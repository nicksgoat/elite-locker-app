import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExerciseSet, WorkoutSummary } from '../contexts/WorkoutContext';

export interface WorkoutSession {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  exercises: WorkoutExercise[];
  totalVolume: number;
  totalSets: number;
  duration: number;
  notes?: string;
  status: 'active' | 'completed' | 'paused';
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
  order: number;
  muscleGroups: string[];
  equipment?: string;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
  thumbnailUrl?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUsed?: Date;
  frequency: number; // how often user performs this exercise
}

export interface UserPreferences {
  defaultRestTime: number;
  weightUnit: 'lbs' | 'kg';
  autoStartTimer: boolean;
  showPreviousPerformance: boolean;
  hapticFeedback: boolean;
  autoSync: boolean;
  darkMode: boolean;
}

class OfflineWorkoutService {
  private static instance: OfflineWorkoutService;
  private readonly STORAGE_KEYS = {
    WORKOUT_SESSIONS: 'workout_sessions',
    EXERCISE_LIBRARY: 'exercise_library',
    USER_PREFERENCES: 'user_preferences',
    WORKOUT_HISTORY: 'workout_history',
    SYNC_QUEUE: 'sync_queue',
    USER_DATA: 'user_data'
  };

  public static getInstance(): OfflineWorkoutService {
    if (!OfflineWorkoutService.instance) {
      OfflineWorkoutService.instance = new OfflineWorkoutService();
    }
    return OfflineWorkoutService.instance;
  }

