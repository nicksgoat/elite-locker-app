/**
 * Elite Locker Services - Enhanced Exercise Service
 *
 * This file contains the comprehensive exercise service implementation using Supabase.
 * Supports the full exercise library system with categories, tags, training maxes, and more.
 */

import { mockExercises } from '../data/mockData';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import {
    Exercise
} from '../types/workout';
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

  // ===== NEW ENHANCED EXERCISE LIBRARY METHODS =====

  // Get all categories
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to mock data during development
      return [
        { id: 'cat1', name: 'Strength Training', description: 'Weight lifting and resistance exercises', colorHex: '#0A84FF', iconName: 'barbell-outline' },
        { id: 'cat2', name: 'Cardio', description: 'Cardiovascular and endurance exercises', colorHex: '#FF375F', iconName: 'heart-outline' },
        { id: 'cat3', name: 'Plyometrics', description: 'Explosive power and jump training', colorHex: '#FF9F0A', iconName: 'flash-outline' },
      ];
    }
  },

  // Get all exercise tags
  getExerciseTags: async (groupName?: string) => {
    try {
      let query = supabase
        .from('exercise_tags')
        .select('*')
        .order('group_name, label');

      if (groupName) {
        query = query.eq('group_name', groupName);
      }

      const { data, error } = await query;

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching exercise tags:', error);
      // Fallback to mock data during development
      return [
        { id: 'tag1', name: 'strength_training', label: 'Strength', groupName: 'exercise_type', colorHex: '#0A84FF' },
        { id: 'tag2', name: 'legs', label: 'Legs', groupName: 'body_part', colorHex: '#FF9F0A' },
        { id: 'tag3', name: 'barbell', label: 'Barbell', groupName: 'equipment', colorHex: '#5E5CE6' },
      ];
    }
  },

  // Enhanced exercise search with category and tag filtering
  searchExercises: async ({
    query = '',
    categoryId,
    tagIds = [],
    measurementType,
    visibility = 'all',
    limit = 50,
    offset = 0
  }: {
    query?: string;
    categoryId?: string;
    tagIds?: string[];
    measurementType?: string;
    visibility?: 'all' | 'public' | 'private';
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      const user = await getCurrentUser();

      let dbQuery = supabase
        .from('exercises')
        .select(`
          *,
          category:categories(*),
          exercise_tag_relations(
            exercise_tags(*)
          )
        `)
        .order('name')
        .range(offset, offset + limit - 1);

      // Apply visibility filter
      if (visibility === 'public') {
        dbQuery = dbQuery.eq('visibility', 'public');
      } else if (visibility === 'private' && user) {
        dbQuery = dbQuery.eq('visibility', 'private').eq('created_by', user.id);
      } else if (visibility === 'all' && user) {
        dbQuery = dbQuery.or(`visibility.eq.public,and(visibility.eq.private,created_by.eq.${user.id})`);
      } else {
        dbQuery = dbQuery.eq('visibility', 'public');
      }

      // Apply search filter
      if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`);
      }

      // Apply category filter
      if (categoryId) {
        dbQuery = dbQuery.eq('category_id', categoryId);
      }

      // Apply measurement type filter
      if (measurementType) {
        dbQuery = dbQuery.contains('measurement_config', { allowed: [measurementType] });
      }

      const { data, error } = await dbQuery;

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      // Transform and filter by tags if needed
      let exercises = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        notes: item.description,
        muscleGroups: item.muscle_groups || [],
        videoUrl: item.video_url,
        thumbnailUrl: item.thumbnail_url,
        measurementConfig: item.measurement_config,
        category: item.category,
        categoryId: item.category_id,
        tags: item.exercise_tag_relations?.map((rel: any) => rel.exercise_tags) || [],
        visibility: item.visibility,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      // Filter by tags if specified
      if (tagIds.length > 0) {
        exercises = exercises.filter(exercise =>
          exercise.tags?.some(tag => tagIds.includes(tag.id))
        );
      }

      return exercises;
    } catch (error) {
      console.error('Error searching exercises:', error);
      // Fallback to mock data during development
      return mockExercises.filter(ex =>
        !query || ex.name.toLowerCase().includes(query.toLowerCase())
      ).slice(offset, offset + limit);
    }
  },

  // Get exercise with full details including tags and category
  getExerciseWithDetails: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          category:categories(*),
          exercise_tag_relations(
            exercise_tags(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      if (!data) {
        throw new ApiError('Exercise not found', 404);
      }

      // Transform data to match Exercise type
      const exercise = {
        id: data.id,
        name: data.name,
        description: data.description,
        notes: data.description,
        muscleGroups: data.muscle_groups || [],
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        measurementConfig: data.measurement_config,
        category: data.category,
        categoryId: data.category_id,
        tags: data.exercise_tag_relations?.map((rel: any) => rel.exercise_tags) || [],
        visibility: data.visibility,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      return exercise;
    } catch (error) {
      console.error(`Error fetching exercise with ID ${id}:`, error);
      // Fallback to mock data during development
      return mockExercises.find(exercise => exercise.id === id);
    }
  },

  // Create exercise with tags
  createExerciseWithTags: async (exerciseData: {
    name: string;
    description?: string;
    muscleGroups?: string[];
    videoUrl?: string;
    thumbnailUrl?: string;
    measurementConfig: any;
    categoryId?: string;
    tagIds?: string[];
    visibility?: 'public' | 'private';
  }) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Create the exercise
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert({
          name: exerciseData.name,
          description: exerciseData.description,
          muscle_groups: exerciseData.muscleGroups,
          video_url: exerciseData.videoUrl,
          thumbnail_url: exerciseData.thumbnailUrl,
          measurement_config: exerciseData.measurementConfig,
          category_id: exerciseData.categoryId,
          visibility: exerciseData.visibility || 'public',
          created_by: user.id,
        })
        .select()
        .single();

      if (exerciseError) {
        throw new ApiError(exerciseError.message, exerciseError.code);
      }

      // Add tag relations if provided
      if (exerciseData.tagIds && exerciseData.tagIds.length > 0) {
        const tagRelations = exerciseData.tagIds.map(tagId => ({
          exercise_id: exercise.id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('exercise_tag_relations')
          .insert(tagRelations);

        if (tagError) {
          console.error('Error adding tag relations:', tagError);
          // Don't fail the entire operation for tag errors
        }
      }

      return await exerciseService.getExerciseWithDetails(exercise.id);
    } catch (error) {
      console.error('Error creating exercise with tags:', error);
      throw error;
    }
  },
};

export default exerciseService;
