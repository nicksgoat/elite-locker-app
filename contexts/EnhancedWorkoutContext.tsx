import * as Haptics from 'expo-haptics';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import OfflineWorkoutService, {
    ExerciseTemplate,
    UserPreferences,
    WorkoutSession
} from '../services/OfflineWorkoutService';
import { ExerciseSet, WorkoutSummary } from './WorkoutContext';

interface EnhancedWorkoutContextType {
  // Current workout state
  activeWorkout: WorkoutSession | null;
  isWorkoutActive: boolean;
  elapsedTime: number;

  // Exercise library
  exerciseLibrary: ExerciseTemplate[];
  searchResults: ExerciseTemplate[];
  isSearching: boolean;

  // User preferences
  userPreferences: UserPreferences | null;

  // Rest timer
  isRestTimerActive: boolean;
  restTimeRemaining: number;

  // Performance tracking
  totalVolume: number;
  completedSets: number;
  personalRecords: number;

  // Actions
  startWorkout: (name?: string) => Promise<void>;
  endWorkout: (notes?: string) => Promise<WorkoutSummary | null>;
  pauseWorkout: () => Promise<void>;
  resumeWorkout: () => Promise<void>;

  // Exercise management
  searchExercises: (query: string, filters?: any) => Promise<void>;
  addExerciseToWorkout: (exerciseId: string) => Promise<void>;
  addCustomExercise: (exercise: Omit<ExerciseTemplate, 'id' | 'frequency'>) => Promise<string>;

  // Set logging
  logSet: (exerciseId: string, setData: Partial<ExerciseSet>) => Promise<void>;
  updateSet: (exerciseId: string, setId: number, updates: Partial<ExerciseSet>) => Promise<void>;

  // Rest timer
  startRestTimer: (seconds?: number) => void;
  pauseRestTimer: () => void;
  resetRestTimer: () => void;

  // Previous performance
  getExercisePreviousPerformance: (exerciseName: string) => Promise<{
    date: string;
    weight: string;
    reps: string;
  }[]>;

  // Preferences
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;

  // Error handling
  lastError: string | null;
  clearError: () => void;
}

const EnhancedWorkoutContext = createContext<EnhancedWorkoutContextType | undefined>(undefined);

export const useEnhancedWorkout = () => {
  const context = useContext(EnhancedWorkoutContext);
  if (context === undefined) {
    throw new Error('useEnhancedWorkout must be used within an EnhancedWorkoutProvider');
  }
  return context;
};

