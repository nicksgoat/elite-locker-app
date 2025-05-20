/**
 * Elite Locker - Background Sync
 *
 * This file provides utilities for background synchronization.
 */

import { AppState, AppStateStatus, Platform } from 'react-native';
import { checkSupabaseConnection } from './supabase-new';

// Import sync operations from syncManager, but avoid importing the whole module
// to prevent circular dependencies
let syncManager: any = null;
const getSyncManager = () => {
  if (!syncManager) {
    syncManager = require('./syncManager');
  }
  return {
    processPendingSyncOperations: syncManager.processPendingSyncOperations
  };
};

// Conditionally import background fetch modules
// This prevents errors on platforms where these modules are not available
let BackgroundFetch: any = null;
let TaskManager: any = null;

// Only import on platforms that support background fetch
try {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // Dynamic imports to avoid bundling issues
    BackgroundFetch = require('expo-background-fetch');
    TaskManager = require('expo-task-manager');
  }
} catch (error) {
  console.warn('Background fetch is not available on this platform:', error);
}

// Task name for background sync
const BACKGROUND_SYNC_TASK = 'background-sync-task';

// Register the background task if TaskManager is available
if (TaskManager && TaskManager.defineTask) {
  TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
      // Check if we can connect to Supabase
      const isConnected = await checkSupabaseConnection();

      if (!isConnected) {
        console.log('Background sync: Cannot connect to Supabase');
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      // Process pending sync operations
      const { processPendingSyncOperations } = getSyncManager();
      const result = await processPendingSyncOperations();

      console.log(`Background sync: Synced ${result.success} operations, ${result.conflicts} conflicts`);

      // Return success if we synced anything
      if (result.success > 0 || result.conflicts > 0) {
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }

      // Return no data if nothing was synced
      return BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
      console.error('Error in background sync task:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

/**
 * Register the background sync task
 * @param interval The interval in minutes (minimum 15 minutes)
 * @returns Whether the task was registered successfully
 */
export async function registerBackgroundSync(interval: number = 15): Promise<boolean> {
  // Check if background fetch is available
  if (!BackgroundFetch || !TaskManager) {
    console.log('Background fetch is not available on this platform');
    return false;
  }

  try {
    // Check if we're running in Expo Go
    const isExpoGo = process.env.EXPO_RUNTIME_VERSION === undefined;
    if (isExpoGo) {
      console.log('Background fetch is not available in Expo Go. Use a development build instead.');
      return false;
    }

    // Ensure the interval is at least 15 minutes (900000 ms)
    const safeInterval = Math.max(interval, 15);

    // Check if the task is already registered
    let isRegistered = false;
    try {
      isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    } catch (err) {
      console.log('Error checking if task is registered:', err);
      // Continue anyway
    }

    if (isRegistered) {
      // Unregister the task first to update the interval
      try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
      } catch (err) {
        console.log('Error unregistering existing task:', err);
        // Continue anyway
      }
    }

    // Register the task
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: safeInterval * 60, // Convert minutes to seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log(`Background sync registered with interval ${safeInterval} minutes`);
      return true;
    } catch (err) {
      // If there's an error about UIBackgroundModes, log it but don't throw
      if (err.message && err.message.includes('UIBackgroundModes')) {
        console.log('Background fetch requires UIBackgroundModes to be configured in Info.plist. This will be available in the production build.');
        return false;
      }
      throw err;
    }
  } catch (error) {
    console.error('Error registering background sync task:', error);
    return false;
  }
}

/**
 * Unregister the background sync task
 * @returns Whether the task was unregistered successfully
 */
export async function unregisterBackgroundSync(): Promise<boolean> {
  // Check if background fetch is available
  if (!BackgroundFetch || !TaskManager) {
    console.log('Background fetch is not available on this platform');
    return false;
  }

  try {
    // Check if we're running in Expo Go
    const isExpoGo = process.env.EXPO_RUNTIME_VERSION === undefined;
    if (isExpoGo) {
      console.log('Background fetch is not available in Expo Go. Use a development build instead.');
      return false;
    }

    // Check if the task is registered before trying to unregister
    let isRegistered = false;
    try {
      isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    } catch (err) {
      console.log('Error checking if task is registered:', err);
      // Assume it's not registered
      return true;
    }

    if (isRegistered) {
      try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
        console.log('Background sync unregistered');
        return true;
      } catch (err) {
        // If there's an error about UIBackgroundModes, log it but don't throw
        if (err.message && err.message.includes('UIBackgroundModes')) {
          console.log('Background fetch requires UIBackgroundModes to be configured in Info.plist. This will be available in the production build.');
          return false;
        }
        console.error('Error unregistering background sync task:', err);
        return false;
      }
    } else {
      console.log('Background sync was not registered');
      return true; // Return true since the end state is as desired (not registered)
    }
  } catch (error) {
    console.error('Error unregistering background sync task:', error);
    return false;
  }
}

