import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import SimpleBottomNavBar from './SimpleBottomNavBar';

// Define nav items
const NAV_ITEMS = [
  {
    id: 'home',
    icon: 'home',
    outlineIcon: 'home-outline',
    label: 'Home',
    route: '/',
  },
  {
    id: 'workouts',
    icon: 'barbell',
    outlineIcon: 'barbell-outline',
    label: 'Workouts',
    route: '/workouts',
  },
  {
    id: 'programs',
    icon: 'calendar',
    outlineIcon: 'calendar-outline',
    label: 'Programs',
    route: '/programs',
  },
  {
    id: 'social',
    icon: 'people',
    outlineIcon: 'people-outline',
    label: 'Social',
    route: '/social',
  },
  {
    id: 'marketplace',
    icon: 'cart',
    outlineIcon: 'cart-outline',
    label: 'Marketplace',
    route: '/marketplace',
  },
  {
    id: 'profile',
    icon: 'person',
    outlineIcon: 'person-outline',
    label: 'Profile',
    route: '/profile',
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
  hideNavBar?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  hideNavBar = false,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={[styles.container, { paddingBottom: hideNavBar ? 0 : insets.bottom }]}>
      {children}
      
      {!hideNavBar && (
        <View style={{ paddingBottom: insets.bottom }}>
          <SimpleBottomNavBar />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default AppLayout;