/**
 * Elite Locker - Supabase Fix
 *
 * This file provides a fix for the "Cannot read property 'error' of undefined" error.
 */

import { supabase } from './supabase';

// Export the supabase client
export default supabase;

// Export a function to safely handle Supabase responses
export function safeSupabaseResponse(response: any) {
  if (!response) {
    return { data: null, error: null };
  }

  return response;
}

// Export a function to safely handle Supabase errors
export function safeSupabaseError(error: any) {
  if (!error) {
    return null;
  }

  return error;
}

// Export a function to safely handle Supabase data
export function safeSupabaseData(data: any) {
  if (!data) {
    return null;
  }

  return data;
}

// Export a function to safely execute a Supabase query
export async function safeSupabaseQuery(query: any) {
  try {
    const response = await query;

    if (!response) {
      return { data: null, error: null };
    }

    return response;
  } catch (error) {
    console.error('Error executing Supabase query:', error);
    return { data: null, error };
  }
}
