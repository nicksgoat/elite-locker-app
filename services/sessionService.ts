/**
 * Elite Locker Services - Session Service
 *
 * This file contains the session service implementation using Supabase.
 */

import { insertData, updateData } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { ApiError } from './types';

// Types for session service
export interface Session {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
  location: string;
  isOnline: boolean;
  meetingUrl?: string;
  host: {
    id: string;
    name: string;
    avatar?: string;
  };
  attendeeCount: number;
  maxAttendees?: number;
  isAttending?: boolean;
  isPaid: boolean;
  price?: number;
  clubId?: string;
  clubName?: string;
  clubImageUrl?: string;
  category?: 'workout' | 'workshop' | 'competition' | 'social';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateSessionData {
  title: string;
  description?: string;
  dateTime: string;
  location: string;
  isOnline: boolean;
  meetingUrl?: string;
  maxAttendees?: number;
  isPaid: boolean;
  price?: number;
  clubId?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
}

// Mock sessions for development
const mockSessions: Session[] = [
  {
    id: '1',
    title: 'Morning HIIT Session',
    description: 'High-intensity interval training to start your day',
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location: 'Elite Fitness Studio',
    isOnline: false,
    host: { id: '1', name: 'Sarah Johnson', avatar: '' },
    attendeeCount: 12,
    maxAttendees: 20,
    isAttending: false,
    isPaid: true,
    price: 25,
    category: 'workout',
    difficulty: 'intermediate',
    tags: ['hiit', 'cardio', 'morning'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Virtual Yoga Flow',
    description: 'Relaxing yoga session for all levels',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Online',
    isOnline: true,
    meetingUrl: 'https://zoom.us/j/123456789',
    host: { id: '2', name: 'Mike Chen', avatar: '' },
    attendeeCount: 8,
    maxAttendees: 15,
    isAttending: true,
    isPaid: false,
    category: 'workout',
    difficulty: 'beginner',
    tags: ['yoga', 'flexibility', 'relaxation'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Strength Training Workshop',
    description: 'Learn proper form and technique for compound movements',
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'PowerHouse Gym',
    isOnline: false,
    host: { id: '3', name: 'Alex Rodriguez', avatar: '' },
    attendeeCount: 6,
    maxAttendees: 10,
    isAttending: false,
    isPaid: true,
    price: 40,
    category: 'workshop',
    difficulty: 'intermediate',
    tags: ['strength', 'technique', 'education'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Session service implementation
export const sessionService = {
  // Get all sessions
  getSessions: async ({
    limit = 20,
    offset = 0,
    bypassCache = false,
    category,
    isOnline,
    upcoming = true
  }: {
    limit?: number;
    offset?: number;
    bypassCache?: boolean;
    category?: string;
    isOnline?: boolean;
    upcoming?: boolean;
  } = {}) => {
    try {
      const cacheKey = `sessions_${limit}_${offset}_${category || 'all'}_${isOnline}_${upcoming}`;

      let query = supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (typeof isOnline === 'boolean') {
        query = query.eq('is_online', isOnline);
      }

      if (upcoming) {
        query = query.gte('date_time', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sessions:', error);
        // Fallback to mock data during development
        return mockSessions.slice(offset, offset + limit);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Fallback to mock data during development
      return mockSessions.slice(offset, offset + limit);
    }
  },

  // Get marketplace sessions (public and paid sessions)
  getMarketplaceSessions: async ({
    limit = 20,
    offset = 0,
    bypassCache = false
  }: {
    limit?: number;
    offset?: number;
    bypassCache?: boolean;
  } = {}) => {
    try {
      // Use direct Supabase query instead of fetchData to avoid caching issues
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching marketplace sessions:', error);
        // Fallback to mock data during development
        return mockSessions.slice(offset, offset + limit);
      }

      return data || mockSessions.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error fetching marketplace sessions:', error);
      // Fallback to mock data during development
      return mockSessions.slice(offset, offset + limit);
    }
  },

  // Get session by ID
  getSessionById: async (id: string) => {
    try {
      // Use direct Supabase query instead of fetchData to avoid caching issues
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching session ${id}:`, error);
        // Fallback to mock data
        const session = mockSessions.find(s => s.id === id);
        if (!session) {
          throw new ApiError(`Session with ID ${id} not found`, 404);
        }
        return session;
      }

      if (!data) {
        // Fallback to mock data
        const session = mockSessions.find(s => s.id === id);
        if (!session) {
          throw new ApiError(`Session with ID ${id} not found`, 404);
        }
        return session;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching session ${id}:`, error);
      // Fallback to mock data
      const session = mockSessions.find(s => s.id === id);
      if (!session) {
        throw new ApiError(`Session with ID ${id} not found`, 404);
      }
      return session;
    }
  },

  // Create a new session
  createSession: async (sessionData: CreateSessionData) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      const newSession = await insertData('sessions', {
        ...sessionData,
        host_id: user.id,
        attendee_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return newSession;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Join a session
  joinSession: async (sessionId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Add user to session attendees
      await insertData('session_attendees', {
        session_id: sessionId,
        user_id: user.id,
        joined_at: new Date().toISOString()
      });

      // Update attendee count
      const { data: session } = await supabase
        .from('sessions')
        .select('attendee_count')
        .eq('id', sessionId)
        .single();

      if (session) {
        await updateData('sessions', sessionId, {
          attendee_count: (session.attendee_count || 0) + 1,
          updated_at: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  },

  // Leave a session
  leaveSession: async (sessionId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Remove user from session attendees
      await supabase
        .from('session_attendees')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      // Update attendee count
      const { data: session } = await supabase
        .from('sessions')
        .select('attendee_count')
        .eq('id', sessionId)
        .single();

      if (session && session.attendee_count > 0) {
        await updateData('sessions', sessionId, {
          attendee_count: session.attendee_count - 1,
          updated_at: new Date().toISOString()
        });
      }

      return true;
    } catch (error) {
      console.error('Error leaving session:', error);
      throw error;
    }
  },
};
