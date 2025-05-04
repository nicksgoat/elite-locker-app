import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WorkoutProvider } from '../contexts/WorkoutContext';
import { RunTrackingProvider } from '../contexts/RunTrackingContext';

export default function RootLayout() {
  return (
    <RunTrackingProvider>
      <WorkoutProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#000000',
            },
          }}
        />
      </WorkoutProvider>
    </RunTrackingProvider>
  );
} 