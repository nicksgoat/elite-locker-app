/**
 * Elite Locker Services - Profile Service
 *
 * This file contains the profile service implementation using Supabase.
 */

import { mockClubs, mockPrograms, mockUsers, mockWorkouts } from '../data/mockData'; // Fallback for development
import { deleteData, fetchData, insertData, uploadFile } from '../lib/api';
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

      // Defensive check for profileData
      if (!profileData || typeof profileData !== 'object') {
        throw new ApiError('Invalid profile data provided', 400);
      }

      // Upload avatar if provided
      let avatarUrl = profileData.avatarUrl || profileData.avatar_url;
      if (profileData.avatar && typeof profileData.avatar !== 'string') {
        avatarUrl = await uploadFile(
          'avatars',
          `${user.id}/${Date.now()}-avatar`,
          profileData.avatar
        );
      } else if (profileData.avatarUrl && !profileData.avatarUrl.startsWith('http') && !profileData.avatarUrl.startsWith('file://')) {
        // Handle local file URI for avatar
        try {
          const response = await fetch(profileData.avatarUrl);
          const blob = await response.blob();
          avatarUrl = await uploadFile(
            'avatars',
            `${user.id}/${Date.now()}-avatar`,
            blob
          );
        } catch (uploadError) {
          console.error('Error uploading avatar:', uploadError);
          // Keep the original URL if upload fails
          avatarUrl = profileData.avatarUrl;
        }
      }

      // Upload header image if provided
      let headerUrl = profileData.headerUrl || profileData.header_url;
      if (profileData.header && typeof profileData.header !== 'string') {
        headerUrl = await uploadFile(
          'avatars',
          `${user.id}/${Date.now()}-header`,
          profileData.header
        );
      } else if (profileData.headerUrl && !profileData.headerUrl.startsWith('http') && !profileData.headerUrl.startsWith('file://')) {
        // Handle local file URI for header
        try {
          const response = await fetch(profileData.headerUrl);
          const blob = await response.blob();
          headerUrl = await uploadFile(
            'avatars',
            `${user.id}/${Date.now()}-header`,
            blob
          );
        } catch (uploadError) {
          console.error('Error uploading header image:', uploadError);
          // Keep the original URL if upload fails
          headerUrl = profileData.headerUrl;
        }
      }

      // Prepare update data with defensive checks
      const profileUpdateData: any = {
        updated_at: new Date()
      };

      // Only include fields that are provided and not undefined
      if (profileData.username !== undefined || profileData.handle !== undefined) {
        profileUpdateData.username = profileData.username || profileData.handle;
      }
      if (profileData.fullName !== undefined || profileData.full_name !== undefined || profileData.name !== undefined) {
        profileUpdateData.full_name = profileData.fullName || profileData.full_name || profileData.name;
      }
      if (profileData.bio !== undefined) {
        profileUpdateData.bio = profileData.bio;
      }
      if (avatarUrl !== undefined) {
        profileUpdateData.avatar_url = avatarUrl;
      }
      if (headerUrl !== undefined) {
        profileUpdateData.header_url = headerUrl;
      }

      // Update the profile using the updateData function from api.ts
      const { updateData: updateDataFunction } = await import('../lib/api');
      const profile = await updateDataFunction('profiles', user.id, profileUpdateData);

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
            sets:exercise_sets(*)
          )
        `,
        filters: { author_id: profileId, is_complete: true },
        order: { column: 'date', ascending: false },
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
      console.log(`ProfileService - Fetching clubs for profile: ${profileId}`);

      // First try to get clubs where user is the owner
      const ownedClubs = await fetchData('clubs', {
        select: '*',
        filters: { owner_id: profileId },
        order: { column: 'created_at', ascending: false },
        limit
      });

      console.log(`ProfileService - Found ${(ownedClubs || []).length} owned clubs`);

      // If no owned clubs, try to get clubs where user is a member
      if (!ownedClubs || ownedClubs.length === 0) {
        console.log('ProfileService - No owned clubs found, checking memberships...');

        try {
          const memberships = await fetchData('club_members', {
            select: `
              *,
              club:clubs(*)
            `,
            filters: { user_id: profileId },
            order: { column: 'created_at', ascending: false },
            limit
          });

          console.log(`ProfileService - Found ${(memberships || []).length} club memberships`);

          if (memberships && memberships.length > 0) {
            // Extract club data from memberships
            const memberClubs = memberships.map((membership: any) => membership.club).filter(Boolean);
            console.log('ProfileService - Member clubs:', memberClubs);
            return memberClubs;
          }
        } catch (membershipError) {
          console.error('Error fetching club memberships:', membershipError);
        }
      }

      return ownedClubs || [];
    } catch (error) {
      console.error(`Error fetching clubs for profile ${profileId}:`, error);
      // Fallback to mock data during development
      const mockResult = mockClubs.filter(c => c.ownerId === profileId).slice(offset, offset + limit);
      console.log('ProfileService - Using mock clubs:', mockResult);
      return mockResult;
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
