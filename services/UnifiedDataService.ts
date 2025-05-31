/**
 * Elite Locker - Unified Data Service
 *
 * This is the single source of truth for ALL data operations in the app.
 * It consolidates clubs, workouts, programs, templates, and logging functionality.
 */

// Simple API Error class for type safety
export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Import types from the correct path
import {
    AnalyticsData,
    Club,
    Event,
    Exercise,
    ExerciseSet,
    Post,
    Program,
    WorkoutExercise,
    WorkoutLog
} from '../types/workout';

// Import mock data
import {
    mockExercises,
    mockPrograms
} from '../data/mockData';

export interface UnifiedDataState {
  // Club Data
  clubs: Club[];
  myClubs: Club[];
  clubMemberships: Club[];
  clubPosts: Record<string, Post[]>;
  clubEvents: Record<string, Event[]>;

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
  exerciseCategories: string[];

  // Analytics
  analytics: AnalyticsData | null;
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

// Mock API functions - in production these would connect to actual APIs
const getCurrentUser = async () => {
  return { id: 'user1', email: 'test@example.com' };
};

const fetchData = async (table: string, options: any) => {
  // Mock API implementation - simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return null; // Return null to trigger fallback to mock data
};

const insertData = async (table: string, data: any) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { id: `${table}_${Date.now()}`, ...data };
};

const updateData = async (table: string, id: string, data: any) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { id, ...data };
};

const deleteData = async (table: string, id: string) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return { success: true };
};

class UnifiedDataService {
  private static instance: UnifiedDataService;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private dataState: UnifiedDataState = {
    clubs: [],
    myClubs: [],
    clubMemberships: [],
    clubPosts: {},
    clubEvents: {},
    workouts: [],
    workoutTemplates: [],
    activeWorkout: null,
    workoutHistory: [],
    programs: [],
    myPrograms: [],
    enrolledPrograms: [],
    exercises: [],
    exerciseCategories: [],
    analytics: null,
  };

  private constructor() {}

