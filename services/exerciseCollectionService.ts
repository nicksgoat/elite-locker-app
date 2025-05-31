/**
 * Elite Locker Services - Exercise Collection Service
 *
 * This file contains the exercise collection service implementation using Supabase.
 * Handles curated exercise collections created by users.
 */

import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { ApiError } from './types';

// Exercise Collection interfaces
export interface ExerciseCollection {
  id: string;
  name: string;
  description?: string;
  creatorId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  thumbnailUrl?: string;
  isPaid: boolean;
  price?: number;
  visibility: 'public' | 'private';
  exerciseCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseCollectionItem {
  id: string;
  collectionId: string;
  exerciseId: string;
  orderIndex: number;
  notes?: string;
  exercise?: any; // Exercise details
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  isPaid?: boolean;
  price?: number;
  visibility?: 'public' | 'private';
  exerciseIds?: string[];
}

// Exercise collection service implementation
export const exerciseCollectionService = {
  // Get all collections
  getCollections: async ({
    search = '',
    creatorId,
    isPaid,
    limit = 50,
    offset = 0
  }: {
    search?: string;
    creatorId?: string;
    isPaid?: boolean;
    limit?: number;
    offset?: number;
  } = {}) => {
    try {
      let query = supabase
        .from('exercise_collections')
        .select(`
          *,
          creator:profiles!creator_id(
            id,
            username,
            full_name,
            avatar_url
          ),
          exercise_collection_items(count)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply search filter
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply creator filter
      if (creatorId) {
        query = query.eq('creator_id', creatorId);
      }

      // Apply paid filter
      if (isPaid !== undefined) {
        query = query.eq('is_paid', isPaid);
      }

      const { data, error } = await query;

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      // Transform data to match interface
      const collections: ExerciseCollection[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        creatorId: item.creator_id,
        creatorName: item.creator?.full_name || item.creator?.username,
        creatorAvatar: item.creator?.avatar_url,
        thumbnailUrl: item.thumbnail_url,
        isPaid: item.is_paid,
        price: item.price,
        visibility: item.visibility,
        exerciseCount: item.exercise_collection_items?.[0]?.count || 0,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));

      return collections;
    } catch (error) {
      console.error('Error fetching exercise collections:', error);
      // Fallback to mock data during development
      return [];
    }
  },

  // Get collection by ID with exercises
  getCollectionById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('exercise_collections')
        .select(`
          *,
          creator:profiles!creator_id(
            id,
            username,
            full_name,
            avatar_url
          ),
          exercise_collection_items(
            *,
            exercise:exercises(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      if (!data) {
        throw new ApiError('Collection not found', 404);
      }

      // Transform data
      const collection: ExerciseCollection & { items: ExerciseCollectionItem[] } = {
        id: data.id,
        name: data.name,
        description: data.description,
        creatorId: data.creator_id,
        creatorName: data.creator?.full_name || data.creator?.username,
        creatorAvatar: data.creator?.avatar_url,
        thumbnailUrl: data.thumbnail_url,
        isPaid: data.is_paid,
        price: data.price,
        visibility: data.visibility,
        exerciseCount: data.exercise_collection_items?.length || 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        items: (data.exercise_collection_items || []).map((item: any) => ({
          id: item.id,
          collectionId: item.collection_id,
          exerciseId: item.exercise_id,
          orderIndex: item.order_index,
          notes: item.notes,
          exercise: item.exercise,
        })),
      };

      return collection;
    } catch (error) {
      console.error(`Error fetching collection with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new collection
  createCollection: async (collectionData: CreateCollectionData) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Create the collection
      const { data: collection, error: collectionError } = await supabase
        .from('exercise_collections')
        .insert({
          name: collectionData.name,
          description: collectionData.description,
          thumbnail_url: collectionData.thumbnailUrl,
          is_paid: collectionData.isPaid || false,
          price: collectionData.price,
          visibility: collectionData.visibility || 'public',
          creator_id: user.id,
        })
        .select()
        .single();

      if (collectionError) {
        throw new ApiError(collectionError.message, collectionError.code);
      }

      // Add exercises to collection if provided
      if (collectionData.exerciseIds && collectionData.exerciseIds.length > 0) {
        const collectionItems = collectionData.exerciseIds.map((exerciseId, index) => ({
          collection_id: collection.id,
          exercise_id: exerciseId,
          order_index: index,
        }));

        const { error: itemsError } = await supabase
          .from('exercise_collection_items')
          .insert(collectionItems);

        if (itemsError) {
          console.error('Error adding exercises to collection:', itemsError);
          // Don't fail the entire operation for items errors
        }
      }

      return await exerciseCollectionService.getCollectionById(collection.id);
    } catch (error) {
      console.error('Error creating exercise collection:', error);
      throw error;
    }
  },

  // Update a collection
  updateCollection: async (id: string, updates: Partial<CreateCollectionData>) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { data, error } = await supabase
        .from('exercise_collections')
        .update({
          name: updates.name,
          description: updates.description,
          thumbnail_url: updates.thumbnailUrl,
          is_paid: updates.isPaid,
          price: updates.price,
          visibility: updates.visibility,
          updated_at: new Date(),
        })
        .eq('id', id)
        .eq('creator_id', user.id)
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return await exerciseCollectionService.getCollectionById(data.id);
    } catch (error) {
      console.error(`Error updating collection with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a collection
  deleteCollection: async (id: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const { error } = await supabase
        .from('exercise_collections')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id);

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting collection with ID ${id}:`, error);
      throw error;
    }
  },

  // Add exercise to collection
  addExerciseToCollection: async (collectionId: string, exerciseId: string, notes?: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if user owns the collection
      const { data: collection } = await supabase
        .from('exercise_collections')
        .select('creator_id')
        .eq('id', collectionId)
        .single();

      if (!collection || collection.creator_id !== user.id) {
        throw new ApiError('Not authorized to modify this collection', 403);
      }

      // Get the next order index
      const { data: lastItem } = await supabase
        .from('exercise_collection_items')
        .select('order_index')
        .eq('collection_id', collectionId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextOrderIndex = (lastItem?.order_index || -1) + 1;

      const { data, error } = await supabase
        .from('exercise_collection_items')
        .insert({
          collection_id: collectionId,
          exercise_id: exerciseId,
          order_index: nextOrderIndex,
          notes,
        })
        .select()
        .single();

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return data;
    } catch (error) {
      console.error('Error adding exercise to collection:', error);
      throw error;
    }
  },

  // Remove exercise from collection
  removeExerciseFromCollection: async (collectionId: string, exerciseId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if user owns the collection
      const { data: collection } = await supabase
        .from('exercise_collections')
        .select('creator_id')
        .eq('id', collectionId)
        .single();

      if (!collection || collection.creator_id !== user.id) {
        throw new ApiError('Not authorized to modify this collection', 403);
      }

      const { error } = await supabase
        .from('exercise_collection_items')
        .delete()
        .eq('collection_id', collectionId)
        .eq('exercise_id', exerciseId);

      if (error) {
        throw new ApiError(error.message, error.code);
      }

      return true;
    } catch (error) {
      console.error('Error removing exercise from collection:', error);
      throw error;
    }
  },

  // Get user's collections
  getUserCollections: async (userId?: string) => {
    try {
      const user = userId ? { id: userId } : await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      return await exerciseCollectionService.getCollections({
        creatorId: user.id,
      });
    } catch (error) {
      console.error('Error fetching user collections:', error);
      throw error;
    }
  },
};

export default exerciseCollectionService;
