/**
 * Elite Locker - Connectivity Context
 *
 * This file provides a context for managing network connectivity status
 * and Supabase connection status.
 */

import { initializeBackgroundSync, isBackgroundSyncRegistered, registerBackgroundSync, unregisterBackgroundSync } from '@/lib/backgroundSync';
import { checkSupabaseConnection } from '@/lib/supabase-client';
import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the context type
interface ConnectivityContextType {
  isConnected: boolean | null;
  isSupabaseConnected: boolean;
  checkConnection: () => Promise<void>;
  isBackgroundSyncEnabled: boolean;
  enableBackgroundSync: (interval?: number) => Promise<boolean>;
  disableBackgroundSync: () => Promise<boolean>;
}

// Create the context with default values
const ConnectivityContext = createContext<ConnectivityContextType>({
  isConnected: null,
  isSupabaseConnected: false,
  checkConnection: async () => {},
  isBackgroundSyncEnabled: false,
  enableBackgroundSync: async () => false,
  disableBackgroundSync: async () => false,
});

// Hook to use the connectivity context
export const useConnectivity = () => useContext(ConnectivityContext);

// Provider component
export const ConnectivityProvider: React.FC<{
  children: React.ReactNode;
  enableBackgroundSync?: boolean;
  backgroundSyncInterval?: number;
}> = ({
  children,
  enableBackgroundSync: initialBackgroundSyncEnabled = true,
  backgroundSyncInterval = 15
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isBackgroundSyncEnabled, setIsBackgroundSyncEnabled] = useState<boolean>(false);

  // Function to check Supabase connection
  const checkSupabaseConnectionStatus = async () => {
    const isConnected = await checkSupabaseConnection();
    setIsSupabaseConnected(isConnected);
    return isConnected;
  };

  // Function to check overall connection
  const checkConnection = async () => {
    const netInfoState = await NetInfo.fetch();
    setIsConnected(netInfoState.isConnected);

    if (netInfoState.isConnected) {
      await checkSupabaseConnectionStatus();
    } else {
      setIsSupabaseConnected(false);
    }
  };

  // Function to enable background sync
  const enableBackgroundSync = async (interval: number = backgroundSyncInterval) => {
    try {
      const result = await registerBackgroundSync(interval);
      setIsBackgroundSyncEnabled(result);
      return result;
    } catch (error) {
      console.error('Error enabling background sync:', error);
      setIsBackgroundSyncEnabled(false);
      return false;
    }
  };

  // Function to disable background sync
  const disableBackgroundSync = async () => {
    try {
      const result = await unregisterBackgroundSync();
      setIsBackgroundSyncEnabled(!result);
      return result;
    } catch (error) {
      console.error('Error disabling background sync:', error);
      // Don't change the state if there's an error
      return false;
    }
  };

  // Check if background sync is enabled
  const checkBackgroundSyncStatus = async () => {
    try {
      const isEnabled = await isBackgroundSyncRegistered();
      setIsBackgroundSyncEnabled(isEnabled);
    } catch (error) {
      console.error('Error checking background sync status:', error);
      setIsBackgroundSyncEnabled(false);
    }
  };

  // Set up network connectivity listener and background sync
  useEffect(() => {
    // Initial check
    checkConnection();
    checkBackgroundSyncStatus();

    // Initialize background sync if enabled
    if (initialBackgroundSyncEnabled) {
      try {
        initializeBackgroundSync({
          enabled: true,
          interval: backgroundSyncInterval
        });
      } catch (error) {
        console.error('Error initializing background sync:', error);
        // Background sync initialization failed, but the app can still function
        setIsBackgroundSyncEnabled(false);
      }
    }

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);

      if (state.isConnected) {
        checkSupabaseConnectionStatus();
      } else {
        setIsSupabaseConnected(false);
      }
    });

    // Periodic check for Supabase connection
    const intervalId = setInterval(() => {
      if (isConnected) {
        checkSupabaseConnectionStatus();
      }
    }, 30000); // Check every 30 seconds

    // Clean up
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [isConnected, initialBackgroundSyncEnabled, backgroundSyncInterval]);

  return (
    <ConnectivityContext.Provider
      value={{
        isConnected,
        isSupabaseConnected,
        checkConnection,
        isBackgroundSyncEnabled,
        enableBackgroundSync,
        disableBackgroundSync,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

// We're already exporting ConnectivityProvider as a named export above
// No need for a default export that could cause confusion
