# Elite Locker Supabase Implementation

This document provides instructions for completing the Supabase backend implementation for the Elite Locker fitness app.

## Overview

The Elite Locker app now uses Supabase for its backend, replacing the previous mock data implementation. This provides a real database, authentication, and storage solution for the app.

## Implementation Status

The following components have been implemented:

- ✅ Supabase client setup in `lib/supabase.ts`
- ✅ API utilities in `lib/api.ts`
- ✅ Authentication utilities in `lib/auth.ts`
- ✅ Service files updated to use Supabase:
  - ✅ `exerciseService.ts`
  - ✅ `workoutService.ts`
  - ✅ `programService.ts`
  - ✅ `clubService.ts`
  - ✅ `feedService.ts`
  - ✅ `profileService.ts`
- ✅ SQL files for database schema, RLS policies, and seed data
- ✅ Deployment script for SQL files

## Next Steps

To complete the implementation, follow these steps:

1. **Set up Supabase Project**:
   - Create a new Supabase project at https://app.supabase.com
   - Note your project URL and API keys

2. **Configure Environment Variables**:
   - Create a `.env` file in the `backend` directory with your Supabase URL and service key:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   ```

3. **Deploy SQL Files**:
   - Install dependencies: `cd backend && npm install`
   - Run the deployment script: `npm run deploy-supabase`

4. **Update UI Components**:
   - Update all UI components that directly use mock data to use the service files instead
   - Example: `app/(tabs)/marketplace.tsx` has been updated as a reference

5. **Test the Implementation**:
   - Test each service to ensure it works correctly with Supabase
   - Test the UI components to ensure they display data correctly

## Updating UI Components

To update a UI component to use the service files instead of mock data, follow these steps:

1. Import the necessary service files:
   ```typescript
   import { workoutService, programService, clubService, profileService } from '@/services';
   ```

2. Replace direct mock data usage with service calls:
   ```typescript
   // Before
   const items = mockWorkouts.filter(workout => workout.isPaid);

   // After
   const [items, setItems] = useState([]);
   useEffect(() => {
     const fetchItems = async () => {
       const workouts = await workoutService.getWorkoutHistory();
       setItems(workouts.filter(workout => workout.isPaid));
     };
     fetchItems();
   }, []);
   ```

3. Add loading states and error handling:
   ```typescript
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
     const fetchItems = async () => {
       setIsLoading(true);
       try {
         const workouts = await workoutService.getWorkoutHistory();
         setItems(workouts.filter(workout => workout.isPaid));
       } catch (err) {
         setError(err);
       } finally {
         setIsLoading(false);
       }
     };
     fetchItems();
   }, []);
   ```

4. Update the UI to handle loading and error states:
   ```tsx
   {isLoading ? (
     <ActivityIndicator size="large" color="#0A84FF" />
   ) : error ? (
     <Text>Error loading data: {error.message}</Text>
   ) : (
     <FlatList data={items} renderItem={renderItem} />
   )}
   ```

## Service File Pattern

All service files follow the same pattern:

1. Try to fetch data from Supabase
2. Handle errors gracefully
3. Fall back to mock data during development if the API call fails

Example:

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

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)

For more detailed information, see the `docs/SUPABASE_IMPLEMENTATION.md` file.
