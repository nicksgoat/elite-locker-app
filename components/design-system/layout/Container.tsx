/**
 * Elite Locker Design System - Container Component
 * 
 * A responsive container component that provides consistent horizontal padding
 * across different screen sizes.
 */

import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Calculate responsive horizontal padding based on screen width
const getResponsiveHorizontalPadding = () => {
  // For larger devices (iPad, larger iPhones), use proportional padding
  if (screenWidth >= 428) { // iPhone 13/14 Pro Max width
    return Math.max(20, Math.min(32, screenWidth * 0.06)); // 6% of screen width
  } else if (screenWidth >= 414) { // iPhone 11 Pro Max, 12 Pro Max
    return Math.max(16, Math.min(28, screenWidth * 0.055)); // 5.5% of screen width
  }
  // For smaller devices, use fixed padding
  return 16;
};

interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
  includeSafeArea?: boolean;
  includeSafeAreaTop?: boolean;
  includeSafeAreaBottom?: boolean;
  includeSafeAreaLeft?: boolean;
  includeSafeAreaRight?: boolean;
}

/**
 * Container component
 * 
 * A responsive container component that provides consistent horizontal padding
 * across different screen sizes.
 * 
 * @example
 * ```tsx
 * <Container>
 *   <Text>Content with consistent horizontal padding</Text>
 * </Container>
 * 
 * <Container fullWidth>
 *   <Text>Full width content</Text>
 * </Container>
 * 
 * <Container includeSafeArea>
 *   <Text>Content with safe area insets</Text>
 * </Container>
 * ```
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  fullWidth = false,
  includeSafeArea = false,
  includeSafeAreaTop = false,
  includeSafeAreaBottom = false,
  includeSafeAreaLeft = false,
  includeSafeAreaRight = false,
}) => {
  const insets = useSafeAreaInsets();
  
  // Calculate padding based on safe area settings
  const padding = {
    paddingTop: (includeSafeArea || includeSafeAreaTop) ? insets.top : 0,
    paddingBottom: (includeSafeArea || includeSafeAreaBottom) ? insets.bottom : 0,
    paddingLeft: (includeSafeArea || includeSafeAreaLeft) ? insets.left : 0,
    paddingRight: (includeSafeArea || includeSafeAreaRight) ? insets.right : 0,
    paddingHorizontal: fullWidth ? 0 : getResponsiveHorizontalPadding(),
  };
  
  return (
    <View style={[styles.container, padding, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Container;
