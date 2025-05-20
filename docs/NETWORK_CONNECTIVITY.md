# Elite Locker Network Connectivity

This document provides information about how network connectivity is handled in the Elite Locker app.

## Overview

The Elite Locker app uses Supabase as its backend, which requires an internet connection to function properly. To provide a good user experience even when the network connection is unreliable, the app includes several features to handle network connectivity issues:

1. **Network Status Detection**: The app detects when the device is offline or when it can't connect to the Supabase backend.
2. **Graceful Error Handling**: API functions handle network errors gracefully and fall back to mock data during development.
3. **Offline Fallback UI**: Components can display fallback UI when the app is offline.
4. **Network Status Indicator**: The app displays a network status indicator when the device is offline or can't connect to Supabase.

## Implementation

### ConnectivityContext

The `ConnectivityContext` provides information about the network connectivity status:

```tsx
import { useConnectivity } from '@/contexts/ConnectivityContext';

function MyComponent() {
  const { isConnected, isSupabaseConnected, checkConnection } = useConnectivity();
  
  // Use connectivity information
  return (
    <View>
      {!isConnected && <Text>You are offline</Text>}
      {isConnected && !isSupabaseConnected && <Text>Can't connect to server</Text>}
      <Button title="Retry" onPress={checkConnection} />
    </View>
  );
}
```

### API Utilities

The API utilities in `lib/api.ts` handle network errors gracefully:

```tsx
// Before
try {
  const data = await fetchData('table_name');
  return data;
} catch (error) {
  // Error is thrown, causing the component to crash
  throw error;
}

// After
try {
  const data = await fetchData('table_name');
  return data || [];
} catch (error) {
  console.error('Error fetching data:', error);
  // Fall back to mock data during development
  return mockData;
}
```

### Offline Fallback Component

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

### withOfflineFallback HOC

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

## Best Practices

When implementing network-dependent features, follow these best practices:

1. **Use the ConnectivityContext**: Always check the network status before making API calls.
2. **Handle Errors Gracefully**: Catch errors and provide fallback behavior.
3. **Provide Feedback to Users**: Let users know when they're offline and what they can do about it.
4. **Cache Data When Possible**: Store data locally when it's fetched so it can be used offline.
5. **Implement Retry Mechanisms**: Allow users to retry failed operations when they're back online.

## Example: Implementing a Network-Aware Component

Here's an example of how to implement a network-aware component:

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useConnectivity } from '@/contexts/ConnectivityContext';
import { workoutService } from '@/services';
import OfflineFallback from '@/components/ui/OfflineFallback';

function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isConnected, isSupabaseConnected } = useConnectivity();
  
  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      const data = await workoutService.getWorkoutHistory();
      setWorkouts(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isConnected && isSupabaseConnected) {
      fetchWorkouts();
    }
  }, [isConnected, isSupabaseConnected]);
  
  if (!isConnected || !isSupabaseConnected) {
    return (
      <OfflineFallback message="You need to be online to view your workouts">
        <Button title="Try Again" onPress={fetchWorkouts} />
      </OfflineFallback>
    );
  }
  
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  
  if (error) {
    return (
      <View>
        <Text>Error loading workouts: {error.message}</Text>
        <Button title="Try Again" onPress={fetchWorkouts} />
      </View>
    );
  }
  
  return (
    <View>
      {workouts.map(workout => (
        <Text key={workout.id}>{workout.title}</Text>
      ))}
    </View>
  );
}

export default WorkoutList;
```

## Conclusion

By implementing these network connectivity features, the Elite Locker app provides a good user experience even when the network connection is unreliable. Users are informed about the network status and can continue using the app with limited functionality when offline.
