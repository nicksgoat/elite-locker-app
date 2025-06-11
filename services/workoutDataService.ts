import { workoutService } from './workoutService';
import { WorkoutSummary } from '../contexts/WorkoutContext';

// Enhanced workout data types for social integration
export interface SocialWorkoutData {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  duration: number; // in seconds
  totalVolume: number; // in lbs
  exercisesCompleted: number;
  setsCompleted: number;
  personalRecords: string[];
  caloriesBurned?: number;
  completedAt: Date;
  exercises: SocialExerciseData[];
  notes?: string;
  visibility: 'public' | 'friends' | 'private';
  sharedTo?: {
    clubs?: string[];
    platforms?: string[];
  };
  media?: {
    type: 'photo' | 'video';
    url: string;
  }[];
  location?: string;
  clubId?: string;
  clubName?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface SocialExerciseData {
  id: string;
  name: string;
  sets: SocialSetData[];
  personalRecord?: boolean;
  notes?: string;
}

export interface SocialSetData {
  id: string;
  weight?: number;
  reps?: number;
  duration?: number;
  completed: boolean;
  isPersonalRecord?: boolean;
}

// User workout history for profile display
export interface UserWorkoutHistory {
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalVolume: number; // in lbs
  personalRecords: number;
  recentWorkouts: SocialWorkoutData[];
  weeklyStats: {
    week: string;
    workouts: number;
    duration: number;
    volume: number;
  }[];
  topExercises: {
    name: string;
    count: number;
    totalVolume: number;
  }[];
}

class WorkoutDataService {
  private userWorkouts: Map<string, SocialWorkoutData[]> = new Map();
  private currentUserId = 'current-user'; // In real app, get from auth context

