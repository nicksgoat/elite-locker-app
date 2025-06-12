/**
 * Elite Locker - Authentication Utilities
 *
 * This file contains utility functions for authentication with Supabase.
 * It provides functions for sign up, sign in, sign out, and password reset.
 */

import { supabase } from './supabase-client';
import { createLogger, logSecurityEvent } from '../utils/secureLogger';
import { Sanitizers } from '../utils/sanitization';
import { config, getMaxLoginAttempts, getSessionTimeout } from '../config/environment';

const logger = createLogger('Authentication');

// Track login attempts to prevent brute force attacks
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Rate limiting for login attempts
const isRateLimited = (email: string): boolean => {
  const attempts = loginAttempts.get(email);
  if (!attempts) return false;

  const now = Date.now();
  const timeSinceLastAttempt = now - attempts.lastAttempt;

  // Reset attempts after 15 minutes
  if (timeSinceLastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(email);
    return false;
  }

  return attempts.count >= getMaxLoginAttempts();
};

// Record login attempt
const recordLoginAttempt = (email: string, success: boolean): void => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || { count: 0, lastAttempt: now };

  if (success) {
    loginAttempts.delete(email);
  } else {
    attempts.count += 1;
    attempts.lastAttempt = now;
    loginAttempts.set(email, attempts);

    logSecurityEvent('Failed login attempt', undefined, { email, attempts: attempts.count });
  }
};

/**
 * Sign up a new user with enhanced security
 * @param email The user's email
 * @param password The user's password
 * @returns The user data
 */
export async function signUp(email: string, password: string) {
  try {
    // Sanitize inputs
    const sanitizedEmail = Sanitizers.email.sanitize(email);
    if (!sanitizedEmail.isValid) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    logger.info('Attempting user registration', { email: sanitizedEmail.sanitized });

    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail.sanitized,
      password,
    });

    if (error) {
      logger.error('Registration failed', { email: sanitizedEmail.sanitized, error: error.message });
      throw error;
    }

    logger.info('User registered successfully', { email: sanitizedEmail.sanitized });
    logSecurityEvent('User registration', data.user?.id, { email: sanitizedEmail.sanitized });

    return data;
  } catch (error) {
    throw handleSupabaseError(error, 'signing up');
  }
}

/**
 * Sign in a user with enhanced security
 * @param email The user's email
 * @param password The user's password
 * @returns The user data
 */
export async function signIn(email: string, password: string) {
  try {
    // Sanitize inputs
    const sanitizedEmail = Sanitizers.email.sanitize(email);
    if (!sanitizedEmail.isValid) {
      throw new Error('Invalid email format');
    }

    // Check rate limiting
    if (isRateLimited(sanitizedEmail.sanitized)) {
      const error = new Error('Too many login attempts. Please try again later.');
      logSecurityEvent('Rate limited login attempt', undefined, { email: sanitizedEmail.sanitized });
      throw error;
    }

    logger.info('Attempting user login', { email: sanitizedEmail.sanitized });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail.sanitized,
      password,
    });

    if (error) {
      recordLoginAttempt(sanitizedEmail.sanitized, false);
      logger.error('Login failed', { email: sanitizedEmail.sanitized, error: error.message });
      throw error;
    }

    recordLoginAttempt(sanitizedEmail.sanitized, true);
    logger.info('User logged in successfully', { email: sanitizedEmail.sanitized, userId: data.user?.id });
    logSecurityEvent('User login', data.user?.id, { email: sanitizedEmail.sanitized });

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
