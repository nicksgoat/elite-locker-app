/**
 * Elite Locker Services - Workout Service
 *
 * This file contains the workout service implementation using Supabase.
 */

import { mockExercises, mockWorkouts } from '../data/mockData';
import { fetchData, insertData, updateData } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase-client';
import { ApiError } from './types';

// Types for workout service
interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: any[];
}

interface ExerciseHistory {
  sets: {
    workoutDate: string;
    weight?: number;
    reps?: number;
    isPersonalRecord?: boolean;
  }[];
}

// Mock workout templates for fallback
const mockTemplates: WorkoutTemplate[] = [
  {
    id: 't1',
    name: 'Push Day',
    exercises: [
      {
        id: 'ex1',
        exercise: {
          name: 'Bench Press',
          muscleGroups: ['chest', 'triceps'],
          equipment: 'barbell'
        },
        sets: [
          { weight: 135, reps: 10 },
          { weight: 155, reps: 8 },
          { weight: 175, reps: 6 }
        ]
      },
      {
        id: 'ex2',
        exercise: {
          name: 'Overhead Press',
          muscleGroups: ['shoulders', 'triceps'],
          equipment: 'barbell'
        },
        sets: [
          { weight: 95, reps: 10 },
          { weight: 105, reps: 8 },
          { weight: 115, reps: 6 }
        ]
      }
    ]
  }
];