  // Convert WorkoutSummary to SocialWorkoutData
  convertWorkoutSummaryToSocialData(
    summary: WorkoutSummary,
    authorId: string = this.currentUserId,
    authorName: string = 'Nick McKenzie',
    authorAvatar: string = 'https://via.placeholder.com/40x40'
  ): SocialWorkoutData {
    return {
      id: `workout_${Date.now()}`,
      title: summary.title || 'Workout',
      authorId,
      authorName,
      authorAvatar,
      duration: summary.duration,
      totalVolume: summary.totalVolume,
      exercisesCompleted: summary.totalExercises,
      setsCompleted: summary.totalSets,
      personalRecords: [], // Will be populated from exercises
      completedAt: summary.date,
      exercises: summary.exercises?.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets?.map(set => ({
          id: set.id,
          weight: set.weight,
          reps: set.reps,
          duration: set.duration,
          completed: set.completed,
          isPersonalRecord: set.isPersonalRecord
        })) || [],
        personalRecord: ex.sets?.some(set => set.isPersonalRecord) || false,
        notes: ex.notes
      })) || [],
      notes: summary.notes,
      visibility: summary.visibility || 'public',
      sharedTo: summary.sharedTo,
      media: summary.media,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false
    };
  }

  // Save completed workout to user's history
  async saveCompletedWorkout(summary: WorkoutSummary, userId: string = this.currentUserId): Promise<SocialWorkoutData> {
    try {
      // Convert to social data format
      const socialWorkoutData = this.convertWorkoutSummaryToSocialData(summary, userId);
      
      // Get user's existing workouts
      const userWorkouts = this.userWorkouts.get(userId) || [];
      
      // Add new workout to the beginning
      userWorkouts.unshift(socialWorkoutData);
      
      // Store updated workouts
      this.userWorkouts.set(userId, userWorkouts);
      
      // In a real app, save to Supabase
      // await workoutService.saveWorkout(socialWorkoutData);
      
      return socialWorkoutData;
    } catch (error) {
      console.error('Error saving completed workout:', error);
      throw error;
    }
  }

  // Get user's workout history
  async getUserWorkouts(userId: string = this.currentUserId, limit: number = 20): Promise<SocialWorkoutData[]> {
    try {
      // In a real app, fetch from Supabase
      // const workouts = await workoutService.getUserWorkouts(userId, limit);
      
      // For now, return from memory with some mock data if empty
      let userWorkouts = this.userWorkouts.get(userId) || [];
      
      if (userWorkouts.length === 0) {
        // Add some mock recent workouts
        userWorkouts = this.generateMockUserWorkouts(userId);
        this.userWorkouts.set(userId, userWorkouts);
      }
      
      return userWorkouts.slice(0, limit);
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      return [];
    }
  }

  // Get user's workout statistics
  async getUserWorkoutStats(userId: string = this.currentUserId): Promise<UserWorkoutHistory> {
    try {
      const workouts = await this.getUserWorkouts(userId, 100); // Get more for stats
      
      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, w) => sum + (w.duration / 60), 0); // Convert to minutes
      const totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
      const personalRecords = workouts.reduce((sum, w) => sum + w.personalRecords.length, 0);
      
      // Calculate weekly stats (last 8 weeks)
      const weeklyStats = this.calculateWeeklyStats(workouts);
      
      // Calculate top exercises
      const topExercises = this.calculateTopExercises(workouts);
      
      return {
        totalWorkouts,
        totalDuration,
        totalVolume,
        personalRecords,
        recentWorkouts: workouts.slice(0, 10),
        weeklyStats,
        topExercises
      };
    } catch (error) {
      console.error('Error fetching user workout stats:', error);
      throw error;
    }
  }

  // Get workouts for social feed (from all users)
  async getFeedWorkouts(limit: number = 20): Promise<SocialWorkoutData[]> {
    try {
      // In a real app, fetch from Supabase with proper filtering
      // const feedWorkouts = await workoutService.getFeedWorkouts(limit);
      
      // For now, combine workouts from all users
      const allWorkouts: SocialWorkoutData[] = [];
      
      for (const [userId, workouts] of this.userWorkouts.entries()) {
        allWorkouts.push(...workouts.filter(w => w.visibility === 'public'));
      }
      
      // Add some mock feed workouts if empty
      if (allWorkouts.length === 0) {
        allWorkouts.push(...this.generateMockFeedWorkouts());
      }
      
      // Sort by completion date (newest first)
      allWorkouts.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
      
      return allWorkouts.slice(0, limit);
    } catch (error) {
      console.error('Error fetching feed workouts:', error);
      return [];
    }
  }

  // Calculate weekly stats
  private calculateWeeklyStats(workouts: SocialWorkoutData[]) {
    const weeks: { [key: string]: { workouts: number; duration: number; volume: number } } = {};
    
    workouts.forEach(workout => {
      const weekStart = this.getWeekStart(workout.completedAt);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { workouts: 0, duration: 0, volume: 0 };
      }
      
      weeks[weekKey].workouts++;
      weeks[weekKey].duration += workout.duration / 60; // Convert to minutes
      weeks[weekKey].volume += workout.totalVolume;
    });
    
    return Object.entries(weeks)
      .map(([week, stats]) => ({ week, ...stats }))
      .sort((a, b) => new Date(b.week).getTime() - new Date(a.week).getTime())
      .slice(0, 8);
  }

  // Calculate top exercises
  private calculateTopExercises(workouts: SocialWorkoutData[]) {
    const exerciseStats: { [name: string]: { count: number; totalVolume: number } } = {};
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exerciseStats[exercise.name]) {
          exerciseStats[exercise.name] = { count: 0, totalVolume: 0 };
        }
        
        exerciseStats[exercise.name].count++;
        
        // Calculate volume for this exercise
        const exerciseVolume = exercise.sets.reduce((sum, set) => {
          if (set.weight && set.reps && set.completed) {
            return sum + (set.weight * set.reps);
          }
          return sum;
        }, 0);
        
        exerciseStats[exercise.name].totalVolume += exerciseVolume;
      });
    });
    
    return Object.entries(exerciseStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Helper to get week start date
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Generate mock user workouts for testing
  private generateMockUserWorkouts(userId: string): SocialWorkoutData[] {
    const mockWorkouts: SocialWorkoutData[] = [
      {
        id: 'mock_1',
        title: 'Upper Body Power',
        authorId: userId,
        authorName: 'Nick McKenzie',
        authorAvatar: 'https://via.placeholder.com/40x40',
        duration: 3600, // 1 hour
        totalVolume: 12500,
        exercisesCompleted: 4,
        setsCompleted: 12,
        personalRecords: ['Bench Press'],
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        exercises: [
          {
            id: 'ex1',
            name: 'Bench Press',
            sets: [
              { id: 's1', weight: 225, reps: 8, completed: true, isPersonalRecord: true },
              { id: 's2', weight: 225, reps: 6, completed: true },
              { id: 's3', weight: 205, reps: 8, completed: true }
            ],
            personalRecord: true
          }
        ],
        visibility: 'public',
        likes: 5,
        comments: 2,
        shares: 1,
        isLiked: false,
        isBookmarked: false
      }
    ];
    
    return mockWorkouts;
  }

  // Generate mock feed workouts
  private generateMockFeedWorkouts(): SocialWorkoutData[] {
    return [
      {
        id: 'feed_1',
        title: 'Morning Cardio',
        authorId: 'user_2',
        authorName: 'Sarah Johnson',
        authorAvatar: 'https://via.placeholder.com/40x40',
        duration: 1800, // 30 minutes
        totalVolume: 0,
        exercisesCompleted: 3,
        setsCompleted: 0,
        personalRecords: [],
        completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        exercises: [],
        visibility: 'public',
        likes: 8,
        comments: 3,
        shares: 0,
        isLiked: false,
        isBookmarked: false
      }
    ];
  }
}

export const workoutDataService = new WorkoutDataService();
