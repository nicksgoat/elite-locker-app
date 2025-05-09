/**
 * Elite Locker Design System - Text Component
 * 
 * A themeable text component that supports various text styles.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeProvider';

// Text variant types based on typography tokens
export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'body' 
  | 'bodySemiBold' 
  | 'bodySmall' 
  | 'bodySmallSemiBold' 
  | 'label' 
  | 'labelSmall' 
  | 'link' 
  | 'button' 
  | 'buttonSmall';

// Text color types
export type TextColor = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'inverse' 
  | 'link' 
  | 'error' 
  | 'success' 
  | 'warning'
  | string;

// Text props
export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
  selectable?: boolean;
}

/**
 * Text component
 * 
 * A themeable text component that supports various text styles.
 * 
 * @example
 * ```tsx
 * <Text variant="h1" color="primary">Hello World</Text>
 * <Text variant="body" color="secondary">This is a paragraph</Text>
 * <Text variant="link" onPress={() => {}}>Click me</Text>
 * ```
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  align = 'auto',
  style,
  numberOfLines,
  selectable = false,
  ...rest
}) => {
  const { colors, typography } = useTheme();
  
  // Get text style from typography tokens
  const variantStyle = typography.textVariants[variant];
  
  // Get text color from theme
  const textColor = color in colors.text 
    ? colors.text[color as keyof typeof colors.text] 
    : color;
  
  return (
    <RNText
      style={[
        variantStyle,
        { color: textColor, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      selectable={selectable}
      {...rest}
    />
  );
};

export default Text;
