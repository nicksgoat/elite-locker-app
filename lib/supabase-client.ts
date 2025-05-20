/**
 * Elite Locker - Supabase Client
 *
 * This file contains a simplified Supabase client for React Native.
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
 * Error handler for Supabase operations
 * @param error The error object
 * @param operation The operation that failed
 * @returns A standardized error object
 */
export const handleSupabaseError = (error: any, operation: string) => {
  try {
    console.error(`Supabase error during ${operation}:`, error);

    // Handle case where error is undefined or null
    if (!error) {
      return {
        message: `An unknown error occurred during ${operation}`,
        status: 500,
        details: null,
      };
    }

    // Handle case where error is a string
    if (typeof error === 'string') {
      return {
        message: error,
        status: 500,
        details: null,
      };
    }

    // Handle case where error is an Error object
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500,
        details: error.stack,
      };
    }

    return {
      message: error.message || `An error occurred during ${operation}`,
      status: error.status || 500,
      details: error.details || null,
    };
  } catch (e) {
    // Last resort error handling
    console.error('Error in handleSupabaseError:', e);
    return {
      message: `An error occurred during ${operation}`,
      status: 500,
      details: null,
    };
  }
};

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
    // Use the auth API to check connection status
    // This is the most reliable method as it doesn't depend on database schemas
    const { data, error } = await supabase.auth.getSession();

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
    // Check if the table exists in the public schema
    const response = await supabase
      .from(table)
      .select('count(*)')
      .limit(1);

    // Safely handle the response
    if (!response) {
      console.log(`No response from Supabase for table ${table}`);
      return 'public';
    }

    const { data, error } = response;

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
