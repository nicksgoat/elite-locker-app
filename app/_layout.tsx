import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthWrapper } from '../components/auth/AuthWrapper';
import { AuthProvider } from '../contexts/AuthContext';
import { ConnectivityProvider } from '../contexts/ConnectivityContext';
import { EnhancedWorkoutProvider } from '../contexts/EnhancedWorkoutContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { ProgramProvider } from '../contexts/ProgramContext';
import { RunTrackingProvider } from '../contexts/RunTrackingContext';
import { SocialProvider } from '../contexts/SocialContext';
import { WorkoutProvider } from '../contexts/WorkoutContext';
import { WorkoutPurchaseProvider } from '../contexts/WorkoutPurchaseContext';

// Suppress React 19 compatibility warnings for development
// This is a known issue with React 19 and React Native libraries
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args[0]?.toString?.() || '';
  // Suppress the specific React 19 hook call warning and KeyboardAvoidingView warnings
  if (message.includes('Invalid hook call') ||
      message.includes('Warning: Error: Invalid hook call') ||
      message.includes('KeyboardAvoidingView') ||
      message.includes('ScreenContentWrapper') ||
      message.includes("Property 'KeyboardAvoidingView' doesn't exist") ||
      message.includes('Text strings must be rendered within a <Text> component')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args[0]?.toString?.() || '';
  // Suppress KeyboardAvoidingView and React Native warnings
  if (message.includes('KeyboardAvoidingView') ||
      message.includes('ScreenContentWrapper') ||
      message.includes("Property 'KeyboardAvoidingView' doesn't exist") ||
      message.includes('Text strings must be rendered within a <Text> component')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConnectivityProvider>
      <AuthProvider>
        <AuthWrapper>
          <ProfileProvider>
            <SocialProvider>
              <WorkoutPurchaseProvider>
                <EnhancedWorkoutProvider>
                  <ProgramProvider>
                    <RunTrackingProvider>
                      <WorkoutProvider>
                      <StatusBar style="light" />
                      <Stack
                        screenOptions={{
                          headerShown: false,
                          contentStyle: { backgroundColor: '#000000' },
                        }}
                      >
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="club" options={{ headerShown: false }} />
                        <Stack.Screen name="workout" options={{ headerShown: false }} />
                        <Stack.Screen name="exercise" options={{ headerShown: false }} />
                        <Stack.Screen name="exercises" options={{ headerShown: false }} />
                        <Stack.Screen name="training" options={{ headerShown: false }} />
                        <Stack.Screen name="streaming" options={{ headerShown: false }} />
                      </Stack>
                      </WorkoutProvider>
                    </RunTrackingProvider>
                  </ProgramProvider>
                </EnhancedWorkoutProvider>
              </WorkoutPurchaseProvider>
            </SocialProvider>
          </ProfileProvider>
        </AuthWrapper>
      </AuthProvider>
    </ConnectivityProvider>
    </GestureHandlerRootView>
  );
}
