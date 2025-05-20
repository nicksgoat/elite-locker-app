/**
 * Elite Locker Services - Profile Service
 *
 * This file contains the profile service implementation using Supabase.
 */

import { mockClubs, mockPrograms, mockUsers, mockWorkouts } from '../data/mockData'; // Fallback for development
import { deleteData, fetchData, insertData, updateData, uploadFile } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { ApiError } from './types';

// Profile service implementation
export const profileService = {
  // Get current user profile
  getMyProfile: async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const data = await fetchData('profiles', {
        select: '*',
        filters: { id: user.id },
        single: true
      });

      if (!data) {
        throw new ApiError(`Profile not found`, 404);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to mock data during development
      return mockUsers[0];
    }
  },

  // Get profile by ID
  getProfile: async (id: string) => {
    try {
      const data = await fetchData('profiles', {
        select: '*',
        filters: { id },
        single: true
      });

      if (!data) {
        throw new ApiError(`Profile with ID ${id} not found`, 404);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching profile ${id}:`, error);
      // Fallback to mock data during development
      const profile = mockUsers.find(u => u.id === id);

      if (!profile) {
        throw new ApiError(`Profile with ID ${id} not found`, 404);
      }

      return profile;
    }
  },

  // Get profile by username
  getProfileByUsername: async (username: string) => {
    try {
      const data = await fetchData('profiles', {
        select: '*',
        filters: { username },
        single: true
      });

      if (!data) {
        throw new ApiError(`Profile with username ${username} not found`, 404);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching profile with username ${username}:`, error);
      // Fallback to mock data during development
      const profile = mockUsers.find(u => u.username === username);

      if (!profile) {
        throw new ApiError(`Profile with username ${username} not found`, 404);
      }

      return profile;
    }
  },

  // Update profile
  updateProfile: async (profileData: any) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Upload avatar if provided
      let avatarUrl = profileData.avatarUrl;
      if (profileData.avatar && typeof profileData.avatar !== 'string') {
        avatarUrl = await uploadFile(
          'avatars',
          `${user.id}/${Date.now()}`,
          profileData.avatar
        );
      }

      // Update the profile
      const profile = await updateData('profiles', user.id, {
        username: profileData.username,
        full_name: profileData.fullName,
        bio: profileData.bio,
        avatar_url: avatarUrl,
        updated_at: new Date()
      });

      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get profile workouts
  getProfileWorkouts: async (profileId: string, { limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) => {
    try {
      const data = await fetchData('workouts', {
        select: `
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*),
            sets:workout_sets(*)
          )
        `,
        filters: { user_id: profileId, status: 'completed' },
        order: { column: 'end_time', ascending: false },
        limit
      });

      return data || [];
    } catch (error) {
      console.error(`Error fetching workouts for profile ${profileId}:`, error);
      // Fallback to mock data during development
      return mockWorkouts.slice(offset, offset + limit);
    }
  },

  // Get profile programs
  getProfilePrograms: async (profileId: string, { limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) => {
    try {
      const data = await fetchData('programs', {
        select: '*',
        filters: { author_id: profileId },
        order: { column: 'created_at', ascending: false },
        limit
      });

      return data || [];
    } catch (error) {
      console.error(`Error fetching programs for profile ${profileId}:`, error);
      // Fallback to mock data during development
      return mockPrograms.filter(p => p.authorId === profileId).slice(offset, offset + limit);
    }
  },

  // Get profile clubs
  getProfileClubs: async (profileId: string, { limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) => {
    try {
      const data = await fetchData('clubs', {
        select: '*',
        filters: { owner_id: profileId },
        order: { column: 'created_at', ascending: false },
        limit
      });

      return data || [];
    } catch (error) {
      console.error(`Error fetching clubs for profile ${profileId}:`, error);
      // Fallback to mock data during development
      return mockClubs.filter(c => c.ownerId === profileId).slice(offset, offset + limit);
    }
  },

  // Follow a user
  followUser: async (userId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if already following
      const existingFollow = await fetchData('follows', {
        select: '*',
        filters: { follower_id: user.id, following_id: userId }
      });

      if (existingFollow && existingFollow.length > 0) {
        return existingFollow[0];
      }

      // Create follow
      const follow = await insertData('follows', {
        follower_id: user.id,
        following_id: userId,
        created_at: new Date()
      });

      return follow;
    } catch (error) {
      console.error(`Error following user ${userId}:`, error);
      throw error;
    }
  },

  // Unfollow a user
  unfollowUser: async (userId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get follow
      const follows = await fetchData('follows', {
        select: '*',
        filters: { follower_id: user.id, following_id: userId }
      });

      if (!follows || follows.length === 0) {
        throw new ApiError(`Not following user ${userId}`, 404);
      }

      // Delete follow
      await deleteData('follows', follows[0].id);

      return { success: true };
    } catch (error) {
      console.error(`Error unfollowing user ${userId}:`, error);
      throw error;
    }
  },

  // Get followers
  getFollowers: async (userId: string, { limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) => {
    try {
      const data = await fetchData('follows', {
        select: `
          *,
          follower:profiles(*)
        `,
        filters: { following_id: userId },
        order: { column: 'created_at', ascending: false },
        limit
      });

      // Extract just the follower data
      return data.map((follow: any) => follow.follower) || [];
    } catch (error) {
      console.error(`Error fetching followers for user ${userId}:`, error);
      // Fallback to mock data during development
      return mockUsers.slice(1, 3);
    }
  },

  // Get following
  getFollowing: async (userId: string, { limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) => {
    try {
      const data = await fetchData('follows', {
        select: `
          *,
          following:profiles(*)
        `,
        filters: { follower_id: userId },
        order: { column: 'created_at', ascending: false },
        limit
      });

      // Extract just the following data
      return data.map((follow: any) => follow.following) || [];
    } catch (error) {
      console.error(`Error fetching following for user ${userId}:`, error);
      // Fallback to mock data during development
      return mockUsers.slice(1, 3);
    }
  }
};
