/**
 * Elite Locker Design System - Button Component
 * 
 * A themeable button component that supports various styles.
 */

import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';
import Text from './Text';

// Button variants
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'outline' 
  | 'ghost'
  | 'gradient'
  | 'blur';

// Button sizes
export type ButtonSize = 'sm' | 'md' | 'lg';

// Button props
export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  leftIcon?: string;
  rightIcon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  gradientColors?: string[];
  blurIntensity?: number;
  blurTint?: 'light' | 'dark' | 'default';
  onPress?: () => void;
}

/**
 * Button component
 * 
 * A themeable button component that supports various styles.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" label="Press me" onPress={() => {}} />
 * <Button variant="outline" label="Cancel" leftIcon="close-outline" onPress={() => {}} />
 * <Button variant="gradient" label="Get Started" gradientColors={['#0A84FF', '#0066CC']} />
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  label,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  gradientColors,
  blurIntensity = 20,
  blurTint = 'dark',
  style,
  onPress,
  ...rest
}) => {
  const { colors, spacing } = useTheme();
  
  // Handle press with haptic feedback
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Call onPress handler
    if (onPress) onPress();
  };
  
  // Get button height based on size
  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'lg': return 56;
      case 'md':
      default: return 44;
    }
  };
  
  // Get button padding based on size
  const getPadding = () => {
    switch (size) {
      case 'sm': return spacing.spacing.md;
      case 'lg': return spacing.spacing.xl;
      case 'md':
      default: return spacing.spacing.lg;
    }
  };
  
  // Get icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 24;
      case 'md':
      default: return 20;
    }
  };
  
  // Get text variant based on button size
  const getTextVariant = () => {
    switch (size) {
      case 'sm': return 'buttonSmall';
      case 'lg':
      case 'md':
      default: return 'button';
    }
  };
  
  // Get button styles based on variant
  const getButtonStyles = () => {
    const height = getHeight();
    const horizontalPadding = getPadding();
    
    const baseStyle = {
      height,
      paddingHorizontal: horizontalPadding,
      borderRadius: height / 2,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined,
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.brand.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.background.tertiary,
        };
      case 'tertiary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'gradient':
      case 'blur':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          overflow: 'hidden',
        };
      default:
        return baseStyle;
    }
  };
  
  // Get text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'inverse';
      case 'secondary':
        return 'primary';
      case 'tertiary':
      case 'outline':
      case 'ghost':
        return 'primary';
      case 'gradient':
      case 'blur':
        return 'inverse';
      default:
        return 'primary';
    }
  };
  
  // Get icon color based on variant
  const getIconColor = () => {
    const textColor = getTextColor();
    return colors.text[textColor as keyof typeof colors.text];
  };
  
  // Render button content
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getIconColor()} 
          style={styles.loader} 
        />
      ) : (
        <>
          {leftIcon && (
            <Ionicons 
              name={leftIcon as any} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.leftIcon} 
            />
          )}
          
          {label && (
            <Text 
              variant={getTextVariant()} 
              color={getTextColor()}
              style={styles.label}
            >
              {label}
            </Text>
          )}
          
          {rightIcon && (
            <Ionicons 
              name={rightIcon as any} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.rightIcon} 
            />
          )}
        </>
      )}
    </>
  );
  
  // Render button based on variant
  if (variant === 'gradient' && gradientColors) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled || loading}
        onPress={handlePress}
        style={[getButtonStyles(), style]}
        {...rest}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  if (variant === 'blur') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled || loading}
        onPress={handlePress}
        style={[getButtonStyles(), style]}
        {...rest}
      >
        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={styles.blurContainer}
        >
          {renderContent()}
        </BlurView>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={handlePress}
      style={[getButtonStyles(), style]}
      {...rest}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  loader: {
    marginHorizontal: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  label: {
    textAlign: 'center',
  },
});

export default Button;
