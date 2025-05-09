import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

// Import design system components
import { Text, View } from '@/components/design-system/primitives';
import { IconSymbol } from '@/components/design-system/primitives/IconSymbol';
import { useTheme } from '@/components/design-system/ThemeProvider';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors, spacing } = useTheme();

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          color="primary"
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <Text variant="bodySemiBold" color="primary">{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

// Import design system tokens
const { spacing } = require('@/components/design-system/tokens');

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spacing.xs,
  },
  content: {
    marginTop: spacing.spacing.xs,
    marginLeft: spacing.spacing.xl,
  },
});
