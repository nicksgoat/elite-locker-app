import { Text } from '@/components/design-system/primitives/Text';
import { useThemeColor } from '@/hooks/useThemeColor';
import { type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

// Map old types to new design system variants
const typeToVariantMap = {
  default: 'body',
  title: 'h1',
  defaultSemiBold: 'bodySemiBold',
  subtitle: 'h3',
  link: 'link',
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Map the old type to the new variant
  const variant = typeToVariantMap[type as keyof typeof typeToVariantMap] || 'body';

  return (
    <Text
      variant={variant}
      color={color}
      style={style}
      {...rest}
    />
  );
}