  // Initialize service with default data
  async initialize(): Promise<void> {
    try {
      // Check if this is first run
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEYS.EXERCISE_LIBRARY);
      if (!existingData) {
        await this.seedDefaultData();
      }

      // Initialize user preferences if not exist
      const prefs = await this.getUserPreferences();
      if (!prefs) {
        await this.setUserPreferences(this.getDefaultPreferences());
      }
    } catch (error) {
      console.error('Error initializing OfflineWorkoutService:', error);
    }
  }

  // Seed default exercise library
  private async seedDefaultData(): Promise<void> {
    const defaultExercises: ExerciseTemplate[] = [
      {
        id: 'ex1',
        name: 'Barbell Bench Press',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: 'barbell',
        category: 'strength',
        difficulty: 'intermediate',
        frequency: 0,
        instructions: 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up.'
      },
      {
        id: 'ex2',
        name: 'Squat',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: 'barbell',
        category: 'strength',
        difficulty: 'intermediate',
        frequency: 0,
        instructions: 'Stand with feet shoulder-width apart, lower hips back and down, keep chest up.'
      },
      {
        id: 'ex3',
        name: 'Deadlift',
        muscleGroups: ['hamstrings', 'glutes', 'back'],
        equipment: 'barbell',
        category: 'strength',
        difficulty: 'advanced',
        frequency: 0,
        instructions: 'Stand with bar over mid-foot, grip bar, keep back neutral, lift by extending hips and knees.'
      },
      {
        id: 'ex4',
        name: 'Pull-ups',
        muscleGroups: ['back', 'biceps'],
        equipment: 'pullup_bar',
        category: 'strength',
        difficulty: 'intermediate',
        frequency: 0,
        instructions: 'Hang from bar with overhand grip, pull body up until chin clears bar.'
      },
      {
        id: 'ex5',
        name: 'Overhead Press',
        muscleGroups: ['shoulders', 'triceps', 'core'],
        equipment: 'barbell',
        category: 'strength',
        difficulty: 'intermediate',
        frequency: 0,
        instructions: 'Stand with bar at shoulder height, press overhead while keeping core tight.'
      },
      {
        id: 'ex6',
        name: 'Push-ups',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: 'bodyweight',
        category: 'strength',
        difficulty: 'beginner',
        frequency: 0,
        instructions: 'Start in plank position, lower chest to ground, push back up.'
      },
      {
        id: 'ex7',
        name: 'Dumbbell Rows',
        muscleGroups: ['back', 'biceps'],
        equipment: 'dumbbells',
        category: 'strength',
        difficulty: 'beginner',
        frequency: 0,
        instructions: 'Bend over with weight in hand, pull elbow back squeezing shoulder blade.'
      },
      {
        id: 'ex8',
        name: 'Plank',
        muscleGroups: ['core', 'shoulders'],
        equipment: 'bodyweight',
        category: 'strength',
        difficulty: 'beginner',
        frequency: 0,
        instructions: 'Hold body in straight line from head to heels, engage core.'
      }
    ];

    await AsyncStorage.setItem(
      this.STORAGE_KEYS.EXERCISE_LIBRARY,
      JSON.stringify(defaultExercises)
    );
  }

  // User Preferences
  private getDefaultPreferences(): UserPreferences {
    return {
      defaultRestTime: 120, // 2 minutes
      weightUnit: 'lbs',
      autoStartTimer: true,
      showPreviousPerformance: true,
      hapticFeedback: true,
      autoSync: true,
      darkMode: true
    };
  }

  async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  async setUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error setting user preferences:', error);
    }
  }

  // Exercise Library Management
  async searchExercises(query: string, filters?: {
    muscleGroups?: string[];
    equipment?: string[];
    difficulty?: string;
  }): Promise<ExerciseTemplate[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.EXERCISE_LIBRARY);
      if (!data) return [];

      let exercises: ExerciseTemplate[] = JSON.parse(data);

      // Text search
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        exercises = exercises.filter(ex =>
          ex.name.toLowerCase().includes(searchTerm) ||
          ex.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm)) ||
          ex.category.toLowerCase().includes(searchTerm)
        );
      }

      // Apply filters
      if (filters) {
        if (filters.muscleGroups && filters.muscleGroups.length > 0) {
          exercises = exercises.filter(ex =>
            ex.muscleGroups.some(mg => filters.muscleGroups!.includes(mg))
          );
        }

        if (filters.equipment && filters.equipment.length > 0) {
          exercises = exercises.filter(ex =>
            filters.equipment!.includes(ex.equipment || '')
          );
        }

        if (filters.difficulty) {
          exercises = exercises.filter(ex => ex.difficulty === filters.difficulty);
        }
      }

      // Sort by frequency (most used first), then alphabetically
      exercises.sort((a, b) => {
        if (a.frequency !== b.frequency) {
          return b.frequency - a.frequency;
        }
        return a.name.localeCompare(b.name);
      });

      return exercises;
    } catch (error) {
      console.error('Error searching exercises:', error);
      return [];
    }
  }

  async getExerciseById(id: string): Promise<ExerciseTemplate | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.EXERCISE_LIBRARY);
      if (!data) return null;

      const exercises: ExerciseTemplate[] = JSON.parse(data);
      return exercises.find(ex => ex.id === id) || null;
    } catch (error) {
      console.error('Error getting exercise by ID:', error);
      return null;
    }
  }

  async addCustomExercise(exercise: Omit<ExerciseTemplate, 'id' | 'frequency'>): Promise<string> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.EXERCISE_LIBRARY);
      const exercises: ExerciseTemplate[] = data ? JSON.parse(data) : [];

      const newExercise: ExerciseTemplate = {
        ...exercise,
        id: `custom_${Date.now()}`,
        frequency: 0
      };

      exercises.push(newExercise);
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.EXERCISE_LIBRARY,
        JSON.stringify(exercises)
      );

      return newExercise.id;
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      throw error;
    }
  }

  // Workout Session Management
  async createWorkoutSession(name: string): Promise<string> {
    try {
      const workoutId = `workout_${Date.now()}`;
      const session: WorkoutSession = {
        id: workoutId,
        name,
        startTime: new Date(),
        exercises: [],
        totalVolume: 0,
        totalSets: 0,
        duration: 0,
        status: 'active',
        syncStatus: 'pending',
        lastModified: new Date()
      };

      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SESSIONS);
      const sessions: WorkoutSession[] = data ? JSON.parse(data) : [];
      sessions.push(session);

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WORKOUT_SESSIONS,
        JSON.stringify(sessions)
      );

      return workoutId;
    } catch (error) {
      console.error('Error creating workout session:', error);
      throw error;
    }
  }

  async getActiveWorkoutSession(): Promise<WorkoutSession | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SESSIONS);
      if (!data) return null;

      const sessions: WorkoutSession[] = JSON.parse(data);
      const activeSession = sessions.find(s => s.status === 'active') || null;

      // Ensure dates are properly converted back to Date objects
      if (activeSession) {
        activeSession.startTime = new Date(activeSession.startTime);
        activeSession.lastModified = new Date(activeSession.lastModified);
        if (activeSession.endTime) {
          activeSession.endTime = new Date(activeSession.endTime);
        }
      }

      return activeSession;
    } catch (error) {
      console.error('Error getting active workout session:', error);
      return null;
    }
  }

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SESSIONS);
      if (!data) return;

      const sessions: WorkoutSession[] = JSON.parse(data);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) return;

      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
        lastModified: new Date()
      };

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WORKOUT_SESSIONS,
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error('Error updating workout session:', error);
    }
  }

  async addExerciseToWorkout(sessionId: string, exerciseId: string): Promise<void> {
    try {
      const exercise = await this.getExerciseById(exerciseId);
      if (!exercise) throw new Error('Exercise not found');

      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SESSIONS);
      if (!data) return;

      const sessions: WorkoutSession[] = JSON.parse(data);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const workoutExercise: WorkoutExercise = {
        id: `we_${Date.now()}`,
        exerciseId: exercise.id,
        name: exercise.name,
        sets: [this.createEmptySet(1)],
        order: session.exercises.length,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment
      };

      session.exercises.push(workoutExercise);
      session.lastModified = new Date();

      // Update exercise frequency
      await this.incrementExerciseFrequency(exerciseId);

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WORKOUT_SESSIONS,
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error('Error adding exercise to workout:', error);
      throw error;
    }
  }

  async logSet(sessionId: string, exerciseId: string, setData: Partial<ExerciseSet>): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SESSIONS);
      if (!data) return;

      const sessions: WorkoutSession[] = JSON.parse(data);
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      const exercise = session.exercises.find(e => e.id === exerciseId);
      if (!exercise) return;

      // Find the set to update or create new one
      const setIndex = setData.id ? exercise.sets.findIndex(s => s.id === setData.id) : -1;

      if (setIndex >= 0) {
        // Update existing set
        exercise.sets[setIndex] = { ...exercise.sets[setIndex], ...setData };
      } else {
        // Add new set
        const newSet = this.createEmptySet(exercise.sets.length + 1);
        exercise.sets.push({ ...newSet, ...setData });
      }

      // Recalculate totals
      this.recalculateWorkoutTotals(session);
      session.lastModified = new Date();

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WORKOUT_SESSIONS,
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error('Error logging set:', error);
      throw error;
    }
  }

  async completeWorkout(sessionId: string, notes?: string): Promise<WorkoutSummary> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_SESSIONS);
      if (!data) throw new Error('No workout sessions found');

      const sessions: WorkoutSession[] = JSON.parse(data);
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex === -1) throw new Error('Workout session not found');

      const session = sessions[sessionIndex];

      // Ensure startTime is a Date object
      const startTime = new Date(session.startTime);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Update session
      session.endTime = endTime;
      session.duration = duration;
      session.status = 'completed';
      session.notes = notes;
      session.lastModified = new Date();

      // Recalculate final totals
      this.recalculateWorkoutTotals(session);

      // Save updated sessions
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WORKOUT_SESSIONS,
        JSON.stringify(sessions)
      );

      // Add to workout history
      await this.addToWorkoutHistory(session);

      // Create summary
      const summary: WorkoutSummary = {
        title: session.name,
        totalVolume: session.totalVolume,
        totalSets: session.totalSets,
        totalExercises: session.exercises.length,
        duration: session.duration,
        personalRecords: 0, // TODO: Calculate PRs
        date: session.startTime,
        notes: session.notes,
        exercises: session.exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets.map(set => ({
            id: typeof set.id === 'string' ? parseInt(set.id) || 1 : set.id,
            weight: set.weight,
            reps: set.reps,
            completed: set.completed,
            isPersonalRecord: false // TODO: Calculate PRs
          }))
        }))
      };

      return summary;
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  }

  // Helper methods
  private createEmptySet(setNumber: number): ExerciseSet {
    return {
      id: setNumber,
      weight: '',
      reps: '',
      completed: false,
      repType: 'standard'
    };
  }

  private recalculateWorkoutTotals(session: WorkoutSession): void {
    let totalVolume = 0;
    let totalSets = 0;

    session.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed) {
          totalSets++;
          if (set.weight && set.reps) {
            const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight;
            const reps = typeof set.reps === 'string' ? parseInt(set.reps) : set.reps;
            if (!isNaN(weight) && !isNaN(reps)) {
              totalVolume += weight * reps;
            }
          }
        }
      });
    });

    session.totalVolume = totalVolume;
    session.totalSets = totalSets;
  }

  private async incrementExerciseFrequency(exerciseId: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.EXERCISE_LIBRARY);
      if (!data) return;

      const exercises: ExerciseTemplate[] = JSON.parse(data);
      const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);

      if (exerciseIndex >= 0) {
        exercises[exerciseIndex].frequency++;
        exercises[exerciseIndex].lastUsed = new Date();

        await AsyncStorage.setItem(
          this.STORAGE_KEYS.EXERCISE_LIBRARY,
          JSON.stringify(exercises)
        );
      }
    } catch (error) {
      console.error('Error incrementing exercise frequency:', error);
    }
  }

  private async addToWorkoutHistory(session: WorkoutSession): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_HISTORY);
      const history: WorkoutSession[] = data ? JSON.parse(data) : [];

      history.unshift(session); // Add to beginning of array

      // Keep only last 100 workouts in local storage
      if (history.length > 100) {
        history.splice(100);
      }

      await AsyncStorage.setItem(
        this.STORAGE_KEYS.WORKOUT_HISTORY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error('Error adding to workout history:', error);
    }
  }

  // Get workout history
  async getWorkoutHistory(limit: number = 20): Promise<WorkoutSession[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.WORKOUT_HISTORY);
      if (!data) return [];

      const history: WorkoutSession[] = JSON.parse(data);
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error getting workout history:', error);
      return [];
    }
  }

  // Get previous performance for exercise
  async getExercisePreviousPerformance(exerciseName: string): Promise<{
    date: string;
    weight: string;
    reps: string;
  }[]> {
    try {
      const history = await this.getWorkoutHistory(50);
      const performances: { date: string; weight: string; reps: string; }[] = [];

      history.forEach(workout => {
        workout.exercises.forEach(exercise => {
          if (exercise.name.toLowerCase() === exerciseName.toLowerCase()) {
            exercise.sets.forEach(set => {
              if (set.completed && set.weight && set.reps) {
                performances.push({
                  date: new Date(workout.startTime).toISOString().split('T')[0],
                  weight: set.weight.toString(),
                  reps: set.reps.toString()
                });
              }
            });
          }
        });
      });

      return performances.slice(0, 10); // Return last 10 performances
    } catch (error) {
      console.error('Error getting exercise previous performance:', error);
      return [];
    }
  }

  // Clear all data (for testing or reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export default OfflineWorkoutService;