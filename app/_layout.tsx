import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ConnectivityProvider } from '../contexts/ConnectivityContext';
import { EnhancedWorkoutProvider } from '../contexts/EnhancedWorkoutContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { ProgramProvider } from '../contexts/ProgramContext';
import { RunTrackingProvider } from '../contexts/RunTrackingContext';
import { SocialProvider } from '../contexts/SocialContext';
import { WorkoutProvider } from '../contexts/WorkoutContext';
import { WorkoutPurchaseProvider } from '../contexts/WorkoutPurchaseContext';

export default function RootLayout() {
  return (
    <ConnectivityProvider>
      <AuthProvider>
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
                    />
                    </WorkoutProvider>
                  </RunTrackingProvider>
                </ProgramProvider>
              </EnhancedWorkoutProvider>
            </WorkoutPurchaseProvider>
          </SocialProvider>
        </ProfileProvider>
      </AuthProvider>
    </ConnectivityProvider>
  );
}
