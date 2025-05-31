import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define tab configuration with fallbacks
const tabs = [
  {
    name: 'Home',
    path: '/(tabs)/',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
    fallbackIcon: 'help-circle-outline',
  },
  {
    name: 'Training',
    path: '/(tabs)/training',
    activeIcon: 'fitness',
    inactiveIcon: 'fitness-outline',
    fallbackIcon: 'help-circle-outline',
  },
  {
    name: 'Social',
    path: '/(tabs)/social',
    activeIcon: 'people',
    inactiveIcon: 'people-outline',
    fallbackIcon: 'help-circle-outline',
  },
  {
    name: 'Profile',
    path: '/(tabs)/profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
    fallbackIcon: 'help-circle-outline',
  },
];

/**
 * A robust bottom navigation bar with built-in error handling
 */
export default function BottomNavBar() {
  return (
    <ErrorBoundary
      fallback={
        <View style={styles.container}>
          <Text style={styles.errorText}>Navigation Error</Text>
        </View>
      }
    >
      <BottomNavBarContent />
    </ErrorBoundary>
  );
}

/**
 * The actual navigation bar content, separated to enable error boundary
 */
function BottomNavBarContent() {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // Attempt fallback to home route if navigation fails
      try {
        router.push('/(tabs)/' as any);
      } catch (innerError) {
        console.error('Fallback navigation error:', innerError);
      }
    }
  };

  const getTabIcon = (tab: typeof tabs[0] | undefined, isActive: boolean) => {
    const defaultIconName = 'help-circle-outline';
    const errorIconName = 'alert-circle-outline';
    const activeColor = '#0A84FF';
    const inactiveColor = '#9BA1A6';
    const errorColor = '#FF3B30';
    let iconToShow: string;

    if (!tab) {
      return <Ionicons name={errorIconName} size={24} color={errorColor} />;
    }

    try {
      const selectedIconName = isActive ? tab.activeIcon : tab.inactiveIcon;

      if (selectedIconName && typeof selectedIconName === 'string') {
        iconToShow = selectedIconName;
      } else if (tab.fallbackIcon && typeof tab.fallbackIcon === 'string') {
        iconToShow = tab.fallbackIcon;
      } else {
        iconToShow = defaultIconName;
      }

      return (
        <Ionicons
          name={iconToShow as any}
          size={24}
          color={isActive ? activeColor : inactiveColor}
        />
      );
    } catch (error) {
      console.error("Error in getTabIcon processing:", error, "Tab:", tab);
      const finalFallbackIcon = (tab.fallbackIcon && typeof tab.fallbackIcon === 'string') ? tab.fallbackIcon : errorIconName;
      return (
        <Ionicons
          name={finalFallbackIcon as any}
          size={24}
          color={errorColor}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        let isActive = false;
        try {
          if (typeof pathname === 'string' && typeof tab?.path === 'string') {
            isActive = pathname.startsWith(tab.path);
          } else {
            console.warn('Pathname or tab.path is not a string:', { pathname, tabPath: tab?.path });
          }
        } catch (error) {
          console.error('Path matching error:', error);
        }

        return (
          <TouchableOpacity
            key={tab?.name || `tab-${index}`}
            style={styles.tab}
            onPress={() => handleTabPress(tab?.path || '/(tabs)/')}
            activeOpacity={0.7}
          >
            {getTabIcon(tab, isActive)}
            <Text style={[
              styles.tabText,
              isActive && styles.activeTabText
            ]}>
              {tab?.name || 'Unknown'}
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
    backgroundColor: 'rgba(28, 28, 30, 0.9)', // Dark, semi-transparent
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 10,
    paddingTop: 10,
    height: 80,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    color: '#9BA1A6',
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    color: '#0A84FF',
    fontWeight: '500',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
  },
});