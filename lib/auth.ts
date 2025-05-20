/**
 * Elite Locker - Authentication Utilities
 *
 * This file contains utility functions for authentication with Supabase.
 * It provides functions for sign up, sign in, sign out, and password reset.
 */

import { supabase } from './supabase-new';

/**
 * Sign up a new user
 * @param email The user's email
 * @param password The user's password
 * @returns The user data
 */
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error, 'signing up');
  }
}

/**
 * Sign in a user
 * @param email The user's email
 * @param password The user's password
 * @returns The user data
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw handleSupabaseError(error, 'signing in');
  }
}

/**
 * Sign out the current user
 * @returns Success status
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    throw handleSupabaseError(error, 'signing out');
  }
}

/**
 * Reset a user's password
 * @param email The user's email
 * @returns Success status
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    throw handleSupabaseError(error, 'resetting password');
  }
}

/**
 * Get the current user
 * @returns The current user data or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      // If it's an auth session missing error, return null instead of throwing
      if (error.message && error.message.includes('Auth session missing')) {
        console.log('No authenticated user found');
        return null;
      }
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null; // Return null instead of throwing to handle gracefully
  }
}

/**
 * Update the current user's profile
 * @param profile The profile data to update
 * @returns The updated user data
 */
export async function updateProfile(profile: {
  username?: string;
  avatar_url?: string;
  full_name?: string;
  bio?: string;
}) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userData.user.id)
      .select();

    if (error) {
      throw error;
    }

    return data[0];
  } catch (error) {
    throw handleSupabaseError(error, 'updating profile');
  }
}

/**
 * Check if a user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return !!data.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}