/**
 * Check if the background sync task is registered
 * @returns Whether the task is registered
 */
export async function isBackgroundSyncRegistered(): Promise<boolean> {
  // Check if background fetch is available
  if (!BackgroundFetch || !TaskManager) {
    console.log('Background fetch is not available on this platform');
    return false;
  }

  try {
    // Check if we're running in Expo Go
    const isExpoGo = process.env.EXPO_RUNTIME_VERSION === undefined;
    if (isExpoGo) {
      console.log('Background fetch is not available in Expo Go. Use a development build instead.');
      return false;
    }

    let status;
    try {
      status = await BackgroundFetch.getStatusAsync();
    } catch (err) {
      console.log('Error getting background fetch status:', err);
      return false;
    }

    let isRegistered = false;
    try {
      isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    } catch (err) {
      console.log('Error checking if task is registered:', err);
      return false;
    }

    return (
      status === BackgroundFetch.BackgroundFetchStatus.Available &&
      isRegistered
    );
  } catch (error) {
    console.error('Error checking background sync status:', error);
    return false;
  }
}

/**
 * Hook to handle app state changes for foreground sync
 * This is used to sync data when the app comes back to the foreground
 */
export function setupForegroundSync(): () => void {
  // Set up app state change listener
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Only sync when the app comes back to the foreground
    if (nextAppState === 'active') {
      try {
        // Check if we can connect to Supabase
        const isConnected = await checkSupabaseConnection();

        if (!isConnected) {
          console.log('Foreground sync: Cannot connect to Supabase');
          return;
        }

        // Process pending sync operations
        const { processPendingSyncOperations } = getSyncManager();
        const result = await processPendingSyncOperations();

        console.log(`Foreground sync: Synced ${result.success} operations, ${result.conflicts} conflicts`);
      } catch (error) {
        console.error('Error in foreground sync:', error);
      }
    }
  };

  // Subscribe to app state changes
  const subscription = AppState.addEventListener('change', handleAppStateChange);

  // Return a cleanup function
  return () => {
    subscription.remove();
  };
}

/**
 * Initialize background sync
 * @param options Options for background sync
 * @returns A cleanup function
 */
export function initializeBackgroundSync(
  options: {
    enabled?: boolean;
    interval?: number;
  } = {}
): () => void {
  const { enabled = true, interval = 15 } = options;

  // Register background sync if enabled and available
  if (enabled && BackgroundFetch && TaskManager) {
    registerBackgroundSync(interval).then(success => {
      if (!success) {
        console.log('Failed to register background sync, but foreground sync will still work');
      }
    });
  } else if (enabled) {
    console.log('Background sync is not available on this platform, using foreground sync only');
  }

  // Set up foreground sync (works on all platforms)
  const cleanupForegroundSync = setupForegroundSync();

  // Return a cleanup function
  return () => {
    cleanupForegroundSync();

    if (enabled && BackgroundFetch && TaskManager) {
      unregisterBackgroundSync().catch(error => {
        console.error('Error unregistering background sync during cleanup:', error);
      });
    }
  };
}
