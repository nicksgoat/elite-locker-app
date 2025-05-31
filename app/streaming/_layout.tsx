import { Stack } from 'expo-router';

export default function StreamingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="settings" />
      <Stack.Screen name="twitch-auth" />
    </Stack>
  );
}
