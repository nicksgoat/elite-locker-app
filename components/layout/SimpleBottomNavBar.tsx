import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

// Define navigation options with icons
const NAV_OPTIONS = [
  {
    label: 'Home',
    path: '/(tabs)/',
    icon: 'home',
    outlineIcon: 'home-outline'
  },
  {
    label: 'Training',
    path: '/(tabs)/training',
    icon: 'fitness',
    outlineIcon: 'fitness-outline'
  },
  {
    label: 'Social',
    path: '/(tabs)/social',
    icon: 'people',
    outlineIcon: 'people-outline'
  },
  {
    label: 'Profile',
    path: '/(tabs)/profile',
    icon: 'person',
    outlineIcon: 'person-outline'
  },
];

/**
 * iOS iMessage-styled bottom navigation bar with glassmorphism effect
 */
export default function SimpleBottomNavBar() {
  return (
    <ErrorBoundary
      fallback={
        <View style={styles.container}>
          <Text style={styles.errorText}>Navigation Error</Text>
        </View>
      }
    >
      <SimpleNavBarContent />
    </ErrorBoundary>
  );
}

function SimpleNavBarContent() {
  const router = useRouter();
  const pathname = usePathname() || '';

  // Animation values for each tab
  const tabAnimations = NAV_OPTIONS.map(() => useSharedValue(0));
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  // Navigation handler with haptic feedback and animation
  const navigate = (path: string, index: number) => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Animate all tabs
      tabAnimations.forEach((anim, i) => {
        anim.value = withTiming(i === index ? 1 : 0, { duration: 300 });
      });

      // Use router.replace instead of push to avoid stacking navigation
      router.replace(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Log additional context for debugging
      console.log('Current pathname:', pathname);
      console.log('Attempted navigation to:', path);
    }
  };

  // Set initial active tab animation
  useEffect(() => {
    NAV_OPTIONS.forEach((option, index) => {
      let isActive = false;

      // Check if this tab is active
      if (option.path === '/(tabs)/' && (pathname === '/(tabs)/' || pathname === '/')) {
        isActive = true;
      } else if (option.path !== '/(tabs)/' && pathname.startsWith(option.path)) {
        isActive = true;
      }

      // Set animation value
      if (isActive) {
        tabAnimations[index].value = 1;
      }
    });
  }, [pathname]);

  return (
    <View style={styles.outerContainer}>
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        {/* Subtle gradient overlay for enhanced glassmorphism */}
        <View style={styles.gradientOverlay} />
        <View style={styles.container}>
          {NAV_OPTIONS.map((option, index) => {
            // Determine if this tab is active
            let isActive = false;
            try {
              if (option.path === '/(tabs)/' && (pathname === '/(tabs)/' || pathname === '/')) {
                isActive = true;
              } else if (option.path !== '/(tabs)/' && pathname.startsWith(option.path)) {
                isActive = true;
              }
            } catch (error) {
              console.error('Path matching error:', error);
            }

            // Create animated styles for this tab
            const animatedIconStyle = useAnimatedStyle(() => {
              const scale = interpolate(
                tabAnimations[index].value,
                [0, 1],
                [1, 1.2],
                Extrapolate.CLAMP
              );

              return {
                transform: [{ scale }]
              };
            });

            const animatedTextStyle = useAnimatedStyle(() => {
              const opacity = interpolate(
                tabAnimations[index].value,
                [0, 1],
                [0.7, 1],
                Extrapolate.CLAMP
              );

              return {
                opacity
              };
            });

            return (
              <TouchableOpacity
                key={option.label}
                style={styles.tab}
                onPress={() => navigate(option.path, index)}
                activeOpacity={0.7}
                accessibilityLabel={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                  <Ionicons
                    name={isActive ? option.icon : option.outlineIcon}
                    size={28}
                    color={isActive ? '#FFFFFF' : '#9BA1A6'}
                  />
                </Animated.View>

                {/* Animated active indicator - always render but animate visibility */}
                <Animated.View
                  style={[
                    styles.activeIndicator,
                    useAnimatedStyle(() => ({
                      width: withTiming(isActive ? 30 : 0, { duration: 300 }),
                      opacity: withTiming(isActive ? 1 : 0, { duration: 200 })
                    }))
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

const styles = StyleSheet.create({
  outerContainer: {
    overflow: 'hidden',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Add elevation for Android
    elevation: 10,
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.3)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  container: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    height: '100%',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: TAB_WIDTH,
    height: '100%',
    position: 'relative',
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    top: 42, // Position below the icon
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0A84FF',
    // Add a subtle glow effect
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    padding: 10,
    textAlign: 'center',
  },
});