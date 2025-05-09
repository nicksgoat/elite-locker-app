// Type definitions for global variables

import { FeedExercise } from './contexts/WorkoutContext';

declare global {
  interface WorkoutFeedItem {
    id: string;
    userName: string;
    userAvatarUrl?: string;
    workoutName: string;
    caloriesBurned?: number;
    totalVolume?: number;
    duration?: number; // in seconds
    prsAchieved?: number;
    timestamp: string; // e.g., "4 hours ago"
    location?: string; // e.g., "Canada"
    workoutId?: string;
    exercises?: FeedExercise[];
  }

  var workoutFeedItems: WorkoutFeedItem[];
}
