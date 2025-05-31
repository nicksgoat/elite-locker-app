/**
 * Elite Locker Services - Training Max Service
 *
 * This file contains the training max service implementation for managing
 * exercise training maxes and calculated weights.
 */

import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { MeasurementType } from '../types/workout';
import { ApiError } from './types';

// Training max service implementation
export const trainingMaxService = {
  // Get user's training maxes
  getUserTrainingMaxes: async (userId?: string) => {
    try {
      const user = userId ? { id: userId } : await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('exercise_training_maxes')
        .select(`
          *,
          exercise:exercises(
            id,
            name,
            measurement_config
          )
        `)
        .eq('user_id', user.id)
        .order('date_achieved', { ascending: false });

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        exerciseId: item.exercise_id,
        measurementType: item.measurement_type,
        maxValue: item.max_value,
        maxReps: item.max_reps,
        dateAchieved: new Date(item.date_achieved),
        notes: item.notes,
        sourceType: item.source_type,
        workoutId: item.workout_id,
        exerciseLogId: item.exercise_log_id,
        exercise: item.exercise,
      }));
    } catch (error) {
      console.error('Error fetching training maxes:', error);
      throw error;
    }
  },

  // Get training max for specific exercise
  getExerciseTrainingMax: async (exerciseId: string, measurementType: MeasurementType) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('exercise_training_maxes')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .eq('measurement_type', measurementType)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw new ApiError(error.message, error.code);
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        exerciseId: data.exercise_id,
        measurementType: data.measurement_type,
        maxValue: data.max_value,
        maxReps: data.max_reps,
        dateAchieved: new Date(data.date_achieved),
        notes: data.notes,
        sourceType: data.source_type,
        workoutId: data.workout_id,
        exerciseLogId: data.exercise_log_id,
      };
    } catch (error) {
      console.error('Error fetching exercise training max:', error);
      throw error;
    }
  },

  // Set or update training max
  setTrainingMax: async (trainingMaxData: {
    exerciseId: string;
    measurementType: MeasurementType;
    maxValue: number;
    maxReps?: number;
    notes?: string;
    sourceType?: 'manual' | 'workout_tracker' | 'estimated';
    workoutId?: string;
    exerciseLogId?: string;
  }) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('exercise_training_maxes')
        .upsert({
          user_id: user.id,
          exercise_id: trainingMaxData.exerciseId,
          measurement_type: trainingMaxData.measurementType,
          max_value: trainingMaxData.maxValue,
          max_reps: trainingMaxData.maxReps || 1,
          notes: trainingMaxData.notes,
          source_type: trainingMaxData.sourceType || 'manual',
          workout_id: trainingMaxData.workoutId || null,
          exercise_log_id: trainingMaxData.exerciseLogId || null,
          date_achieved: new Date(),
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return {
        id: data.id,
        userId: data.user_id,
        exerciseId: data.exercise_id,
        measurementType: data.measurement_type,
        maxValue: data.max_value,
        maxReps: data.max_reps,
        dateAchieved: new Date(data.date_achieved),
        notes: data.notes,
        sourceType: data.source_type,
        workoutId: data.workout_id,
        exerciseLogId: data.exercise_log_id,
      };
    } catch (error) {
      console.error('Error setting training max:', error);
      throw error;
    }
  },

  // Calculate percentage-based weights
  calculatePercentageWeight: (trainingMax: number, percentage: number): number => {
    return Math.round((trainingMax * percentage / 100) * 4) / 4; // Round to nearest 0.25
  },

  // Calculate weights for common percentages
  calculateCommonPercentages: (trainingMax: number) => {
    const percentages = [50, 60, 65, 70, 75, 80, 85, 90, 95, 100];
    return percentages.map(percentage => ({
      percentage,
      weight: trainingMaxService.calculatePercentageWeight(trainingMax, percentage),
    }));
  },

  // Delete training max
  deleteTrainingMax: async (id: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { error } = await supabase
        .from('exercise_training_maxes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return true;
    } catch (error) {
      console.error('Error deleting training max:', error);
      throw error;
    }
  },

  // Get training max history for an exercise
  getTrainingMaxHistory: async (exerciseId: string, measurementType: MeasurementType) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('exercise_training_maxes')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .eq('measurement_type', measurementType)
        .order('date_achieved', { ascending: false });

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        exerciseId: item.exercise_id,
        measurementType: item.measurement_type,
        maxValue: item.max_value,
        maxReps: item.max_reps,
        dateAchieved: new Date(item.date_achieved),
        notes: item.notes,
        sourceType: item.source_type,
        workoutId: item.workout_id,
        exerciseLogId: item.exercise_log_id,
      }));
    } catch (error) {
      console.error('Error fetching training max history:', error);
      throw error;
    }
  },

  // Update training max from workout tracker data
  updateFromWorkoutTracker: async (data: {
    exerciseId: string;
    measurementType: MeasurementType;
    maxValue: number;
    maxReps: number;
    workoutId: string;
    exerciseLogId: string;
    notes?: string;
  }) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if this is actually a new max
      const currentMax = await trainingMaxService.getExerciseTrainingMax(
        data.exerciseId,
        data.measurementType
      );

      // Calculate estimated 1RM using Epley formula if reps > 1
      const estimated1RM = data.maxReps === 1
        ? data.maxValue
        : Math.round(data.maxValue * (1 + data.maxReps / 30));

      // Only update if this is a new max
      if (!currentMax || estimated1RM > currentMax.maxValue) {
        const result = await trainingMaxService.setTrainingMax({
          exerciseId: data.exerciseId,
          measurementType: data.measurementType,
          maxValue: estimated1RM,
          maxReps: 1, // Always store as 1RM
          notes: data.notes || `Auto-updated from workout: ${data.maxValue} lbs x ${data.maxReps} reps`,
          sourceType: 'workout_tracker',
          workoutId: data.workoutId,
          exerciseLogId: data.exerciseLogId,
        });

        // Return result with previous max for comparison
        return {
          ...result,
          previousMax: currentMax?.maxValue || 0,
        };
      }

      return null; // No update needed
    } catch (error) {
      console.error('Error updating training max from workout tracker:', error);
      throw error;
    }
  },

  // Get training maxes with source information for display
  getTrainingMaxWithSource: async (exerciseId: string, measurementType: MeasurementType) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('exercise_training_maxes')
        .select(`
          *,
          workout:workouts(
            id,
            title,
            date
          ),
          exercise_log:exercise_logs(
            id,
            sets
          )
        `)
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .eq('measurement_type', measurementType)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new ApiError(error.message, error.code);
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        exerciseId: data.exercise_id,
        measurementType: data.measurement_type,
        maxValue: data.max_value,
        maxReps: data.max_reps,
        dateAchieved: new Date(data.date_achieved),
        notes: data.notes,
        sourceType: data.source_type,
        workoutId: data.workout_id,
        exerciseLogId: data.exercise_log_id,
        workout: data.workout,
        exerciseLog: data.exercise_log,
      };
    } catch (error) {
      console.error('Error fetching training max with source:', error);
      throw error;
    }
  },
};

export default trainingMaxService;
