import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineWorkoutService from '../services/OfflineWorkoutService';

interface TestResults {
  testName: string;
  passed: boolean;
  error?: string;
  result?: any;
}

class OfflineWorkoutTester {
  private service: OfflineWorkoutService;
  private results: TestResults[] = [];

  constructor() {
    this.service = OfflineWorkoutService.getInstance();
  }

  private log(message: string) {
    console.log(`[OFFLINE TEST] ${message}`);
  }

  private addResult(testName: string, passed: boolean, error?: string, result?: any) {
    this.results.push({ testName, passed, error, result });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    this.log(`${status}: ${testName}${error ? ` - ${error}` : ''}`);
  }

  async runAllTests(): Promise<TestResults[]> {
    this.log('Starting comprehensive offline workout system tests...');
    
    // Clear any existing data first
    await this.clearTestData();
    
    // Run tests in sequence
    await this.testInitialization();
    await this.testUserPreferences();
    await this.testExerciseLibrary();
    await this.testWorkoutSession();
    await this.testExerciseManagement();
    await this.testSetLogging();
    await this.testWorkoutCompletion();
    await this.testWorkoutHistory();
    await this.testPerformanceTracking();
    await this.testDataPersistence();
    
    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    this.log(`\n🎯 TEST SUMMARY: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      this.log('🚀 All tests passed! Offline workout system is fully functional.');
    } else {
      this.log('⚠️  Some tests failed. Check the details above.');
    }
    
    return this.results;
  }

  private async clearTestData() {
    try {
      await this.service.clearAllData();
      this.addResult('Clear test data', true);
    } catch (error) {
      this.addResult('Clear test data', false, error?.toString());
    }
  }

  private async testInitialization() {
    try {
      await this.service.initialize();
      
      // Check if default exercises were seeded
      const exercises = await this.service.searchExercises('');
      const hasDefaultExercises = exercises.length >= 8;
      
      if (!hasDefaultExercises) {
        throw new Error(`Expected at least 8 default exercises, got ${exercises.length}`);
      }
      
      // Check if default preferences were created
      const prefs = await this.service.getUserPreferences();
      const hasPreferences = prefs && prefs.defaultRestTime === 120;
      
      if (!hasPreferences) {
        throw new Error('Default preferences not created correctly');
      }
      
      this.addResult('Service initialization', true, undefined, { 
        exercisesCount: exercises.length,
        preferencesCreated: !!prefs 
      });
    } catch (error) {
      this.addResult('Service initialization', false, error?.toString());
    }
  }

  private async testUserPreferences() {
    try {
      // Test updating preferences
      const newPrefs = {
        defaultRestTime: 180,
        weightUnit: 'kg' as const,
        autoStartTimer: false,
        showPreviousPerformance: true,
        hapticFeedback: false,
        autoSync: true,
        darkMode: true
      };
      
      await this.service.setUserPreferences(newPrefs);
      const retrieved = await this.service.getUserPreferences();
      
      if (!retrieved || retrieved.defaultRestTime !== 180 || retrieved.weightUnit !== 'kg') {
        throw new Error('Preferences not saved/retrieved correctly');
      }
      
      this.addResult('User preferences management', true, undefined, retrieved);
    } catch (error) {
      this.addResult('User preferences management', false, error?.toString());
    }
  }

  private async testExerciseLibrary() {
    try {
      // Test search functionality
      const allExercises = await this.service.searchExercises('');
      const benchPress = await this.service.searchExercises('bench');
      const squatResults = await this.service.searchExercises('squat');
      
      if (benchPress.length === 0) {
        throw new Error('Search for "bench" returned no results');
      }
      
      if (squatResults.length === 0) {
        throw new Error('Search for "squat" returned no results');
      }
      
      // Test filtered search
      const strengthExercises = await this.service.searchExercises('', {
        muscleGroups: ['chest'],
        equipment: ['barbell'],
        difficulty: 'intermediate'
      });
      
      // Test adding custom exercise
      const customExerciseId = await this.service.addCustomExercise({
        name: 'Test Custom Exercise',
        muscleGroups: ['test'],
        equipment: 'test_equipment',
        category: 'strength',
        difficulty: 'beginner',
        instructions: 'Test instructions'
      });
      
      const customExercise = await this.service.getExerciseById(customExerciseId);
      if (!customExercise || customExercise.name !== 'Test Custom Exercise') {
        throw new Error('Custom exercise not added correctly');
      }
      
      this.addResult('Exercise library management', true, undefined, {
        totalExercises: allExercises.length,
        benchPressResults: benchPress.length,
        squatResults: squatResults.length,
        strengthExercises: strengthExercises.length,
        customExerciseId
      });
    } catch (error) {
      this.addResult('Exercise library management', false, error?.toString());
    }
  }

  private async testWorkoutSession() {
    try {
      // Test creating workout session
      const sessionId = await this.service.createWorkoutSession('Test Workout Session');
      
      if (!sessionId) {
        throw new Error('Session ID not returned');
      }
      
      // Test retrieving active session
      const activeSession = await this.service.getActiveWorkoutSession();
      if (!activeSession || activeSession.id !== sessionId) {
        throw new Error('Active session not retrieved correctly');
      }
      
      if (activeSession.name !== 'Test Workout Session') {
        throw new Error('Session name not saved correctly');
      }
      
      if (activeSession.status !== 'active') {
        throw new Error('Session status not set to active');
      }
      
      // Test updating session
      await this.service.updateWorkoutSession(sessionId, { 
        notes: 'Test notes' 
      });
      
      const updatedSession = await this.service.getActiveWorkoutSession();
      if (!updatedSession || updatedSession.notes !== 'Test notes') {
        throw new Error('Session update failed');
      }
      
      this.addResult('Workout session management', true, undefined, {
        sessionId,
        sessionName: activeSession.name,
        status: activeSession.status
      });
    } catch (error) {
      this.addResult('Workout session management', false, error?.toString());
    }
  }

  private async testExerciseManagement() {
    try {
      const activeSession = await this.service.getActiveWorkoutSession();
      if (!activeSession) {
        throw new Error('No active session found');
      }
      
      // Get a test exercise
      const exercises = await this.service.searchExercises('bench');
      if (exercises.length === 0) {
        throw new Error('No bench press exercise found');
      }
      
      const testExercise = exercises[0];
      
      // Add exercise to workout
      await this.service.addExerciseToWorkout(activeSession.id, testExercise.id);
      
      // Verify exercise was added
      const updatedSession = await this.service.getActiveWorkoutSession();
      if (!updatedSession || updatedSession.exercises.length === 0) {
        throw new Error('Exercise not added to workout');
      }
      
      const addedExercise = updatedSession.exercises[0];
      if (addedExercise.name !== testExercise.name) {
        throw new Error('Exercise name mismatch');
      }
      
      if (addedExercise.sets.length !== 1) {
        throw new Error('Initial set not created');
      }
      
      this.addResult('Exercise management', true, undefined, {
        exerciseName: addedExercise.name,
        initialSets: addedExercise.sets.length,
        exerciseOrder: addedExercise.order
      });
    } catch (error) {
      this.addResult('Exercise management', false, error?.toString());
    }
  }

  private async testSetLogging() {
    try {
      const activeSession = await this.service.getActiveWorkoutSession();
      if (!activeSession || activeSession.exercises.length === 0) {
        throw new Error('No active session or exercises found');
      }
      
      const exercise = activeSession.exercises[0];
      
      // Log first set
      await this.service.logSet(activeSession.id, exercise.id, {
        id: 1,
        weight: '185',
        reps: '8',
        completed: true,
        repType: 'standard'
      });
      
      // Add second set
      await this.service.logSet(activeSession.id, exercise.id, {
        id: 2,
        weight: '185',
        reps: '6',
        completed: true,
        repType: 'standard'
      });
      
      // Verify sets were logged
      const updatedSession = await this.service.getActiveWorkoutSession();
      if (!updatedSession) {
        throw new Error('Session not found after logging sets');
      }
      
      const updatedExercise = updatedSession.exercises[0];
      if (updatedExercise.sets.length !== 2) {
        throw new Error(`Expected 2 sets, got ${updatedExercise.sets.length}`);
      }
      
      const completedSets = updatedExercise.sets.filter(set => set.completed);
      if (completedSets.length !== 2) {
        throw new Error(`Expected 2 completed sets, got ${completedSets.length}`);
      }
      
      // Check if volume was calculated
      if (updatedSession.totalVolume === 0) {
        throw new Error('Total volume not calculated');
      }
      
      if (updatedSession.totalSets !== 2) {
        throw new Error(`Expected 2 total sets, got ${updatedSession.totalSets}`);
      }
      
      this.addResult('Set logging', true, undefined, {
        totalSets: updatedSession.totalSets,
        totalVolume: updatedSession.totalVolume,
        completedSets: completedSets.length
      });
    } catch (error) {
      this.addResult('Set logging', false, error?.toString());
    }
  }

  private async testWorkoutCompletion() {
    try {
      const activeSession = await this.service.getActiveWorkoutSession();
      if (!activeSession) {
        throw new Error('No active session found');
      }
      
      // Complete the workout
      const summary = await this.service.completeWorkout(activeSession.id, 'Test workout notes');
      
      if (!summary) {
        throw new Error('Workout summary not returned');
      }
      
      if (summary.title !== activeSession.name) {
        throw new Error('Summary title mismatch');
      }
      
      if (summary.totalSets !== 2) {
        throw new Error(`Expected 2 sets in summary, got ${summary.totalSets}`);
      }
      
      if (summary.totalExercises !== 1) {
        throw new Error(`Expected 1 exercise in summary, got ${summary.totalExercises}`);
      }
      
      if (summary.notes !== 'Test workout notes') {
        throw new Error('Workout notes not saved in summary');
      }
      
      // Verify no active session exists
      const noActiveSession = await this.service.getActiveWorkoutSession();
      if (noActiveSession) {
        throw new Error('Active session still exists after completion');
      }
      
      this.addResult('Workout completion', true, undefined, summary);
    } catch (error) {
      this.addResult('Workout completion', false, error?.toString());
    }
  }

  private async testWorkoutHistory() {
    try {
      // Get workout history
      const history = await this.service.getWorkoutHistory(10);
      
      if (history.length === 0) {
        throw new Error('No workout history found');
      }
      
      const lastWorkout = history[0];
      if (lastWorkout.name !== 'Test Workout Session') {
        throw new Error('Last workout name mismatch');
      }
      
      if (lastWorkout.status !== 'completed') {
        throw new Error('Last workout status not completed');
      }
      
      if (lastWorkout.exercises.length !== 1) {
        throw new Error(`Expected 1 exercise in history, got ${lastWorkout.exercises.length}`);
      }
      
      this.addResult('Workout history', true, undefined, {
        historyCount: history.length,
        lastWorkoutName: lastWorkout.name,
        lastWorkoutStatus: lastWorkout.status
      });
    } catch (error) {
      this.addResult('Workout history', false, error?.toString());
    }
  }

  private async testPerformanceTracking() {
    try {
      // Test getting previous performance
      const performance = await this.service.getExercisePreviousPerformance('Barbell Bench Press');
      
      if (performance.length === 0) {
        throw new Error('No previous performance found');
      }
      
      const lastPerformance = performance[0];
      if (!lastPerformance.weight || !lastPerformance.reps || !lastPerformance.date) {
        throw new Error('Performance data incomplete');
      }
      
      if (lastPerformance.weight !== '185' || lastPerformance.reps !== '8') {
        throw new Error('Performance data mismatch');
      }
      
      this.addResult('Performance tracking', true, undefined, {
        performanceEntries: performance.length,
        lastWeight: lastPerformance.weight,
        lastReps: lastPerformance.reps
      });
    } catch (error) {
      this.addResult('Performance tracking', false, error?.toString());
    }
  }

  private async testDataPersistence() {
    try {
      // Create a second service instance to test persistence
      const newService = OfflineWorkoutService.getInstance();
      await newService.initialize();
      
      // Check if data persists across service instances
      const exercises = await newService.searchExercises('');
      const prefs = await newService.getUserPreferences();
      const history = await newService.getWorkoutHistory(5);
      
      if (exercises.length < 8) {
        throw new Error('Exercise library not persisted');
      }
      
      if (!prefs || prefs.defaultRestTime !== 180) {
        throw new Error('User preferences not persisted');
      }
      
      if (history.length === 0) {
        throw new Error('Workout history not persisted');
      }
      
      this.addResult('Data persistence', true, undefined, {
        exercisesCount: exercises.length,
        prefsRestTime: prefs.defaultRestTime,
        historyCount: history.length
      });
    } catch (error) {
      this.addResult('Data persistence', false, error?.toString());
    }
  }
}

// Export test runner
export async function runOfflineWorkoutTests(): Promise<TestResults[]> {
  const tester = new OfflineWorkoutTester();
  return await tester.runAllTests();
}

// Export for manual testing
export { OfflineWorkoutTester };
export type { TestResults }; 