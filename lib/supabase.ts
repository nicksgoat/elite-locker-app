/**
 * Elite Locker - Supabase Client
 *
 * This file contains the Supabase client configuration and initialization.
 * It provides a singleton instance of the Supabase client that can be used
 * throughout the application.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
// Use our mock instead of the real Supabase client to avoid WebSocket dependencies
import { createClient } from './mocks/supabase-client.js';

// Define environment variables for Supabase
// In a production app, these would be stored in environment variables
// For now, we'll use placeholder values that will be replaced with actual values
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
  realtime: {
    // Disable real-time features to avoid WebSocket connections
    heartbeatIntervalMs: 0,
    timeout: 0,
  },
  // Disable global options that might trigger WebSocket connections
  global: {
    headers: {
      'X-Client-Info': 'elite-locker-mobile',
    },
  },
});

/**
 * Error handler for Supabase operations
 * @param error The error object
 * @param operation The operation that failed
 * @returns A standardized error object
 */
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase error during ${operation}:`, error);

  // Handle case where error is undefined or null
  if (!error) {
    return {
      message: `An unknown error occurred during ${operation}`,
      status: 500,
      details: null,
    };
  }

  return {
    message: error.message || `An error occurred during ${operation}`,
    status: error.status || 500,
    details: error.details || null,
  };
};

/**
 * Check if the Supabase client is properly configured
 * @returns True if the client is configured, false otherwise
 */
export const isSupabaseConfigured = () => {
  // Check if we have actual values (not placeholder values)
  return supabaseUrl.startsWith('https://') && 
         supabaseAnonKey.length > 10;
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

export default supabase;
