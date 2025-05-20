/**
 * Elite Locker - With Offline Fallback HOC
 * 
 * This higher-order component wraps a component and provides an offline fallback
 * when the app is offline or can't connect to Supabase.
 */

import React from 'react';
import { useConnectivity } from '@/contexts/ConnectivityContext';
import OfflineFallback from '@/components/ui/OfflineFallback';

interface WithOfflineFallbackOptions {
  requireSupabase?: boolean;
  fallbackMessage?: string;
  fallbackIcon?: string;
}

/**
 * Higher-order component that provides an offline fallback
 * @param WrappedComponent The component to wrap
 * @param options Options for the offline fallback
 * @returns A new component with offline fallback
 */
const withOfflineFallback = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithOfflineFallbackOptions = {}
) => {
  const {
    requireSupabase = true,
    fallbackMessage,
    fallbackIcon,
  } = options;

  const WithOfflineFallbackComponent: React.FC<P> = (props) => {
    const { isConnected, isSupabaseConnected } = useConnectivity();

    // If we're offline or Supabase is required but not connected, show the fallback
    if (!isConnected || (requireSupabase && !isSupabaseConnected)) {
      return (
        <OfflineFallback
          message={fallbackMessage}
          icon={fallbackIcon}
        />
      );
    }

    // Otherwise, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithOfflineFallbackComponent.displayName = `withOfflineFallback(${wrappedComponentName})`;

  return WithOfflineFallbackComponent;
};

export default withOfflineFallback;
