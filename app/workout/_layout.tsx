import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#000000',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="active" />
      <Stack.Screen name="run" />
      <Stack.Screen name="log-new" />
      <Stack.Screen name="share-workout" />
      <Stack.Screen name="detail/[id]" />
    </Stack>
  );
}
