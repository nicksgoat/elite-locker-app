import { View } from '@/components/design-system/primitives/View';
import { useThemeColor } from '@/hooks/useThemeColor';
import { type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View backgroundColor={backgroundColor} style={style} {...otherProps} />;
}
