/**
 * Elite Locker Design System - View Component
 *
 * A themeable view component that supports various background colors.
 */

import React from 'react';
import { View as RNView, ViewProps as RNViewProps } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { spacing } from '../tokens';

// Background color types
export type BackgroundColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'card'
  | 'modal'
  | 'transparent'
  | string;

// Spacing types
export type SpacingKey = keyof typeof spacing.spacing;
export type BorderRadiusKey = keyof typeof spacing.layout.borderRadius;

// View props
export interface ViewProps extends RNViewProps {
  backgroundColor?: BackgroundColor;
  padding?: SpacingKey;
  margin?: SpacingKey;
  borderRadius?: BorderRadiusKey;
}

/**
 * View component
 *
 * A themeable view component that supports various background colors.
 *
 * @example
 * ```tsx
 * <View backgroundColor="primary" padding="lg">
 *   <Text>Hello World</Text>
 * </View>
 * ```
 */
export const View: React.FC<ViewProps> = ({
  backgroundColor = 'transparent',
  padding,
  margin,
  borderRadius,
  style,
  ...rest
}) => {
  const { colors, spacing } = useTheme();

  // Get background color from theme
  const bgColor = backgroundColor === 'transparent'
    ? 'transparent'
    : backgroundColor in colors.background
      ? colors.background[backgroundColor as keyof typeof colors.background]
      : backgroundColor;

  // Get padding from spacing tokens
  const paddingValue = padding ? spacing.spacing[padding] : undefined;

  // Get margin from spacing tokens
  const marginValue = margin ? spacing.spacing[margin] : undefined;

  // Get border radius from layout tokens
  const borderRadiusValue = borderRadius
    ? spacing.layout.borderRadius[borderRadius]
    : undefined;

  return (
    <RNView
      style={[
        {
          backgroundColor: bgColor,
          padding: paddingValue,
          margin: marginValue,
          borderRadius: borderRadiusValue,
        },
        style,
      ]}
      {...rest}
    />
  );
};

export default View;
