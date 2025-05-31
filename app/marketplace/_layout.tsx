import { Stack } from 'expo-router';

export default function MarketplaceLayout() {
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
      <Stack.Screen name="workouts" />
      <Stack.Screen name="programs" />
      <Stack.Screen name="clubs" />
      <Stack.Screen name="profiles" />
      <Stack.Screen name="library" />
      <Stack.Screen name="search" />
      <Stack.Screen name="category/[id]" />
    </Stack>
  );
}
