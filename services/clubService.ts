/**
 * Elite Locker Services - Club Service
 *
 * This file contains the club service implementation using Supabase.
 */

import { mockClubs } from '../data/mockData';
import { deleteData, fetchData, insertData, uploadFile } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { ApiError } from './types';

// Club service implementation
export const clubService = {
  // Get all clubs
  getClubs: async ({
    limit = 10,
    offset = 0,
    bypassCache = false
  }: {
    limit?: number,
    offset?: number,
    bypassCache?: boolean
  } = {}) => {
    try {
      const data = await fetchData('clubs', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        limit,
        bypassCache,
        // Cache clubs for 1 hour (3600000 ms)
        cacheExpiration: 3600000
      });

      // Ensure we always return an array
      if (!data) {
        console.log('No clubs data returned from API');
        return [];
      }

      // If data is not an array, wrap it in an array
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error fetching clubs:', error);
      // Return empty array instead of mock data to force real backend usage
      return [];
    }
  },

  // Get featured clubs
  getFeaturedClubs: async ({
    limit = 5,
    bypassCache = false
  }: {
    limit?: number,
    bypassCache?: boolean
  } = {}) => {
    try {
      const data = await fetchData('clubs', {
        select: '*',
        filters: { is_paid: true }, // Use is_paid instead of is_featured for now
        order: { column: 'created_at', ascending: false },
        limit,
        bypassCache,
        // Cache featured clubs for 2 hours (7200000 ms)
        cacheExpiration: 7200000
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching featured clubs:', error);
      // Return empty array instead of mock data to force real backend usage
      return [];
    }
  },

  // Get user's clubs (clubs they own)
  getMyClubs: async ({ bypassCache = false } = {}) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        console.log('User not authenticated, returning empty array');
        return [];
      }

      const data = await fetchData('clubs', {
        select: '*',
        filters: { owner_id: user.id },
        order: { column: 'created_at', ascending: false },
        bypassCache,
        // Cache user's clubs for 30 minutes (1800000 ms)
        cacheExpiration: 1800000
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      // Return empty array instead of mock data to force real backend usage
      return [];
    }
  },

  // Get clubs user is a member of
  getMyMemberships: async ({ bypassCache = false } = {}) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const data = await fetchData('club_members', {
        select: `
          *,
          club:clubs(
            *,
            owner:profiles(id, username, avatar_url, full_name)
          )
        `,
        filters: { user_id: user.id },
        order: { column: 'joined_at', ascending: false },
        bypassCache,
        // Cache user's memberships for 30 minutes (1800000 ms)
        cacheExpiration: 1800000
      });

      // Extract just the club data
      return data ? data.map((membership: any) => membership.club) || [] : [];
    } catch (error) {
      console.error('Error fetching user memberships:', error);
      // Fallback to mock data during development
      return mockClubs.slice(0, 3);
    }
  },

  // Get club by ID
  getClub: async (id: string, { bypassCache = false } = {}) => {
    try {
      // Validate the club ID format
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new ApiError('Invalid club ID provided', 400);
      }

      const data = await fetchData('clubs', {
        select: '*',
        filters: { id: id.trim() },
        single: true,
        bypassCache,
        // Cache club details for 1 hour (3600000 ms)
        cacheExpiration: 3600000
      });

      if (!data) {
        throw new ApiError(`Club with ID ${id} not found`, 404);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching club ${id}:`, error);

      // If it's already an ApiError, re-throw it
      if (error instanceof ApiError) {
        throw error;
      }

      // For other errors, wrap them in an ApiError
      throw new ApiError(`Failed to fetch club with ID ${id}: ${error.message || 'Unknown error'}`, 500);
    }
  },

  // Get club posts
  getClubPosts: async (
    clubId: string,
    {
      limit = 10,
      offset = 0,
      bypassCache = false
    }: {
      limit?: number,
      offset?: number,
      bypassCache?: boolean
    } = {}
  ) => {
    try {
      const data = await fetchData('posts', {
        select: `
          *,
          author:profiles(id, username, avatar_url, full_name)
        `,
        filters: { club_id: clubId },
        order: { column: 'created_at', ascending: false },
        limit,
        bypassCache,
        // Cache club posts for 15 minutes (900000 ms)
        cacheExpiration: 900000
      });

      // Add fallback author data if missing
      const validPosts = (data || []).map(post => {
        if (!post.author) {
          post.author = {
            id: post.author_id || 'unknown',
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          };
        }
        return post;
      });

      return validPosts;
    } catch (error) {
      console.error(`Error fetching posts for club ${clubId}:`, error);
      // Return empty array instead of mock data to force real backend usage
      return [];
    }
  },

  // Get club events
  getClubEvents: async (
    clubId: string,
    {
      limit = 10,
      offset = 0,
      bypassCache = false
    }: {
      limit?: number,
      offset?: number,
      bypassCache?: boolean
    } = {}
  ) => {
    try {
      const data = await fetchData('events', {
        select: `
          *,
          host:profiles(id, username, avatar_url, full_name)
        `,
        filters: { club_id: clubId },
        order: { column: 'date', ascending: true },
        limit,
        bypassCache,
        // Cache club events for 30 minutes (1800000 ms)
        cacheExpiration: 1800000
      });

      // Add fallback host data if missing
      const validEvents = (data || []).map(event => {
        if (!event.host) {
          event.host = {
            id: event.host_id || 'unknown',
            username: 'Unknown Host',
            full_name: 'Unknown Host',
            avatar_url: null
          };
        }
        return event;
      });

      return validEvents;
    } catch (error) {
      console.error(`Error fetching events for club ${clubId}:`, error);
      // Return empty array instead of mock data to force real backend usage
      return [];
    }
  },

  // Create a club
  createClub: async (clubData: any) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Upload banner image if provided
      let bannerImageUrl = clubData.bannerImageUrl;
      if (clubData.bannerImage && typeof clubData.bannerImage !== 'string') {
        bannerImageUrl = await uploadFile(
          'club-images',
          `${user.id}/${Date.now()}-banner`,
          clubData.bannerImage
        );
      }

      // Upload profile image if provided
      let profileImageUrl = clubData.profileImageUrl;
      if (clubData.profileImage && typeof clubData.profileImage !== 'string') {
        profileImageUrl = await uploadFile(
          'club-images',
          `${user.id}/${Date.now()}-profile`,
          clubData.profileImage
        );
      }

      // Create the club
      const club = await insertData('clubs', {
        name: clubData.name,
        description: clubData.description,
        owner_id: user.id,
        is_paid: clubData.isPaid || false,
        price: clubData.price,
        banner_image_url: bannerImageUrl,
        profile_image_url: profileImageUrl,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Add the owner as a member
      await insertData('club_members', {
        club_id: club.id,
        user_id: user.id,
        role: 'owner',
        joined_at: new Date()
      });

      return club;
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  },

  // Join a club
  joinClub: async (clubId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if already a member
      const existingMembership = await fetchData('club_members', {
        select: '*',
        filters: { club_id: clubId, user_id: user.id },
        bypassCache: true // Always get the latest data
      });

      if (existingMembership && existingMembership.length > 0) {
        return existingMembership[0];
      }

      // Join the club with offline support
      const membership = await insertData('club_members', {
        club_id: clubId,
        user_id: user.id,
        role: 'member',
        joined_at: new Date()
      }, { offlineSupport: true });

      return membership;
    } catch (error) {
      console.error(`Error joining club ${clubId}:`, error);
      throw error;
    }
  },

  // Leave a club
  leaveClub: async (clubId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get membership
      const memberships = await fetchData('club_members', {
        select: '*',
        filters: { club_id: clubId, user_id: user.id },
        bypassCache: true // Always get the latest data
      });

      if (!memberships || memberships.length === 0) {
        throw new ApiError(`Not a member of club ${clubId}`, 404);
      }

      // Delete membership with offline support
      await deleteData('club_members', memberships[0].id, { offlineSupport: true });

      return { success: true };
    } catch (error) {
      console.error(`Error leaving club ${clubId}:`, error);
      throw error;
    }
  },

  // Update a club
  updateClub: async (clubId: string, updateData: any) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get the club to verify ownership
      const club = await fetchData('clubs', {
        select: '*',
        filters: { id: clubId },
        single: true,
        bypassCache: true
      });

      if (!club) {
        throw new ApiError(`Club with ID ${clubId} not found`, 404);
      }

      if (club.owner_id !== user.id) {
        throw new ApiError('You are not authorized to update this club', 403);
      }

      // Handle image uploads
      let bannerImageUrl = updateData.banner_image_url;
      let profileImageUrl = updateData.profile_image_url;

      // Upload banner image if it's a new file (not a URL)
      if (updateData.banner_image_url && !updateData.banner_image_url.startsWith('http')) {
        try {
          bannerImageUrl = await uploadFile(
            'club-images',
            `${user.id}/${Date.now()}-banner`,
            updateData.banner_image_url
          );
        } catch (uploadError) {
          console.error('Error uploading banner image:', uploadError);
          // Keep the original URL if upload fails
          bannerImageUrl = club.banner_image_url;
        }
      }

      // Upload profile image if it's a new file (not a URL)
      if (updateData.profile_image_url && !updateData.profile_image_url.startsWith('http')) {
        try {
          profileImageUrl = await uploadFile(
            'club-images',
            `${user.id}/${Date.now()}-profile`,
            updateData.profile_image_url
          );
        } catch (uploadError) {
          console.error('Error uploading profile image:', uploadError);
          // Keep the original URL if upload fails
          profileImageUrl = club.profile_image_url;
        }
      }

      // Prepare the update data
      const clubUpdateData = {
        name: updateData.name,
        description: updateData.description,
        banner_image_url: bannerImageUrl,
        profile_image_url: profileImageUrl,
        updated_at: new Date()
      };

      // Update the club using the updateData function from api.ts
      const { updateData: updateDataFunction } = await import('../lib/api');
      const updatedClub = await updateDataFunction('clubs', clubId, clubUpdateData);

      if (!updatedClub) {
        throw new ApiError('Failed to update club', 500);
      }

      return updatedClub;
    } catch (error) {
      console.error(`Error updating club ${clubId}:`, error);
      throw error;
    }
  },

  // Get marketplace clubs (public and paid clubs)
  getMarketplaceClubs: async ({
    limit = 20,
    offset = 0,
    bypassCache = false
  }: {
    limit?: number,
    offset?: number,
    bypassCache?: boolean
  } = {}) => {
    try {
      const data = await fetchData('clubs', {
        select: `
          *,
          owner:profiles(username, avatar_url),
          member_count:club_members(count)
        `,
        // For now, get all clubs - we can add more filtering later
        order: { column: 'created_at', ascending: false },
        limit,
        bypassCache,
        // Cache marketplace clubs for 30 minutes (1800000 ms)
        cacheExpiration: 1800000
      });

      // Add fallback owner data if missing
      const validClubs = (data || []).map(club => {
        if (!club.owner) {
          club.owner = {
            username: 'Unknown Owner',
            avatar_url: null
          };
        }
        return club;
      });

      return validClubs;
    } catch (error) {
      console.error('Error fetching marketplace clubs:', error);
      // Return empty array instead of mock data to force real backend usage
      return [];
    }
  }
};
