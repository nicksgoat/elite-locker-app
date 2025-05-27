# Social Share Deep Link System

## Overview
The Elite Locker app now uses user-friendly deep links for social sharing of workouts. Instead of using cryptic workout IDs, shared links follow a human-readable pattern that matches social media best practices.

## Deep Link Format
```
https://elitelocker.app/@{username}/{workoutName}
```

### Examples
- `https://elitelocker.app/@devonallen/UpperHypertrophy`
- `https://elitelocker.app/@devonallen/LowerHypertrophy`
- `https://elitelocker.app/@sarahfit/PushDay`

## Implementation Details

### 1. URL Structure
- **Username**: Creator's handle without the @ symbol (e.g., `Sam.Sulek`)
- **Workout Name**: Cleaned workout title with spaces and special characters removed

### 2. Workout Name Cleaning
```typescript
const cleanWorkoutName = workoutName
  .replace(/\s+/g, '')           // Remove spaces
  .replace(/[^a-zA-Z0-9]/g, '')  // Remove special characters
  .replace(/^-+|-+$/g, '');      // Remove leading/trailing dashes
```

### 3. Route Handling
The app handles social share URLs through a dedicated route handler:

**File**: `app/@[username]/[workoutName].tsx`

This handler:
1. Extracts username and workout name from the URL
2. Queries the backend to find the actual workout ID
3. Redirects to the appropriate workout detail/paywall screen

### 4. Workout Lookup
In production, the system would:
1. Query the database using username and workout name
2. Return the internal workout ID
3. Handle edge cases (not found, multiple matches, etc.)

Currently uses mock data for demonstration:
```typescript
const workoutMapping = {
  'devonallen': {
    'UpperHypertrophy': 'workout_123',
    'LowerHypertrophy': 'workout_456',
    'OlympicHurdleTraining': 'workout_789'
  },
  'sarahfit': {
    'PushDay': 'workout_234',
    'HIITCircuit': 'workout_345'
  }
};
```

## User Flow

### Social Sharing Flow
1. User completes workout
2. Shares workout to social media/clubs
3. Deep link is generated: `@username/workoutName`
4. Link is included in share content

### Link Access Flow
1. User clicks shared link
2. App opens to social link handler
3. Handler looks up workout by username/name
4. Redirects to workout paywall/detail screen
5. User can purchase and access full workout

## Benefits

### 1. User Experience
- **Human-readable URLs**: Easy to understand and remember
- **Brand consistency**: Matches social media handle patterns
- **SEO-friendly**: Better for web indexing and discovery

### 2. Social Media Optimization
- **Professional appearance**: Links look native to social platforms
- **Easy sharing**: Users can manually type or remember links
- **Viral potential**: Recognizable creator names encourage clicks

### 3. Creator Monetization
- **Personal branding**: Creator handle prominently featured
- **Workout discovery**: Easy to find specific workouts by name
- **Cross-platform sharing**: Works across all social media platforms

## Test Implementation

Use the "Test Social Share Link" button in the Quick Start screen to experience the full flow:
1. Tap the test button
2. Navigate to `/@devonallen/UpperHypertrophy`
3. See the social link handler in action
4. Experience the paywall monetization system

## Future Enhancements

### 1. Backend Integration
- Database queries for workout lookup
- Caching for performance
- Analytics tracking for link clicks

### 2. SEO Optimization
- Meta tags for shared content
- Open Graph images
- Twitter Card integration

### 3. Advanced Features
- Custom workout slugs
- Link analytics dashboard
- Branded short links 