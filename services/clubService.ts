/**
 * Elite Locker Services - Club Service
 *
 * This file contains the club service implementation using Supabase.
 */

import { mockClubs, mockEvents, mockPosts } from '../data/mockData';
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
        select: `
          *,
          owner:profiles(id, username, avatar_url, full_name)
        `,
        order: { column: 'created_at', ascending: false },
        limit,
        bypassCache,
        // Cache clubs for 1 hour (3600000 ms)
        cacheExpiration: 3600000
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching clubs:', error);
      // Fallback to mock data during development
      return mockClubs.slice(offset, offset + limit);
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
        select: `
          *,
          owner:profiles(id, username, avatar_url, full_name)
        `,
        filters: { is_featured: true },
        order: { column: 'created_at', ascending: false },
        limit,
        bypassCache,
        // Cache featured clubs for 2 hours (7200000 ms)
        cacheExpiration: 7200000
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching featured clubs:', error);
      // Fallback to mock data during development
      return mockClubs.filter(c => c.isPaid).slice(0, limit);
    }
  },

  // Get user's clubs (clubs they own)
  getMyClubs: async ({ bypassCache = false } = {}) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const data = await fetchData('clubs', {
        select: `
          *,
          owner:profiles(id, username, avatar_url, full_name)
        `,
        filters: { owner_id: user.id },
        order: { column: 'created_at', ascending: false },
        bypassCache,
        // Cache user's clubs for 30 minutes (1800000 ms)
        cacheExpiration: 1800000
      });

      return data || [];
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      // Fallback to mock data during development
      return mockClubs.filter(c => c.ownerId === 'user1');
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
      const data = await fetchData('clubs', {
        select: `
          *,
          owner:profiles(id, username, avatar_url, full_name),
          members:club_members(count)
        `,
        filters: { id },
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
      // Fallback to mock data during development
      const club = mockClubs.find(c => c.id === id);

      if (!club) {
        throw new ApiError(`Club with ID ${id} not found`, 404);
      }

      return club;
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

      return data || [];
    } catch (error) {
      console.error(`Error fetching posts for club ${clubId}:`, error);
      // Fallback to mock data during development
      return mockPosts.filter(p => p.clubId === clubId).slice(offset, offset + limit);
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

      return data || [];
    } catch (error) {
      console.error(`Error fetching events for club ${clubId}:`, error);
      // Fallback to mock data during development
      return mockEvents.filter(e => e.clubId === clubId).slice(offset, offset + limit);
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
  }
};
