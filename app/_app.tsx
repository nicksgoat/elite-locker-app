import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WorkoutProvider } from '../contexts/WorkoutContext';
import { RunTrackingProvider } from '../contexts/RunTrackingContext';

// Simple function to catch and handle errors
function withErrorHandling(Component: React.ComponentType<any>) {
  return function ErrorHandlingWrapper(props: any) {
    try {
      return <Component {...props} />;
    } catch (error: any) {
      console.error('App error:', error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>App Error</Text>
          <Text style={styles.errorMessage}>{error?.message || 'Unknown error'}</Text>
        </View>
      );
    }
  };
}

// Using dynamic import with error handling
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

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
  },
});

export default withErrorHandling(App); 