import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { mockTrainingMaxes } from '../data/mockData';
import { fetchData } from '../lib/api';
import { trainingMaxService, workoutService } from '../services';

// Types
export type MeasurementType =
  | 'weight_reps'
  | 'reps'
  | 'time_based'
  | 'distance'
  | 'rpe'
  | 'height'
  | 'bodyweight'
  | 'assisted';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  targetReps: string;
  restTime: number;
  completed?: boolean;
  category?: string;
  equipment?: string;
  measurementType?: MeasurementType;
  repType?: 'standard' | 'failure' | 'dropset' | 'superset' | 'timed';
  percentage?: number; // For template-based workouts
  previousPerformance?: {
    date: string;
    weight: string;
    reps: string;
    personalRecord?: boolean;
  }[];
  notes?: string;
}

export interface ExerciseSet {
  id: number;
  weight: string;
  reps: string;
  completed: boolean;
  isPersonalRecord?: boolean;
  previousWeight?: string;
  previousReps?: string;
  repType?: 'standard' | 'failure' | 'dropset' | 'superset' | 'timed';
  notes?: string;
  percentage?: string; // For template workouts - percentage of training max
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
  trainingMaxUpdates?: TrainingMaxUpdate[]; // Added for training max tracking
}

export interface TrainingMaxUpdate {
  exerciseId: string;
  exerciseName: string;
  previousMax: number;
  newMax: number;
  improvement: number;
  performance: {
    weight: number;
    reps: number;
    estimated1RM: number;
  };
}

// Workout logging types
export type WorkoutLogType = 'template' | 'repeat' | 'quick_start';

// Template-based workout data
export interface TemplateWorkoutData {
  templateId: string;
  templateName: string;
  exercises: TemplateExercise[];
}

export interface TemplateExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  percentage: number;
  sets: number;
  targetReps: string;
  restTime: number;
  notes?: string;
}

// Repeat workout data
export interface RepeatWorkoutData {
  originalWorkoutId: string;
  originalWorkoutName: string;
  originalDate: Date;
  exercises: RepeatExercise[];
}

export interface RepeatExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: RepeatSet[];
  restTime: number;
  notes?: string;
}

export interface RepeatSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
  notes?: string;
}

interface WorkoutContextType {
  isWorkoutActive: boolean;
  isWorkoutMinimized: boolean;
  workoutLogType: WorkoutLogType | null;
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
  templateData: TemplateWorkoutData | null;
  repeatData: RepeatWorkoutData | null;
  workoutSummary: WorkoutSummary | null;

  // Updated start workout methods for each type
  startTemplateWorkout: (templateId: string) => Promise<void>;
  startRepeatWorkout: (workoutId: string) => Promise<void>;
  startQuickWorkout: (exercises?: Exercise[]) => Promise<void>;

  // Existing methods
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

  // New methods for template-based workouts
  calculateTemplateWeight: (exerciseName: string, percentage: number) => number | null;
  updateTrainingMax: (exerciseName: string, weight: number) => Promise<void>;
  getTrainingMax: (exerciseName: string) => number | null;
  continueTemplateWorkout: () => Promise<void>;
}

