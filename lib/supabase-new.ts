/**
 * Elite Locker - New Supabase Client
 *
 * This file contains a completely new Supabase client implementation with robust error handling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Define environment variables for Supabase
const supabaseUrl = 'https://gpiwvrsdkmykbevzvnsh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXd2cnNka215a2Jldnp2bnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTkzMjAsImV4cCI6MjA2MTQzNTMyMH0.Ae9lFKHGbimZ_m9ypPns9pK54Qx8Ba9dAxjjrPwcV30';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'api',
  },
});

// Create a supabase client that uses the api schema
export const supabaseApi = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'api',
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
 * Check if the Supabase client is properly configured
 * @returns True if the client is configured, false otherwise
 */
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'YOUR_SUPABASE_URL' &&
         supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';
};

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

/**
 * Get the correct schema for a table
 * @param table The table name
 * @returns The schema name (public or api)
 */
export const getTableSchema = async (table: string): Promise<string> => {
  try {
    const { data, error } = await safeQuery(() =>
      supabase
        .from(table)
        .select('count(*)')
        .limit(1)
    );

    if (!error) {
      return 'public';
    }

    // If there's an error, check if it's because the table is in the api schema
    if (error && error.message && error.message.includes('api')) {
      return 'api';
    }

    // Default to public
    return 'public';
  } catch (error) {
    console.error(`Error determining schema for table ${table}:`, error);
    return 'public';
  }
};

export default supabase;
