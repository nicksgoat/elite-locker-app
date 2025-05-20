/**
 * Elite Locker Services - Exercise Service
 *
 * This file contains the exercise service implementation using Supabase.
 */

import { mockExercises } from '../data/mockData';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase-client';
import { Exercise } from '../types/workout';
import { ApiError } from './types';

// Exercise service implementation
export const exerciseService = {
  // Get all exercises
  getExercises: async ({
    search = '',
    muscleGroups = [],
    limit = 50,
    offset = 0
  }: {
    search?: string;
    muscleGroups?: string[];
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      let query = supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply search filter if provided
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      // Apply muscle group filter if provided
      if (muscleGroups.length > 0) {
        query = query.contains('muscle_groups', muscleGroups);
      }

      const { data, error } = await query;

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      // Transform data to match Exercise type
      const exercises: Exercise[] = data.map(item => ({
        id: item.id,
        name: item.name,
        notes: item.description,
        muscleGroups: item.muscle_groups || [],
      }));

      return exercises;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // Fallback to mock data during development
      return mockExercises;
    }
  },

  // Get exercise by ID
  getExerciseById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      if (!data) {
        throw new ApiError('Exercise not found', 404);
      }

      // Transform data to match Exercise type
      const exercise: Exercise = {
        id: data.id,
        name: data.name,
        notes: data.description,
        muscleGroups: data.muscle_groups || [],
      };

      return exercise;
    } catch (error) {
      console.error(`Error fetching exercise with ID ${id}:`, error);
      // Fallback to mock data during development
      return mockExercises.find(exercise => exercise.id === id);
    }
  },

  // Create a new exercise
  createExercise: async (exercise: Omit<Exercise, 'id'>) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: exercise.name,
          description: exercise.notes,
          muscle_groups: exercise.muscleGroups,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      // Transform data to match Exercise type
      const newExercise: Exercise = {
        id: data.id,
        name: data.name,
        notes: data.description,
        muscleGroups: data.muscle_groups || [],
      };

      return newExercise;
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  },

  // Update an exercise
  updateExercise: async (id: string, exercise: Partial<Exercise>) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('exercises')
        .update({
          name: exercise.name,
          description: exercise.notes,
          muscle_groups: exercise.muscleGroups,
          updated_at: new Date(),
        })
        .eq('id', id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      // Transform data to match Exercise type
      const updatedExercise: Exercise = {
        id: data.id,
        name: data.name,
        notes: data.description,
        muscleGroups: data.muscle_groups || [],
      };

      return updatedExercise;
    } catch (error) {
      console.error(`Error updating exercise with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete an exercise
  deleteExercise: async (id: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting exercise with ID ${id}:`, error);
      throw error;
    }
  },

  // Get user's favorite exercises
  getFavoriteExercises: async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          content_id,
          exercises:content_id(*)
        `)
        .eq('user_id', user.id)
        .eq('content_type', 'exercise');

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      // Transform data to match Exercise type
      const exercises: Exercise[] = data
        .filter(item => item.exercises)
        .map(item => ({
          id: item.exercises.id,
          name: item.exercises.name,
          notes: item.exercises.description,
          muscleGroups: item.exercises.muscle_groups || [],
        }));

      return exercises;
    } catch (error) {
      console.error('Error fetching favorite exercises:', error);
      // Fallback to mock data during development
      return mockExercises.filter(exercise => exercise.id === 'ex1' || exercise.id === 'ex4');
    }
  },

  // Toggle favorite status for an exercise
  toggleFavoriteExercise: async (id: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if already favorited
      const { data: existingFavorite, error: checkError } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('content_id', id)
        .eq('content_type', 'exercise')
        .maybeSingle();

      if (checkError) {
        throw new ApiError(checkError.message, checkError.code);
      }

      if (existingFavorite) {
        // Remove from favorites
        const { error: deleteError } = await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existingFavorite.id);

        if (deleteError) {
          throw new ApiError(deleteError.message, deleteError.code);
        }

        return false; // Not favorited anymore
      } else {
        // Add to favorites
        const { error: insertError } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            content_id: id,
            content_type: 'exercise',
          });

        if (insertError) {
          throw new ApiError(insertError.message, insertError.code);
        }

        return true; // Now favorited
      }
    } catch (error) {
      console.error(`Error toggling favorite status for exercise with ID ${id}:`, error);
      throw error;
    }
  },
};

export default exerciseService;
