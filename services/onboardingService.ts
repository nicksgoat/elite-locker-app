/**
 * Elite Locker - Onboarding Service
 *
 * Service for managing user onboarding flow and data persistence
 */

import { fetchData, insertData, updateData } from '../lib/api';
import { supabase } from '../lib/supabase';
import {
    ClubSetupData,
    ProfileSetupData,
    UserOnboardingStatus
} from '../types/onboarding';
import { ApiError } from './types';

// Helper function to get current user
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onboardingService = {
  /**
   * Get user's onboarding status
   */
  getOnboardingStatus: async (): Promise<UserOnboardingStatus> => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check profile completion
      const profile = await fetchData('profiles', {
        select: '*',
        filters: { id: user.id },
        single: true
      });

      const profileComplete = !!(
        profile?.username &&
        profile?.full_name
      );

      // Check if user has any clubs (created or joined)
      const clubMemberships = await fetchData('club_members', {
        select: 'club_id',
        filters: { user_id: user.id }
      });

      const ownedClubs = await fetchData('clubs', {
        select: 'id',
        filters: { owner_id: user.id }
      });

      const clubSetup = (clubMemberships?.length > 0) || (ownedClubs?.length > 0);

      // Check if user has logged any workouts
      const workouts = await fetchData('workouts', {
        select: 'id',
        filters: { author_id: user.id, is_template: false },
        limit: 1
      });

      const firstWorkoutLogged = workouts?.length > 0;

      // For now, consider preferences set if profile is complete
      // In the future, we could add a user_preferences table
      const preferencesSet = profileComplete;

      const onboardingComplete = profileComplete && clubSetup && firstWorkoutLogged;

      return {
        profileComplete,
        clubSetup,
        preferencesSet,
        firstWorkoutLogged,
        onboardingComplete
      };
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      // Return default status on error
      return {
        profileComplete: false,
        clubSetup: false,
        preferencesSet: false,
        firstWorkoutLogged: false,
        onboardingComplete: false
      };
    }
  },

  /**
   * Update user profile during onboarding
   */
  updateProfile: async (profileData: ProfileSetupData): Promise<void> => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      await updateData('profiles', user.id, {
        username: profileData.username,
        full_name: profileData.fullName,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Create a new club during onboarding
   */
  createClub: async (clubData: ClubSetupData): Promise<string> => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      if (!clubData.clubName) {
        throw new ApiError('Club name is required', 400);
      }

      const club = await insertData('clubs', {
        name: clubData.clubName,
        description: clubData.clubDescription || '',
        owner_id: user.id,
        is_paid: false,
        created_at: new Date()
      });

      // Add user as admin member
      await insertData('club_members', {
        club_id: club.id,
        user_id: user.id,
        is_admin: true,
        joined_at: new Date()
      });

      return club.id;
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  },

  /**
   * Join an existing club during onboarding
   */
  joinClub: async (clubId: string): Promise<void> => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if already a member
      const existingMembership = await fetchData('club_members', {
        select: '*',
        filters: { club_id: clubId, user_id: user.id }
      });

      if (existingMembership?.length > 0) {
        return; // Already a member
      }

      await insertData('club_members', {
        club_id: clubId,
        user_id: user.id,
        is_admin: false,
        joined_at: new Date()
      });
    } catch (error) {
      console.error('Error joining club:', error);
      throw error;
    }
  },

  // Note: First workout logging is now handled by the core workout tracking system
  // in the FirstWorkoutScreen component using the EnhancedWorkoutContext

  /**
   * Search for clubs to join
   */
  searchClubs: async (query: string): Promise<any[]> => {
    try {
      if (!query.trim()) {
        // Return popular clubs if no query
        return await fetchData('clubs', {
          select: 'id, name, description, profile_image_url',
          limit: 10
        }) || [];
      }

      // Search clubs by name
      const clubs = await fetchData('clubs', {
        select: 'id, name, description, profile_image_url',
        filters: { name: { ilike: `%${query}%` } },
        limit: 10
      });

      return clubs || [];
    } catch (error) {
      console.error('Error searching clubs:', error);
      return [];
    }
  },

  /**
   * Save user preferences during onboarding
   */
  setPreferences: async (preferencesData: any): Promise<void> => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // For now, we'll store preferences in the profile
      // In the future, we could create a separate user_preferences table
      await updateData('profiles', user.id, {
        preferences: preferencesData,
        updated_at: new Date()
      });

      console.log('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  },

  /**
   * Complete onboarding process
   */
  completeOnboarding: async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Update the user's profile to mark onboarding as complete
      // We can add an onboarding_complete field to the profiles table
      // For now, we'll just ensure the profile is complete
      await updateData('profiles', user.id, {
        updated_at: new Date()
      });

      console.log('Onboarding completed successfully');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }
};
