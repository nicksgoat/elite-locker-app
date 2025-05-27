import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import QuickAccessMenu from './QuickAccessMenu';

const { width } = Dimensions.get('window');

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused?: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

const TAB_ITEMS: TabItem[] = [
  {
    name: 'index',
    icon: 'home-outline',
    iconFocused: 'home',
    label: 'Home',
    route: '/(tabs)/',
  },
  {
    name: 'training',
    icon: 'barbell-outline',
    iconFocused: 'barbell',
    label: 'Training',
    route: '/(tabs)/training',
  },
  {
    name: 'social',
    icon: 'people-outline',
    iconFocused: 'people',
    label: 'Social',
    route: '/(tabs)/social',
  },
  {
    name: 'marketplace',
    icon: 'storefront-outline',
    iconFocused: 'storefront',
    label: 'Market',
    route: '/(tabs)/marketplace',
  },
  {
    name: 'profile',
    icon: 'person-outline',
    iconFocused: 'person',
    label: 'Profile',
    route: '/(tabs)/profile',
  },
];

// Secondary navigation items (accessible via swipe or long press)
const SECONDARY_ITEMS: TabItem[] = [
  {
    name: 'explore',
    icon: 'compass-outline',
    iconFocused: 'compass',
    label: 'Explore',
    route: '/(tabs)/explore',
  },
  {
    name: 'feed',
    icon: 'newspaper-outline',
    iconFocused: 'newspaper',
    label: 'Feed',
    route: '/(tabs)/feed',
  },
  {
    name: 'clubs',
    icon: 'people-circle-outline',
    iconFocused: 'people-circle',
    label: 'Clubs',
    route: '/(tabs)/clubs',
  },
  {
    name: 'progress',
    icon: 'analytics-outline',
    iconFocused: 'analytics',
    label: 'Progress',
    route: '/(tabs)/progress',
  },
];

interface CustomTabBarProps {
  visible?: boolean;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ visible = true }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  if (!visible) return null;

  const handleTabPress = (route: string, tabName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Clean up the route for proper navigation
    let cleanRoute = route;
    if (route === '/(tabs)/') {
      cleanRoute = '/';
    } else {
      cleanRoute = route.replace('/(tabs)', '');
    }
    
    console.log(`Navigating to: ${cleanRoute} from route: ${route}`);
    router.push(cleanRoute as any);
  };

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowQuickMenu(true);
  };

  const isActive = (route: string) => {
    // Handle home route specially
    if (route === '/(tabs)/') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    
    // Extract the route name from the full route
    const routeName = route.replace('/(tabs)/', '');
    
    // Check if current pathname contains the route name
    return pathname.includes(`/${routeName}`) || pathname.endsWith(`/${routeName}`);
  };

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <BlurView intensity={100} tint="dark" style={styles.tabBar}>
          <View style={styles.tabContainer}>
            {TAB_ITEMS.map((tab) => {
              const active = isActive(tab.route);
              const iconName = active && tab.iconFocused ? tab.iconFocused : tab.icon;

              return (
                <TouchableOpacity
                  key={tab.name}
                  style={styles.tabItem}
                  onPress={() => handleTabPress(tab.route, tab.name)}
                  activeOpacity={0.6}
                >
                  <View style={[styles.tabIconContainer, active && styles.activeTabIconContainer]}>
                    <Ionicons
                      name={iconName}
                      size={24}
                      color={active ? '#FFFFFF' : '#8E8E93'}
                    />
                  </View>
                  <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Secondary navigation access */}
          <View style={styles.secondaryIndicator}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuButtonContainer}>
                <View style={styles.dots}>
                  {SECONDARY_ITEMS.map((_, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.dot,
                        SECONDARY_ITEMS.some(item => isActive(item.route)) && styles.activeDot
                      ]} 
                    />
                  ))}
                </View>
                <Ionicons 
                  name="chevron-up" 
                  size={12} 
                  color="#8E8E93" 
                  style={styles.chevron}
                />
              </View>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      <QuickAccessMenu 
        visible={showQuickMenu}
        onClose={() => setShowQuickMenu(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  tabBar: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(84, 84, 88, 0.6)',
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeTabIconContainer: {
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryIndicator: {
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    alignItems: 'center',
  },
  menuButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  menuButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
    marginHorizontal: 1,
  },
  activeDot: {
    backgroundColor: '#0A84FF',
  },
  chevron: {
    marginLeft: 2,
  },
});

export default CustomTabBar; 