# Elite Locker Supabase Implementation

This document outlines the implementation of Supabase as the backend for the Elite Locker fitness app.

## Overview

The Elite Locker app now uses Supabase for its backend, replacing the previous mock data implementation. This provides a real database, authentication, and storage solution for the app.

## Architecture

The implementation follows a layered architecture:

1. **Core Client Layer**: A simplified Supabase client that works in React Native (`lib/supabase.ts`)
2. **API Utilities Layer**: Generic functions for CRUD operations (`lib/api.ts`)
3. **Service Layer**: Domain-specific services that use the API utilities (`services/*.ts`)
4. **UI Layer**: React components that use the services

This architecture provides a clean separation of concerns and makes it easier to handle errors and fallbacks.

## Key Files

- `lib/supabase.ts`: The core Supabase client configuration
- `lib/api.ts`: Generic API utilities for CRUD operations
- `lib/auth.ts`: Authentication utilities
- `services/*.ts`: Domain-specific services (programs, workouts, clubs, etc.)
- `sql/schema.sql`: Database schema
- `sql/rls_policies.sql`: Row Level Security policies
- `sql/seed_data.sql`: Seed data for development
- `scripts/deploy-supabase.js`: Script to deploy SQL files to Supabase

## Service Files

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

## Database Schema

The database schema is defined in `sql/schema.sql` and includes tables for:

- Profiles (extends Supabase auth.users)
- Exercises
- Workouts
- Programs
- Clubs
- Posts
- Comments
- Events
- and more

## Row Level Security

Row Level Security (RLS) policies are defined in `sql/rls_policies.sql` and ensure that users can only access data they are authorized to see.

For example:

```sql
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Seed Data

Seed data is defined in `sql/seed_data.sql` and includes sample data for development and testing.

## Deployment

To deploy the SQL files to Supabase:

1. Create a `.env` file in the `backend` directory with your Supabase URL and service key:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
```

2. Run the deployment script:

```
cd backend
npm install
npm run deploy-supabase
```

## UI Components

Several UI components were previously using mock data directly. These components should be updated to use the service files instead. For example:

```typescript
// Before
import { mockPrograms } from '@/data/mockData';

// After
import { programService } from '@/services';
const [programs, setPrograms] = useState([]);

useEffect(() => {
  const fetchPrograms = async () => {
    const data = await programService.getPrograms();
    setPrograms(data);
  };
  
  fetchPrograms();
}, []);
```

## Authentication

Authentication is handled by Supabase Auth and the `lib/auth.ts` utilities. The app uses email/password authentication by default, but can be extended to support other providers.

## Storage

File storage (images, videos, etc.) is handled by Supabase Storage. The `uploadFile` function in `lib/api.ts` provides a convenient way to upload files.

## Error Handling

All service functions include error handling and fallbacks to mock data during development. This ensures that the app continues to work even if there are issues with the Supabase connection.

## Next Steps

1. Update all UI components to use the service files instead of mock data
2. Implement authentication UI
3. Add more comprehensive error handling
4. Implement offline support
5. Add more comprehensive testing