// Create context with default values
const WorkoutContext = createContext<WorkoutContextType>({
  isWorkoutActive: false,
  isWorkoutMinimized: false,
  workoutLogType: null,
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
  templateData: null,
  repeatData: null,
  workoutSummary: null,
  startTemplateWorkout: async () => {},
  startRepeatWorkout: async () => {},
  startQuickWorkout: async () => {},
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
  calculateTemplateWeight: () => null,
  updateTrainingMax: async () => {},
  getTrainingMax: () => null,
  continueTemplateWorkout: async () => {},
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

  // New state for different workout types
  const [workoutLogType, setWorkoutLogType] = useState<WorkoutLogType | null>(null);
  const [templateData, setTemplateData] = useState<TemplateWorkoutData | null>(null);
  const [repeatData, setRepeatData] = useState<RepeatWorkoutData | null>(null);
  const [trainingMaxes, setTrainingMaxes] = useState<Record<string, number>>({});

  // Mapping from template exercise IDs to actual exercise IDs for template workouts
  const [exerciseIdMapping, setExerciseIdMapping] = useState<Record<string, string>>({});

  // Load training maxes on initialization
  useEffect(() => {
    const loadTrainingMaxes = async () => {
      try {
        const maxes = await trainingMaxService.getUserTrainingMaxes();
        const maxesRecord: Record<string, number> = {};
        maxes.forEach((max: any) => {
          if (max.exercise && max.exercise.name) {
            maxesRecord[max.exercise.name] = max.maxValue;
          }
        });

        // If no training maxes found in database, use mock data as fallback
        if (Object.keys(maxesRecord).length === 0) {
          console.log('No training maxes found in database, using mock data');
          setTrainingMaxes(mockTrainingMaxes);
        } else {
          setTrainingMaxes(maxesRecord);
        }

        console.log('Loaded training maxes:', Object.keys(maxesRecord).length > 0 ? maxesRecord : mockTrainingMaxes);
      } catch (error) {
        console.error('Error loading training maxes:', error);
        // Use mock data as fallback on error
        console.log('Using mock training maxes as fallback');
        setTrainingMaxes(mockTrainingMaxes);
      }
    };

    loadTrainingMaxes();
  }, []);

  // Timer intervals - use ReturnType<typeof setInterval> to fix type issues
  const workoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate total sets from exercises
  const calculateTotalSets = (exercises: Exercise[]) => {
    return exercises.reduce((total, exercise) => total + exercise.sets, 0);
  };

  // Calculate total volume whenever sets change
  useEffect(() => {
    if (isWorkoutActive) {
      let volume = 0;
      let completed = 0;
      let prs = 0;

      Object.values(exerciseSets).forEach(sets => {
        sets.forEach(set => {
          if (set.completed) {
            completed++;
            const weight = parseFloat(set.weight) || 0;
            const reps = parseFloat(set.reps) || 0;
            volume += weight * reps;

            if (set.isPersonalRecord) {
              prs++;
            }
          }
        });
      });

      setTotalVolume(volume);
      setCompletedSets(completed);
      setPersonalRecords(prs);
    }
  }, [exerciseSets, isWorkoutActive]);

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
      // Use setTimeout to avoid setState during render
      const timeoutId = setTimeout(() => {
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
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [exercises]);

  // Helper function to initialize workout state
  const initializeWorkoutState = (exercisesToUse: Exercise[], workoutId?: string) => {
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
    if (workoutId) setActiveWorkoutId(workoutId);

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
  };

  // 1. Start Template Workout (Percentage-based)
  const startTemplateWorkout = async (templateId: string) => {
    if (isWorkoutActive) {
      maximizeWorkout();
      return;
    }

    try {
      setWorkoutLogType('template');

      // Fetch template data with measurement configurations and percentages
      const template: any = await fetchData('workout_templates', {
        select: `
          *,
          exercises:workout_template_exercises(
            *,
            percentage,
            exercise:exercises(
              *,
              measurement_config
            )
          )
        `,
        filters: { id: templateId },
        single: true,
        bypassCache: true // Bypass cache to ensure fresh data
      });

      if (!template) {
        throw new Error('Template not found');
      }

      console.log('Template loaded:', template);
      console.log('Template exercises:', template.exercises);

      // Create mapping from template exercise IDs to actual exercise IDs
      const idMapping: Record<string, string> = {};
      template.exercises.forEach((ex: any) => {
        idMapping[ex.id] = ex.exercise.id; // Map template exercise ID to actual exercise ID
      });
      setExerciseIdMapping(idMapping);

      // Set template data
      const templateData: TemplateWorkoutData = {
        templateId: template.id,
        templateName: template.title,
        exercises: template.exercises.map((ex: any) => {
          console.log('DEBUG: Template exercise mapping:', {
            templateExerciseId: ex.id,
            actualExerciseId: ex.exercise.id,
            exerciseName: ex.exercise.name
          });
          return {
            id: ex.id, // Keep template exercise ID for UI consistency
            exerciseId: ex.exercise.id, // Store actual exercise ID separately
            exerciseName: ex.exercise.name,
            percentage: ex.percentage || 80, // Use percentage from database, default to 80% if not specified
            sets: ex.sets || 3,
            targetReps: ex.reps || '8-10',
            restTime: ex.rest_time || 90,
            notes: ex.notes
          };
        })
      };
      setTemplateData(templateData);

      console.log('Template data processed:', templateData);

      // Convert to Exercise format for UI
      const exercisesToUse: Exercise[] = templateData.exercises.map(ex => {
        // Get measurement type from exercise config
        const measurementConfig = template.exercises.find((tEx: any) => tEx.exercise.name === ex.exerciseName)?.exercise?.measurement_config;
        const measurementType = measurementConfig?.default || 'weight_reps';

        return {
          id: ex.id,
          name: ex.exerciseName,
          sets: ex.sets,
          targetReps: ex.targetReps,
          restTime: ex.restTime,
          category: 'strength',
          equipment: 'Barbell', // Default equipment
          measurementType: measurementType as MeasurementType,
          percentage: ex.percentage // Add percentage for template workouts
        };
      });

      // Check for missing training maxes
      console.log('Current training maxes:', trainingMaxes);
      const missingMaxes: string[] = [];
      templateData.exercises.forEach(ex => {
        console.log(`Checking training max for: ${ex.exerciseName}`);
        if (!trainingMaxes[ex.exerciseName]) {
          console.log(`Missing training max for: ${ex.exerciseName}`);
          missingMaxes.push(ex.exerciseName);
        } else {
          console.log(`Found training max for ${ex.exerciseName}: ${trainingMaxes[ex.exerciseName]}`);
        }
      });

      // If there are missing training maxes, we need to set them up first
      if (missingMaxes.length > 0) {
        console.log('Missing training maxes:', missingMaxes);
        // Store template data for later use
        setTemplateData(templateData);

        // Throw error with missing exercises to trigger setup flow
        throw new Error(`MISSING_TRAINING_MAXES:${missingMaxes.join(',')}`);
      }

      // Start workout in API
      const result = await workoutService.startWorkout(templateId);
      initializeWorkoutState(exercisesToUse, result.workoutId);

      // Pre-fill sets with template data (percentages and reps)
      const templateExerciseSets: Record<string, ExerciseSet[]> = {};
      templateData.exercises.forEach(ex => {
        // Calculate weight based on training max and percentage
        const calculatedWeight = calculateTemplateWeight(ex.exerciseName, ex.percentage);

        // Use the actual exercise ID (ex.id is now the correct exercise ID)
        templateExerciseSets[ex.id] = Array(ex.sets).fill(0).map((_, idx) => ({
          id: idx + 1,
          weight: calculatedWeight ? calculatedWeight.toString() : '',
          reps: ex.targetReps.includes('-') ? ex.targetReps.split('-')[0] : ex.targetReps, // Use lower bound of rep range
          completed: false,
          repType: 'standard',
          percentage: ex.percentage.toString() // Add percentage to each set for template workouts
        }));
      });

      // Update exercise sets with template data
      setExerciseSets(templateExerciseSets);

    } catch (error) {
      console.error('Error starting template workout:', error);

      // If this is a missing training maxes error, re-throw it to trigger the setup flow
      if (error instanceof Error && error.message.startsWith('MISSING_TRAINING_MAXES:')) {
        throw error;
      }

      // For other errors, fallback to local mode
      setWorkoutLogType('template');
      initializeWorkoutState([]);
    }
  };

  // 2. Start Repeat Workout (Exact copy)
  const startRepeatWorkout = async (workoutId: string) => {
    if (isWorkoutActive) {
      maximizeWorkout();
      return;
    }

    try {
      setWorkoutLogType('repeat');

      // Fetch original workout data
      const originalWorkout: any = await fetchData('workouts', {
        select: `
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*),
            sets:exercise_sets(*)
          )
        `,
        filters: { id: workoutId },
        single: true
      });

      if (!originalWorkout) {
        throw new Error('Original workout not found');
      }

      // Set repeat data
      const repeatData: RepeatWorkoutData = {
        originalWorkoutId: originalWorkout.id,
        originalWorkoutName: originalWorkout.title || 'Repeated Workout',
        originalDate: new Date(originalWorkout.start_time),
        exercises: originalWorkout.exercises.map((ex: any) => ({
          id: ex.id,
          exerciseId: ex.exercise.id,
          exerciseName: ex.exercise.name,
          sets: ex.sets.map((set: any) => ({
            id: set.id,
            weight: set.weight || 0,
            reps: set.reps || 0,
            completed: false, // Start uncompleted
            notes: set.notes
          })),
          restTime: ex.rest_time || 90,
          notes: ex.notes
        }))
      };
      setRepeatData(repeatData);

      // Convert to Exercise format for UI
      const exercisesToUse: Exercise[] = repeatData.exercises.map(ex => ({
        id: ex.id,
        name: ex.exerciseName,
        sets: ex.sets.length,
        targetReps: `${ex.sets[0]?.reps || 8}`, // Use first set's reps as target
        restTime: ex.restTime,
        category: 'strength',
        equipment: 'Barbell', // Default equipment
        previousPerformance: ex.sets.map(set => ({
          weight: set.weight.toString(),
          reps: set.reps.toString(),
          date: repeatData.originalDate.toLocaleDateString()
        }))
      }));

      // Start workout in API
      const result = await workoutService.startWorkout('new');
      initializeWorkoutState(exercisesToUse, result.workoutId);

      // Pre-fill sets with previous data
      const newExerciseSets: Record<string, ExerciseSet[]> = {};
      repeatData.exercises.forEach(ex => {
        newExerciseSets[ex.id] = ex.sets.map((set, idx) => ({
          id: idx + 1,
          weight: set.weight.toString(),
          reps: set.reps.toString(),
          completed: false,
          repType: 'standard'
        }));
      });
      setExerciseSets(newExerciseSets);

    } catch (error) {
      console.error('Error starting repeat workout:', error);
      // Fallback to local mode
      setWorkoutLogType('repeat');
      initializeWorkoutState([]);
    }
  };

  // 3. Start Quick Workout (From scratch)
  const startQuickWorkout = async (exercises: Exercise[] = []) => {
    if (isWorkoutActive) {
      maximizeWorkout();
      return;
    }

    try {
      setWorkoutLogType('quick_start');
      setTemplateData(null);
      setRepeatData(null);

      // Start workout in API
      const result = await workoutService.startWorkout('new');
      initializeWorkoutState(exercises, result.workoutId);

    } catch (error) {
      console.error('Error starting quick workout:', error);
      // Fallback to local mode
      setWorkoutLogType('quick_start');
      initializeWorkoutState(exercises);
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
      if (activeWorkoutId) {
        // Complete the workout in the API
        const result = await workoutService.completeWorkout(activeWorkoutId, {
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

        // Add training max updates to summary
        if (result.trainingMaxUpdates && result.trainingMaxUpdates.length > 0) {
          summary.trainingMaxUpdates = result.trainingMaxUpdates;

          // Show training max notifications
          result.trainingMaxUpdates.forEach((update: any) => {
            console.log(`🎉 New Training Max! ${update.exerciseName}: ${update.newMax} lbs (+${update.improvement} lbs)`);
          });
        }
      }
    } catch (error) {
      console.error('Error completing workout in API:', error);
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
        // For template workouts, use the actual exercise ID from the mapping
        const actualExerciseId = workoutLogType === 'template' && exerciseIdMapping[exerciseId]
          ? exerciseIdMapping[exerciseId]
          : exerciseId;

        console.log('UpdateExerciseSets - Exercise ID mapping:', {
          originalExerciseId: exerciseId,
          actualExerciseId: actualExerciseId,
          workoutLogType: workoutLogType,
          hasMapping: !!exerciseIdMapping[exerciseId]
        });

        // Log each set to the API
        for (const set of sets) {
          if (set.completed) {
            await workoutService.logSet(activeWorkoutId, actualExerciseId, {
              id: set.id.toString(),
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
    setWorkoutSummary(prev => {
      if (!prev) return null;
      return { ...prev, ...summary };
    });

    try {
      if (workoutSummary) {
        // In a real implementation, we would update the workout in the API
        // For now, we'll just log it
        console.log("Saving workout summary:", { ...workoutSummary, ...summary });
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

  // Training Max Methods
  const calculateTemplateWeight = (exerciseName: string, percentage: number): number | null => {
    // First try exact match
    let trainingMax = trainingMaxes[exerciseName];

    // If no exact match, try flexible matching
    if (!trainingMax) {
      // Create a normalized version of the exercise name for matching
      const normalizeExerciseName = (name: string) =>
        name.toLowerCase()
          .replace(/s$/, '') // Remove trailing 's' (squats -> squat)
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();

      const normalizedSearchName = normalizeExerciseName(exerciseName);

      // Look for a match in training maxes
      const matchingKey = Object.keys(trainingMaxes).find(key =>
        normalizeExerciseName(key) === normalizedSearchName
      );

      if (matchingKey) {
        trainingMax = trainingMaxes[matchingKey];
        console.log(`Found training max for ${exerciseName} using flexible matching: ${matchingKey} -> ${trainingMax}`);
      } else {
        console.log(`No training max found for: ${exerciseName}`);
        console.log('Available training maxes:', Object.keys(trainingMaxes));
        return null;
      }
    }

    const weight = trainingMax * (percentage / 100);
    // Round to nearest 2.5 lbs
    return Math.round(weight / 2.5) * 2.5;
  };

  const updateTrainingMax = async (exerciseName: string, weight: number) => {
    try {
      // Update local state immediately
      setTrainingMaxes(prev => ({
        ...prev,
        [exerciseName]: weight
      }));

      // Try to save to database
      try {
        // First, find the exercise ID
        const exercise = await fetchData('exercises', {
          select: 'id',
          filters: { name: exerciseName },
          single: true
        });

        if (exercise && (exercise as any).id) {
          // Update or insert training max using the training max service
          await trainingMaxService.setTrainingMax({
            exerciseId: (exercise as any).id,
            measurementType: 'weight_reps',
            maxValue: weight,
            sourceType: 'manual'
          });
          console.log(`Updated training max for ${exerciseName}: ${weight} lbs (saved to database)`);
        } else {
          console.log(`Updated training max for ${exerciseName}: ${weight} lbs (local only - exercise not found)`);
        }
      } catch (dbError) {
        console.error('Error saving training max to database:', dbError);
        console.log(`Updated training max for ${exerciseName}: ${weight} lbs (local only - database error)`);
      }
    } catch (error) {
      console.error('Error updating training max:', error);
      // Still update locally even if everything fails
      setTrainingMaxes(prev => ({
        ...prev,
        [exerciseName]: weight
      }));
    }
  };

  // Reload training maxes from database
  const reloadTrainingMaxes = async () => {
    try {
      const maxes = await trainingMaxService.getUserTrainingMaxes();
      const maxesRecord: Record<string, number> = {};
      maxes.forEach((max: any) => {
        if (max.exercise && max.exercise.name) {
          maxesRecord[max.exercise.name] = max.maxValue;
        }
      });
      setTrainingMaxes(maxesRecord);
      console.log('Reloaded training maxes:', maxesRecord);
    } catch (error) {
      console.error('Error reloading training maxes:', error);
    }
  };

  const getTrainingMax = (exerciseName: string): number | null => {
    return trainingMaxes[exerciseName] || null;
  };

  // Continue template workout after training maxes are set
  const continueTemplateWorkout = async () => {
    if (!templateData) {
      throw new Error('No template data available');
    }

    try {
      setWorkoutLogType('template');

      // Reload training maxes from database to get the latest values
      const maxes = await trainingMaxService.getUserTrainingMaxes();
      const maxesRecord: Record<string, number> = {};
      maxes.forEach((max: any) => {
        if (max.exercise && max.exercise.name) {
          maxesRecord[max.exercise.name] = max.maxValue;
        }
      });

      // Update state with fresh data
      setTrainingMaxes(maxesRecord);
      console.log('Fresh training maxes for template:', maxesRecord);

      // Check for missing training maxes using fresh data
      const missingMaxes: string[] = [];
      templateData.exercises.forEach(ex => {
        if (!maxesRecord[ex.exerciseName]) {
          missingMaxes.push(ex.exerciseName);
        }
      });

      // If there are still missing training maxes, throw error
      if (missingMaxes.length > 0) {
        throw new Error(`MISSING_TRAINING_MAXES:${missingMaxes.join(',')}`);
      }

      // Convert to Exercise format for UI (need to fetch measurement configs)
      const exercisesToUse: Exercise[] = await Promise.all(templateData.exercises.map(async (ex) => {
        // Fetch exercise details to get measurement config
        try {
          const exerciseDetails = await fetchData('exercises', {
            select: 'id, measurement_config',
            filters: { name: ex.exerciseName },
            single: true
          });

          const measurementType = (exerciseDetails as any)?.measurement_config?.default || 'weight_reps';

          return {
            id: (exerciseDetails as any)?.id || ex.id, // Use real exercise ID from database
            name: ex.exerciseName,
            sets: ex.sets,
            targetReps: ex.targetReps,
            restTime: ex.restTime,
            category: 'strength',
            equipment: 'Barbell', // Default equipment
            measurementType: measurementType as MeasurementType,
            percentage: ex.percentage || 80 // Default to 80% for template workouts
          };
        } catch (error) {
          console.error(`Error fetching measurement config for ${ex.exerciseName}:`, error);
          return {
            id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate fallback ID
            name: ex.exerciseName,
            sets: ex.sets,
            targetReps: ex.targetReps,
            restTime: ex.restTime,
            category: 'strength',
            equipment: 'Barbell',
            measurementType: 'weight_reps' as MeasurementType, // Fallback
            percentage: ex.percentage || 80 // Default to 80% for template workouts
          };
        }
      }));

      // Start workout in API
      const result = await workoutService.startWorkout('new');
      initializeWorkoutState(exercisesToUse, result.workoutId);

      // Pre-fill sets with template data (percentages and reps)
      const templateExerciseSets: Record<string, ExerciseSet[]> = {};
      templateData.exercises.forEach(ex => {
        // Calculate weight based on training max and percentage
        const calculatedWeight = calculateTemplateWeight(ex.exerciseName, ex.percentage);

        templateExerciseSets[ex.id] = Array(ex.sets).fill(0).map((_, idx) => ({
          id: idx + 1,
          weight: calculatedWeight ? calculatedWeight.toString() : '',
          reps: ex.targetReps.includes('-') ? ex.targetReps.split('-')[0] : ex.targetReps, // Use lower bound of rep range
          completed: false,
          repType: 'standard',
          percentage: ex.percentage.toString() // Add percentage to each set for template workouts
        }));
      });

      // Update exercise sets with template data
      setExerciseSets(templateExerciseSets);

      console.log('Template workout continued successfully with calculated weights');

    } catch (error) {
      console.error('Error continuing template workout:', error);
      throw error;
    }
  };

  const contextValue: WorkoutContextType = {
    isWorkoutActive,
    isWorkoutMinimized,
    workoutLogType,
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
    templateData,
    repeatData,
    workoutSummary,
    startTemplateWorkout,
    startRepeatWorkout,
    startQuickWorkout,
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
    calculateTemplateWeight,
    updateTrainingMax,
    getTrainingMax,
    continueTemplateWorkout,
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
