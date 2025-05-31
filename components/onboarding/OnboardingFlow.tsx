/**
 * Elite Locker - Onboarding Flow
 * 
 * Main onboarding coordinator component with Spotify-style design
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ProfileSetupScreen } from './ProfileSetupScreen';
import { ClubSetupScreen } from './ClubSetupScreen';
import { PreferencesScreen } from './PreferencesScreen';
import { FirstWorkoutScreen } from './FirstWorkoutScreen';

export const OnboardingFlow: React.FC = () => {
  const {
    currentStep,
    steps,
    isLoading,
    error,
    isComplete,
    nextStep,
    previousStep,
    skipStep,
    completeOnboarding
  } = useOnboarding();

  // Handle onboarding completion
  const handleComplete = () => {
    Alert.alert(
      'Welcome to Elite Locker!',
      'Your setup is complete. Ready to start your fitness journey?',
      [
        {
          text: 'Get Started',
          onPress: completeOnboarding
        }
      ]
    );
  };

  // Show loading state
  if (isLoading && currentStep === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Setting up your experience...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show completion state
  if (isComplete || currentStep >= steps.length) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1DB954', '#1ed760']}
          style={styles.completionContainer}
        >
          <View style={styles.completionContent}>
            <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
            <Text style={styles.completionTitle}>You're all set!</Text>
            <Text style={styles.completionSubtitle}>
              Welcome to Elite Locker. Let's start your fitness journey.
            </Text>
            <TouchableOpacity
              style={styles.completionButton}
              onPress={completeOnboarding}
            >
              <Text style={styles.completionButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderCurrentStep = () => {
    switch (currentStepData?.id) {
      case 'profile':
        return <ProfileSetupScreen onNext={nextStep} />;
      case 'club':
        return <ClubSetupScreen onNext={nextStep} onSkip={skipStep} />;
      case 'preferences':
        return <PreferencesScreen onNext={nextStep} onSkip={skipStep} />;
      case 'first-workout':
        return <FirstWorkoutScreen onNext={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with progress */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={previousStep}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {currentStep + 1} of {steps.length}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      {/* Current step content */}
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>

      {/* Error display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    flex: 1,
    alignItems: 'center',
  },
  stepText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  completionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  completionButtonText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});
