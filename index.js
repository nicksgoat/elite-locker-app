// Import polyfills
import { Buffer } from 'buffer';
import 'react-native-get-random-values';

// Add global Buffer
global.Buffer = Buffer;

// Register the error handler before importing the app
import { LogBox } from 'react-native';

// Suppress specific warnings
LogBox.ignoreLogs([
  // Add warnings to ignore here
  'Property "opacity" of AnimatedComponent',
  'Possible Unhandled Promise Rejection',
  'crypto.getRandomValues() not supported',
  'Task orphaned for request',
  'The package at',
  'attempted to import the Node standard library',
  'It failed because the native React runtime',
  'Node standard library module',
  'Require cycle:',
]);

// Now import and register the app
import 'expo-router/entry';

import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Create a safety wrapper to prevent crashes from property access
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('App Error:', error);
    console.log('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>
            {this.state.error ? this.state.error.message : 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// Create a custom wrapper for the entire app
const AppWrapper = ({ children }) => {
  // Simplified wrapper with no SafeAreaProvider dependency
  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {children}
    </View>
  );
};

// Must be exported or Fast Refresh won't update the context
export function App() {
  // Use try-catch around the import to prevent crashes
  try {
    const ctx = require.context('./app');
    return (
      <ErrorBoundary>
        <AppWrapper>
          <ExpoRoot context={ctx} />
        </AppWrapper>
      </ErrorBoundary>
    );
  } catch (error) {
    console.log('Failed to load app:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>App Failed to Load</Text>
        <Text style={styles.errorSubtext}>{error.message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

registerRootComponent(App);