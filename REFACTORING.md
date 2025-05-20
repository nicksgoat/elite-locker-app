# Elite Locker Refactoring Documentation

This document outlines the refactoring changes made to improve code quality and backend integration while preserving all existing functionality.

## Overview of Changes

1. **Supabase Integration**
   - Created a Supabase client setup in `lib/supabase.ts`
   - Added utility functions for API operations in `lib/api.ts`
   - Added authentication utilities in `lib/auth.ts`
   - Updated service files to use Supabase instead of mock data

2. **Service Layer Refactoring**
   - Updated `programService.ts` to use Supabase
   - Updated `workoutService.ts` to use Supabase
   - Created `clubService.ts` for club-related operations
   - Created `profileService.ts` for user profile operations
   - Created `feedService.ts` for social feed operations

3. **Error Handling**
   - Added consistent error handling utilities in `utils/errorUtils.ts`
   - Implemented fallback to mock data when API calls fail during development

4. **Loading States**
   - Added loading state utilities in `utils/loadingUtils.ts`
   - Created hooks for managing loading states, pagination, and mutations

5. **Authentication**
   - Created an authentication hook in `hooks/useAuth.ts`
   - Added an authentication context provider in `contexts/AuthContext.tsx`
   - Updated the app's root layout to include the AuthProvider

## Detailed Changes

### Supabase Integration

The Supabase client is now set up in `lib/supabase.ts` with proper error handling and configuration. This provides a singleton instance of the Supabase client that can be used throughout the application.

```typescript
// lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Service Layer Refactoring

All service files have been updated to use Supabase instead of mock data. Each service file follows a consistent pattern:

1. Try to fetch data from Supabase
2. Handle errors gracefully
3. Fall back to mock data during development if the API call fails

Example from `programService.ts`:

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

### Error Handling

A new utility file `utils/errorUtils.ts` provides consistent error handling throughout the application:

```typescript
export function handleApiError(error: any, fallbackMessage: string = 'An unexpected error occurred') {
  console.error('API Error:', error);
  
  // If it's already an ApiError, return it
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      data: error.data
    };
  }
  
  // If it's a Supabase error
  if (error?.error_description || error?.message) {
    return {
      message: error.error_description || error.message,
      status: error.status || 500,
      data: error
    };
  }
  
  // Default error
  return {
    message: fallbackMessage,
    status: 500,
    data: error
  };
}
```

### Loading States

A new utility file `utils/loadingUtils.ts` provides hooks for managing loading states:

```typescript
export function useLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);
  
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  const setLoadingError = useCallback((err: any) => {
    setError(handleApiError(err));
    setIsLoading(false);
  }, []);
  
  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError
  };
}
```

### Authentication

A new hook `hooks/useAuth.ts` provides authentication functionality:

```typescript
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoading();
  
  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      startLoading();
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            username: profile?.username,
            avatarUrl: profile?.avatar_url
          });
        } else {
          setUser(null);
        }
        
        stopLoading();
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoadingError(err);
        setUser(null);
      }
    };
    
    initAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle auth state changes
      }
    );
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [startLoading, stopLoading, setLoadingError]);
  
  // Auth methods (signIn, signUp, signOut, etc.)
  
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  };
}
```

## Next Steps

1. **Update Components**: Update components to use the new services and hooks
2. **Add Loading States**: Add loading indicators to all components that fetch data
3. **Add Error Handling**: Add error handling to all components that fetch data
4. **Test Authentication**: Test the authentication flow
5. **Remove Mock Data**: Once all components are updated, remove the mock data files
