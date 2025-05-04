import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

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
  id: number;
  weight: string;
  reps: string;
  completed: boolean;
  isPersonalRecord?: boolean;
  repType?: 'standard' | 'failure' | 'dropset' | 'superset' | 'timed';
  notes?: string;
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
  getExercisePreviousPerformance: (exerciseName: string) => any[];
  saveWorkoutSummary: (summary: Partial<WorkoutSummary>) => void;
  shareWorkout: (platforms: string[], caption?: string) => void;
}

// Default mock exercises with enhanced data
const mockExercises: Exercise[] = [
  {
    id: 'e1',
    name: 'Barbell Bench Press',
    sets: 4,
    targetReps: '8-10',
    restTime: 90, // seconds
    category: 'Chest',
    equipment: 'Barbell',
    measurementType: 'weight',
    repType: 'standard',
    previousPerformance: [
      { date: '2023-05-01', weight: '225', reps: '8', personalRecord: true },
      { date: '2023-04-24', weight: '215', reps: '8', personalRecord: false }
    ]
  },
  {
    id: 'e2',
    name: 'Incline Dumbbell Press',
    sets: 3,
    targetReps: '10-12',
    restTime: 60,
    category: 'Chest',
    equipment: 'Dumbbell',
    measurementType: 'weight',
    repType: 'standard',
    previousPerformance: [
      { date: '2023-05-01', weight: '70', reps: '10', personalRecord: false },
      { date: '2023-04-24', weight: '65', reps: '12', personalRecord: false }
    ]
  },
  {
    id: 'e3',
    name: 'Cable Flyes',
    sets: 3,
    targetReps: '12-15',
    restTime: 45,
    category: 'Chest',
    equipment: 'Cable',
    measurementType: 'weight',
    repType: 'standard'
  },
  {
    id: 'e4',
    name: 'Tricep Pushdowns',
    sets: 3,
    targetReps: '12-15',
    restTime: 45,
    category: 'Arms',
    equipment: 'Cable',
    measurementType: 'weight',
    repType: 'standard'
  },
  {
    id: 'e5',
    name: 'Overhead Tricep Extensions',
    sets: 3,
    targetReps: '12-15',
    restTime: 45,
    category: 'Arms',
    equipment: 'Cable',
    measurementType: 'weight',
    repType: 'standard'
  },
];

// Mock previous workouts data
const mockPreviousWorkouts = [
  {
    id: 'w1',
    title: 'Monday Push Day',
    date: '2023-05-01',
    exercises: [
      {
        name: 'Barbell Bench Press',
        sets: [
          { weight: '225', reps: '8', isPersonalRecord: true },
          { weight: '225', reps: '7', isPersonalRecord: false },
          { weight: '205', reps: '8', isPersonalRecord: false },
        ]
      },
      {
        name: 'Incline Dumbbell Press',
        sets: [
          { weight: '70', reps: '10', isPersonalRecord: false },
          { weight: '70', reps: '9', isPersonalRecord: false },
          { weight: '65', reps: '10', isPersonalRecord: false },
        ]
      }
    ]
  },
  {
    id: 'w2',
    title: 'Thursday Pull Day',
    date: '2023-05-04',
    exercises: [
      {
        name: 'Pull-Ups',
        sets: [
          { weight: 'BW', reps: '12', isPersonalRecord: true },
          { weight: 'BW', reps: '10', isPersonalRecord: false },
          { weight: 'BW', reps: '8', isPersonalRecord: false },
        ]
      }
    ]
  }
];

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
  getExercisePreviousPerformance: () => [],
  saveWorkoutSummary: () => {},
  shareWorkout: () => {},
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
  
  // Track exercise sets separately to allow dynamic set management
  const [exerciseSets, setExerciseSets] = useState<Record<string, ExerciseSet[]>>({});
  
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
  
  // Start tracking workout time when active
  useEffect(() => {
    if (isWorkoutActive) {
      if (!workoutTimerRef.current) {
        workoutTimerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      }
    } else {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
        workoutTimerRef.current = null;
      }
    }
    
    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
        workoutTimerRef.current = null;
      }
    };
  }, [isWorkoutActive]);
  
  // Rest timer logic
  useEffect(() => {
    if (isRestTimerActive && restTimeRemaining > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimeRemaining(prev => {
          if (prev <= 1) {
            stopRestTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    }
    
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    };
  }, [isRestTimerActive, restTimeRemaining]);
  
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
  
  // Start a new workout
  const startWorkout = (workoutExercises: Exercise[] = mockExercises) => {
    // If already active, just maximize it
    if (isWorkoutActive) {
      maximizeWorkout();
      return;
    }
    
    // Otherwise start a new one
    setExercises(workoutExercises);
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
    workoutExercises.forEach(exercise => {
      // Pre-fill with previous workout data if available
      newExerciseSets[exercise.id] = Array(exercise.sets).fill(0).map((_, idx) => {
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
    });
    setExerciseSets(newExerciseSets);
  };
  
  // End the current workout and generate summary
  const endWorkout = () => {
    if (workoutTimerRef.current) {
      clearInterval(workoutTimerRef.current);
      workoutTimerRef.current = null;
    }
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    
    // Generate workout summary
    const summary: WorkoutSummary = {
      totalVolume,
      totalSets: completedSets,
      totalExercises: exercises.filter(ex => ex.completed).length,
      duration: elapsedTime,
      personalRecords,
      date: startTime || new Date(),
    };
    
    setWorkoutSummary(summary);
    setIsWorkoutActive(false);
    setIsWorkoutMinimized(false);
    setExercises([]);
    setElapsedTime(0);
    setExerciseSets({});
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
    
    // Make sure workout timer runs again
    if (isWorkoutActive && !workoutTimerRef.current) {
      workoutTimerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  };
  
  // Update exercise sets
  const updateExerciseSets = (exerciseId: string, sets: ExerciseSet[]) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: sets
    }));
    
    // Also update the exercise's set count if necessary
    setExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId ? { ...ex, sets: sets.length } : ex
      )
    );
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
  
  // Set custom rest timer
  const setCustomRestTimer = (seconds: number) => {
    setCustomRestTime(seconds);
  };
  
  // Get previous performance data for a specific exercise
  const getExercisePreviousPerformance = (exerciseName: string) => {
    // In a real app, this would query a database
    // For now, we'll just search through our mock data
    const mockResults = [];
    
    for (const workout of mockPreviousWorkouts) {
      const matchingExercise = workout.exercises.find(ex => ex.name === exerciseName);
      if (matchingExercise) {
        mockResults.push({
          date: workout.date,
          sets: matchingExercise.sets,
          title: workout.title
        });
      }
    }
    
    return mockResults;
  };
  
  // Save workout summary (title, notes, etc.)
  const saveWorkoutSummary = (summary: Partial<WorkoutSummary>) => {
    setWorkoutSummary(prev => {
      if (!prev) return null;
      return { ...prev, ...summary };
    });
    
    // In a real app, this would persist to database
    console.log("Saving workout:", { ...workoutSummary, ...summary });
  };
  
  // Share workout to social platforms
  const shareWorkout = (platforms: string[], caption?: string) => {
    if (!workoutSummary) return;
    
    const shareData = {
      ...workoutSummary,
      sharedTo: {
        platforms
      },
      caption
    };
    
    console.log("Sharing workout:", shareData);
    // In a real app, this would trigger the share generation and native share sheet
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