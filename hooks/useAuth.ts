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
  fullName?: string;
  bio?: string;
  profileComplete?: boolean;
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
          console.log('Auth: Found session for user:', session.user.email);
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Auth: Error fetching profile:', profileError);
            throw profileError;
          }

          console.log('Auth: Profile data fetched:', profile);
          console.log('Auth: Profile username:', profile?.username);
          console.log('Auth: Profile full_name:', profile?.full_name);

          const authUser = {
            id: session.user.id,
            email: session.user.email,
            username: profile?.username,
            avatarUrl: profile?.avatar_url,
            fullName: profile?.full_name,
            bio: profile?.bio,
            profileComplete: !!(profile?.username && profile?.full_name)
          };

          console.log('Auth: Setting user:', authUser);
          setUser(authUser);
        } else {
          console.log('Auth: No session found, setting user to null');
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
        console.log('Auth: State change event:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Auth: User signed in:', session.user.email);
          // Get user profile
          console.log('Auth: Attempting to fetch profile for user ID:', session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('Auth: Profile fetch result - data:', profile);
          console.log('Auth: Profile fetch result - error:', profileError);

          if (profileError) {
            console.error('Auth: Error fetching profile on sign in:', profileError);
            if (profileError.code !== 'PGRST116') {
              console.error('Auth: Non-404 profile error:', profileError);
            }
          }

          console.log('Auth: Profile data fetched on sign in:', profile);
          console.log('Auth: Profile username on sign in:', profile?.username);
          console.log('Auth: Profile full_name on sign in:', profile?.full_name);

          const authUser = {
            id: session.user.id,
            email: session.user.email,
            username: profile?.username,
            avatarUrl: profile?.avatar_url,
            fullName: profile?.full_name,
            bio: profile?.bio,
            profileComplete: !!(profile?.username && profile?.full_name)
          };

          console.log('Auth: Setting user on sign in:', authUser);
          setUser(authUser);
        } else if (event === 'SIGNED_OUT') {
          console.log('Auth: User signed out');
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
