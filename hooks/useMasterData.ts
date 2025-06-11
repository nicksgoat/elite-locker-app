/**
 * Elite Locker - Master Data Hook (Phase 1)
 *
 * This hook provides a unified interface for ALL data operations in the app.
 * It integrates with all existing services and provides a single source of truth.
 * 
 * FEATURES:
 * - Integrates all existing services (dataService, clubService, programService, etc.)
 * - Unified caching and error handling
 * - Offline support with mock data fallbacks
 * - Real-time state management
 * - Granular loading states
 */

import { useCallback, useEffect, useState } from 'react';
import {
    AnalyticsData,
    Club,
    Exercise,
    ExerciseSet,
    Post,
    Program,
    WorkoutExercise,
    WorkoutLog
} from '../types/workout';

// Import all existing services
import { dataService } from '../services/api/dataService';
import { clubService } from '../services/clubService';
import { programService } from '../services/programService';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';

// Import mock data as fallbacks
import { 
  mockClubs, 
  mockExercises, 
  mockPrograms, 
  mockPosts, 
  mockWorkouts,
  mockUsers 
} from '../data/mockData';

// Enhanced data state interface
export interface MasterDataState {
  // Club Data
  clubs: Club[];
  myClubs: Club[];
  clubMemberships: Club[];
  featuredClubs: Club[];

  // Social Data
  posts: Post[];
  myPosts: Post[];
  clubPosts: Record<string, Post[]>;

  // Workout Data
  workouts: WorkoutLog[];
  workoutTemplates: any[];
  activeWorkout: any | null;
  workoutHistory: WorkoutLog[];

  // Program Data
  programs: Program[];
  myPrograms: Program[];
  enrolledPrograms: Program[];
  featuredPrograms: Program[];

  // Exercise Data
  exercises: Exercise[];
  exerciseCategories: string[];

  // User Data
  users: any[];
  currentUser: any | null;

  // Analytics
  analytics: AnalyticsData | null;

  // Loading states
  isLoading: boolean;
  isLoadingClubs: boolean;
  isLoadingPrograms: boolean;
  isLoadingExercises: boolean;
  isLoadingPosts: boolean;
  isLoadingWorkouts: boolean;
  
  // Error states
  error: string | null;
  clubsError: string | null;
  programsError: string | null;
  exercisesError: string | null;
  postsError: string | null;
  workoutsError: string | null;

  // Cache metadata
  lastUpdated: Record<string, number>;
  isOnline: boolean;
}

// API Response interface
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  fromCache?: boolean;
}

