/**
 * Elite Locker - Supabase Client
 *
 * This file contains the Supabase client configuration and initialization.
 * It provides a singleton instance of the Supabase client that can be used
 * throughout the application.
 */

import { Platform } from 'react-native';
// Use real Supabase client
import { createClient } from '@supabase/supabase-js';

// Platform-specific storage
let storage: any;
if (Platform.OS === 'web') {
  // Web storage implementation
  storage = {
    getItem: (key: string) => {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch {
        return Promise.resolve();
      }
    },
  };
} else {
  // React Native storage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storage = AsyncStorage;
}

// Define environment variables for Supabase
// Elite Locker App project configuration
const supabaseUrl = 'https://emucorbwylxtykughxks.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtdWNvcmJ3eWx4dHlrdWdoeGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNTc3MTksImV4cCI6MjA2MzkzMzcxOX0.LQTfyzp5TkqOu7E8zMV5eL1x0lhkQwgIzcmfed3i5Ok';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
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
