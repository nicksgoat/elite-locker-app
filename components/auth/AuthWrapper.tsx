/**
 * Elite Locker - Authentication Wrapper
 *
 * Wrapper component that shows authentication screen when user is not authenticated
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { AuthScreen } from './AuthScreen';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [shouldShowOnboarding, setShouldShowOnboarding] = React.useState<boolean | null>(null);

  // Check if user should see onboarding
  React.useEffect(() => {
    const checkOnboarding = async () => {
      if (isAuthenticated && user) {
        // Check if profile is incomplete (username or full_name is missing)
        const profileIncomplete = !user.username || !user.fullName;
        setShouldShowOnboarding(profileIncomplete);
      } else {
        setShouldShowOnboarding(false);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, user]);

  // Debug authentication state
  React.useEffect(() => {
    console.log('AuthWrapper: Auth state changed');
    console.log('AuthWrapper: isLoading:', isLoading);
    console.log('AuthWrapper: isAuthenticated:', isAuthenticated);
    console.log('AuthWrapper: user:', user ? user.email : 'null');
    console.log('AuthWrapper: profileComplete:', user?.profileComplete);
    console.log('AuthWrapper: shouldShowOnboarding:', shouldShowOnboarding);
  }, [user, isLoading, isAuthenticated, shouldShowOnboarding]);

  // Show loading spinner while checking authentication or onboarding status
  if (isLoading || shouldShowOnboarding === null) {
    console.log('AuthWrapper: Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  // Show authentication screen if user is not authenticated
  if (!isAuthenticated || !user) {
    console.log('AuthWrapper: Showing auth screen - not authenticated');
    return <AuthScreen />;
  }

  // Show onboarding flow if needed
  if (shouldShowOnboarding) {
    console.log('AuthWrapper: Showing onboarding flow');
    return <OnboardingFlow />;
  }

  // Show main app if user is authenticated and onboarding is complete
  console.log('AuthWrapper: Showing main app - user authenticated and onboarding complete');
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
