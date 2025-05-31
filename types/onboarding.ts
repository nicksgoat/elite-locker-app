/**
 * Elite Locker - Onboarding Types
 * 
 * Type definitions for the onboarding flow
 */

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle?: string;
  completed: boolean;
  required: boolean;
}

export interface ProfileSetupData {
  fullName: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  goals?: string[];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredWorkoutTypes?: string[];
}

export interface ClubSetupData {
  action: 'create' | 'join' | 'skip';
  clubName?: string;
  clubDescription?: string;
  clubToJoin?: string;
}

export interface PreferencesData {
  workoutFrequency?: number; // times per week
  preferredDuration?: number; // minutes
  goals?: string[];
  equipment?: string[];
  notifications?: {
    workoutReminders: boolean;
    socialUpdates: boolean;
    programUpdates: boolean;
  };
}

export interface FirstWorkoutData {
  type: string;
  duration: number; // minutes
  notes?: string;
  exercises?: {
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
  }[];
}

export interface OnboardingData {
  profile: ProfileSetupData;
  club: ClubSetupData;
  preferences: PreferencesData;
  firstWorkout?: FirstWorkoutData;
}

export interface OnboardingState {
  currentStep: number;
  steps: OnboardingStep[];
  data: Partial<OnboardingData>;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
}

export interface UserOnboardingStatus {
  profileComplete: boolean;
  clubSetup: boolean;
  preferencesSet: boolean;
  firstWorkoutLogged: boolean;
  onboardingComplete: boolean;
  lastCompletedStep?: string;
}
