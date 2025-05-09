/**
 * Elite Locker Design System - Card Component
 * 
 * A base card component that can be used for various card types.
 */

import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../ThemeProvider';

// Card variants
export type CardVariant = 
  | 'default' 
  | 'elevated' 
  | 'outlined' 
  | 'blur' 
  | 'gradient';

// Card props
export interface CardProps extends TouchableOpacityProps {
  variant?: CardVariant;
  children: ReactNode;
  onPress?: () => void;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  contentStyle?: ViewStyle;
  disabled?: boolean;
}

/**
 * Card component
 * 
 * A base card component that can be used for various card types.
 * 
 * @example
 * ```tsx
 * <Card variant="default" onPress={() => {}}>
 *   <Text>Card content</Text>
 * </Card>
 * 
 * <Card variant="blur" blurIntensity={20} blurTint="dark">
 *   <Text>Blurred card content</Text>
 * </Card>
 * 
 * <Card 
 *   variant="gradient" 
 *   gradientColors={['#0A84FF', '#0066CC']}
 * >
 *   <Text>Gradient card content</Text>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  onPress,
  blurIntensity = 20,
  blurTint = 'dark',
  gradientColors = ['#000000', '#121212'],
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
  style,
  contentStyle,
  disabled = false,
  ...rest
}) => {
  const { colors, spacing } = useTheme();
  
  // Handle press with haptic feedback
  const handlePress = () => {
    if (disabled || !onPress) return;
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Call onPress handler
    onPress();
  };
  
  // Get card styles based on variant
  const getCardStyles = () => {
    const baseStyle = {
      borderRadius: spacing.layout.borderRadius.md,
      overflow: 'hidden' as const,
    };
    
    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          backgroundColor: colors.background.card,
        };
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.background.card,
          ...spacing.layout.shadow.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.background.card,
          borderWidth: spacing.layout.borderWidth.thin,
          borderColor: colors.border.primary,
        };
      case 'blur':
      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };
  
  // Get content styles
  const getContentStyles = () => {
    return {
      padding: spacing.spacing.lg,
    };
  };
  
  // Render card content
  const renderContent = () => (
    <View style={[getContentStyles(), contentStyle]}>
      {children}
    </View>
  );
  
  // Wrap with TouchableOpacity if onPress is provided
  const CardContainer = onPress ? TouchableOpacity : View;
  const touchableProps = onPress ? {
    activeOpacity: 0.8,
    onPress: handlePress,
    disabled,
  } : {};
  
  // Render card based on variant
  if (variant === 'blur') {
    return (
      <CardContainer
        style={[getCardStyles(), style]}
        {...touchableProps}
        {...rest}
      >
        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={styles.blurContainer}
        >
          {renderContent()}
        </BlurView>
      </CardContainer>
    );
  }
  
  if (variant === 'gradient') {
    return (
      <CardContainer
        style={[getCardStyles(), style]}
        {...touchableProps}
        {...rest}
      >
        <LinearGradient
          colors={gradientColors}
          start={gradientStart}
          end={gradientEnd}
          style={styles.gradientContainer}
        >
          {renderContent()}
        </LinearGradient>
      </CardContainer>
    );
  }
  
  return (
    <CardContainer
      style={[getCardStyles(), style]}
      {...touchableProps}
      {...rest}
    >
      {renderContent()}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    width: '100%',
    height: '100%',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
  },
});

export default Card;
