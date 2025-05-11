import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

/**
 * Ultra-simplified bottom navigation bar, using text labels only.
 * This is a minimal implementation to avoid any potential icon-related errors.
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

  // Define simple navigation options - match the routes in the app/(tabs) directory
  const navOptions = [
    { label: 'Home', path: '/(tabs)/' },
    { label: 'Workouts', path: '/(tabs)/workouts' },
    { label: 'Programs', path: '/(tabs)/programs' },
    { label: 'Social', path: '/(tabs)/social' },
    { label: 'Profile', path: '/(tabs)/profile' },
  ];

  // Simple navigation handler with error protection
  const navigate = (path: string) => {
    try {
      // Use router.replace instead of push to avoid stacking navigation
      router.replace(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Log additional context for debugging
      console.log('Current pathname:', pathname);
      console.log('Attempted navigation to:', path);
    }
  };

  return (
    <View style={styles.container}>
      {navOptions.map((option) => {
        // Simple active state determination
        let isActive = false;
        try {
          // Handle exact match for root path '/(tabs)/'
          if (option.path === '/(tabs)/' && (pathname === '/(tabs)/' || pathname === '/')) {
            isActive = true;
          } 
          // Handle other paths
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
            <View style={[
              styles.tabIndicator,
              isActive && styles.activeTabIndicator
            ]} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    paddingVertical: 12,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'transparent',
    marginBottom: 5,
  },
  activeTabIndicator: {
    backgroundColor: '#0A84FF',
  },
  tabText: {
    color: '#9BA1A6',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    padding: 10,
    textAlign: 'center',
  },
}); 