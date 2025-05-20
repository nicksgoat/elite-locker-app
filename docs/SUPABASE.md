# Supabase Integration in Elite Locker

This document provides detailed information about the Supabase integration in the Elite Locker app, including how we've addressed the Node.js module compatibility issues in React Native.

## Overview

Elite Locker uses Supabase as its backend service for data storage, authentication, and real-time updates. However, integrating Supabase with React Native presents challenges because Supabase's JavaScript client relies on Node.js modules that are not available in the React Native runtime environment.

## Architecture

We've implemented a layered architecture for Supabase integration:

1. **Core Client Layer**: A simplified Supabase client that works in React Native
2. **API Utilities Layer**: Generic functions for CRUD operations
3. **Service Layer**: Domain-specific services that use the API utilities
4. **UI Layer**: React components that use the services

This architecture provides a clean separation of concerns and makes it easier to handle errors and fallbacks.

## Key Files

- `lib/supabase-client.ts`: The core Supabase client configuration
- `lib/api.ts`: Generic API utilities for CRUD operations
- `lib/auth.ts`: Authentication utilities
- `services/*.ts`: Domain-specific services (programs, workouts, clubs, etc.)
- `contexts/AuthContext.tsx`: Authentication context provider
- `hooks/useAuth.ts`: Authentication hook

## Node.js Module Compatibility

To address the Node.js module compatibility issues, we've implemented the following solutions:

### 1. Minimal Polyfills

Instead of trying to polyfill all Node.js modules, we've added only the essential polyfills:

```javascript
// In index.js
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Add global Buffer
global.Buffer = Buffer;
```

### 2. Ignoring Warnings

We've configured LogBox to ignore warnings related to Node.js modules:

```javascript
LogBox.ignoreLogs([
  'The package at',
  'attempted to import the Node standard library',
  'It failed because the native React runtime',
  'Node standard library module',
  'Require cycle:',
]);
```

### 3. Simplified Supabase Client

We've created a simplified Supabase client that works with React Native:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 4. Fallbacks to Mock Data

All service functions include fallbacks to mock data when API calls fail:

```typescript
getPrograms: async () => {
  try {
    const data = await fetchData('programs', {
      select: '*',
      order: { column: 'created_at', ascending: false }
    });
    
    return data || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    // Fallback to mock data during development
    return mockPrograms;
  }
}
```

## Error Handling

We've implemented consistent error handling throughout the Supabase integration:

1. **API Level**: The `handleSupabaseError` function in `lib/supabase.ts` standardizes error objects
2. **Service Level**: Each service function includes try/catch blocks with fallbacks
3. **UI Level**: Components use loading and error states to handle API operations

## Authentication

Authentication is handled through the `useAuth` hook and `AuthContext` provider:

1. The `useAuth` hook manages authentication state and provides methods for sign-in, sign-up, etc.
2. The `AuthContext` provider makes authentication state available throughout the app
3. The `lib/auth.ts` file provides utility functions for authentication operations

## Usage Examples

### Basic Data Fetching

```typescript
import { supabase } from '@/lib/supabase-client';

const fetchPrograms = async () => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
  
  return data || [];
};
```

### Using API Utilities

```typescript
import { fetchData } from '@/lib/api';

const fetchPrograms = async () => {
  try {
    const data = await fetchData('programs', {
      select: '*',
      order: { column: 'created_at', ascending: false }
    });
    
    return data || [];
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};
```

### Using Service Functions

```typescript
import { programService } from '@/services';

const fetchPrograms = async () => {
  try {
    const programs = await programService.getPrograms();
    return programs;
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};
```

### Authentication

```typescript
import { useAuthContext } from '@/contexts/AuthContext';

const ProfileScreen = () => {
  const { user, isAuthenticated, signOut } = useAuthContext();
  
  if (!isAuthenticated) {
    return <SignInPrompt />;
  }
  
  return (
    <View>
      <Text>Welcome, {user.username || user.email}</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
};
```

## Troubleshooting

If you encounter issues with the Supabase integration, try the following:

1. **Check the console for errors**: Look for specific error messages related to Supabase operations
2. **Verify network connectivity**: Ensure the device has internet access
3. **Check authentication state**: Make sure the user is properly authenticated for protected operations
4. **Clear AsyncStorage**: If authentication issues persist, try clearing AsyncStorage
5. **Update polyfills**: If new Node.js module errors appear, you may need to add additional polyfills

## Future Improvements

1. **Offline Support**: Implement offline caching and synchronization
2. **Real-time Subscriptions**: Add support for Supabase real-time subscriptions
3. **File Storage**: Enhance file upload/download capabilities
4. **Better Error Handling**: Improve error messages and recovery strategies
5. **Performance Optimization**: Implement request batching and caching
