import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Platform, 
  TouchableOpacity, 
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { useColorScheme } from 'react-native';

// Import workout context and floating tracker
import { WorkoutProvider, useWorkout } from '../contexts/WorkoutContext';
import { RunTrackingProvider, useRunTracking } from '../contexts/RunTrackingContext';
import { ProfileProvider } from '../contexts/ProfileContext';
import { ProgramProvider } from '../contexts/ProgramContext';
import FloatingWorkoutTracker from '../components/ui/FloatingWorkoutTracker';
import FloatingRunTracker from '../components/ui/FloatingRunTracker';
import NavigationMenu from '../components/ui/NavigationMenu';

// Create a context for scroll events
import { createContext } from 'react';

export const ScrollContext = createContext({
  scrollY: new Animated.Value(0),
  scrollHandler: ({nativeEvent}: any) => {},
  headerOpacity: new Animated.Value(1) as any
});

// TabButton component with TypeScript typing
interface TabButtonProps {
  iconName: string;
  label: string;
  isActive?: boolean;
  onPress: () => void;
}

function TabButton({ iconName, label, isActive = false, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity 
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={iconName as any} 
        size={24} 
        color={isActive ? '#0A84FF' : '#8E8E93'} 
      />
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
        {label}
      </Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );
}

const { height } = Dimensions.get('window');
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 10 : 10;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 10 : 10;
const HEADER_PADDING_TOP = Platform.OS === 'ios' ? 10 : 10;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
  },
  blurView: {
    width: '100%',
    overflow: 'hidden',
  },
  safeArea: {
    width: '100%',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: HEADER_PADDING_TOP,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  searchButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#0A84FF',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 3,
    backgroundColor: '#0A84FF',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bottomSafeArea: {
    height: Platform.OS === 'ios' ? 24 : 0,
  },
});

// Separate App component to use context hooks
function AppContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
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

  // Determine if the current screen uses the iMessage layout or other full-screen layout
  const usesIMessageLayout = 
    path === '/' ||
    path === '/workouts' ||
    path === '/explore' ||
    path === '/clubs' ||
    path === '/progress' ||
    path.startsWith('/profile') || // Matches /profile and /profile/[id]
    path.startsWith('/club/') || // Matches /club/[id] and /club/[id]/post/[postId]
    path.startsWith('/workout/detail/') || // Workout detail
    path.startsWith('/programs/detail/') || // Program detail
    path.startsWith('/exercises/detail/') || // Exercise detail
    path.startsWith('/events/detail/') || // Event detail
    (path === '/workout/active' && !isWorkoutMinimized) || // Active workout (maximized)
    (path === '/workout/run' && !isMinimized); // Active run (maximized)
                           
  // Show persistent header/tab bar ONLY if the screen does NOT use the iMessage layout
  const shouldShowHeader = !usesIMessageLayout;
  const shouldShowTabBar = !usesIMessageLayout;

  // Handle menu toggle
  const handleMenuToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(!menuVisible);
  };

  // Handle resuming a minimized workout
  const handleResumeWorkout = () => {
    maximizeWorkout();
    router.push('/workout/active' as any);
  };

  // Determine screen title based on path
  const getScreenTitle = () => {
    if (pathname?.includes('club/')) {
      return 'Club Details';
    } else if (pathname === '/') {
      return 'Elite Locker';
    } else if (pathname?.includes('/workout')) {
      return 'Workouts';
    } else if (pathname?.includes('exercises')) {
      return 'Exercise Library';
    } else if (pathname?.includes('events')) {
      return 'Events';
    } else if (pathname?.includes('programs')) {
      return 'Programs';
    } else if (pathname?.includes('profile')) {
      return 'Profile';
    }
    return 'Elite Locker';
  };

  const handleTabPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <ScrollContext.Provider value={{ scrollY, scrollHandler, headerOpacity }}>
      <View style={styles.container}>
        {/* Main Content */}
        <View style={[
          styles.contentContainer,
          shouldShowHeader ? { paddingTop: HEADER_HEIGHT + HEADER_PADDING_TOP } : { paddingTop: 0 }
        ]}>
          <Stack 
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000000' },
              animation: 'slide_from_right',
            }}
          />
        </View>
        
        {/* Persistent Header */}
        {shouldShowHeader && (
          <Animated.View style={[
            styles.headerContainer,
            { opacity: headerOpacity }
          ]}>
            <BlurView intensity={50} tint="dark" style={styles.blurView}>
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                  <TouchableOpacity 
                    style={styles.menuButton}
                    onPress={handleMenuToggle}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="menu" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {getScreenTitle()}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.searchButton}
                    onPress={() => router.push('/search' as any)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="search" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </BlurView>
          </Animated.View>
        )}
        
        {/* Persistent Tab Bar */}
        {shouldShowTabBar && (
          <View style={styles.tabBarContainer}>
            <BlurView intensity={50} tint="dark" style={styles.blurView}>
              <View style={styles.tabBar}>
                <TabButton 
                  iconName={pathname === '/' ? 'chatbubbles' : 'chatbubbles-outline'} 
                  label="Feed"
                  isActive={pathname === '/'}
                  onPress={() => handleTabPress('/')}
                />
                <TabButton 
                  iconName={pathname === '/workouts' ? 'barbell' : 'barbell-outline'} 
                  label="Workouts"
                  isActive={pathname === '/workouts'}
                  onPress={() => handleTabPress('/workouts')}
                />
                <TabButton 
                  iconName={pathname === '/explore' ? 'compass' : 'compass-outline'} 
                  label="Explore"
                  isActive={pathname === '/explore'}
                  onPress={() => handleTabPress('/explore')}
                />
                <TabButton 
                  iconName={pathname === '/progress' ? 'stats-chart' : 'stats-chart-outline'} 
                  label="Progress"
                  isActive={pathname === '/progress'}
                  onPress={() => handleTabPress('/progress')}
                />
                <TabButton 
                  iconName={pathname?.includes('/profile') ? 'person' : 'person-outline'} 
                  label="Profile"
                  isActive={pathname?.includes('/profile')}
                  onPress={() => handleTabPress('/profile')}
                />
              </View>
              <View style={styles.bottomSafeArea} />
            </BlurView>
          </View>
        )}
        
        {/* Floating Run Tracker if a run is in progress */}
        {isTracking && isMinimized && (
          <FloatingRunTracker />
        )}
        
        {/* Floating Workout Tracker if a workout is in progress */}
        {isWorkoutActive && isWorkoutMinimized && (
          <FloatingWorkoutTracker />
        )}
        
        {/* Navigation Menu */}
        <NavigationMenu 
          visible={menuVisible} 
          onClose={() => setMenuVisible(false)} 
        />
      </View>
    </ScrollContext.Provider>
  );
}

// Root layout component that wraps the app with necessary providers
export default function AppLayout() {
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

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <ProfileProvider>
        <ProgramProvider>
          <RunTrackingProvider>
            <WorkoutProvider>
              <AppContent />
            </WorkoutProvider>
          </RunTrackingProvider>
        </ProgramProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}
