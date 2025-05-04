import React, { createContext, useState, useContext, useEffect } from 'react';

// Types for programs
export interface ProgramPhase {
  name: string;
  weeks: number;
  deload: boolean;
}

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  percentage?: number;
  note?: string;
}

export interface ProgramWorkout {
  id: string;
  title: string;
  week: number;
  day: number;
  exercises: ProgramExercise[];
  notes?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  phases_config: ProgramPhase[];
  is_public: boolean;
  club_id?: string;
  thumbnail?: string;
  goal?: string;
  level?: string;
  workouts: ProgramWorkout[];
  created_by: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ProgramSubscription {
  id: string;
  programId: string;
  startDate: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  currentWeek: number;
  currentDay: number;
  addToCalendar: boolean;
  receiveReminders: boolean;
  adaptToProgress: boolean;
  autoScheduleDeloads: boolean;
}

export interface TrainingMax {
  exerciseName: string;
  weight: number;
  unit: 'kg' | 'lb';
  lastUpdated: Date;
}

interface ProgramContextType {
  programs: Program[];
  featuredPrograms: Program[];
  myPrograms: Program[];
  mySubscriptions: ProgramSubscription[];
  currentProgram: Program | null;
  trainingMaxes: TrainingMax[];
  
  getProgram: (programId: string) => Program | null;
  getProgramWorkout: (programId: string, workoutId: string) => ProgramWorkout | null;
  subscribeToProgram: (programId: string, options: Partial<ProgramSubscription>) => void;
  updateSubscriptionStatus: (subscriptionId: string, status: ProgramSubscription['status']) => void;
  updateTrainingMax: (exerciseName: string, weight: number, unit: 'kg' | 'lb') => void;
  getTrainingMax: (exerciseName: string) => TrainingMax | null;
  calculateWorkingWeight: (exerciseName: string, percentage: number) => number | null;
  markWorkoutComplete: (subscriptionId: string, workoutId: string) => void;
  getNextScheduledWorkout: (subscriptionId: string) => {
    workout: ProgramWorkout | null;
    date: Date | null;
  };
}

// Mock training maxes
const mockTrainingMaxes: TrainingMax[] = [
  {
    exerciseName: 'Barbell Bench Press',
    weight: 225,
    unit: 'lb',
    lastUpdated: new Date('2023-10-15')
  },
  {
    exerciseName: 'Back Squat',
    weight: 315,
    unit: 'lb',
    lastUpdated: new Date('2023-10-12')
  },
  {
    exerciseName: 'Deadlift',
    weight: 405,
    unit: 'lb',
    lastUpdated: new Date('2023-10-10')
  },
  {
    exerciseName: 'Overhead Press',
    weight: 135,
    unit: 'lb',
    lastUpdated: new Date('2023-10-08')
  }
];

// Mock programs (truncated for context file)
const mockPrograms: Program[] = [
  {
    id: 'p1',
    title: 'ELITE Power Building',
    description: 'Complete 8-week program focusing on strength and hypertrophy with built-in progression.',
    duration_weeks: 8,
    phases_config: [
      { name: 'Hypertrophy', weeks: 3, deload: false },
      { name: 'Deload', weeks: 1, deload: true },
      { name: 'Strength', weeks: 3, deload: false },
      { name: 'Peak', weeks: 1, deload: false }
    ],
    is_public: true,
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
    goal: 'Strength',
    level: 'Intermediate',
    created_by: {
      id: 'c1',
      name: 'Elite Coaching Staff',
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d'
    },
    workouts: [
      {
        id: 'w1',
        title: 'Day 1: Upper Hypertrophy',
        week: 1,
        day: 1,
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10 @70%', rest: 90, percentage: 70 },
          { name: 'Bent-Over Row', sets: 4, reps: '10-12 @65%', rest: 90, percentage: 65 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Lat Pulldown', sets: 3, reps: '12-15', rest: 60 },
          { name: 'Lateral Raises', sets: 3, reps: '15-20', rest: 45 },
          { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: 45 }
        ]
      },
      {
        id: 'w2',
        title: 'Day 2: Lower Hypertrophy',
        week: 1,
        day: 2,
        exercises: [
          { name: 'Back Squat', sets: 4, reps: '8-10 @70%', rest: 120, percentage: 70 },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-10 @65%', rest: 90, percentage: 65 },
          { name: 'Leg Press', sets: 3, reps: '10-12', rest: 90 },
          { name: 'Leg Curl', sets: 3, reps: '12-15', rest: 60 },
          { name: 'Standing Calf Raise', sets: 4, reps: '15-20', rest: 45 }
        ]
      }
    ]
  },
  {
    id: 'p2',
    title: '12-Week Transformation',
    description: 'Progressive overload program designed for body composition changes with nutrition guidance.',
    duration_weeks: 12,
    phases_config: [
      { name: 'Foundation', weeks: 4, deload: false },
      { name: 'Deload', weeks: 1, deload: true },
      { name: 'Hypertrophy', weeks: 4, deload: false },
      { name: 'Deload', weeks: 1, deload: true },
      { name: 'Definition', weeks: 2, deload: false }
    ],
    is_public: true,
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
    goal: 'Hypertrophy',
    level: 'Beginner',
    created_by: {
      id: 'c2',
      name: 'Transform Fitness',
      avatar: 'https://images.unsplash.com/photo-1549351512-c5e12b11e283'
    },
    workouts: [] // Truncated for brevity
  }
];

// Mock subscriptions
const mockSubscriptions: ProgramSubscription[] = [
  {
    id: 's1',
    programId: 'p1',
    startDate: new Date('2023-11-01'),
    status: 'active',
    currentWeek: 2,
    currentDay: 3,
    addToCalendar: true,
    receiveReminders: true,
    adaptToProgress: true,
    autoScheduleDeloads: true
  }
];

// Create the context with a default value
const ProgramContext = createContext<ProgramContextType>({
  programs: [],
  featuredPrograms: [],
  myPrograms: [],
  mySubscriptions: [],
  currentProgram: null,
  trainingMaxes: [],
  
  getProgram: () => null,
  getProgramWorkout: () => null,
  subscribeToProgram: () => {},
  updateSubscriptionStatus: () => {},
  updateTrainingMax: () => {},
  getTrainingMax: () => null,
  calculateWorkingWeight: () => null,
  markWorkoutComplete: () => {},
  getNextScheduledWorkout: () => ({ workout: null, date: null }),
});

export const ProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [featuredPrograms, setFeaturedPrograms] = useState<Program[]>(mockPrograms.filter(p => p.is_public));
  const [myPrograms, setMyPrograms] = useState<Program[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<ProgramSubscription[]>(mockSubscriptions);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [trainingMaxes, setTrainingMaxes] = useState<TrainingMax[]>(mockTrainingMaxes);

  // Get a single program by ID
  const getProgram = (programId: string): Program | null => {
    return programs.find(program => program.id === programId) || null;
  };

  // Get a specific workout from a program
  const getProgramWorkout = (programId: string, workoutId: string): ProgramWorkout | null => {
    const program = getProgram(programId);
    if (!program) return null;
    return program.workouts.find(workout => workout.id === workoutId) || null;
  };

  // Subscribe to a program
  const subscribeToProgram = (programId: string, options: Partial<ProgramSubscription>) => {
    const program = getProgram(programId);
    if (!program) return;

    const newSubscription: ProgramSubscription = {
      id: `s${Date.now()}`, // Generate a unique ID
      programId,
      startDate: options.startDate || new Date(),
      status: 'active',
      currentWeek: 1,
      currentDay: 1,
      addToCalendar: options.addToCalendar !== undefined ? options.addToCalendar : true,
      receiveReminders: options.receiveReminders !== undefined ? options.receiveReminders : true,
      adaptToProgress: options.adaptToProgress !== undefined ? options.adaptToProgress : true,
      autoScheduleDeloads: options.autoScheduleDeloads !== undefined ? options.autoScheduleDeloads : true,
    };

    setMySubscriptions([...mySubscriptions, newSubscription]);
  };

  // Update subscription status (active, paused, completed, cancelled)
  const updateSubscriptionStatus = (subscriptionId: string, status: ProgramSubscription['status']) => {
    setMySubscriptions(
      mySubscriptions.map(sub => 
        sub.id === subscriptionId ? { ...sub, status } : sub
      )
    );
  };

  // Update a training max for an exercise
  const updateTrainingMax = (exerciseName: string, weight: number, unit: 'kg' | 'lb') => {
    const existingIndex = trainingMaxes.findIndex(tm => tm.exerciseName === exerciseName);
    
    if (existingIndex >= 0) {
      const updatedMaxes = [...trainingMaxes];
      updatedMaxes[existingIndex] = {
        ...updatedMaxes[existingIndex],
        weight,
        unit,
        lastUpdated: new Date()
      };
      setTrainingMaxes(updatedMaxes);
    } else {
      setTrainingMaxes([
        ...trainingMaxes,
        {
          exerciseName,
          weight,
          unit,
          lastUpdated: new Date()
        }
      ]);
    }
  };

  // Get a training max for an exercise
  const getTrainingMax = (exerciseName: string): TrainingMax | null => {
    return trainingMaxes.find(tm => tm.exerciseName === exerciseName) || null;
  };

  // Calculate working weight based on percentage of training max
  const calculateWorkingWeight = (exerciseName: string, percentage: number): number | null => {
    const trainingMax = getTrainingMax(exerciseName);
    if (!trainingMax) return null;
    
    // Calculate and round to nearest 2.5
    const rawWeight = trainingMax.weight * (percentage / 100);
    return Math.round(rawWeight / 2.5) * 2.5;
  };

  // Mark a workout as complete
  const markWorkoutComplete = (subscriptionId: string, workoutId: string) => {
    // In a real app, this would update a completed workouts array
    // and potentially advance the current week/day if appropriate
    
    // Here we'll just simulate advancing the program
    setMySubscriptions(
      mySubscriptions.map(sub => {
        if (sub.id === subscriptionId) {
          // Simple logic to advance to next day
          let nextDay = sub.currentDay + 1;
          let nextWeek = sub.currentWeek;
          
          // If we've completed all days in the week, advance to next week
          if (nextDay > 5) { // Assuming 5 days per week
            nextDay = 1;
            nextWeek++;
          }

          return {
            ...sub,
            currentWeek: nextWeek,
            currentDay: nextDay
          };
        }
        return sub;
      })
    );
  };

  // Get the next scheduled workout
  const getNextScheduledWorkout = (subscriptionId: string) => {
    const subscription = mySubscriptions.find(sub => sub.id === subscriptionId);
    if (!subscription || subscription.status !== 'active') {
      return { workout: null, date: null };
    }

    const program = getProgram(subscription.programId);
    if (!program) {
      return { workout: null, date: null };
    }

    // Find the next workout based on current week/day
    const nextWorkout = program.workouts.find(
      workout => workout.week === subscription.currentWeek && workout.day === subscription.currentDay
    ) || null;

    // Calculate the date for this workout
    const nextDate = new Date(subscription.startDate);
    const totalDays = ((subscription.currentWeek - 1) * 7) + (subscription.currentDay - 1);
    nextDate.setDate(nextDate.getDate() + totalDays);

    return {
      workout: nextWorkout,
      date: nextDate
    };
  };

  return (
    <ProgramContext.Provider
      value={{
        programs,
        featuredPrograms,
        myPrograms,
        mySubscriptions,
        currentProgram,
        trainingMaxes,
        getProgram,
        getProgramWorkout,
        subscribeToProgram,
        updateSubscriptionStatus,
        updateTrainingMax,
        getTrainingMax,
        calculateWorkingWeight,
        markWorkoutComplete,
        getNextScheduledWorkout,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgram = () => useContext(ProgramContext); 