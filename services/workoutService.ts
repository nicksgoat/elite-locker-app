/**
 * Elite Locker Services - Workout Service
 *
 * This file contains the workout service implementation using Supabase.
 */

import { mockExercises, mockWorkouts } from '../data/mockData';
import { fetchData, insertData, updateData } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
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

      // Generate a workout title
      const today = new Date();
      const workoutTitle = templateId !== 'new'
        ? `Template Workout ${today.toLocaleDateString()}`
        : `Workout ${today.toLocaleDateString()}`;

      // Create a new workout
      const workout = await insertData('workouts', {
        title: workoutTitle,
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
          for (let i = 0; i < template.exercises.length; i++) {
            const templateExercise = template.exercises[i];
            await insertData('workout_exercises', {
              workout_id: workout.id,
              exercise_id: templateExercise.exercise.id,
              order: templateExercise.order || (i + 1), // Use template order or index
              target_sets: templateExercise.target_sets,
              target_reps: templateExercise.target_reps,
              rest_time: templateExercise.rest_time || 90 // Default rest time
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

      // Analyze workout for training max updates
      const trainingMaxUpdates = await workoutService.analyzeWorkoutForTrainingMaxes(workoutId, data.exercises);

      return {
        ...workout,
        trainingMaxUpdates
      };
    } catch (error) {
      console.error(`Error completing workout ${workoutId}:`, error);
      // Fallback during development
      return {
        success: true,
        workoutId,
        endTime: data.endTime,
        trainingMaxUpdates: []
      };
    }
  },

  // Analyze workout for potential training max updates
  analyzeWorkoutForTrainingMaxes: async (workoutId: string, exercises: any[]) => {
    try {
      const trainingMaxService = (await import('./trainingMaxService')).default;
      const exerciseService = (await import('./exerciseService')).default;

      const trainingMaxUpdates = [];

      for (const exercise of exercises) {
        if (!exercise.sets || exercise.sets.length === 0) continue;

        // Get exercise details to determine measurement type
        const exerciseDetails = await exerciseService.getExerciseById(exercise.id);
        if (!exerciseDetails) continue;

        const measurementType = exerciseDetails.measurementConfig?.default || 'weight_reps';

        // Find the best performance in this workout
        let bestPerformance = null;
        let bestEstimated1RM = 0;

        for (const set of exercise.sets) {
          if (!set.completed || !set.weight || !set.reps) continue;

          const weight = parseFloat(set.weight);
          const reps = parseInt(set.reps);

          if (weight <= 0 || reps <= 0) continue;

          // Calculate estimated 1RM using Epley formula
          const estimated1RM = reps === 1 ? weight : Math.round(weight * (1 + reps / 30));

          if (estimated1RM > bestEstimated1RM) {
            bestEstimated1RM = estimated1RM;
            bestPerformance = {
              weight,
              reps,
              estimated1RM
            };
          }
        }

        if (bestPerformance) {
          try {
            // Check if this is a new training max
            const result = await trainingMaxService.updateFromWorkoutTracker({
              exerciseId: exercise.id,
              measurementType: measurementType as any,
              maxValue: bestPerformance.weight,
              maxReps: bestPerformance.reps,
              workoutId,
              exerciseLogId: `${workoutId}-${exercise.id}`, // Generate a log ID
              notes: `Auto-updated from workout: ${bestPerformance.weight} lbs x ${bestPerformance.reps} reps`
            });

            if (result) {
              trainingMaxUpdates.push({
                exerciseId: exercise.id,
                exerciseName: exerciseDetails.name,
                previousMax: result.previousMax || 0,
                newMax: result.maxValue,
                improvement: result.maxValue - (result.previousMax || 0),
                performance: bestPerformance
              });
            }
          } catch (error) {
            console.error(`Error updating training max for exercise ${exercise.id}:`, error);
          }
        }
      }

      return trainingMaxUpdates;
    } catch (error) {
      console.error('Error analyzing workout for training maxes:', error);
      return [];
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
        // Get the current count of exercises in this workout for ordering
        const existingExercises = await fetchData('workout_exercises', {
          select: 'id',
          filters: { workout_id: workoutId }
        });
        const exerciseOrder = (existingExercises?.length || 0) + 1;

        // Create the workout exercise if it doesn't exist
        const workoutExercise = await insertData('workout_exercises', {
          workout_id: workoutId,
          exercise_id: exerciseId,
          order: exerciseOrder,
          rest_time: 90, // Default rest time
          created_at: new Date()
        }, { offlineSupport: true }); // Enable offline support

        // Log the set
        const set = await insertData('exercise_sets', {
          workout_exercise_id: workoutExercise.id,
          weight: setData.weight,
          reps: setData.reps,
          completed: setData.completed,
          notes: setData.notes,
          order_index: setData.id,
          created_at: new Date()
        }, { offlineSupport: true }); // Enable offline support

        return set;
      } else {
        // Log the set
        const set = await insertData('exercise_sets', {
          workout_exercise_id: workoutExercises[0].id,
          weight: setData.weight,
          reps: setData.reps,
          completed: setData.completed,
          notes: setData.notes,
          order_index: setData.id,
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
      // Use ilike for better compatibility with multi-word searches
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .ilike('name', `%${query}%`)
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

      // Get all sets for this exercise through workout_exercises
      const data = await fetchData('exercise_sets', {
        select: `
          *,
          workout_exercise:workout_exercises(
            workout:workouts(id, date, author_id)
          )
        `,
        filters: {
          'workout_exercise.workout.author_id': user.id,
          'workout_exercise.exercise_id': exerciseId
        },
        order: { column: 'created_at', ascending: false }
      });

      // Transform data to expected format
      const sets = data.map((set: any) => ({
        workoutDate: set.workout_exercise?.workout?.date || new Date(),
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
            sets:exercise_sets(*)
          )
        `,
        filters: { author_id: user.id, is_complete: true },
        order: { column: 'date', ascending: false },
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

  // Get marketplace workouts (public templates and paid workouts)
  getMarketplaceWorkouts: async ({
    limit = 20,
    offset = 0,
    bypassCache = false
  }: {
    limit?: number,
    offset?: number,
    bypassCache?: boolean
  } = {}) => {
    try {
      const cacheKey = `marketplace_workouts_${limit}_${offset}`;

      const data = await fetchData('workouts', {
        select: `
          *,
          author:profiles(username, avatar_url),
          exercises:workout_exercises(
            *,
            exercise:exercises(*),
            sets:exercise_sets(*)
          )
        `,
        filters: {
          is_template: true
          // For now, get all templates - we can add more filtering later
        },
        order: { column: 'created_at', ascending: false },
        limit,
        bypassCache,
        // Cache marketplace workouts for 30 minutes (1800000 ms)
        cacheExpiration: 1800000
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching marketplace workouts:', error);
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
