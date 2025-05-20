# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Error Handling and Robustness Improvements

To make the Elite Locker app more robust and resilient to errors, we've implemented several strategies:

### 1. Color System Fallbacks

We've created a comprehensive fallback color system in `utils/colorUtils.js` that provides safe access to colors with proper fallbacks. This prevents "Cannot read property of undefined" errors when the design system fails to load.

### 2. Date Formatting Without Dependencies

To eliminate dependency issues with date-fns, we've created a lightweight date formatting utility in `utils/dateUtils.js` that provides similar functionality without external dependencies.

### 3. Error Boundaries

We've added React Error Boundary components throughout the app to gracefully catch and handle errors without crashing the entire application.

### 4. Safe Component Wrappers

Components like `SafeAreaWrapper` now include robust error handling and fallbacks to prevent common issues such as "Cannot read property 'icon' of undefined".

### 5. Robust UI Components

We've created resilient UI components like `WorkoutCard`, `ProgramCard`, and `ClubCard` that:
- Use hardcoded styles to reduce dependencies on the design system
- Include proper type checking and defensive coding
- Handle missing or undefined data gracefully
- Provide fallbacks for images and other dynamic content

### 6. Startup Script

The `start.ps1` PowerShell script helps ensure all dependencies are properly installed and configured before starting the app.

### 7. Supabase Integration and Node.js Module Compatibility

We've implemented a robust Supabase integration that works in React Native despite the lack of Node.js modules in the React Native environment:

- Created a simplified Supabase client in `lib/supabase-client.ts` that works with React Native
- Added essential polyfills in `index.js` to support Supabase functionality
- Implemented proper error handling for Supabase operations
- Created utility functions for common Supabase operations in `lib/api.ts`
- Added authentication utilities in `lib/auth.ts`
- Created service layer files that use Supabase with fallbacks to mock data during development

This approach ensures that the app can use Supabase for backend operations while maintaining compatibility with React Native's runtime environment.

### Usage Tips

1. Always use the Error Boundary component to wrap any code that might throw errors:

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

2. Use the Safe Area Wrapper for proper rendering with device notches:

```tsx
<SafeAreaWrapper>
  <YourScreenContent />
</SafeAreaWrapper>
```

3. Use the color utilities to safely access design tokens:

```tsx
import { getColor } from '@/utils/colorUtils';

// Safe access with fallback
const backgroundColor = getColor('dark.background.card', '#1C1C1E');
```

4. Use the date utilities instead of date-fns:

```tsx
import { formatRelativeTime, formatDate } from '@/utils/dateUtils';

// Format relative time
const timeAgo = formatRelativeTime(new Date(2023, 5, 10));

// Format date
const formattedDate = formatDate(new Date(), 'medium');
```

5. Use the Supabase client for data operations:

```tsx
import { supabase } from '@/lib/supabase-client';
import { fetchData, insertData, updateData, deleteData } from '@/lib/api';

// Using the Supabase client directly
const { data, error } = await supabase
  .from('workouts')
  .select('*')
  .order('created_at', { ascending: false });

// Using the API utilities
const workouts = await fetchData('workouts', {
  select: '*',
  order: { column: 'created_at', ascending: false },
  limit: 10
});

// Using service layer functions
import { workoutService } from '@/services';

const templates = await workoutService.getWorkoutTemplates();
```

6. Use the authentication utilities:

```tsx
import { signIn, signUp, signOut, getCurrentUser } from '@/lib/auth';
import { useAuthContext } from '@/contexts/AuthContext';

// Sign in a user
await signIn('user@example.com', 'password');

// Using the auth context in components
const { user, isAuthenticated, signOut } = useAuthContext();

if (isAuthenticated) {
  console.log(`Logged in as: ${user.email}`);
}
```

# Elite Locker

A modern sports community platform built with React Native and Expo, featuring a Discord-like club system for sports and fitness enthusiasts.

## AI Workout Creator

Elite Locker now includes an AI-powered workout creator that allows users to describe workouts in natural language (through voice or text) and automatically generates structured workouts with exercises from the app's library.

### Setting up OpenAI Integration

The AI workout creator can use OpenAI's GPT models for more intelligent workout creation. To enable this feature:

1. Create a `.env` file in the project root with your OpenAI API key:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

2. Rebuild the app to include the environment variables:
   ```
   npx expo prebuild --clean
   npx expo run:android  # or npx expo run:ios on Mac
   ```

If no API key is provided, the app will fall back to local text processing, which has more limited capabilities.

### Using the AI Workout Creator

- Tap the "AI Workout Creator" button on the workout screen
- Describe your workout with voice or text
- Example prompt: "Create an upper body workout with 4 sets of bench press, 3 sets of pull-ups, and some tricep exercises"
- The AI will generate a structured workout with appropriate sets, reps, and rest times
- Review and start the workout

## Features

### Club System
- Browse and discover sports clubs
- Detailed club profiles with coach information
- Sport-specific tagging and filtering
- Member statistics and engagement metrics

### Membership Management
- Monthly and annual subscription options
- Free trial periods
- Multiple payment methods (Apple Pay, Credit Card, PayPal)
- Automatic renewal handling

### Content & Training
- Live session scheduling
- Training program access
- Progress tracking
- Form analysis and feedback

### Coach Features
- Club creation and management
- Member engagement tools
- Content scheduling
- Analytics dashboard
