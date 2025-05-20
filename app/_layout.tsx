import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { createContext, useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import 'react-native-reanimated';

// Initialize global workout feed items array
if (typeof global.workoutFeedItems === 'undefined') {
  global.workoutFeedItems = [];
}

// Import design system ThemeProvider
import { ThemeProvider } from '@/components/design-system/ThemeProvider';

// Import workout context and floating tracker
import AppLayout from '../components/layout/AppLayout';
import FloatingRunTracker from '../components/ui/FloatingRunTracker';
import FloatingWorkoutTracker from '../components/ui/FloatingWorkoutTracker';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { ProgramProvider } from '../contexts/ProgramContext';
import { RunTrackingProvider, useRunTracking } from '../contexts/RunTrackingContext';
import { WorkoutProvider, useWorkout } from '../contexts/WorkoutContext';

export const ScrollContext = createContext({
  scrollY: new Animated.Value(0),
  scrollHandler: ({nativeEvent}: any) => {},
  headerOpacity: new Animated.Value(1) as any
});

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  networkStatusBar: {
    backgroundColor: '#FF3B30',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 1000,
  },
  warningBar: {
    backgroundColor: '#FF9500',
  },
  networkStatusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

// Import the connectivity context
import { ConnectivityProvider, useConnectivity } from '../contexts/ConnectivityContext';

// Separate App component to use context hooks
function AppContent() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isWorkoutActive,
    isWorkoutMinimized,
    maximizeWorkout
  } = useWorkout();

  // Add RunTracking context
  const {
    isTracking,
    isMinimized,
  } = useRunTracking();

  // Add Connectivity context
  const { isConnected, isSupabaseConnected, checkConnection } = useConnectivity();

  // Create animated values for header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.7, 0],
    extrapolate: 'clamp'
  });

  // Handle scroll events
  const scrollHandler = ({nativeEvent}: any) => {
    if (!nativeEvent || !nativeEvent.contentOffset) return;
    const offsetY = nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  const path = pathname || ''; // Ensure pathname is not null

  // Hide nav bar on specific screens
  const shouldHideNavBar =
    (path === '/workout/active' && !isWorkoutMinimized) || // Active workout
    (path === '/workout/run' && !isMinimized) || // Active run
    path.includes('/messages') || // Message compose screens
    path === '/chat' || // Chat compose screens
    path.includes('/workout/detail/') || // Workout detail screens
    path.includes('/workout/template/') || // Workout template screens
    path.includes('/programs/workout') || // Program workout screens
    path.includes('/programs/detail/'); // Program detail screens

  // Handle resuming a minimized workout
  const handleResumeWorkout = () => {
    maximizeWorkout();
    router.push('/workout/active' as any);
  };

  return (
    <ScrollContext.Provider value={{ scrollY, scrollHandler, headerOpacity }}>
      <AppLayout hideNavBar={shouldHideNavBar}>
        <View style={styles.container}>
          {/* Network Status Indicator */}
          {!isConnected && (
            <TouchableOpacity
              style={styles.networkStatusBar}
              onPress={checkConnection}
            >
              <Text style={styles.networkStatusText}>
                No internet connection. Tap to retry.
              </Text>
            </TouchableOpacity>
          )}

          {isConnected && !isSupabaseConnected && (
            <TouchableOpacity
              style={[styles.networkStatusBar, styles.warningBar]}
              onPress={checkConnection}
            >
              <Text style={styles.networkStatusText}>
                Connected to internet, but can't reach server. Tap to retry.
              </Text>
            </TouchableOpacity>
          )}

          {/* Main Content */}
          <View style={styles.contentContainer}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000000' },
                animation: 'slide_from_right',
              }}
            />
          </View>

          {/* Floating Run Tracker if a run is in progress */}
          {isTracking && isMinimized && (
            <FloatingRunTracker />
          )}

          {/* Floating Workout Tracker if a workout is in progress */}
          {isWorkoutActive && isWorkoutMinimized && (
            <FloatingWorkoutTracker />
          )}
        </View>
      </AppLayout>
    </ScrollContext.Provider>
  );
}

// Root layout component that wraps the app with necessary providers
export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Try to log available contexts and providers for debugging
  console.log('_layout.tsx loaded');
  try {
    console.log('Available React Native Context:', require('react-native-safe-area-context'));
  } catch (error: any) {
    console.log('Failed to load react-native-safe-area-context:', error?.message || 'Unknown error');
  }

  return (
    <ThemeProvider forcedMode="dark">
      <StatusBar style="light" />
      <ConnectivityProvider>
        <AuthProvider>
          <ProfileProvider>
            <ProgramProvider>
              <RunTrackingProvider>
                <WorkoutProvider>
                  <AppContent />
                </WorkoutProvider>
              </RunTrackingProvider>
            </ProgramProvider>
          </ProfileProvider>
        </AuthProvider>
      </ConnectivityProvider>
    </ThemeProvider>
  );
}