  public static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }

  // Cache management
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = 300000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  // =====================================================
  // CLUB OPERATIONS - Single source of truth
  // =====================================================

  async getClubs(options: {
    limit?: number;
    offset?: number;
    category?: string;
    bypassCache?: boolean;
  } = {}): Promise<Club[]> {
    const { limit = 20, offset = 0, category, bypassCache = false } = options;
    const cacheKey = `clubs_${limit}_${offset}_${category || 'all'}`;

    if (!bypassCache) {
      const cached = this.getCachedData<Club[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const filters: any = {};
      if (category && category !== 'all') filters.category = category;

      const data = await fetchData('clubs', {
        select: '*',
        filters,
        order: { column: 'created_at', ascending: false },
        limit,
        offset
      });

      const clubs = data || [];
      this.dataState.clubs = clubs;
      this.setCachedData(cacheKey, clubs, 600000); // 10 minutes
      return clubs;
    } catch (error) {
      console.error('Error fetching clubs:', error);
      const fallback = [];
      this.dataState.clubs = fallback;
      return fallback;
    }
  }

  async getMyClubs(bypassCache = false): Promise<Club[]> {
    const cacheKey = 'my_clubs';

    if (!bypassCache) {
      const cached = this.getCachedData<Club[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const user = await getCurrentUser();
      if (!user) throw new ApiError('User not authenticated', 401);

      const data = await fetchData('clubs', {
        select: '*',
        filters: { owner_id: user.id },
        order: { column: 'created_at', ascending: false }
      });

      const clubs = data || [];
      this.dataState.myClubs = clubs;
      this.setCachedData(cacheKey, clubs, 300000); // 5 minutes
      return clubs;
    } catch (error) {
      console.error('Error fetching my clubs:', error);
      const fallback = [];
      this.dataState.myClubs = fallback;
      return fallback;
    }
  }

  async createClub(clubData: Partial<Club>): Promise<Club> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new ApiError('User not authenticated', 401);

      const newClub = await insertData('clubs', {
        ...clubData,
        owner_id: user.id,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Update local state
      this.dataState.clubs.unshift(newClub);
      this.dataState.myClubs.unshift(newClub);

      // Clear relevant caches
      this.cache.clear();

      return newClub;
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  }

  async joinClub(clubId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new ApiError('User not authenticated', 401);

      await insertData('club_members', {
        club_id: clubId,
        user_id: user.id,
        role: 'member',
        joined_at: new Date()
      });

      // Update local state
      const club = this.dataState.clubs.find(c => c.id === clubId);
      if (club) {
        club.memberCount += 1;
        this.dataState.clubMemberships.push(club);
      }

      // Clear relevant caches
      this.cache.delete('club_memberships');
    } catch (error) {
      console.error('Error joining club:', error);
      throw error;
    }
  }

  // =====================================================
  // WORKOUT OPERATIONS - Single source of truth
  // =====================================================

  async getWorkoutTemplates(options: {
    limit?: number;
    category?: string;
    level?: string;
    bypassCache?: boolean;
  } = {}): Promise<WorkoutTemplate[]> {
    const { limit = 20, category, level, bypassCache = false } = options;
    const cacheKey = `workout_templates_${limit}_${category || 'all'}_${level || 'all'}`;

    if (!bypassCache) {
      const cached = this.getCachedData<WorkoutTemplate[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const filters: any = {};
      if (category && category !== 'all') filters.category = category;
      if (level && level !== 'all') filters.level = level;

      const data = await fetchData('workout_templates', {
        select: `
          *,
          exercises:workout_template_exercises(
            *,
            exercise:exercises(*)
          )
        `,
        filters,
        order: { column: 'created_at', ascending: false },
        limit
      });

      const templates = data || this.getMockWorkoutTemplates().slice(0, limit);
      this.dataState.workoutTemplates = templates;
      this.setCachedData(cacheKey, templates, 600000); // 10 minutes
      return templates;
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      const fallback = this.getMockWorkoutTemplates().slice(0, limit);
      this.dataState.workoutTemplates = fallback;
      return fallback;
    }
  }

  async startWorkout(templateId?: string, exercises: WorkoutExercise[] = []): Promise<ActiveWorkout> {
    try {
      const user = await getCurrentUser();
      if (!user) throw new ApiError('User not authenticated', 401);

      // If there's already an active workout, return it
      if (this.dataState.activeWorkout?.isActive) {
        return this.dataState.activeWorkout;
      }

      let workoutExercises = exercises;

      // If using a template, get exercises from template
      if (templateId) {
        const template = this.dataState.workoutTemplates.find(t => t.id === templateId);
        if (template) {
          workoutExercises = template.exercises;
        }
      }

      // Create workout in database
      const workout = await insertData('workouts', {
        user_id: user.id,
        template_id: templateId || null,
        start_time: new Date(),
        status: 'in_progress'
      });

      // Create active workout state
      const activeWorkout: ActiveWorkout = {
        id: workout.id,
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

      this.dataState.activeWorkout = activeWorkout;
      return activeWorkout;
    } catch (error) {
      console.error('Error starting workout:', error);
      // Create mock active workout for offline use
      const activeWorkout: ActiveWorkout = {
        id: `workout_${Date.now()}`,
        templateId,
        startTime: new Date(),
        exercises,
        currentExerciseIndex: 0,
        elapsedTime: 0,
        isActive: true,
        isMinimized: false,
        totalVolume: 0,
        completedSets: 0
      };
      this.dataState.activeWorkout = activeWorkout;
      return activeWorkout;
    }
  }

  async logWorkoutSet(exerciseId: string, set: ExerciseSet): Promise<void> {
    try {
      if (!this.dataState.activeWorkout) return;

      const user = await getCurrentUser();
      if (!user) throw new ApiError('User not authenticated', 401);

      // First find or create the workout_exercise
      const workoutExercises = await fetchData('workout_exercises', {
        filters: { workout_id: this.dataState.activeWorkout.id, exercise_id: exerciseId }
      });

      let workoutExerciseId;
      if (workoutExercises.length === 0) {
        const workoutExercise = await insertData('workout_exercises', {
          workout_id: this.dataState.activeWorkout.id,
          exercise_id: exerciseId,
          order_index: 0
        });
        workoutExerciseId = workoutExercise.id;
      } else {
        workoutExerciseId = workoutExercises[0].id;
      }

      await insertData('exercise_sets', {
        workout_exercise_id: workoutExerciseId,
        weight: set.weight,
        reps: set.reps,
        duration: set.duration,
        distance: set.distance,
        completed: set.completed,
        notes: set.notes,
        order_index: set.id
      });

      // Update local state
      if (set.completed) {
        this.dataState.activeWorkout.completedSets += 1;
        if (set.weight && set.reps) {
          this.dataState.activeWorkout.totalVolume += set.weight * set.reps;
        }
      }
    } catch (error) {
      console.error('Error logging set:', error);
      // Continue with local updates even if API fails
    }
  }

  async completeWorkout(): Promise<WorkoutLog> {
    try {
      if (!this.dataState.activeWorkout) {
        throw new Error('No active workout to complete');
      }

      const user = await getCurrentUser();
      if (!user) throw new ApiError('User not authenticated', 401);

      const endTime = new Date();
      // Ensure startTime is a Date object
      const startTime = new Date(this.dataState.activeWorkout.startTime);
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Update workout in database
      const completedWorkout = await updateData('workouts', this.dataState.activeWorkout.id, {
        end_time: endTime,
        duration,
        status: 'completed',
        total_volume: this.dataState.activeWorkout.totalVolume,
        completed_sets: this.dataState.activeWorkout.completedSets
      });

      // Create workout log
      const workoutLog: WorkoutLog = {
        id: this.dataState.activeWorkout.id,
        title: `Workout - ${this.dataState.activeWorkout.startTime.toLocaleDateString()}`,
        date: this.dataState.activeWorkout.startTime,
        exercises: this.dataState.activeWorkout.exercises,
        supersets: [],
        duration,
        notes: '',
        isComplete: true
      };

      // Update local state
      this.dataState.workoutHistory.unshift(workoutLog);
      this.dataState.workouts.unshift(workoutLog);
      this.dataState.activeWorkout = null;

      // Clear workout caches
      this.cache.delete('workout_history');
      this.cache.delete('workouts');

      return workoutLog;
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  }

  // =====================================================
  // PROGRAM OPERATIONS - Single source of truth
  // =====================================================

  async getPrograms(options: {
    limit?: number;
    category?: string;
    level?: string;
    bypassCache?: boolean;
  } = {}): Promise<Program[]> {
    const { limit = 20, category, level, bypassCache = false } = options;
    const cacheKey = `programs_${limit}_${category || 'all'}_${level || 'all'}`;

    if (!bypassCache) {
      const cached = this.getCachedData<Program[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const filters: any = {};
      if (category && category !== 'all') filters.category = category;
      if (level && level !== 'all') filters.level = level;

      const data = await fetchData('programs', {
        select: `
          *,
          author:profiles(id, username, avatar_url, full_name),
          workouts:program_workouts(count)
        `,
        filters,
        order: { column: 'created_at', ascending: false },
        limit
      });

      const programs = data || mockPrograms.slice(0, limit);
      this.dataState.programs = programs;
      this.setCachedData(cacheKey, programs, 600000); // 10 minutes
      return programs;
    } catch (error) {
      console.error('Error fetching programs:', error);
      const fallback = mockPrograms.slice(0, limit);
      this.dataState.programs = fallback;
      return fallback;
    }
  }

  // =====================================================
  // ANALYTICS - Single source of truth
  // =====================================================

  async getAnalytics(bypassCache = false): Promise<AnalyticsData> {
    const cacheKey = 'user_analytics';

    if (!bypassCache) {
      const cached = this.getCachedData<AnalyticsData>(cacheKey);
      if (cached) return cached;
    }

    try {
      const user = await getCurrentUser();
      if (!user) throw new ApiError('User not authenticated', 401);

      // Fetch analytics data from API
      const analytics = await fetchData('user_analytics', {
        filters: { user_id: user.id },
        single: true
      });

      const analyticsData: AnalyticsData = analytics || {
        totalWorkouts: this.dataState.workoutHistory.length,
        totalDuration: this.dataState.workoutHistory.reduce((sum, w) => sum + w.duration, 0),
        totalVolume: this.dataState.workoutHistory.reduce((sum, w) => {
          return sum + w.exercises.reduce((exSum, ex) => {
            return exSum + ex.sets.reduce((setSum, set) => {
              return setSum + ((set.weight || 0) * (set.reps || 0));
            }, 0);
          }, 0);
        }, 0),
        workoutsPerWeek: [0, 1, 2, 1, 3, 2, 4], // Mock data
        volumePerWeek: [0, 5000, 7500, 6000, 8500, 7000, 9500], // Mock data
        topExercises: [
          { exerciseId: 'ex1', exerciseName: 'Bench Press', count: 15 },
          { exerciseId: 'ex2', exerciseName: 'Squat', count: 12 },
          { exerciseId: 'ex3', exerciseName: 'Deadlift', count: 10 }
        ]
      };

      this.dataState.analytics = analyticsData;
      this.setCachedData(cacheKey, analyticsData, 300000); // 5 minutes
      return analyticsData;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      const fallback: AnalyticsData = {
        totalWorkouts: 0,
        totalDuration: 0,
        totalVolume: 0,
        workoutsPerWeek: [0, 0, 0, 0, 0, 0, 0],
        volumePerWeek: [0, 0, 0, 0, 0, 0, 0],
        topExercises: []
      };
      this.dataState.analytics = fallback;
      return fallback;
    }
  }

  // =====================================================
  // STATE GETTERS
  // =====================================================

  getDataState(): UnifiedDataState {
    return { ...this.dataState };
  }

  getActiveWorkout(): ActiveWorkout | null {
    return this.dataState.activeWorkout;
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private getMockWorkoutTemplates(): WorkoutTemplate[] {
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
      }
    ];
  }

  // Clear all caches (useful for logout or data refresh)
  clearCache(): void {
    this.cache.clear();
  }

  // Reset all data state
  resetDataState(): void {
    this.dataState = {
      clubs: [],
      myClubs: [],
      clubMemberships: [],
      clubPosts: {},
      clubEvents: {},
      workouts: [],
      workoutTemplates: [],
      activeWorkout: null,
      workoutHistory: [],
      programs: [],
      myPrograms: [],
      enrolledPrograms: [],
      exercises: [],
      exerciseCategories: [],
      analytics: null,
    };
  }
}

export const unifiedDataService = UnifiedDataService.getInstance();
export default unifiedDataService;