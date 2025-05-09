/**
 * Elite Locker Design System - IconSymbol Component
 * 
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */

import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';

// Icon mapping type
type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;

// Icon name type
type IconSymbolName = keyof typeof MAPPING;

// Icon color type
export type IconColor = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'inverse' 
  | 'active' 
  | 'error' 
  | 'success' 
  | 'warning'
  | string;

// Icon props
export interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color?: IconColor;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  // Add more mappings as needed
} as IconMapping;

/**
 * IconSymbol component
 * 
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * 
 * @example
 * ```tsx
 * <IconSymbol name="house.fill" size={24} color="primary" />
 * ```
 */
export const IconSymbol: React.FC<IconSymbolProps> = ({
  name,
  size = 24,
  color = 'primary',
  style,
  weight,
}) => {
  const { colors } = useTheme();
  
  // Get icon color from theme
  const iconColor = color in colors.icon 
    ? colors.icon[color as keyof typeof colors.icon] 
    : color;
  
  return (
    <MaterialIcons 
      color={iconColor} 
      size={size} 
      name={MAPPING[name]} 
      style={style} 
    />
  );
};

export default IconSymbol;
