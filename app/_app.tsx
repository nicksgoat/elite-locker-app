import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { RunTrackingProvider } from '../contexts/RunTrackingContext';
import { WorkoutProvider } from '../contexts/WorkoutContext';

// Main App component
const App: React.FC = (props) => {
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
};

export default App;