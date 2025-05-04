import { Stack } from 'expo-router';

export default function ExercisesLayout() {
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
      <Stack.Screen name="detail/[id]" />
      <Stack.Screen name="create" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
} 