import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Define the navigation items
const NAV_ITEMS = [
  {
    id: 'feed',
    icon: 'chatbubbles',
    outlineIcon: 'chatbubbles-outline',
    label: 'Messages',
    route: '/',
    color: '#0A84FF',
  },
  {
    id: 'workout',
    icon: 'barbell',
    outlineIcon: 'barbell-outline',
    label: 'Workouts',
    route: '/workout',
    color: '#34C759',
  },
  {
    id: 'explore',
    icon: 'compass',
    outlineIcon: 'compass-outline',
    label: 'Explore',
    route: '/explore',
    color: '#5AC8FA',
  },
  {
    id: 'clubs',
    icon: 'people',
    outlineIcon: 'people-outline',
    label: 'Clubs',
    route: '/clubs',
    color: '#FF9500',
  },
  {
    id: 'profile',
    icon: 'person',
    outlineIcon: 'person-outline',
    label: 'Profile',
    route: '/profile',
    color: '#AF52DE',
  },
];

// Simple BottomNavBar component
const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Handle navigation
  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  // Check if route is active
  const isRouteActive = (route: string): boolean => {
    // Special case for root path
    if (route === '/' && pathname === '/') return true;
    // For other routes, check if the pathname starts with the route (excluding root)
    if (route !== '/' && pathname?.startsWith(route)) return true;
    return false;
  };

  return (
    <View style={[styles.navContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.navContent}>
        {NAV_ITEMS.map((item) => {
          const isActive = isRouteActive(item.route);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navButton}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? item.icon as any : item.outlineIcon as any}
                size={24}
                color={isActive ? item.color : '#8E8E93'}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: isActive ? item.color : '#8E8E93' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
    zIndex: 100,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 4,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '500',
  },
});

export default BottomNavBar;