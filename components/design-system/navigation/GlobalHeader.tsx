/**
 * Elite Locker Design System - GlobalHeader Component
 *
 * A header component for navigation with title, back button, and optional right action.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// GlobalHeader props
export interface GlobalHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  leftAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  transparent?: boolean;
  style?: ViewStyle;
  titleAlign?: 'left' | 'center';
  onBackPress?: () => void;
}

/**
 * GlobalHeader component
 *
 * A header component for navigation with title, back button, and optional right action.
 *
 * @example
 * ```tsx
 * <GlobalHeader
 *   title="Workouts"
 *   showBackButton
 *   rightAction={{
 *     icon: "add",
 *     onPress: () => console.log("Add pressed")
 *   }}
 * />
 * ```
 */
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  rightAction,
  leftAction,
  transparent = false,
  style,
  titleAlign = 'center',
  onBackPress,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  // Handle back button press
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Handle right action press
  const handleRightActionPress = () => {
    if (rightAction?.onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      rightAction.onPress();
    }
  };

  // Handle left action press
  const handleLeftActionPress = () => {
    if (leftAction?.onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      leftAction.onPress();
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: transparent ? 'transparent' : (colors.dark?.background?.primary || '#000000'),
          },
          style,
        ]}
      >
        <View style={styles.headerContent}>
          {/* Left side - Back button or custom left action */}
          <View style={styles.leftContainer}>
            {showBackButton ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.7}
                accessibilityLabel="Back"
                accessibilityRole="button"
              >
                <Ionicons
                  name="chevron-back"
                  size={28}
                  color={colors.light?.icon?.primary || '#FFFFFF'}
                />
              </TouchableOpacity>
            ) : leftAction ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLeftActionPress}
                activeOpacity={0.7}
                accessibilityLabel={leftAction.accessibilityLabel || "Left action"}
                accessibilityRole="button"
              >
                <Ionicons
                  name={leftAction.icon as any}
                  size={24}
                  color={colors.light?.icon?.primary || '#FFFFFF'}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Center - Title */}
          <View
            style={[
              styles.titleContainer,
              titleAlign === 'left' ? styles.titleLeft : styles.titleCenter,
            ]}
          >
            <Text
              variant="h3"
              color="primary"
              numberOfLines={1}
              style={styles.title}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                variant="bodySmall"
                color="secondary"
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right side - Optional action */}
          <View style={styles.rightContainer}>
            {rightAction && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleRightActionPress}
                activeOpacity={0.7}
                accessibilityLabel={rightAction.accessibilityLabel || "Right action"}
                accessibilityRole="button"
              >
                <Ionicons
                  name={rightAction.icon as any}
                  size={24}
                  color={colors.light?.icon?.primary || '#FFFFFF'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleCenter: {
    alignItems: 'center',
  },
  titleLeft: {
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  title: {
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  actionButton: {
    padding: 4,
  },
});

export default GlobalHeader;
