import { useTheme } from '@/components/design-system/ThemeProvider';
import { Stack } from 'expo-router';
import React from 'react';

/**
 * Exercise stack layout
 *
 * This layout defines the navigation stack for the exercise section of the app.
 */
export default function ExerciseLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="detail/[id]" />
    </Stack>
  );
}
