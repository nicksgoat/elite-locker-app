/**
 * Elite Locker - Authentication Debug Utilities
 * 
 * Utilities for debugging authentication issues
 */

import { supabase } from '../lib/supabase-new';

export const debugAuth = async () => {
  console.log('=== AUTH DEBUG START ===');
  
  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Auth Debug: Error getting session:', sessionError);
    } else if (session) {
      console.log('Auth Debug: Current session found');
      console.log('Auth Debug: User ID:', session.user.id);
      console.log('Auth Debug: User email:', session.user.email);
      console.log('Auth Debug: Session expires at:', session.expires_at);
    } else {
      console.log('Auth Debug: No current session');
    }
    
    // Check current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Auth Debug: Error getting user:', userError);
    } else if (user) {
      console.log('Auth Debug: Current user found');
      console.log('Auth Debug: User ID:', user.id);
      console.log('Auth Debug: User email:', user.email);
    } else {
      console.log('Auth Debug: No current user');
    }
    
    // Try to fetch user profile
    if (session?.user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Auth Debug: Error fetching profile:', profileError);
        } else if (profile) {
          console.log('Auth Debug: Profile found');
          console.log('Auth Debug: Username:', profile.username);
          console.log('Auth Debug: Full name:', profile.full_name);
        } else {
          console.log('Auth Debug: No profile found');
        }
      } catch (error) {
        console.error('Auth Debug: Exception fetching profile:', error);
      }
    }
    
  } catch (error) {
    console.error('Auth Debug: Exception in debug function:', error);
  }
  
  console.log('=== AUTH DEBUG END ===');
};

export const signInTestUser = async () => {
  console.log('=== SIGNING IN TEST USER ===');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'password123'
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return false;
    }
    
    if (data.user) {
      console.log('Sign in successful:', data.user.email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Sign in exception:', error);
    return false;
  }
};
