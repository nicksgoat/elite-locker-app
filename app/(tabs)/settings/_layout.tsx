import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="offline-settings"
        options={{
          title: 'Offline Settings',
        }}
      />
      <Stack.Screen
        name="db"
        options={{
          title: 'Database Test',
        }}
      />
    </Stack>
  );
}