// Workout service implementation
export const workoutService = {
  // Get workout templates
  getWorkoutTemplates: async ({ limit = 10 }: { limit?: number } = {}) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const data = await fetchData('workout_templates', {
        select: `
          *,
          exercises:workout_template_exercises(
            *,
            exercise:exercises(*)
          )
        `,
        filters: { user_id: user.id },
        order: { column: 'created_at', ascending: false },
        limit
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching workout templates:', error);
      // Fallback to mock data during development
      return mockTemplates.slice(0, limit);
    }
  },

  // Get workout template by ID
  getWorkoutTemplateById: async (id: string) => {
    try {
      const data = await fetchData('workout_templates', {
        select: `
          *,
          exercises:workout_template_exercises(
            *,
            exercise:exercises(*)
          )
        `,
        filters: { id },
        single: true
      });

      if (!data) {
        throw new ApiError(`Template with ID ${id} not found`, 404);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching workout template ${id}:`, error);
      // Fallback to mock data during development
      const template = mockTemplates.find(t => t.id === id);

      if (!template) {
        throw new ApiError(`Template with ID ${id} not found`, 404);
      }

      return template;
    }
  },

  // Start a new workout
  startWorkout: async (templateId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Create a new workout
      const workout = await insertData('workouts', {
        user_id: user.id,
        template_id: templateId !== 'new' ? templateId : null,
        start_time: new Date(),
        status: 'in_progress'
      });

      // If using a template, copy exercises from template
      if (templateId !== 'new') {
        const template = await fetchData('workout_templates', {
          select: `
            *,
            exercises:workout_template_exercises(
              *,
              exercise:exercises(*)
            )
          `,
          filters: { id: templateId },
          single: true
        });

        if (template && template.exercises) {
          // Add exercises to workout
          for (const templateExercise of template.exercises) {
            await insertData('workout_exercises', {
              workout_id: workout.id,
              exercise_id: templateExercise.exercise.id,
              order: templateExercise.order,
              target_sets: templateExercise.target_sets,
              target_reps: templateExercise.target_reps,
              rest_time: templateExercise.rest_time
            });
          }
        }
      }

      return {
        workoutId: workout.id,
        startTime: workout.start_time
      };
    } catch (error) {
      console.error('Error starting workout:', error);
      // Fallback during development
      return {
        workoutId: `workout-${Date.now()}`,
        startTime: new Date().toISOString()
      };
    }
  },

  // Complete a workout
  completeWorkout: async (workoutId: string, data: any) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Update the workout with offline support
      const workout = await updateData('workouts', workoutId, {
        end_time: new Date(data.endTime),
        status: 'completed',
        notes: data.notes,
        updated_at: new Date()
      }, { offlineSupport: true }); // Enable offline support

      return workout;
    } catch (error) {
      console.error(`Error completing workout ${workoutId}:`, error);
      // Fallback during development
      return {
        success: true,
        workoutId,
        endTime: data.endTime
      };
    }
  },

  // Log a set
  logSet: async (workoutId: string, exerciseId: string, setData: any) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get the workout exercise
      const workoutExercises = await fetchData('workout_exercises', {
        select: '*',
        filters: { workout_id: workoutId, exercise_id: exerciseId }
      });

      if (!workoutExercises || workoutExercises.length === 0) {
        // Create the workout exercise if it doesn't exist
        const workoutExercise = await insertData('workout_exercises', {
          workout_id: workoutId,
          exercise_id: exerciseId,
          order: 0, // Default order
          created_at: new Date()
        }, { offlineSupport: true }); // Enable offline support

        // Log the set
        const set = await insertData('workout_sets', {
          workout_id: workoutId,
          exercise_id: exerciseId,
          workout_exercise_id: workoutExercise.id,
          set_number: setData.id,
          weight: setData.weight,
          reps: setData.reps,
          completed: setData.completed,
          notes: setData.notes,
          created_at: new Date()
        }, { offlineSupport: true }); // Enable offline support

        return set;
      } else {
        // Log the set
        const set = await insertData('workout_sets', {
          workout_id: workoutId,
          exercise_id: exerciseId,
          workout_exercise_id: workoutExercises[0].id,
          set_number: setData.id,
          weight: setData.weight,
          reps: setData.reps,
          completed: setData.completed,
          notes: setData.notes,
          created_at: new Date()
        }, { offlineSupport: true }); // Enable offline support

        return set;
      }
    } catch (error) {
      console.error(`Error logging set for workout ${workoutId}, exercise ${exerciseId}:`, error);
      // Fallback during development
      return {
        success: true,
        setId: `set-${Date.now()}`
      };
    }
  },

  // Search exercises
  searchExercises: async (query: string, { limit = 10 }: { limit?: number } = {}) => {
    try {
      // Use Supabase text search
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .textSearch('name', query)
        .limit(limit);

      if (error) {
        throw error;
      }

      return { exercises: data || [] };
    } catch (error) {
      console.error(`Error searching exercises with query "${query}":`, error);
      // Fallback to mock data during development
      const filteredExercises = mockExercises
        .filter(ex => ex.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);

      return { exercises: filteredExercises };
    }
  },

  // Get exercise history
  getExerciseHistory: async (exerciseId: string): Promise<ExerciseHistory> => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get all sets for this exercise
      const data = await fetchData('workout_sets', {
        select: `
          *,
          workout:workouts(id, start_time)
        `,
        filters: { exercise_id: exerciseId, user_id: user.id },
        order: { column: 'created_at', ascending: false }
      });

      // Transform data to expected format
      const sets = data.map((set: any) => ({
        workoutDate: set.workout.start_time,
        weight: set.weight,
        reps: set.reps,
        isPersonalRecord: set.is_personal_record || false
      }));

      return { sets };
    } catch (error) {
      console.error(`Error fetching exercise history for ${exerciseId}:`, error);
      // Fallback to mock data during development
      const relevantWorkouts = mockWorkouts.filter(workout =>
        workout.exercises.some(ex => ex.exerciseId === exerciseId)
      );

      // Extract set data
      const sets = relevantWorkouts.flatMap(workout =>
        workout.exercises
          .filter(ex => ex.exerciseId === exerciseId)
          .flatMap(ex => ex.sets.map(set => ({
            workoutDate: workout.date.toISOString(),
            weight: set.weight,
            reps: set.reps,
            isPersonalRecord: false // We would determine this from actual data
          })))
      );

      return { sets };
    }
  },

  // Get user's workout history
  getWorkoutHistory: async ({
    limit = 10,
    offset = 0,
    bypassCache = false
  }: {
    limit?: number,
    offset?: number,
    bypassCache?: boolean
  } = {}) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Use a cache key that includes the user ID
      const cacheKey = `workout_history_${user.id}_${limit}_${offset}`;

      const data = await fetchData('workouts', {
        select: `
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*),
            sets:workout_sets(*)
          )
        `,
        filters: { user_id: user.id, status: 'completed' },
        order: { column: 'end_time', ascending: false },
        limit,
        bypassCache,
        // Cache workout history for 1 hour (3600000 ms)
        cacheExpiration: 3600000
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching workout history:', error);
      // Fallback to mock data during development
      return mockWorkouts.slice(offset, offset + limit);
    }
  },

  // Create a workout template
  createWorkoutTemplate: async (template: any) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Create the template
      const newTemplate = await insertData('workout_templates', {
        user_id: user.id,
        name: template.name,
        description: template.description,
        is_public: template.isPublic || false,
        created_at: new Date()
      });

      // Add exercises to the template
      if (template.exercises && template.exercises.length > 0) {
        for (let i = 0; i < template.exercises.length; i++) {
          const exercise = template.exercises[i];
          await insertData('workout_template_exercises', {
            template_id: newTemplate.id,
            exercise_id: exercise.id,
            order: i,
            target_sets: exercise.sets,
            target_reps: exercise.targetReps,
            rest_time: exercise.restTime
          });
        }
      }

      return newTemplate;
    } catch (error) {
      console.error('Error creating workout template:', error);
      throw error;
    }
  }
};
