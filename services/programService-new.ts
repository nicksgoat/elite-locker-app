/**
 * Elite Locker - Program Service
 *
 * This file contains the program service implementation using Supabase.
 */

import { mockPrograms } from '../data/mockData'; // Fallback for development
import { fetchData, insertData, updateData } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { safeQuery, supabase, supabaseApi } from '../lib/supabase-new';
import { ApiError } from './types';

// Program service implementation
export const programService = {
  // Get all programs
  getPrograms: async ({ bypassCache = false } = {}) => {
    try {
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
};
