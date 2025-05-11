import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to our workouts tab which doesn't depend on date-fns
  return <Redirect href="/(tabs)/workouts" />;
} 