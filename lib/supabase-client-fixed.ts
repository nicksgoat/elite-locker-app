/**
 * Elite Locker - Supabase Client
 *
 * This file contains the Supabase client configuration.
 */

// Use real Supabase client
import { createClient } from '@supabase/supabase-js';

// Define environment variables for Supabase
// Elite Locker App project configuration
const supabaseUrl = 'https://emucorbwylxtykughxks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdWNvcmJ3eWx4dHlrdWdoeGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTc3MTksImV4cCI6MjA2MzkzMzcxOX0.LQTfyzp5TkqOu7E8zMV5eL1x0lhkQwgIzcmfed3i5Ok';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Create a supabase client that uses the public schema (default)
export const supabaseApi = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
});

/**
 * Safe wrapper for Supabase queries
 * @param queryFn Function that returns a Supabase query
 * @returns The result of the query with safe error handling
 */
export async function safeQuery<T>(queryFn: () => Promise<any>): Promise<{ data: T | null; error: any }> {
  try {
    const response = await queryFn();

    // Handle case where response is undefined or null
    if (!response) {
      console.warn('Supabase query returned undefined or null response');
      return { data: null, error: null };
    }

    // Handle case where response doesn't have data or error properties
    const data = response.data !== undefined ? response.data : null;
    const error = response.error !== undefined ? response.error : null;

    return { data, error };
  } catch (error) {
    console.error('Error executing Supabase query:', error);
    return { data: null, error };
  }
}

/**
 * Check if the Supabase client can connect to the server
 * @returns A promise that resolves to true if the client can connect, false otherwise
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await safeQuery(() => supabase.auth.getSession());

    if (error) {
      console.error('Supabase connection check error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking Supabase connection:', error);
    return false;
  }
};

export default supabase;