export const EnhancedWorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core state
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseTemplate[]>([]);
  const [searchResults, setSearchResults] = useState<ExerciseTemplate[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);

  // UI state
  const [isSearching, setIsSearching] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Rest timer state
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);

  // Performance metrics
  const [totalVolume, setTotalVolume] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [personalRecords, setPersonalRecords] = useState(0);

  // Refs for timers
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offlineService = useRef(OfflineWorkoutService.getInstance());

  // Computed properties
  const isWorkoutActive = activeWorkout?.status === 'active';

  // Initialize service and load data
  useEffect(() => {
    initializeService();
    return () => {
      // Cleanup timers on unmount
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  // Start workout timer when workout becomes active
  useEffect(() => {
    if (isWorkoutActive && !workoutTimerRef.current) {
      workoutTimerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (!isWorkoutActive && workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
  }, [isWorkoutActive]);

  // Start rest timer effect
  useEffect(() => {
    if (isRestTimerActive && restTimeRemaining > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            if (userPreferences?.hapticFeedback) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    };
  }, [isRestTimerActive, restTimeRemaining, userPreferences?.hapticFeedback]);

  const initializeService = async () => {
    try {
      await offlineService.current.initialize();

      // Load user preferences
      const prefs = await offlineService.current.getUserPreferences();
      setUserPreferences(prefs);

      // Check for active workout
      const activeSession = await offlineService.current.getActiveWorkoutSession();
      if (activeSession) {
        setActiveWorkout(activeSession);
        // Calculate elapsed time - ensure startTime is a Date object
        const startTime = new Date(activeSession.startTime);
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
        recalculateMetrics(activeSession);
      }

      // Load exercise library
      const exercises = await offlineService.current.searchExercises('');
      setExerciseLibrary(exercises);
    } catch (error) {
      handleError('Failed to initialize workout service', error);
    }
  };

  const handleError = (message: string, error: any) => {
    console.error(message, error);
    setLastError(message);
  };

  const clearError = () => {
    setLastError(null);
  };

  const recalculateMetrics = (workout: WorkoutSession) => {
    let volume = 0;
    let sets = 0;
    let prs = 0;

    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.completed) {
          sets++;
          if (set.weight && set.reps) {
            const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight;
            const reps = typeof set.reps === 'string' ? parseInt(set.reps) : set.reps;
            if (!isNaN(weight) && !isNaN(reps)) {
              volume += weight * reps;
            }
          }
          if (set.isPersonalRecord) {
            prs++;
          }
        }
      });
    });

    setTotalVolume(volume);
    setCompletedSets(sets);
    setPersonalRecords(prs);
  };

  // Debounced search function
  const searchExercises = useCallback(async (query: string, filters?: any) => {
    setIsSearching(true);
    try {
      const results = await offlineService.current.searchExercises(query, filters);
      setSearchResults(results);
    } catch (error) {
      handleError('Failed to search exercises', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const startWorkout = async (name: string = 'Workout') => {
    try {
      if (activeWorkout) {
        throw new Error('A workout is already active');
      }

      const workoutId = await offlineService.current.createWorkoutSession(name);
      const session = await offlineService.current.getActiveWorkoutSession();

      if (session) {
        setActiveWorkout(session);
        setElapsedTime(0);
        setTotalVolume(0);
        setCompletedSets(0);
        setPersonalRecords(0);

        if (userPreferences?.hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    } catch (error) {
      handleError('Failed to start workout', error);
    }
  };

  const endWorkout = async (notes?: string): Promise<WorkoutSummary | null> => {
    try {
      if (!activeWorkout) {
        throw new Error('No active workout to end');
      }

      const summary = await offlineService.current.completeWorkout(activeWorkout.id, notes);

      // Clear active workout
      setActiveWorkout(null);
      setElapsedTime(0);
      setTotalVolume(0);
      setCompletedSets(0);
      setPersonalRecords(0);

      if (userPreferences?.hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      return summary;
    } catch (error) {
      handleError('Failed to end workout', error);
      return null;
    }
  };

  const pauseWorkout = async () => {
    try {
      if (!activeWorkout) return;

      await offlineService.current.updateWorkoutSession(activeWorkout.id, {
        status: 'paused'
      });

      setActiveWorkout(prev => prev ? { ...prev, status: 'paused' } : null);
    } catch (error) {
      handleError('Failed to pause workout', error);
    }
  };

  const resumeWorkout = async () => {
    try {
      if (!activeWorkout) return;

      await offlineService.current.updateWorkoutSession(activeWorkout.id, {
        status: 'active'
      });

      setActiveWorkout(prev => prev ? { ...prev, status: 'active' } : null);
    } catch (error) {
      handleError('Failed to resume workout', error);
    }
  };

  const addExerciseToWorkout = async (exerciseId: string) => {
    try {
      if (!activeWorkout) {
        throw new Error('No active workout');
      }

      await offlineService.current.addExerciseToWorkout(activeWorkout.id, exerciseId);

      // Refresh active workout
      const updatedSession = await offlineService.current.getActiveWorkoutSession();
      if (updatedSession) {
        setActiveWorkout(updatedSession);
        recalculateMetrics(updatedSession);
      }

      if (userPreferences?.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      handleError('Failed to add exercise to workout', error);
    }
  };

  const addCustomExercise = async (exercise: Omit<ExerciseTemplate, 'id' | 'frequency'>): Promise<string> => {
    try {
      const exerciseId = await offlineService.current.addCustomExercise(exercise);

      // Refresh exercise library
      const exercises = await offlineService.current.searchExercises('');
      setExerciseLibrary(exercises);

      return exerciseId;
    } catch (error) {
      handleError('Failed to add custom exercise', error);
      throw error;
    }
  };

  const logSet = async (exerciseId: string, setData: Partial<ExerciseSet>) => {
    try {
      if (!activeWorkout) {
        throw new Error('No active workout');
      }

      await offlineService.current.logSet(activeWorkout.id, exerciseId, setData);

      // Refresh active workout
      const updatedSession = await offlineService.current.getActiveWorkoutSession();
      if (updatedSession) {
        setActiveWorkout(updatedSession);
        recalculateMetrics(updatedSession);
      }

      // Auto-start rest timer if set is completed
      if (setData.completed && userPreferences?.autoStartTimer) {
        const restTime = userPreferences.defaultRestTime || 120;
        startRestTimer(restTime);
      }

      if (userPreferences?.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      handleError('Failed to log set', error);
    }
  };

  const updateSet = async (exerciseId: string, setId: number, updates: Partial<ExerciseSet>) => {
    try {
      await logSet(exerciseId, { id: setId, ...updates });
    } catch (error) {
      handleError('Failed to update set', error);
    }
  };

  const startRestTimer = (seconds?: number) => {
    const restTime = seconds || userPreferences?.defaultRestTime || 120;
    setRestTimeRemaining(restTime);
    setIsRestTimerActive(true);

    if (userPreferences?.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const pauseRestTimer = () => {
    setIsRestTimerActive(false);
  };

  const resetRestTimer = () => {
    setIsRestTimerActive(false);
    setRestTimeRemaining(0);
  };

  const getExercisePreviousPerformance = async (exerciseName: string) => {
    try {
      return await offlineService.current.getExercisePreviousPerformance(exerciseName);
    } catch (error) {
      handleError('Failed to get exercise history', error);
      return [];
    }
  };

  const updateUserPreferences = async (preferences: Partial<UserPreferences>) => {
    try {
      const currentPrefs = userPreferences || offlineService.current.getUserPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences } as UserPreferences;

      await offlineService.current.setUserPreferences(updatedPrefs);
      setUserPreferences(updatedPrefs);
    } catch (error) {
      handleError('Failed to update preferences', error);
    }
  };

  const contextValue: EnhancedWorkoutContextType = {
    // State
    activeWorkout,
    isWorkoutActive,
    elapsedTime,
    exerciseLibrary,
    searchResults,
    isSearching,
    userPreferences,
    isRestTimerActive,
    restTimeRemaining,
    totalVolume,
    completedSets,
    personalRecords,
    lastError,

    // Actions
    startWorkout,
    endWorkout,
    pauseWorkout,
    resumeWorkout,
    searchExercises,
    addExerciseToWorkout,
    addCustomExercise,
    logSet,
    updateSet,
    startRestTimer,
    pauseRestTimer,
    resetRestTimer,
    getExercisePreviousPerformance,
    updateUserPreferences,
    clearError
  };

  return (
    <EnhancedWorkoutContext.Provider value={contextValue}>
      {children}
    </EnhancedWorkoutContext.Provider>
  );
};