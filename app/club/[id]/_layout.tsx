import { Stack } from 'expo-router';
import React from 'react';

/**
 * Club detail stack layout
 *
 * This layout defines the navigation stack for individual club pages.
 */
export default function ClubDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  );
}
