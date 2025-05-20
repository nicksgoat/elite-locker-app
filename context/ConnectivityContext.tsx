/**
 * Elite Locker - Connectivity Context
 *
 * This file provides a context for managing network connectivity status
 * and Supabase connection status.
 */

import { checkSupabaseConnection } from '@/lib/supabase-new';
import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the context type
interface ConnectivityContextType {
  isConnected: boolean | null;
  isSupabaseConnected: boolean;
  checkConnection: () => Promise<void>;
}

// Create the context with default values
const ConnectivityContext = createContext<ConnectivityContextType>({
  isConnected: null,
  isSupabaseConnected: false,
  checkConnection: async () => {},
});

// Hook to use the connectivity context
export const useConnectivity = () => useContext(ConnectivityContext);

// Provider component
export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

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

  // Set up network connectivity listener
  useEffect(() => {
    // Initial check
    checkConnection();

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
  }, [isConnected]);

  return (
    <ConnectivityContext.Provider
      value={{
        isConnected,
        isSupabaseConnected,
        checkConnection,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export default ConnectivityProvider;
