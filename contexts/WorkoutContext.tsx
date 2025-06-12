import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { workoutService, ApiError } from '../services';
import { Exercise as TypeExercise, ExerciseSet as TypeExerciseSet } from '../types/workout';
import { workoutDataService } from '../services/workoutDataService';
import { trainingMaxService } from '../services/trainingMaxService';

// Types
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  targetReps: string;
  restTime: number;
  completed?: boolean;
  category?: string;
  equipment?: string;
  measurementType?: 'weight' | 'time' | 'distance' | 'bodyweight' | 'assisted';
  repType?: 'standard' | 'failure' | 'dropset' | 'superset' | 'timed';
  previousPerformance?: {
    date: string;
    weight: string;
    reps: string;
    personalRecord?: boolean;
  }[];
  notes?: string;
}

export interface ExerciseSet {
  id: string | number;
  weight: string;
  reps: string;
  completed: boolean;
  isPersonalRecord?: boolean;
  previousWeight?: string;
  previousReps?: string;
  repType?: 'standard' | 'failure' | 'dropset' | 'superset' | 'timed';
  notes?: string;
}

// Feed-friendly exercise type
export interface FeedExercise {
  id: string;
  name: string;
  sets: {
    id: number;
    weight: string;
    reps: string;
    completed: boolean;
    isPersonalRecord?: boolean;
  }[];
  superSetId?: string;
}

export interface WorkoutSummary {
  title?: string;
  totalVolume: number; // in lbs or kg
  totalSets: number;
  totalExercises: number;
  duration: number; // in seconds
  personalRecords: number;
  date: Date;
  notes?: string;
  visibility?: 'public' | 'friends' | 'private';
  sharedTo?: {
    clubs?: string[];
    platforms?: string[];
  };
  media?: {
    type: 'photo' | 'video';
    url: string;
  }[];
  exercises?: FeedExercise[]; // Added for feed display
}

interface WorkoutContextType {
  isWorkoutActive: boolean;
  isWorkoutMinimized: boolean;
  currentWorkout: {
    exercises: Exercise[];
    startTime: Date | null;
    elapsedTime: number;
    currentExerciseIndex: number;
    isRestTimerActive: boolean;
    restTimeRemaining: number;
    totalVolume: number;
    completedSets: number;
    totalSets: number;
    personalRecords: number;
  };
  workoutSummary: WorkoutSummary | null;
  startWorkout: (exercises?: Exercise[]) => void;
  endWorkout: () => void;
  minimizeWorkout: () => void;
  maximizeWorkout: () => void;
  completeExercise: (exerciseId: string) => void;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  updateExerciseSets: (exerciseId: string, sets: ExerciseSet[]) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  setCustomRestTimer: (seconds: number) => void;
  getExercisePreviousPerformance: (exerciseName: string) => Promise<any[]>;
  saveWorkoutSummary: (summary: Partial<WorkoutSummary>) => Promise<void>;
  shareWorkout: (platforms: string[], caption?: string) => Promise<void>;
}

