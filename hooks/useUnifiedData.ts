/**
 * Elite Locker - Unified Data Hook
 *
 * This hook provides a unified interface for all data operations in the app.
 * It replaces all the separate club hooks, workout hooks, and program hooks.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    AnalyticsData,
    Club,
    Exercise,
    ExerciseSet,
    Program,
    WorkoutExercise,
    WorkoutLog
} from '../types/workout';

// For now, let's create a simplified version that doesn't depend on external services
// This will work with the existing app structure

export interface UnifiedDataState {
  // Club Data
  clubs: Club[];
  myClubs: Club[];
  clubMemberships: Club[];

  // Workout Data
  workouts: WorkoutLog[];
  workoutTemplates: WorkoutTemplate[];
  activeWorkout: ActiveWorkout | null;
  workoutHistory: WorkoutLog[];

  // Program Data
  programs: Program[];
  myPrograms: Program[];
  enrolledPrograms: Program[];

  // Exercise Data
  exercises: Exercise[];

  // Analytics
  analytics: AnalyticsData | null;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  duration?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  createdBy: string;
  isPublic: boolean;
  category: string;
  isPaid?: boolean;
  price?: number;
}

export interface ActiveWorkout {
  id: string;
  templateId?: string;
  startTime: Date;
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;
  elapsedTime: number;
  isActive: boolean;
  isMinimized: boolean;
  totalVolume: number;
  completedSets: number;
}

// Mock data for development
const mockClubs: Club[] = [
  {
    id: 'club1',
    name: 'Elite Track Club',
    description: 'For serious track and field athletes',
    ownerId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    memberCount: 150,
    isPaid: true,
    price: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
  },
  {
    id: 'club2',
    name: 'Strength & Power',
    description: 'Building functional strength',
    ownerId: 'user2',
    createdAt: new Date(),
    updatedAt: new Date(),
    memberCount: 89,
    isPaid: false,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
  }
];

const mockPrograms: Program[] = [
  {
    id: 'program1',
    title: 'Elite Hurdle Training',
    description: 'Master the art of hurdling',
    level: 'advanced',
    duration: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'user1',
    isPaid: true,
    price: 99.99
  }
];

const mockExercises: Exercise[] = [
  { id: 'ex1', name: 'Bench Press', muscleGroups: ['chest', 'triceps'] },
  { id: 'ex2', name: 'Squat', muscleGroups: ['quads', 'glutes'] },
  { id: 'ex3', name: 'Deadlift', muscleGroups: ['back', 'hamstrings'] }
];

export const useUnifiedData = () => {
  const [state, setState] = useState<UnifiedDataState>({
    clubs: [],
    myClubs: [],
    clubMemberships: [],
    workouts: [],
    workoutTemplates: [],
    activeWorkout: null,
    workoutHistory: [],
    programs: [],
    myPrograms: [],
    enrolledPrograms: [],
    exercises: [],
    analytics: null,
    isLoading: false,
    error: null,
  });

  // Initialize with mock data
  useEffect(() => {
    setState(prev => ({
      ...prev,
      clubs: mockClubs,
      programs: mockPrograms,
      exercises: mockExercises,
      workoutTemplates: getMockWorkoutTemplates()
    }));
  }, []);

  // =====================================================
  // CLUB OPERATIONS
  // =====================================================

  const getClubs = useCallback(async (options: {
    limit?: number;
    offset?: number;
    category?: string;
  } = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const { limit = 20, offset = 0, category } = options;
      let filteredClubs = mockClubs;

      if (category && category !== 'all') {
        filteredClubs = mockClubs.filter(club =>
          club.description?.toLowerCase().includes(category.toLowerCase())
        );
      }

      const paginatedClubs = filteredClubs.slice(offset, offset + limit);

      setState(prev => ({
        ...prev,
        clubs: paginatedClubs,
        isLoading: false
      }));

      return paginatedClubs;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch clubs',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  const createClub = useCallback(async (clubData: Partial<Club>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newClub: Club = {
        id: `club_${Date.now()}`,
        name: clubData.name || 'New Club',
        description: clubData.description,
        ownerId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        memberCount: 1,
        isPaid: clubData.isPaid || false,
        price: clubData.price,
        imageUrl: clubData.imageUrl
      };

      setState(prev => ({
        ...prev,
        clubs: [newClub, ...prev.clubs],
        myClubs: [newClub, ...prev.myClubs],
        isLoading: false
      }));

      return newClub;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to create club',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  const joinClub = useCallback(async (clubId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => {
        const club = prev.clubs.find(c => c.id === clubId);
        if (club) {
          const updatedClub = { ...club, memberCount: club.memberCount + 1 };
          return {
            ...prev,
            clubs: prev.clubs.map(c => c.id === clubId ? updatedClub : c),
            clubMemberships: [...prev.clubMemberships, updatedClub],
            isLoading: false
          };
        }
        return { ...prev, isLoading: false };
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to join club',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  // =====================================================
  // WORKOUT OPERATIONS
  // =====================================================

  const getWorkoutTemplates = useCallback(async (options: {
    limit?: number;
    category?: string;
    level?: string;
  } = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const templates = getMockWorkoutTemplates();
      const { limit = 20, category, level } = options;

      let filteredTemplates = templates;
      if (category && category !== 'all') {
        filteredTemplates = templates.filter(t => t.category === category);
      }
      if (level && level !== 'all') {
        filteredTemplates = filteredTemplates.filter(t => t.level === level);
      }

      const limitedTemplates = filteredTemplates.slice(0, limit);

      setState(prev => ({
        ...prev,
        workoutTemplates: limitedTemplates,
        isLoading: false
      }));

      return limitedTemplates;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch workout templates',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  const startWorkout = useCallback(async (templateId?: string, exercises: WorkoutExercise[] = []) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // If there's already an active workout, return it
      if (state.activeWorkout?.isActive) {
        setState(prev => ({ ...prev, isLoading: false }));
        return state.activeWorkout;
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      let workoutExercises = exercises;

      // If using a template, get exercises from template
      if (templateId) {
        const template = state.workoutTemplates.find(t => t.id === templateId);
        if (template) {
          workoutExercises = template.exercises;
        }
      }

      const activeWorkout: ActiveWorkout = {
        id: `workout_${Date.now()}`,
        templateId,
        startTime: new Date(),
        exercises: workoutExercises,
        currentExerciseIndex: 0,
        elapsedTime: 0,
        isActive: true,
        isMinimized: false,
        totalVolume: 0,
        completedSets: 0
      };

      setState(prev => ({
        ...prev,
        activeWorkout,
        isLoading: false
      }));

      return activeWorkout;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start workout',
        isLoading: false
      }));
      throw error;
    }
  }, [state.activeWorkout, state.workoutTemplates]);

  const logWorkoutSet = useCallback(async (exerciseId: string, set: ExerciseSet) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      setState(prev => {
        if (!prev.activeWorkout) return prev;

        const updatedActiveWorkout = { ...prev.activeWorkout };
        if (set.completed) {
          updatedActiveWorkout.completedSets += 1;
          if (set.weight && set.reps) {
            updatedActiveWorkout.totalVolume += set.weight * set.reps;
          }
        }

        return {
          ...prev,
          activeWorkout: updatedActiveWorkout
        };
      });
    } catch (error) {
      console.error('Error logging set:', error);
    }
  }, []);

  const completeWorkout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!state.activeWorkout) {
        throw new Error('No active workout to complete');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      const endTime = new Date();
      // Ensure startTime is a Date object
      const startTime = new Date(state.activeWorkout.startTime);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      const workoutLog: WorkoutLog = {
        id: state.activeWorkout.id,
        title: `Workout - ${startTime.toLocaleDateString()}`,
        date: startTime,
        exercises: state.activeWorkout.exercises,
        supersets: [],
        duration,
        notes: '',
        isComplete: true
      };

      setState(prev => ({
        ...prev,
        workoutHistory: [workoutLog, ...prev.workoutHistory],
        workouts: [workoutLog, ...prev.workouts],
        activeWorkout: null,
        isLoading: false
      }));

      return workoutLog;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to complete workout',
        isLoading: false
      }));
      throw error;
    }
  }, [state.activeWorkout]);

  // =====================================================
  // PROGRAM OPERATIONS
  // =====================================================

  const getPrograms = useCallback(async (options: {
    limit?: number;
    category?: string;
    level?: string;
  } = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const { limit = 20, category, level } = options;
      let filteredPrograms = mockPrograms;

      if (category && category !== 'all') {
        filteredPrograms = mockPrograms.filter(p =>
          p.description?.toLowerCase().includes(category.toLowerCase())
        );
      }
      if (level && level !== 'all') {
        filteredPrograms = filteredPrograms.filter(p => p.level === level);
      }

      const limitedPrograms = filteredPrograms.slice(0, limit);

      setState(prev => ({
        ...prev,
        programs: limitedPrograms,
        isLoading: false
      }));

      return limitedPrograms;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch programs',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  // =====================================================
  // ANALYTICS
  // =====================================================

  const getAnalytics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const analytics: AnalyticsData = {
        totalWorkouts: state.workoutHistory.length,
        totalDuration: state.workoutHistory.reduce((sum, w) => sum + w.duration, 0),
        totalVolume: state.workoutHistory.reduce((sum, w) => {
          return sum + w.exercises.reduce((exSum, ex) => {
            return exSum + ex.sets.reduce((setSum, set) => {
              return setSum + ((set.weight || 0) * (set.reps || 0));
            }, 0);
          }, 0);
        }, 0),
        workoutsPerWeek: [0, 1, 2, 1, 3, 2, 4],
        volumePerWeek: [0, 5000, 7500, 6000, 8500, 7000, 9500],
        topExercises: [
          { exerciseId: 'ex1', exerciseName: 'Bench Press', count: 15 },
          { exerciseId: 'ex2', exerciseName: 'Squat', count: 12 },
          { exerciseId: 'ex3', exerciseName: 'Deadlift', count: 10 }
        ]
      };

      setState(prev => ({
        ...prev,
        analytics,
        isLoading: false
      }));

      return analytics;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to fetch analytics',
        isLoading: false
      }));
      throw error;
    }
  }, [state.workoutHistory]);

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      getClubs(),
      getPrograms(),
      getWorkoutTemplates(),
      getAnalytics()
    ]);
  }, [getClubs, getPrograms, getWorkoutTemplates, getAnalytics]);

  return {
    // State
    ...state,

    // Club operations
    getClubs,
    createClub,
    joinClub,

    // Workout operations
    getWorkoutTemplates,
    startWorkout,
    logWorkoutSet,
    completeWorkout,

    // Program operations
    getPrograms,

    // Analytics
    getAnalytics,

    // Utilities
    clearError,
    refreshData,
  };
};

// Helper function to generate mock workout templates
function getMockWorkoutTemplates(): WorkoutTemplate[] {
  return [
    {
      id: 't1',
      name: 'Push Day',
      description: 'Focus on pushing movements - chest, shoulders, triceps',
      exercises: [
        {
          id: 'we1',
          exerciseId: 'ex1',
          exercise: mockExercises[0],
          sets: [
            { id: 's1', weight: 135, reps: 10, completed: false },
            { id: 's2', weight: 155, reps: 8, completed: false },
            { id: 's3', weight: 175, reps: 6, completed: false }
          ]
        }
      ],
      duration: 3600,
      level: 'intermediate',
      createdBy: 'Elite Coach',
      isPublic: true,
      category: 'strength'
    },
    {
      id: 't2',
      name: 'HIIT Circuit',
      description: 'High-intensity interval training for fat burning',
      exercises: [
        {
          id: 'we2',
          exerciseId: 'ex2',
          exercise: mockExercises[1],
          sets: [
            { id: 's1', duration: 30, reps: 1, completed: false },
            { id: 's2', duration: 30, reps: 1, completed: false },
            { id: 's3', duration: 30, reps: 1, completed: false }
          ]
        }
      ],
      duration: 1800,
      level: 'advanced',
      createdBy: 'HIIT Master',
      isPublic: true,
      category: 'cardio'
    },
    {
      id: 't3',
      name: 'Full Body Strength',
      description: 'Complete strength training for all muscle groups',
      exercises: [
        {
          id: 'we3',
          exerciseId: 'ex3',
          exercise: mockExercises[2],
          sets: [
            { id: 's1', weight: 185, reps: 5, completed: false },
            { id: 's2', weight: 205, reps: 5, completed: false },
            { id: 's3', weight: 225, reps: 3, completed: false }
          ]
        }
      ],
      duration: 4500,
      level: 'intermediate',
      createdBy: 'Strength Coach',
      isPublic: true,
      category: 'strength'
    }
  ];
}

export default useUnifiedData;