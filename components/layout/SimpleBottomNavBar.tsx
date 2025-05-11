import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

/**
 * Enhanced bottom navigation bar with glassmorphism styling
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

  // Define navigation options with icons
  const navOptions = [
    { label: 'Home', path: '/(tabs)/', icon: 'home', outlineIcon: 'home-outline' },
    { label: 'Workouts', path: '/(tabs)/workouts', icon: 'barbell', outlineIcon: 'barbell-outline' },
    { label: 'Programs', path: '/(tabs)/programs', icon: 'calendar', outlineIcon: 'calendar-outline' },
    { label: 'Social', path: '/(tabs)/social', icon: 'people', outlineIcon: 'people-outline' },
    { label: 'Profile', path: '/(tabs)/profile', icon: 'person', outlineIcon: 'person-outline' },
  ];

  // Navigation handler with haptic feedback
  const navigate = (path: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Use router.replace instead of push to avoid stacking navigation
      router.replace(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
      console.log('Current pathname:', pathname);
      console.log('Attempted navigation to:', path);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
        <View style={styles.container}>
          {navOptions.map((option) => {
            // Determine if tab is active
            let isActive = false;
            try {
              if (option.path === '/(tabs)/' && (pathname === '/(tabs)/' || pathname === '/')) {
                isActive = true;
              } 
              else if (option.path !== '/(tabs)/' && pathname.startsWith(option.path)) {
                isActive = true;
              }
            } catch (error) {
              console.error('Path matching error:', error);
            }

            return (
              <TouchableOpacity
                key={option.label}
                style={styles.tab}
                onPress={() => navigate(option.path)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isActive ? option.icon : option.outlineIcon as any} 
                  size={24} 
                  color={isActive ? '#0A84FF' : '#9BA1A6'} 
                  style={styles.icon}
                />
                <Text style={[
                  styles.tabText,
                  isActive && styles.activeTabText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  blurContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  icon: {
    marginBottom: 3,
  },
  tabText: {
    color: '#9BA1A6',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    padding: 10,
    textAlign: 'center',
  },
}); 