import { supabase } from '../../lib/supabase-client';
import { 
  Exercise, 
  WorkoutLog, 
  Program, 
  Club, 
  Post
} from '../../types/workout';

// Additional types for API responses
interface WorkoutSummary {
  id: string;
  title: string;
  date: string;
  duration: number;
  exercises: number;
  totalVolume: number;
  notes?: string;
  visibility: 'public' | 'friends' | 'private';
  user_id?: string;
}

interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    targetReps: string;
    restTime: number;
  }>;
  estimatedDuration: number;
  isPublic: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  profile_image_url?: string;
}

// Error handling utility
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

class DataService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Generic cache management
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Exercise API methods
  async getExercises(): Promise<ApiResponse<Exercise[]>> {
    try {
      const cacheKey = 'exercises';
      const cached = this.getFromCache<Exercise[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;

      // If no data from Supabase, fall back to mock data
      if (!data || data.length === 0) {
        const mockExercises = await this.getMockExercises();
        return { data: mockExercises, error: null, loading: false };
      }

      this.setCache(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // Fallback to mock data
      const mockExercises = await this.getMockExercises();
      return { 
        data: mockExercises, 
        error: 'Failed to load exercises from server, using offline data', 
        loading: false 
      };
    }
  }

  private async getMockExercises(): Promise<Exercise[]> {
    return [
      {
        id: '1',
        name: 'Bench Press',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      },
      {
        id: '2',
        name: 'Squat',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
      },
      {
        id: '3',
        name: 'Deadlift',
        muscleGroups: ['Back', 'Glutes', 'Hamstrings'],
      },
    ];
  }

  async searchExercises(query: string): Promise<ApiResponse<Exercise[]>> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .or(`name.ilike.%${query}%,muscle_groups.cs.{${query}}`)
        .order('name')
        .limit(20);

      if (error) throw error;

      return { data: data || [], error: null, loading: false };
    } catch (error) {
      console.error('Error searching exercises:', error);
      return { data: [], error: 'Failed to search exercises', loading: false };
    }
  }

  // Workout API methods
  async getWorkoutHistory(userId: string): Promise<ApiResponse<WorkoutSummary[]>> {
    try {
      const cacheKey = `workout_history_${userId}`;
      const cached = this.getFromCache<WorkoutSummary[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      const { data, error } = await supabase
        .from('workout_summaries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fallback to mock data if empty
      if (!data || data.length === 0) {
        const mockWorkouts = await this.getMockWorkoutHistory();
        return { data: mockWorkouts, error: null, loading: false };
      }

      this.setCache(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (error) {
      console.error('Error fetching workout history:', error);
      const mockWorkouts = await this.getMockWorkoutHistory();
      return { 
        data: mockWorkouts, 
        error: 'Failed to load workout history, using offline data', 
        loading: false 
      };
    }
  }

  private async getMockWorkoutHistory(): Promise<WorkoutSummary[]> {
    return [
      {
        id: '1',
        title: 'Upper Body Strength',
        date: new Date().toISOString(),
        duration: 3600, // 1 hour
        exercises: 4,
        totalVolume: 2500,
        notes: 'Great session, hit new PR on bench press',
        visibility: 'public',
      },
      {
        id: '2',
        title: 'Leg Day',
        date: new Date(Date.now() - 86400000).toISOString(), // yesterday
        duration: 4200, // 70 minutes
        exercises: 5,
        totalVolume: 3200,
        notes: 'Challenging leg workout',
        visibility: 'friends',
      },
    ];
  }

  async saveWorkout(workout: Partial<WorkoutSummary>): Promise<ApiResponse<WorkoutSummary>> {
    try {
      const { data, error } = await supabase
        .from('workout_summaries')
        .insert([workout])
        .select()
        .single();

      if (error) throw error;

      // Clear cache to force refresh
      this.cache.delete(`workout_history_${workout.user_id}`);

      return { data, error: null, loading: false };
    } catch (error) {
      console.error('Error saving workout:', error);
      return { data: null, error: 'Failed to save workout', loading: false };
    }
  }

  // Workout Templates
  async getWorkoutTemplates(userId?: string): Promise<ApiResponse<WorkoutTemplate[]>> {
    try {
      const cacheKey = `workout_templates_${userId || 'public'}`;
      const cached = this.getFromCache<WorkoutTemplate[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      let query = supabase.from('workout_templates').select('*');
      
      if (userId) {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Fallback to mock templates
      if (!data || data.length === 0) {
        const mockTemplates = await this.getMockWorkoutTemplates();
        return { data: mockTemplates, error: null, loading: false };
      }

      this.setCache(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      const mockTemplates = await this.getMockWorkoutTemplates();
      return { 
        data: mockTemplates, 
        error: 'Failed to load templates, using offline data', 
        loading: false 
      };
    }
  }

  private async getMockWorkoutTemplates(): Promise<WorkoutTemplate[]> {
    return [
      {
        id: '1',
        title: 'Push Day',
        description: 'Chest, shoulders, and triceps workout',
        exercises: [
          { id: '1', name: 'Bench Press', sets: 4, targetReps: '8-10', restTime: 90 },
          { id: '2', name: 'Shoulder Press', sets: 3, targetReps: '10-12', restTime: 60 },
          { id: '3', name: 'Tricep Extension', sets: 3, targetReps: '12-15', restTime: 45 },
        ],
        estimatedDuration: 60,
        isPublic: true,
      },
      {
        id: '2',
        title: 'Pull Day',
        description: 'Back and biceps workout',
        exercises: [
          { id: '4', name: 'Pull-ups', sets: 4, targetReps: '6-10', restTime: 90 },
          { id: '5', name: 'Barbell Rows', sets: 4, targetReps: '8-10', restTime: 90 },
          { id: '6', name: 'Bicep Curls', sets: 3, targetReps: '12-15', restTime: 45 },
        ],
        estimatedDuration: 55,
        isPublic: true,
      },
    ];
  }

  // Programs
  async getPrograms(): Promise<ApiResponse<Program[]>> {
    try {
      const cacheKey = 'programs';
      const cached = this.getFromCache<Program[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        const mockPrograms = await this.getMockPrograms();
        return { data: mockPrograms, error: null, loading: false };
      }

      this.setCache(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (error) {
      console.error('Error fetching programs:', error);
      const mockPrograms = await this.getMockPrograms();
      return { 
        data: mockPrograms, 
        error: 'Failed to load programs, using offline data', 
        loading: false 
      };
    }
  }

  private async getMockPrograms(): Promise<Program[]> {
    return [
      {
        id: '1',
        title: 'StrongLifts 5x5',
        description: 'Simple and effective strength training program',
        duration: 12, // weeks
        level: 'beginner',
        authorId: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  // Clubs
  async getClubs(): Promise<ApiResponse<Club[]>> {
    try {
      const cacheKey = 'clubs';
      const cached = this.getFromCache<Club[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        const mockClubs = await this.getMockClubs();
        return { data: mockClubs, error: null, loading: false };
      }

      this.setCache(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (error) {
      console.error('Error fetching clubs:', error);
      const mockClubs = await this.getMockClubs();
      return { 
        data: mockClubs, 
        error: 'Failed to load clubs, using offline data', 
        loading: false 
      };
    }
  }

  private async getMockClubs(): Promise<Club[]> {
    return [
      {
        id: '1',
        name: 'Elite Powerlifters',
        description: 'For serious powerlifting enthusiasts',
        memberCount: 1250,
        price: 29.99,
        ownerId: 'creator1',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: 'https://example.com/powerlifting-club.jpg',
      },
      {
        id: '2',
        name: 'Bodyweight Warriors',
        description: 'Calisthenics and bodyweight training',
        memberCount: 892,
        price: 19.99,
        ownerId: 'creator2',
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: 'https://example.com/bodyweight-club.jpg',
      },
    ];
  }

  // User Profile
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      const cacheKey = `user_profile_${userId}`;
      const cached = this.getFromCache<User>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      this.setCache(cacheKey, data);
      return { data, error: null, loading: false };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error: 'Failed to load user profile', loading: false };
    }
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
  }

  // Clear specific cache
  clearCacheByKey(key: string): void {
    this.cache.delete(key);
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService; 