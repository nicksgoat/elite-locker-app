/**
 * Elite Locker - Authentication Hook
 *
 * This file contains a hook for managing authentication state
 * and interacting with Supabase auth.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-new';
import { showErrorToast } from '../utils/errorUtils';
import { useLoading } from '../utils/loadingUtils';

// Types
export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: any;
}

/**
 * Hook for managing authentication state
 * @returns Authentication state and methods
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoading();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      startLoading();
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          setUser({
            id: session.user.id,
            email: session.user.email,
            username: profile?.username,
            avatarUrl: profile?.avatar_url
          });
        } else {
          setUser(null);
        }

        stopLoading();
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoadingError(err);
        setUser(null);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }

          setUser({
            id: session.user.id,
            email: session.user.email,
            username: profile?.username,
            avatarUrl: profile?.avatar_url
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [startLoading, stopLoading, setLoadingError]);

  /**
   * Sign in with email and password
   * @param email User's email
   * @param password User's password
   * @returns Success status
   */
  const signIn = useCallback(async (email: string, password: string) => {
    startLoading();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      stopLoading();
      return true;
    } catch (err) {
      setLoadingError(err);
      return false;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  /**
   * Sign up with email and password
   * @param email User's email
   * @param password User's password
   * @param username User's username
   * @returns Success status
   */
  const signUp = useCallback(async (email: string, password: string, username: string) => {
    startLoading();
    try {
      // Check if username is available
      const { data: existingUsers, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username);

      if (usernameError) {
        throw usernameError;
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Username is already taken');
      }

      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            email,
            created_at: new Date()
          });

        if (profileError) {
          throw profileError;
        }
      }

      stopLoading();
      return true;
    } catch (err) {
      setLoadingError(err);
      return false;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  /**
   * Sign out the current user
   * @returns Success status
   */
  const signOut = useCallback(async () => {
    startLoading();
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      stopLoading();
      return true;
    } catch (err) {
      setLoadingError(err);
      return false;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  /**
   * Reset password
   * @param email User's email
   * @returns Success status
   */
  const resetPassword = useCallback(async (email: string) => {
    startLoading();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        throw error;
      }

      stopLoading();
      return true;
    } catch (err) {
      setLoadingError(err);
      return false;
    }
  }, [startLoading, stopLoading, setLoadingError]);

  /**
   * Update user profile
   * @param profile Profile data to update
   * @returns Success status
   */
  const updateProfile = useCallback(async (profile: {
    username?: string;
    avatarUrl?: string;
    fullName?: string;
    bio?: string;
  }) => {
    if (!user) {
      showErrorToast('You must be logged in to update your profile');
      return false;
    }

    startLoading();
    try {
      // Check if username is available if changing
      if (profile.username && profile.username !== user.username) {
        const { data: existingUsers, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', profile.username);

        if (usernameError) {
          throw usernameError;
        }

        if (existingUsers && existingUsers.length > 0) {
          throw new Error('Username is already taken');
        }
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          avatar_url: profile.avatarUrl,
          full_name: profile.fullName,
          bio: profile.bio,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        username: profile.username || prev.username,
        avatarUrl: profile.avatarUrl || prev.avatarUrl
      } : null);

      stopLoading();
      return true;
    } catch (err) {
      setLoadingError(err);
      return false;
    }
  }, [user, startLoading, stopLoading, setLoadingError]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };
}