export const useMasterData = () => {
  const [state, setState] = useState<MasterDataState>({
    // Club Data
    clubs: [],
    myClubs: [],
    clubMemberships: [],
    featuredClubs: [],

    // Social Data
    posts: [],
    myPosts: [],
    clubPosts: {},

    // Workout Data
    workouts: [],
    workoutTemplates: [],
    activeWorkout: null,
    workoutHistory: [],

    // Program Data
    programs: [],
    myPrograms: [],
    enrolledPrograms: [],
    featuredPrograms: [],

    // Exercise Data
    exercises: [],
    exerciseCategories: [],

    // User Data
    users: [],
    currentUser: null,

    // Analytics
    analytics: null,

    // Loading states
    isLoading: false,
    isLoadingClubs: false,
    isLoadingPrograms: false,
    isLoadingExercises: false,
    isLoadingPosts: false,
    isLoadingWorkouts: false,
    
    // Error states
    error: null,
    clubsError: null,
    programsError: null,
    exercisesError: null,
    postsError: null,
    workoutsError: null,

    // Cache metadata
    lastUpdated: {},
    isOnline: true,
  });

  // Initialize with mock data on mount
  useEffect(() => {
    setState(prev => ({
      ...prev,
      clubs: mockClubs,
      programs: mockPrograms,
      exercises: mockExercises,
      posts: mockPosts,
      workouts: mockWorkouts,
      users: mockUsers,
      lastUpdated: {
        clubs: Date.now(),
        programs: Date.now(),
        exercises: Date.now(),
        posts: Date.now(),
        workouts: Date.now(),
      }
    }));
  }, []);

  // =====================================================
  // CLUB OPERATIONS
  // =====================================================

  const getClubs = useCallback(async (options: { 
    limit?: number; 
    offset?: number; 
    forceRefresh?: boolean 
  } = {}): Promise<Club[]> => {
    const { limit = 20, offset = 0, forceRefresh = false } = options;
    
    setState(prev => ({ ...prev, isLoadingClubs: true, clubsError: null }));

    try {
      // Use the existing clubService
      const clubs = await clubService.getClubs({ limit, offset, bypassCache: forceRefresh });
      
      setState(prev => ({
        ...prev,
        clubs,
        isLoadingClubs: false,
        lastUpdated: { ...prev.lastUpdated, clubs: Date.now() }
      }));

      return clubs;
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setState(prev => ({
        ...prev,
        clubsError: 'Failed to fetch clubs, using offline data',
        isLoadingClubs: false,
        clubs: mockClubs.slice(offset, offset + limit)
      }));
      
      return mockClubs.slice(offset, offset + limit);
    }
  }, []);

  const getFeaturedClubs = useCallback(async (options: { 
    limit?: number; 
    forceRefresh?: boolean 
  } = {}): Promise<Club[]> => {
    const { limit = 5, forceRefresh = false } = options;
    
    setState(prev => ({ ...prev, isLoadingClubs: true, clubsError: null }));

    try {
      const featuredClubs = await clubService.getFeaturedClubs({ limit, bypassCache: forceRefresh });
      
      setState(prev => ({
        ...prev,
        featuredClubs,
        isLoadingClubs: false,
        lastUpdated: { ...prev.lastUpdated, featuredClubs: Date.now() }
      }));

      return featuredClubs;
    } catch (error) {
      console.error('Error fetching featured clubs:', error);
      const fallback = mockClubs.filter(c => c.isPaid).slice(0, limit);
      setState(prev => ({
        ...prev,
        clubsError: 'Failed to fetch featured clubs, using offline data',
        isLoadingClubs: false,
        featuredClubs: fallback
      }));
      
      return fallback;
    }
  }, []);

  const createClub = useCallback(async (clubData: any): Promise<Club> => {
    setState(prev => ({ ...prev, isLoadingClubs: true, clubsError: null }));

    try {
      const newClub = await clubService.createClub(clubData);
      
      setState(prev => ({
        ...prev,
        clubs: [newClub, ...prev.clubs],
        myClubs: [newClub, ...prev.myClubs],
        isLoadingClubs: false
      }));

      return newClub;
    } catch (error) {
      console.error('Error creating club:', error);
      setState(prev => ({
        ...prev,
        clubsError: 'Failed to create club',
        isLoadingClubs: false
      }));
      throw error;
    }
  }, []);

  const joinClub = useCallback(async (clubId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoadingClubs: true, clubsError: null }));

    try {
      await clubService.joinClub(clubId);
      
      // Update local state
      const club = state.clubs.find(c => c.id === clubId);
      if (club) {
        setState(prev => ({
          ...prev,
          clubMemberships: [...prev.clubMemberships, club],
          isLoadingClubs: false
        }));
      }
    } catch (error) {
      console.error('Error joining club:', error);
      setState(prev => ({
        ...prev,
        clubsError: 'Failed to join club',
        isLoadingClubs: false
      }));
      throw error;
    }
  }, [state.clubs]);

  // =====================================================
  // PROGRAM OPERATIONS
  // =====================================================

  const getPrograms = useCallback(async (options: { 
    forceRefresh?: boolean 
  } = {}): Promise<Program[]> => {
    const { forceRefresh = false } = options;
    
    setState(prev => ({ ...prev, isLoadingPrograms: true, programsError: null }));

    try {
      const programs = await programService.getPrograms({ bypassCache: forceRefresh });
      
      setState(prev => ({
        ...prev,
        programs,
        isLoadingPrograms: false,
        lastUpdated: { ...prev.lastUpdated, programs: Date.now() }
      }));

      return programs;
    } catch (error) {
      console.error('Error fetching programs:', error);
      setState(prev => ({
        ...prev,
        programsError: 'Failed to fetch programs, using offline data',
        isLoadingPrograms: false,
        programs: mockPrograms
      }));
      
      return mockPrograms;
    }
  }, []);

  const getFeaturedPrograms = useCallback(async (options: { 
    forceRefresh?: boolean 
  } = {}): Promise<Program[]> => {
    const { forceRefresh = false } = options;
    
    setState(prev => ({ ...prev, isLoadingPrograms: true, programsError: null }));

    try {
      const featuredPrograms = await programService.getFeaturedPrograms({ bypassCache: forceRefresh });
      
      setState(prev => ({
        ...prev,
        featuredPrograms,
        isLoadingPrograms: false,
        lastUpdated: { ...prev.lastUpdated, featuredPrograms: Date.now() }
      }));

      return featuredPrograms;
    } catch (error) {
      console.error('Error fetching featured programs:', error);
      const fallback = mockPrograms.filter(p => p.isPaid);
      setState(prev => ({
        ...prev,
        programsError: 'Failed to fetch featured programs, using offline data',
        isLoadingPrograms: false,
        featuredPrograms: fallback
      }));
      
      return fallback;
    }
  }, []);

  const getMyPrograms = useCallback(async (): Promise<Program[]> => {
    setState(prev => ({ ...prev, isLoadingPrograms: true, programsError: null }));

    try {
      const myPrograms = await programService.getMyPrograms();
      
      setState(prev => ({
        ...prev,
        myPrograms,
        isLoadingPrograms: false,
        lastUpdated: { ...prev.lastUpdated, myPrograms: Date.now() }
      }));

      return myPrograms;
    } catch (error) {
      console.error('Error fetching my programs:', error);
      const fallback = mockPrograms.filter(p => p.authorId === 'user1');
      setState(prev => ({
        ...prev,
        programsError: 'Failed to fetch my programs, using offline data',
        isLoadingPrograms: false,
        myPrograms: fallback
      }));
      
      return fallback;
    }
  }, []);

  // =====================================================
  // EXERCISE OPERATIONS
  // =====================================================

  const getExercises = useCallback(async (options: {
    search?: string;
    muscleGroups?: string[];
    limit?: number;
    offset?: number;
    forceRefresh?: boolean;
  } = {}): Promise<Exercise[]> => {
    const { search = '', muscleGroups = [], limit = 50, offset = 0, forceRefresh = false } = options;
    
    setState(prev => ({ ...prev, isLoadingExercises: true, exercisesError: null }));

    try {
      // Use dataService for exercises (it has better caching)
      const result = await dataService.getExercises();
      
      if (result.data) {
        let exercises = result.data;
        
        // Apply client-side filtering
        if (search) {
          exercises = exercises.filter(ex => 
            ex.name.toLowerCase().includes(search.toLowerCase()) ||
            ex.muscleGroups?.some(mg => mg.toLowerCase().includes(search.toLowerCase()))
          );
        }
        
        if (muscleGroups.length > 0) {
          exercises = exercises.filter(ex =>
            ex.muscleGroups?.some(mg => muscleGroups.includes(mg))
          );
        }
        
        const paginatedExercises = exercises.slice(offset, offset + limit);
        
        setState(prev => ({
          ...prev,
          exercises: paginatedExercises,
          isLoadingExercises: false,
          lastUpdated: { ...prev.lastUpdated, exercises: Date.now() }
        }));

        return paginatedExercises;
      } else {
        throw new Error(result.error || 'Failed to fetch exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setState(prev => ({
        ...prev,
        exercisesError: 'Failed to fetch exercises, using offline data',
        isLoadingExercises: false,
        exercises: mockExercises.slice(offset, offset + limit)
      }));
      
      return mockExercises.slice(offset, offset + limit);
    }
  }, []);

  const searchExercises = useCallback(async (query: string): Promise<Exercise[]> => {
    return getExercises({ search: query });
  }, [getExercises]);

  // =====================================================
  // WORKOUT OPERATIONS
  // =====================================================

  const getWorkoutTemplates = useCallback(async (options: { 
    limit?: number; 
    forceRefresh?: boolean 
  } = {}): Promise<any[]> => {
    const { limit = 10, forceRefresh = false } = options;
    
    setState(prev => ({ ...prev, isLoadingWorkouts: true, workoutsError: null }));

    try {
      const templates = await workoutService.getWorkoutTemplates({ limit });
      
      setState(prev => ({
        ...prev,
        workoutTemplates: templates,
        isLoadingWorkouts: false,
        lastUpdated: { ...prev.lastUpdated, workoutTemplates: Date.now() }
      }));

      return templates;
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      setState(prev => ({
        ...prev,
        workoutsError: 'Failed to fetch workout templates, using offline data',
        isLoadingWorkouts: false,
        workoutTemplates: []
      }));
      
      return [];
    }
  }, []);

  const getWorkoutHistory = useCallback(async (options: { 
    limit?: number; 
    offset?: number; 
    forceRefresh?: boolean 
  } = {}): Promise<WorkoutLog[]> => {
    const { limit = 10, offset = 0, forceRefresh = false } = options;
    
    setState(prev => ({ ...prev, isLoadingWorkouts: true, workoutsError: null }));

    try {
      const history = await workoutService.getWorkoutHistory({ 
        limit, 
        offset, 
        bypassCache: forceRefresh 
      });
      
      setState(prev => ({
        ...prev,
        workoutHistory: history,
        isLoadingWorkouts: false,
        lastUpdated: { ...prev.lastUpdated, workoutHistory: Date.now() }
      }));

      return history;
    } catch (error) {
      console.error('Error fetching workout history:', error);
      setState(prev => ({
        ...prev,
        workoutsError: 'Failed to fetch workout history, using offline data',
        isLoadingWorkouts: false,
        workoutHistory: mockWorkouts.slice(offset, offset + limit)
      }));
      
      return mockWorkouts.slice(offset, offset + limit);
    }
  }, []);

  const startWorkout = useCallback(async (templateId?: string): Promise<any> => {
    setState(prev => ({ ...prev, isLoadingWorkouts: true, workoutsError: null }));

    try {
      const result = await workoutService.startWorkout(templateId || 'new');
      
      setState(prev => ({
        ...prev,
        activeWorkout: result,
        isLoadingWorkouts: false
      }));

      return result;
    } catch (error) {
      console.error('Error starting workout:', error);
      setState(prev => ({
        ...prev,
        workoutsError: 'Failed to start workout',
        isLoadingWorkouts: false
      }));
      throw error;
    }
  }, []);

  const completeWorkout = useCallback(async (workoutId: string, data: any): Promise<any> => {
    setState(prev => ({ ...prev, isLoadingWorkouts: true, workoutsError: null }));

    try {
      const result = await workoutService.completeWorkout(workoutId, data);
      
      setState(prev => ({
        ...prev,
        activeWorkout: null,
        isLoadingWorkouts: false
      }));

      // Refresh workout history
      await getWorkoutHistory({ forceRefresh: true });

      return result;
    } catch (error) {
      console.error('Error completing workout:', error);
      setState(prev => ({
        ...prev,
        workoutsError: 'Failed to complete workout',
        isLoadingWorkouts: false
      }));
      throw error;
    }
  }, [getWorkoutHistory]);

  // =====================================================
  // SOCIAL/POSTS OPERATIONS
  // =====================================================

  const getPosts = useCallback(async (options: { 
    forceRefresh?: boolean 
  } = {}): Promise<Post[]> => {
    const { forceRefresh = false } = options;
    
    setState(prev => ({ ...prev, isLoadingPosts: true, postsError: null }));

    try {
      // Use dataService for posts
      const result = await dataService.getPosts();
      
      if (result.data) {
        setState(prev => ({
          ...prev,
          posts: result.data,
          isLoadingPosts: false,
          lastUpdated: { ...prev.lastUpdated, posts: Date.now() }
        }));

        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setState(prev => ({
        ...prev,
        postsError: 'Failed to fetch posts, using offline data',
        isLoadingPosts: false,
        posts: mockPosts
      }));
      
      return mockPosts;
    }
  }, []);

  // =====================================================
  // ANALYTICS OPERATIONS
  // =====================================================

  const getAnalytics = useCallback(async (): Promise<AnalyticsData> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Calculate analytics from workout history
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
        isLoading: false,
        lastUpdated: { ...prev.lastUpdated, analytics: Date.now() }
      }));

      return analytics;
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const clearError = useCallback((errorType?: string) => {
    if (errorType) {
      setState(prev => ({ ...prev, [`${errorType}Error`]: null }));
    } else {
      setState(prev => ({ 
        ...prev, 
        error: null,
        clubsError: null,
        programsError: null,
        exercisesError: null,
        postsError: null,
        workoutsError: null
      }));
    }
  }, []);

  const refreshAllData = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await Promise.all([
        getClubs({ forceRefresh: true }),
        getPrograms({ forceRefresh: true }),
        getExercises({ forceRefresh: true }),
        getPosts({ forceRefresh: true }),
        getWorkoutHistory({ forceRefresh: true })
      ]);
      
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error refreshing all data:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Failed to refresh some data'
      }));
    }
  }, [getClubs, getPrograms, getExercises, getPosts, getWorkoutHistory]);

  const isDataStale = useCallback((dataType: string, maxAge = 5 * 60 * 1000): boolean => {
    const lastUpdated = state.lastUpdated[dataType];
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated > maxAge;
  }, [state.lastUpdated]);

  // =====================================================
  // RETURN HOOK INTERFACE
  // =====================================================

  return {
    // State
    ...state,

    // Club operations
    getClubs,
    getFeaturedClubs,
    createClub,
    joinClub,

    // Program operations
    getPrograms,
    getFeaturedPrograms,
    getMyPrograms,

    // Exercise operations
    getExercises,
    searchExercises,

    // Workout operations
    getWorkoutTemplates,
    getWorkoutHistory,
    startWorkout,
    completeWorkout,

    // Social operations
    getPosts,

    // Analytics
    getAnalytics,

    // Utilities
    clearError,
    refreshAllData,
    isDataStale,
  };
};

export default useMasterData;
