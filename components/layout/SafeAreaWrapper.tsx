import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  SafeAreaProvider, 
  SafeAreaView,
  useSafeAreaInsets,
  initialWindowMetrics
} from 'react-native-safe-area-context';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// Default insets to use as fallback
const DEFAULT_INSETS = { top: 44, right: 0, bottom: 34, left: 0 };

// Context for providing safe area insets with fallback
const SafeAreaContext = React.createContext(DEFAULT_INSETS);

// Hook to safely get insets with fallback
export function useSafeInsets() {
  try {
    // Try to use the real hook first
    const insets = useSafeAreaInsets();
    // Check if insets are valid (sometimes they can be undefined or all zeros)
    if (insets && (insets.top > 0 || insets.bottom > 0)) {
      return insets;
    }
    return DEFAULT_INSETS;
  } catch (error) {
    // If there's any error, return default insets
    return DEFAULT_INSETS;
  }
}

interface SafeAreaWrapperProps {
  children: ReactNode;
  style?: any;
  edges?: Array<'top' | 'right' | 'bottom' | 'left'>;
}

/**
 * A wrapper component that provides safe area insets with fallbacks
 * to prevent "Cannot read property 'icon' of undefined" errors
 */
export function SafeAreaWrapper({ 
  children, 
  style, 
  edges 
}: SafeAreaWrapperProps) {
  // Attempt to use SafeAreaView, but fall back to a regular View if it fails
  try {
    return (
      <ErrorBoundary
        fallback={
          <View style={[styles.container, style]}>
            {children}
          </View>
        }
      >
        <SafeAreaView edges={edges} style={[styles.container, style]}>
          {children}
        </SafeAreaView>
      </ErrorBoundary>
    );
  } catch (error) {
    // If SafeAreaView fails, use a regular View with padding
    return (
      <View style={[styles.container, style, styles.fallbackPadding]}>
        {children}
      </View>
    );
  }
}

/**
 * App-level provider that wraps the SafeAreaProvider with error handling
 */
export function SafeAreaProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <View style={styles.providerFallback}>
          {children}
        </View>
      }
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        {children}
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallbackPadding: {
    paddingTop: DEFAULT_INSETS.top,
    paddingBottom: DEFAULT_INSETS.bottom,
  },
  providerFallback: {
    flex: 1,
    paddingTop: DEFAULT_INSETS.top,
    paddingBottom: DEFAULT_INSETS.bottom,
  },
});

export default SafeAreaWrapper; 