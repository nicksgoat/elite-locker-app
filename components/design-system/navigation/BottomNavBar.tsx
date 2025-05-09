/**
 * Elite Locker Design System - BottomNavBar Component
 *
 * A bottom navigation bar component for app-wide navigation.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// NavItem interface
export interface NavItem {
  id: string;
  icon: string;
  outlineIcon: string;
  label: string;
  route: string;
  color?: string;
}

// BottomNavBar props
export interface BottomNavBarProps {
  items: NavItem[];
  style?: ViewStyle;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
  onItemPress?: (route: string) => void;
}

const { width } = Dimensions.get('window');

/**
 * BottomNavBar component
 *
 * A bottom navigation bar component for app-wide navigation.
 *
 * @example
 * ```tsx
 * <BottomNavBar
 *   items={[
 *     {
 *       id: 'feed',
 *       icon: 'chatbubbles',
 *       outlineIcon: 'chatbubbles-outline',
 *       label: 'Messages',
 *       route: '/',
 *     },
 *     // ... more items
 *   ]}
 * />
 * ```
 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  items = [],
  style,
  blurIntensity = 80,
  blurTint = 'dark',
  onItemPress,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  // Handle navigation
  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onItemPress) {
      onItemPress(route);
    } else {
      router.push(route as any);
    }
  };

  // Check if route is active
  const isRouteActive = (route: string): boolean => {
    // Special case for root path
    if (route === '/' && pathname === '/') return true;
    // For other routes, check if the pathname starts with the route (excluding root)
    if (route !== '/' && pathname?.startsWith(route)) return true;
    return false;
  };

  // Get icon color based on active state and item id
  const getIconColor = (isActive: boolean, itemId: string): string => {
    // If not active, return secondary color
    if (!isActive) return colors.light.icon.secondary;

    // Make sure items is an array
    if (!Array.isArray(items)) {
      return colors.palette.blue500; // Default active color
    }

    // Find the item to get its custom color if available
    const item = items.find(item => item && item.id === itemId);
    if (item && item.color) return item.color;

    // Default active color
    return colors.palette.blue500;
  };

  // Make sure items is an array and has items
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <BlurView
      intensity={blurIntensity}
      tint={blurTint}
      style={[styles.navContainer, style]}
    >
      <View style={styles.navContent}>
        {safeItems.map((item) => {
          // Skip rendering if item is missing required properties
          if (!item || !item.id || !item.route || !item.label || !item.icon || !item.outlineIcon) {
            console.warn('BottomNavBar: Item is missing required properties', item);
            return null;
          }

          const isActive = isRouteActive(item.route);
          const iconColor = getIconColor(isActive, item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navButton}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={isActive ? item.icon as any : item.outlineIcon as any}
                size={24}
                color={iconColor}
              />
              <Text
                variant="labelSmall"
                style={[
                  styles.navLabel,
                  { color: iconColor },
                  !isActive && styles.navLabelInactive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Extra padding for iPhone home indicator */}
      <View style={{ height: insets.bottom }} />
    </BlurView>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(60, 60, 67, 0.29)',
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
  navLabelInactive: {
    opacity: 0.8,
  },
});

export default BottomNavBar;
