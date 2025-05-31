/**
 * Elite Locker - Onboarding Hook
 *
 * Hook for managing onboarding state and flow
 */

import { useCallback, useEffect, useState } from 'react';
import { onboardingService } from '../services/onboardingService';
import {
    ClubSetupData,
    OnboardingState,
    OnboardingStep,
    ProfileSetupData
} from '../types/onboarding';

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Set up your profile',
    subtitle: 'Tell us about yourself',
    completed: false,
    required: true
  },
  {
    id: 'club',
    title: 'Join the community',
    subtitle: 'Create or join a club',
    completed: false,
    required: false
  },
  {
    id: 'preferences',
    title: 'Set your goals',
    subtitle: 'Customize your experience',
    completed: false,
    required: false
  },
  {
    id: 'first-workout',
    title: 'Log your first workout',
    subtitle: 'Get started with tracking',
    completed: false,
    required: true
  }
];

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    steps: ONBOARDING_STEPS,
    data: {},
    isLoading: false,
    error: null,
    isComplete: false
  });

  /**
   * Load onboarding status from server
   */
  const loadOnboardingStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const status = await onboardingService.getOnboardingStatus();

      // Update steps based on completion status
      const updatedSteps = ONBOARDING_STEPS.map(step => ({
        ...step,
        completed:
          (step.id === 'profile' && status.profileComplete) ||
          (step.id === 'club' && status.clubSetup) ||
          (step.id === 'preferences' && status.preferencesSet) ||
          (step.id === 'first-workout' && status.firstWorkoutLogged)
      }));

      // Find current step (first incomplete required step)
      let currentStep = updatedSteps.findIndex(step => !step.completed && step.required);
      if (currentStep === -1) {
        // All required steps complete, find first incomplete optional step
        currentStep = updatedSteps.findIndex(step => !step.completed);
        if (currentStep === -1) {
          // All steps complete
          currentStep = updatedSteps.length;
        }
      }

      setState(prev => ({
        ...prev,
        steps: updatedSteps,
        currentStep,
        isComplete: status.onboardingComplete,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load onboarding status',
        isLoading: false
      }));
    }
  }, []);

  /**
   * Update profile data
   */
  const updateProfile = useCallback(async (profileData: ProfileSetupData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await onboardingService.updateProfile(profileData);

      setState(prev => {
        const updatedSteps = prev.steps.map(step =>
          step.id === 'profile' ? { ...step, completed: true } : step
        );

        // Find next incomplete step
        const nextIncompleteStep = updatedSteps.findIndex(step => !step.completed);
        const newCurrentStep = nextIncompleteStep === -1 ? updatedSteps.length : nextIncompleteStep;

        return {
          ...prev,
          data: { ...prev.data, profile: profileData },
          steps: updatedSteps,
          currentStep: newCurrentStep,
          isLoading: false
        };
      });

      console.log('Profile updated successfully');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update profile',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  /**
   * Handle club setup
   */
  const setupClub = useCallback(async (clubData: ClubSetupData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (clubData.action === 'create' && clubData.clubName) {
        await onboardingService.createClub(clubData);
      } else if (clubData.action === 'join' && clubData.clubToJoin) {
        await onboardingService.joinClub(clubData.clubToJoin);
      }

      setState(prev => {
        const updatedSteps = prev.steps.map(step =>
          step.id === 'club' ? { ...step, completed: true } : step
        );

        // Find next incomplete step
        const nextIncompleteStep = updatedSteps.findIndex(step => !step.completed);
        const newCurrentStep = nextIncompleteStep === -1 ? updatedSteps.length : nextIncompleteStep;

        return {
          ...prev,
          data: { ...prev.data, club: clubData },
          steps: updatedSteps,
          currentStep: newCurrentStep,
          isLoading: false
        };
      });

      console.log('Club setup completed successfully');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to setup club',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  /**
   * Set user preferences
   */
  const setPreferences = useCallback(async (preferencesData: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await onboardingService.setPreferences(preferencesData);

      setState(prev => {
        const updatedSteps = prev.steps.map(step =>
          step.id === 'preferences' ? { ...step, completed: true } : step
        );

        // Find next incomplete step
        const nextIncompleteStep = updatedSteps.findIndex(step => !step.completed);
        const newCurrentStep = nextIncompleteStep === -1 ? updatedSteps.length : nextIncompleteStep;

        return {
          ...prev,
          data: { ...prev.data, preferences: preferencesData },
          steps: updatedSteps,
          currentStep: newCurrentStep,
          isLoading: false
        };
      });

      console.log('Preferences saved successfully');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save preferences',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  /**
   * Complete first workout step (used with core workout system)
   */
  const completeFirstWorkout = useCallback(() => {
    setState(prev => {
      const updatedSteps = prev.steps.map(step =>
        step.id === 'first-workout' ? { ...step, completed: true } : step
      );

      // All steps should be complete now
      const allComplete = updatedSteps.every(step => step.completed);

      return {
        ...prev,
        steps: updatedSteps,
        currentStep: updatedSteps.length,
        isComplete: allComplete
      };
    });

    console.log('First workout step completed');
  }, []);

  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.steps.length)
    }));
  }, []);

  /**
   * Navigate to previous step
   */
  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  }, []);

  /**
   * Skip current step (if optional)
   */
  const skipStep = useCallback(() => {
    setState(prev => {
      const currentStepData = prev.steps[prev.currentStep];
      if (currentStepData && !currentStepData.required) {
        return {
          ...prev,
          steps: prev.steps.map((step, index) =>
            index === prev.currentStep ? { ...step, completed: true } : step
          ),
          currentStep: prev.currentStep + 1
        };
      }
      return prev;
    });
  }, []);

  /**
   * Complete onboarding
   */
  const completeOnboarding = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Mark onboarding as complete in the backend
      await onboardingService.completeOnboarding();

      setState(prev => ({
        ...prev,
        isComplete: true,
        currentStep: prev.steps.length,
        isLoading: false
      }));

      // Force a page reload to refresh auth state
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to complete onboarding',
        isLoading: false
      }));
    }
  }, []);

  // Load status on mount and when needed
  useEffect(() => {
    loadOnboardingStatus();
  }, []); // Empty dependency array to run only once

  // Expose method to reload status when needed
  const reloadStatus = useCallback(() => {
    loadOnboardingStatus();
  }, [loadOnboardingStatus]);

  return {
    ...state,
    updateProfile,
    setupClub,
    setPreferences,
    completeFirstWorkout,
    nextStep,
    previousStep,
    skipStep,
    completeOnboarding,
    loadOnboardingStatus,
    reloadStatus
  };
}
