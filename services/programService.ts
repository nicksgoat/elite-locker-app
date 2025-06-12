/**
 * Elite Locker Services - Program Service
 *
 * This file contains the program service implementation using Supabase.
 */

import { mockPrograms } from '../data/mockData'; // Fallback for development
import { fetchData, insertData, updateData } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { safeQuery } from '../lib/supabase-client';
import { ApiError } from './types';

// Program service implementation
export const programService = {
  // Get all programs
  getPrograms: async ({ bypassCache = false } = {}) => {
    try {
      // Import the supabaseApi client directly
      const supabaseApi = (await import('../lib/supabase-client')).supabaseApi;

      // Fetch from the api schema
      const { data, error } = await safeQuery(() =>
        supabaseApi
          .from('programs')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('Error fetching programs:', error);
        // Fall back to mock data
        console.log('Falling back to mock programs data');
        return mockPrograms;
      }

      // Map the database column names to the expected format
      const mappedData = data ? data.map(program => ({
        id: program.id,
        title: program.title,
        description: program.description,
        authorId: program.author_id,
        isPaid: program.is_paid,
        isFeatured: program.is_featured,
        level: program.level,
        duration: program.duration,
        price: program.price,
        thumbnailUrl: program.thumbnail_url,
        createdAt: program.created_at,
        updatedAt: program.updated_at
      })) : [];

      return mappedData;
    } catch (error) {
      console.error('Error fetching programs:', error);
      // Fallback to mock data during development
      return mockPrograms;
    }
  },

  // Get featured programs
  getFeaturedPrograms: async ({ bypassCache = false } = {}) => {
    try {
      // Import the supabaseApi client directly
      const supabaseApi = (await import('../lib/supabase-client')).supabaseApi;

      // Fetch from the api schema
      const { data, error } = await safeQuery(() =>
        supabaseApi
          .from('programs')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('Error fetching featured programs:', error);
        // Fall back to mock data
        console.log('Falling back to mock featured programs data');
        return mockPrograms.filter(p => p.isPaid);
      }

      // Map the database column names to the expected format
      const mappedData = data ? data.map(program => ({
        id: program.id,
        title: program.title,
        description: program.description,
        authorId: program.author_id,
        isPaid: program.is_paid,
        isFeatured: program.is_featured,
        level: program.level,
        duration: program.duration,
        price: program.price,
        thumbnailUrl: program.thumbnail_url,
        createdAt: program.created_at,
        updatedAt: program.updated_at
      })) : [];

      return mappedData;
    } catch (error) {
      console.error('Error fetching featured programs:', error);
      // Fallback to mock data during development
      return mockPrograms.filter(p => p.isPaid);
    }
  },

  // Get user's programs
  getMyPrograms: async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Import the supabaseApi client directly
      const supabaseApi = (await import('../lib/supabase-client')).supabaseApi;

      // Fetch from the api schema
      const { data, error } = await safeQuery(() =>
        supabaseApi
          .from('programs')
          .select('*')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false })
      );

      if (error) {
        console.error('Error fetching user programs:', error);
        // Fall back to mock data
        console.log('Falling back to mock user programs data');
        return mockPrograms.filter(p => p.authorId === 'user1');
      }

      // Map the database column names to the expected format
      const mappedData = data ? data.map(program => ({
        id: program.id,
        title: program.title,
        description: program.description,
        authorId: program.author_id,
        isPaid: program.is_paid,
        isFeatured: program.is_featured,
        level: program.level,
        duration: program.duration,
        price: program.price,
        thumbnailUrl: program.thumbnail_url,
        createdAt: program.created_at,
        updatedAt: program.updated_at
      })) : [];

      return mappedData;
    } catch (error) {
      console.error('Error fetching user programs:', error);
      // Fallback to mock data during development
      return mockPrograms.filter(p => p.authorId === 'user1');
    }
  },

  // Get user's program subscriptions
  getMySubscriptions: async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const data = await fetchData('program_subscriptions', {
        select: `
          *,
          program:programs(*)
        `,
        filters: { user_id: user.id },
        order: { column: 'created_at', ascending: false }
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      // Fallback to mock data during development
      return [{
        id: 'sub1',
        programId: 'program1',
        userId: 'user1',
        status: 'active',
        startDate: new Date('2023-05-15'),
        currentWeek: 3,
        currentDay: 2,
        lastCompletedWorkout: {
          id: 'workout1',
          date: new Date('2023-06-10')
        }
      }];
    }
  },

  // Get program by ID
  getProgram: async (id: string, { bypassCache = false } = {}) => {
    try {
      const data = await fetchData('programs', {
        select: `
          *,
          author:profiles(id, username, avatar_url, full_name),
          workouts:program_workouts(*)
        `,
        filters: { id },
        single: true,
        bypassCache,
        // Cache program details for 1 hour (3600000 ms)
        cacheExpiration: 3600000
      });

      if (!data) {
        throw new ApiError(`Program with ID ${id} not found`, 404);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching program ${id}:`, error);
      // Fallback to mock data during development
      const program = mockPrograms.find(p => p.id === id);

      if (!program) {
        throw new ApiError(`Program with ID ${id} not found`, 404);
      }

      return program;
    }
  },

  // Get program workout
  getProgramWorkout: async (programId: string, week: number, day: number, { bypassCache = false } = {}) => {
    try {
      const data = await fetchData('program_workouts', {
        select: `
          *,
          exercises:program_workout_exercises(
            *,
            exercise:exercises(*)
          )
        `,
        filters: { program_id: programId, week, day },
        single: true,
        bypassCache,
        // Cache program workouts for 1 day (86400000 ms)
        cacheExpiration: 86400000
      });

      if (!data) {
        throw new ApiError(`Workout for program ${programId}, week ${week}, day ${day} not found`, 404);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching program workout:`, error);
      // Fallback to mock data during development
      return {
        id: `workout-${programId}-w${week}-d${day}`,
        title: `Week ${week}, Day ${day}`,
        exercises: [
          { name: 'Squat', sets: 3, reps: '5x5', rest: 180 },
          { name: 'Bench Press', sets: 3, reps: '5x5', rest: 180 },
          { name: 'Barbell Row', sets: 3, reps: '5x5', rest: 180 }
        ]
      };
    }
  },

  // Subscribe to a program
  subscribeToProgram: async (programId: string, options: any = {}) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if user is already subscribed
      const existingSubscription = await fetchData('program_subscriptions', {
        select: '*',
        filters: { program_id: programId, user_id: user.id, status: 'active' }
      });

      if (existingSubscription && existingSubscription.length > 0) {
        return existingSubscription[0];
      }

      // Create new subscription
      const subscription = await insertData('program_subscriptions', {
        program_id: programId,
        user_id: user.id,
        status: 'active',
        start_date: options.startDate || new Date(),
        current_week: 1,
        current_day: 1,
        add_to_calendar: options.addToCalendar || false,
        receive_reminders: options.receiveReminders || false,
        adapt_to_progress: options.adaptToProgress || false,
        auto_schedule_deloads: options.autoScheduleDeloads || false
      });

      return subscription;
    } catch (error) {
      console.error(`Error subscribing to program ${programId}:`, error);
      // Fallback during development
      return {
        id: `sub-${Date.now()}`,
        programId,
        userId: 'user1',
        status: 'active',
        startDate: new Date(),
        currentWeek: 1,
        currentDay: 1
      };
    }
  },

  // Update subscription status
  updateSubscriptionStatus: async (subscriptionId: string, status: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const updatedSubscription = await updateData('program_subscriptions', subscriptionId, {
        status,
        updated_at: new Date()
      });

      return updatedSubscription;
    } catch (error) {
      console.error(`Error updating subscription ${subscriptionId}:`, error);
      // Fallback during development
      return {
        id: subscriptionId,
        status,
        updatedAt: new Date()
      };
    }
  },

  // Update training max
  updateTrainingMax: async (exerciseId: string, value: number, unit: 'kg' | 'lb' = 'lb') => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if training max already exists
      const existingTM = await fetchData('training_maxes', {
        select: '*',
        filters: { user_id: user.id, exercise_id: exerciseId },
        bypassCache: true // Always get the latest data
      });

      if (existingTM && existingTM.length > 0) {
        // Update existing with offline support
        const updatedTM = await updateData('training_maxes', existingTM[0].id, {
          value,
          unit,
          updated_at: new Date()
        }, { offlineSupport: true });

        return updatedTM;
      } else {
        // Create new with offline support
        const newTM = await insertData('training_maxes', {
          user_id: user.id,
          exercise_id: exerciseId,
          value,
          unit,
          created_at: new Date(),
          updated_at: new Date()
        }, { offlineSupport: true });

        return newTM;
      }
    } catch (error) {
      console.error(`Error updating training max for exercise ${exerciseId}:`, error);
      // Fallback during development
      return {
        id: `tm-${Date.now()}`,
        exerciseId,
        value,
        unit,
        lastUpdated: new Date()
      };
    }
  },

  // Get training maxes
  getTrainingMaxes: async ({ bypassCache = false } = {}) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const data = await fetchData('training_maxes', {
        select: `
          *,
          exercise:exercises(id, name)
        `,
        filters: { user_id: user.id },
        bypassCache,
        // Cache training maxes for 1 day (86400000 ms)
        cacheExpiration: 86400000
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching training maxes:', error);
      // Fallback to mock data during development
      return [
        {
          id: 'tm1',
          exerciseId: 'ex1',
          exerciseName: 'Squat',
          value: 315,
          unit: 'lb',
          lastUpdated: new Date('2023-06-01')
        },
        {
          id: 'tm2',
          exerciseId: 'ex2',
          exerciseName: 'Bench Press',
          value: 225,
          unit: 'lb',
          lastUpdated: new Date('2023-06-01')
        },
        {
          id: 'tm3',
          exerciseId: 'ex3',
          exerciseName: 'Deadlift',
          value: 405,
          unit: 'lb',
          lastUpdated: new Date('2023-06-01')
        }
      ];
    }
  },

  // Mark workout as complete
  markWorkoutComplete: async (programId: string, workoutId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get the subscription
      const subscriptions = await fetchData('program_subscriptions', {
        select: '*',
        filters: { user_id: user.id, program_id: programId, status: 'active' },
        bypassCache: true // Always get the latest data
      });

      if (!subscriptions || subscriptions.length === 0) {
        throw new ApiError(`No active subscription found for program ${programId}`, 404);
      }

      const subscription = subscriptions[0];

      // Create completed workout record with offline support
      const completedWorkout = await insertData('completed_workouts', {
        user_id: user.id,
        program_id: programId,
        workout_id: workoutId,
        subscription_id: subscription.id,
        completed_at: new Date()
      }, { offlineSupport: true });

      // Update subscription with last completed workout with offline support
      await updateData('program_subscriptions', subscription.id, {
        last_completed_workout_id: workoutId,
        last_completed_workout_date: new Date(),
        updated_at: new Date()
      }, { offlineSupport: true });

      return completedWorkout;
    } catch (error) {
      console.error(`Error marking workout ${workoutId} as complete:`, error);
      // Fallback during development
      return {
        id: `completed-${Date.now()}`,
        programId,
        workoutId,
        completedAt: new Date().toISOString()
      };
    }
  },

  // Calculate working weight based on training max and percentage
  calculateWorkingWeight: (trainingMax: number, percentage: number, unit: 'kg' | 'lb' = 'lb') => {
    const weight = trainingMax * (percentage / 100);

    // Round to nearest 5 or 2.5 depending on unit
    const roundTo = unit === 'kg' ? 2.5 : 5;
    return Math.round(weight / roundTo) * roundTo;
  }
};
