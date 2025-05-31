import { Stack } from 'expo-router';
import React from 'react';

/**
 * Club stack layout
 *
 * This layout defines the navigation stack for the club section of the app.
 */
export default function ClubLayout() {
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
