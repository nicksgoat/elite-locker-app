import { useTheme } from '@/components/design-system/ThemeProvider';
import { Stack } from 'expo-router';
import React from 'react';

/**
 * Training stack layout
 *
 * This layout defines the navigation stack for the training section of the app.
 */
export default function TrainingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="search" />
      <Stack.Screen name="category/[id]" />
    </Stack>
  );
}