// Create context with default values
const WorkoutContext = createContext<WorkoutContextType>({
  isWorkoutActive: false,
  isWorkoutMinimized: false,
  currentWorkout: {
    exercises: [],
    startTime: null,
    elapsedTime: 0,
    currentExerciseIndex: 0,
    isRestTimerActive: false,
    restTimeRemaining: 0,
    totalVolume: 0,
    completedSets: 0,
    totalSets: 0,
    personalRecords: 0,
  },
  workoutSummary: null,
  startWorkout: () => {},
  endWorkout: () => {},
  minimizeWorkout: () => {},
  maximizeWorkout: () => {},
  completeExercise: () => {},
  startRestTimer: () => {},
  stopRestTimer: () => {},
  updateExerciseSets: () => {},
  addExercise: () => {},
  removeExercise: () => {},
  setCustomRestTimer: () => {},
  getExercisePreviousPerformance: async () => [],
  saveWorkoutSummary: async () => {},
  shareWorkout: async () => {},
});

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isWorkoutMinimized, setIsWorkoutMinimized] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [customRestTime, setCustomRestTime] = useState<number | null>(null);
  const [totalVolume, setTotalVolume] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [personalRecords, setPersonalRecords] = useState(0);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  // Track exercise sets separately to allow dynamic set management
  const [exerciseSets, setExerciseSets] = useState<Record<string, ExerciseSet[]>>({});

  // Timer intervals - use ReturnType<typeof setInterval> to fix type issues
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate total sets from exercises
  const calculateTotalSets = (exercises: Exercise[]) => {
    return exercises.reduce((total, exercise) => total + exercise.sets, 0);
  };

  // Check for training max updates when personal records are achieved
  const checkAndUpdateTrainingMax = async (exerciseId: string, exerciseName: string, weight: number, reps: number, setId: string) => {
    try {
      // Calculate estimated 1RM using Epley formula: weight * (1 + reps/30)
      const estimated1RM = weight * (1 + reps / 30);

      // Get current training max
      const history = await trainingMaxService.getTrainingMaxHistory(exerciseId);
      const currentMax = history.currentMax?.value || 0;

      // If estimated 1RM is higher than current max, update training max
      if (estimated1RM > currentMax) {
        await trainingMaxService.updateTrainingMax(
          exerciseId,
          estimated1RM,
          'lb', // Default to lb, could be made configurable
          'tracker',
          {
            workoutId: activeWorkoutId,
            setId,
            reps,
            notes: `Auto-updated from workout tracker: ${weight}lb x ${reps} reps`
          }
        );
        console.log(`Training max updated for ${exerciseName}: ${estimated1RM}lb`);
      }
    } catch (error) {
      console.error('Error updating training max:', error);
      // Don't throw - this is a background operation
    }
  };

  // Track personal records for training max updates
  const [pendingTrainingMaxUpdates, setPendingTrainingMaxUpdates] = useState<Array<{
    exerciseId: string;
    exerciseName: string;
    weight: number;
    reps: number;
    setId: string;
  }>>([]);

  // Calculate total volume whenever sets change
  useEffect(() => {
    if (isWorkoutActive) {
      let volume = 0;
      let completed = 0;
      let prs = 0;
      const newTrainingMaxUpdates: typeof pendingTrainingMaxUpdates = [];

      Object.entries(exerciseSets).forEach(([exerciseId, sets]) => {
        const exercise = exercises.find(ex => ex.id === exerciseId);

        sets.forEach(set => {
          if (set.completed) {
            completed++;
            const weight = parseFloat(set.weight) || 0;
            const reps = parseFloat(set.reps) || 0;
            volume += weight * reps;

            if (set.isPersonalRecord) {
              prs++;

              // Queue training max update for personal records
              if (exercise && weight > 0 && reps > 0) {
                const setId = typeof set.id === 'string' ? set.id : `set-${set.id}`;
                newTrainingMaxUpdates.push({
                  exerciseId,
                  exerciseName: exercise.name,
                  weight,
                  reps,
                  setId
                });
              }
            }
          }
        });
      });

      setTotalVolume(volume);
      setCompletedSets(completed);
      setPersonalRecords(prs);
      setPendingTrainingMaxUpdates(newTrainingMaxUpdates);
    }
  }, [exerciseSets, isWorkoutActive, exercises]);

  // Process training max updates separately to avoid setState during render
  useEffect(() => {
    if (pendingTrainingMaxUpdates.length > 0 && activeWorkoutId) {
      pendingTrainingMaxUpdates.forEach(update => {
        checkAndUpdateTrainingMax(
          update.exerciseId,
          update.exerciseName,
          update.weight,
          update.reps,
          update.setId
        );
      });
      // Clear pending updates after processing
      setPendingTrainingMaxUpdates([]);
    }
  }, [pendingTrainingMaxUpdates, activeWorkoutId]);

  // Update workout timer
  useEffect(() => {
    if (isWorkoutActive && !isRestTimerActive) {
      // Clear any existing timer
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }

      // Start a new timer
      workoutTimerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (!isWorkoutActive && workoutTimerRef.current) {
      // Clear timer when workout is not active
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    };
  }, [isWorkoutActive, isRestTimerActive]);

  // Update rest timer
  useEffect(() => {
    if (isRestTimerActive) {
      // Clear any existing timer
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }

      // Start a new timer
      restTimerRef.current = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up
            setIsRestTimerActive(false);
            clearInterval(restTimerRef.current!);
            restTimerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRestTimerActive && restTimerRef.current) {
      // Clear timer when rest is not active
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [isRestTimerActive]);

  // Initialize exercise sets when starting a workout
  useEffect(() => {
    if (exercises.length > 0) {
      // Create empty set data for each exercise
      const newExerciseSets: Record<string, ExerciseSet[]> = {};

      exercises.forEach(exercise => {
        if (!exerciseSets[exercise.id]) {
          // Only initialize if not already set
          newExerciseSets[exercise.id] = Array(exercise.sets).fill(0).map((_, idx) => {
            // Pre-fill with previous workout data if available
            const prevData = exercise.previousPerformance && exercise.previousPerformance.length > 0
              ? exercise.previousPerformance[0] : null;

            return {
              id: idx + 1,
              weight: prevData?.weight || '',
              reps: '',
              completed: false,
              repType: exercise.repType || 'standard'
            };
          });
        }
      });

      // Update state if there are new exercises
      if (Object.keys(newExerciseSets).length > 0) {
        setExerciseSets(prev => ({...prev, ...newExerciseSets}));
      }
    }
  }, [exercises]);

  // Start a new workout - this is the single entry point for all workout logging
  const startWorkout = async (workoutExercises: Exercise[] = []) => {
    // If already active, just maximize it
    if (isWorkoutActive) {
      maximizeWorkout();
      return;
    }

    try {
      // If no exercises provided, fetch default template
      let exercisesToUse = workoutExercises;
      
      if (exercisesToUse.length === 0) {
        // Fetch a default workout template from the API
        const templates = await workoutService.getWorkoutTemplates({ limit: 1 });
        if (templates.length > 0) {
          const template = await workoutService.getWorkoutTemplateById(templates[0].id);
          
          // Convert template exercises to our format
          exercisesToUse = template.exercises.map((ex: any) => ({
            id: ex.id,
            name: ex.exercise.name,
            sets: ex.sets.length,
            targetReps: '8-12', // Default
            restTime: 60, // Default
            category: ex.exercise.muscleGroups?.[0],
            equipment: ex.exercise.equipment,
          }));
        }
      }
      
      // Start workout in the API
      const result = await workoutService.startWorkout('new');
      setActiveWorkoutId(result.workoutId);
      
      // Set up local state
      setExercises(exercisesToUse);
      setStartTime(new Date(result.startTime));
      setElapsedTime(0);
      setCurrentExerciseIndex(0);
      setIsRestTimerActive(false);
      setRestTimeRemaining(0);
      setTotalVolume(0);
      setCompletedSets(0);
      setPersonalRecords(0);
      setIsWorkoutActive(true);
      setIsWorkoutMinimized(false);
      setWorkoutSummary(null);

      // Initialize exercise sets
      const newExerciseSets: Record<string, ExerciseSet[]> = {};
      exercisesToUse.forEach(exercise => {
        newExerciseSets[exercise.id] = Array(exercise.sets).fill(0).map((_, idx) => ({
          id: idx + 1,
          weight: '',
          reps: '',
          completed: false,
          repType: exercise.repType || 'standard'
        }));
      });
      setExerciseSets(newExerciseSets);
      
    } catch (error) {
      console.error('Error starting workout:', error);
      // Fallback to local-only mode if API fails
      const exercisesToUse = workoutExercises.length > 0 ? workoutExercises : [
        {
          id: 'default1',
          name: 'Squat',
          sets: 3,
          targetReps: '8-12',
          restTime: 60,
        }
      ];
      
      setExercises(exercisesToUse);
      setStartTime(new Date());
      setElapsedTime(0);
      setCurrentExerciseIndex(0);
      setIsRestTimerActive(false);
      setRestTimeRemaining(0);
      setTotalVolume(0);
      setCompletedSets(0);
      setPersonalRecords(0);
      setIsWorkoutActive(true);
      setIsWorkoutMinimized(false);
      setWorkoutSummary(null);

      // Initialize exercise sets
      const newExerciseSets: Record<string, ExerciseSet[]> = {};
      exercisesToUse.forEach(exercise => {
        newExerciseSets[exercise.id] = Array(exercise.sets).fill(0).map((_, idx) => ({
          id: idx + 1,
          weight: '',
          reps: '',
          completed: false,
          repType: exercise.repType || 'standard'
        }));
      });
      setExerciseSets(newExerciseSets);
    }
  };

  // End the current workout and generate summary
  const endWorkout = async () => {
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }

    // Format the current date as MM/DD/YYYY
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    // Generate workout summary
    const summary: WorkoutSummary = {
      title: `Workout ${formattedDate}`,
      totalVolume,
      totalSets: completedSets,
      totalExercises: exercises.filter(ex => ex.completed).length,
      duration: elapsedTime,
      personalRecords,
      date: startTime || new Date(),
      visibility: 'public',
    };

    // Convert exercises and sets to a format suitable for the feed
    const exercisesForFeed = Object.entries(exerciseSets).map(([exerciseId, sets]) => {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      return {
        id: exerciseId,
        name: exercise?.name || 'Unknown Exercise',
        sets: sets.map(set => ({
          id: set.id,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
          isPersonalRecord: set.isPersonalRecord,
        })),
      };
    });

    // Add exercises to the summary
    summary.exercises = exercisesForFeed;

    setWorkoutSummary(summary);

    try {
      // Save to workout data service for social integration
      await workoutDataService.saveCompletedWorkout(summary);
      console.log('Workout automatically saved to social data service');

      if (activeWorkoutId) {
        // Complete the workout in the API
        await workoutService.completeWorkout(activeWorkoutId, {
          endTime: new Date().toISOString(),
          exercises: Object.entries(exerciseSets).map(([exerciseId, sets]) => ({
            id: exerciseId,
            sets: sets.map(set => ({
              weight: parseFloat(set.weight) || undefined,
              reps: parseInt(set.reps) || undefined,
              completed: set.completed,
            })),
          })),
          notes: summary.notes,
        });
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      // Continue with local completion even if API fails
    }
    
    setIsWorkoutActive(false);
    setIsWorkoutMinimized(false);
    setExercises([]);
    setElapsedTime(0);
    setExerciseSets({});
    setActiveWorkoutId(null);
  };

  // Minimize workout to floating tracker
  const minimizeWorkout = () => {
    setIsWorkoutMinimized(true);
  };

  // Maximize workout to full screen
  const maximizeWorkout = () => {
    setIsWorkoutMinimized(false);
  };

  // Mark an exercise as completed
  const completeExercise = (exerciseId: string) => {
    const updatedExercises = exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, completed: true } : ex
    );

    setExercises(updatedExercises);

    // Find the next uncompleted exercise
    const nextIndex = updatedExercises.findIndex(ex => !ex.completed);
    if (nextIndex !== -1) {
      setCurrentExerciseIndex(nextIndex);
    }
  };

  // Start rest timer
  const startRestTimer = (seconds: number) => {
    const restTime = customRestTime !== null ? customRestTime : seconds;
    setRestTimeRemaining(restTime);
    setIsRestTimerActive(true);
  };

  // Stop rest timer
  const stopRestTimer = () => {
    setIsRestTimerActive(false);
    setRestTimeRemaining(0);
  };

  // Update exercise sets
  const updateExerciseSets = async (exerciseId: string, sets: ExerciseSet[]) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: sets
    }));
    
    try {
      if (activeWorkoutId) {
        // Log each set to the API
        for (const set of sets) {
          if (set.completed) {
            const setId = typeof set.id === 'string' ? set.id : `set-${set.id}`;
            await workoutService.logSet(activeWorkoutId, exerciseId, {
              id: setId,
              weight: parseFloat(set.weight) || undefined,
              reps: parseInt(set.reps) || undefined,
              completed: set.completed,
              notes: set.notes,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error logging sets to API:', error);
      // Continue with local updates even if API fails
    }
  };

  // Set custom rest timer
  const setCustomRestTimer = (seconds: number) => {
    setCustomRestTime(seconds);
  };

  // Get previous performance for an exercise
  const getExercisePreviousPerformance = async (exerciseName: string) => {
    try {
      // Search for the exercise first
      const searchResult = await workoutService.searchExercises(exerciseName, { limit: 1 });
      
      if (searchResult.exercises.length === 0) {
        return [];
      }
      
      // Get exercise history
      const exerciseId = searchResult.exercises[0].id;
      const history = await workoutService.getExerciseHistory(exerciseId);
      
      // Format the history for the UI
      return history.sets.map(set => ({
        date: new Date(set.workoutDate).toLocaleDateString(),
        weight: set.weight?.toString() || '',
        reps: set.reps?.toString() || '',
        personalRecord: false, // We'll determine this from the personalRecords array
      }));
      
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      return [];
    }
  };

  // Add a new exercise to the workout
  const addExercise = (exercise: Exercise) => {
    setExercises(prev => [...prev, exercise]);

    // Initialize sets for the new exercise
    setExerciseSets(prev => ({
      ...prev,
      [exercise.id]: Array(exercise.sets).fill(0).map((_, idx) => ({
        id: idx + 1,
        weight: '',
        reps: '',
        completed: false,
        repType: exercise.repType || 'standard'
      }))
    }));
  };

  // Remove an exercise from the workout
  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));

    // Remove sets for this exercise
    setExerciseSets(prev => {
      const updated = {...prev};
      delete updated[exerciseId];
      return updated;
    });
  };

  // Save workout summary (title, notes, etc.)
  const saveWorkoutSummary = async (summary: Partial<WorkoutSummary>) => {
    const updatedSummary = { ...workoutSummary, ...summary };

    setWorkoutSummary(prev => {
      if (!prev) return null;
      return { ...prev, ...summary };
    });

    try {
      if (workoutSummary) {
        // Save to workout data service for social integration
        await workoutDataService.saveCompletedWorkout(updatedSummary);
        console.log('Workout saved to social data service');

        // In a real implementation, we would update the workout in the API
        console.log("Saving workout summary:", updatedSummary);
      }

      return;
    } catch (error) {
      console.error('Error saving workout summary:', error);
    }
  };

  // Share workout to social platforms
  const shareWorkout = async (platforms: string[], caption?: string) => {
    if (!workoutSummary) return;

    try {
      // In a real implementation, we would call the API to share the workout
      console.log("Sharing workout to platforms:", platforms, "with caption:", caption);
      
      // For now, just update the local state to reflect the sharing
      setWorkoutSummary(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sharedTo: {
            ...prev.sharedTo,
            platforms
          }
        };
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  };

  const contextValue: WorkoutContextType = {
    isWorkoutActive,
    isWorkoutMinimized,
    currentWorkout: {
      exercises,
      startTime,
      elapsedTime,
      currentExerciseIndex,
      isRestTimerActive,
      restTimeRemaining,
      totalVolume,
      completedSets,
      totalSets: calculateTotalSets(exercises),
      personalRecords,
    },
    workoutSummary,
    startWorkout,
    endWorkout,
    minimizeWorkout,
    maximizeWorkout,
    completeExercise,
    startRestTimer,
    stopRestTimer,
    updateExerciseSets,
    addExercise,
    removeExercise,
    setCustomRestTimer,
    getExercisePreviousPerformance,
    saveWorkoutSummary,
    shareWorkout,
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};

// Custom hook to use the workout context
export const useWorkout = () => useContext(WorkoutContext);

export default WorkoutContext;
