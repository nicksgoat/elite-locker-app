# Elite Locker Offline Support

This document provides comprehensive information about the offline support implementation in the Elite Locker app.

## Overview

The Elite Locker app now includes robust offline support, allowing users to continue using the app even when they don't have an internet connection or when the Supabase backend is unreachable. The implementation includes:

1. **Network Status Detection**: The app detects when the device is offline or when it can't connect to the Supabase backend.
2. **Local Data Caching**: Frequently accessed data is cached locally for offline use.
3. **Offline Operation Queueing**: Changes made while offline are queued and synchronized when the app comes back online.
4. **Graceful UI Fallbacks**: Components display appropriate fallback UI when offline.
5. **Sync Management**: Users can manually trigger synchronization and see the status of pending operations.

## Architecture

The offline support implementation follows a layered architecture:

1. **Connectivity Layer**: Detects network and Supabase connection status.
2. **Storage Layer**: Provides local caching of data.
3. **Sync Layer**: Manages queuing and synchronization of offline operations.
4. **API Layer**: Integrates with the storage and sync layers to provide seamless offline support.
5. **UI Layer**: Provides appropriate fallbacks and feedback to users.

## Key Components

### ConnectivityContext

The `ConnectivityContext` provides information about the network and Supabase connection status:

```tsx
import { useConnectivity } from '@/contexts/ConnectivityContext';

function MyComponent() {
  const { isConnected, isSupabaseConnected, checkConnection } = useConnectivity();
  
  // Use connectivity information
}
```

### Local Storage

The `storage.ts` module provides utilities for caching data locally:

```tsx
import { saveToCache, getFromCache } from '@/lib/storage';

// Save data to cache
await saveToCache('my-key', data, 3600000); // Cache for 1 hour

// Get data from cache
const data = await getFromCache('my-key');
```

### Sync Manager

The `syncManager.ts` module provides utilities for queuing and synchronizing offline operations:

```tsx
import { queueCreateOperation, useSyncManager } from '@/lib/syncManager';

// Queue a create operation
await queueCreateOperation('table_name', data);

// Use the sync manager hook
function MyComponent() {
  const { processPendingSyncOperations } = useSyncManager();
  
  // Sync pending operations
  const syncData = async () => {
    const count = await processPendingSyncOperations();
    console.log(`Synced ${count} operations`);
  };
}
```

### API Utilities

The API utilities in `lib/api.ts` have been updated to support offline operations:

```tsx
import { fetchData, insertData, updateData, deleteData } from '@/lib/api';

// Fetch data with caching
const data = await fetchData('table_name', {
  bypassCache: false,
  cacheExpiration: 3600000 // 1 hour
});

// Insert data with offline support
const result = await insertData('table_name', data, {
  offlineSupport: true
});

// Update data with offline support
const result = await updateData('table_name', id, data, {
  offlineSupport: true
});

// Delete data with offline support
const result = await deleteData('table_name', id, {
  offlineSupport: true
});
```

### UI Components

#### OfflineFallback

The `OfflineFallback` component provides a consistent UI for offline states:

```tsx
import OfflineFallback from '@/components/ui/OfflineFallback';

function MyScreen() {
  const { isConnected } = useConnectivity();
  
  if (!isConnected) {
    return <OfflineFallback message="You need to be online to view this content" />;
  }
  
  return <YourComponent />;
}
```

#### withOfflineFallback HOC

The `withOfflineFallback` higher-order component makes it easy to add offline fallback to any component:

```tsx
import withOfflineFallback from '@/components/hoc/withOfflineFallback';

function MyComponent(props) {
  // Component implementation
}

// Wrap the component with offline fallback
export default withOfflineFallback(MyComponent, {
  requireSupabase: true,
  fallbackMessage: 'You need to be online to view this content',
  fallbackIcon: 'cloud-offline',
});
```

#### SyncManager

The `SyncManager` component provides a UI for managing offline data synchronization:

```tsx
import SyncManager from '@/components/ui/SyncManager';

function MyScreen() {
  return (
    <View>
      <SyncManager onSyncComplete={() => console.log('Sync complete')} />
      {/* Other components */}
    </View>
  );
}
```

## Implementation in Services

The service files have been updated to use the offline support features:

### Workout Service

The `workoutService.ts` file has been updated to use caching and offline operation queueing:

```tsx
// Get workout history with caching
getWorkoutHistory: async ({ 
  limit = 10, 
  offset = 0,
  bypassCache = false 
}) => {
  // Implementation with caching
}

// Log a set with offline support
logSet: async (workoutId, exerciseId, setData) => {
  // Implementation with offline support
}

// Complete a workout with offline support
completeWorkout: async (workoutId, data) => {
  // Implementation with offline support
}
```

## Testing Offline Support

To test the offline support implementation:

1. **Test in Airplane Mode**:
   - Put your device in airplane mode
   - Try to use the app
   - Verify that cached data is displayed
   - Make changes and verify they are queued
   - Turn off airplane mode and verify synchronization

2. **Test with Supabase Unavailable**:
   - Disconnect from the Supabase backend (e.g., by using an invalid API key)
   - Verify that cached data is displayed
   - Make changes and verify they are queued
   - Reconnect to Supabase and verify synchronization

3. **Test the SyncManager**:
   - Make changes while offline
   - Verify that the SyncManager shows pending operations
   - Manually trigger synchronization
   - Verify that the operations are synchronized

## Best Practices

When implementing offline support in your components:

1. **Use the ConnectivityContext**: Always check the network status before making API calls.
2. **Use Caching for Read Operations**: Cache frequently accessed data for offline use.
3. **Use Offline Operation Queueing for Write Operations**: Queue changes made while offline.
4. **Provide Appropriate Fallbacks**: Use the `OfflineFallback` component or `withOfflineFallback` HOC.
5. **Handle Synchronization**: Use the `SyncManager` component to provide synchronization feedback.

## Example: Implementing a Fully Offline-Aware Component

Here's an example of a fully offline-aware component:

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useConnectivity } from '@/contexts/ConnectivityContext';
import { useSyncManager } from '@/lib/syncManager';
import { workoutService } from '@/services';
import SyncManager from '@/components/ui/SyncManager';
import withOfflineFallback from '@/components/hoc/withOfflineFallback';

function WorkoutListBase() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, isSupabaseConnected } = useConnectivity();
  const { processPendingSyncOperations } = useSyncManager();
  
  const fetchWorkouts = async () => {
    setIsLoading(true);
    const data = await workoutService.getWorkoutHistory();
    setWorkouts(data || []);
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchWorkouts();
  }, []);
  
  useEffect(() => {
    if (isConnected && isSupabaseConnected) {
      processPendingSyncOperations().then(count => {
        if (count > 0) {
          fetchWorkouts();
        }
      });
    }
  }, [isConnected, isSupabaseConnected]);
  
  return (
    <View>
      <SyncManager onSyncComplete={fetchWorkouts} />
      <FlatList
        data={workouts}
        renderItem={({ item }) => (
          <Text>{item.title}</Text>
        )}
      />
    </View>
  );
}

export default withOfflineFallback(WorkoutListBase);
```

## Conclusion

By implementing these offline support features, the Elite Locker app provides a seamless experience even when the network connection is unreliable. Users can continue using the app offline, and their changes will be synchronized when they come back online.
