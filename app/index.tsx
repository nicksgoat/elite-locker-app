import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to our tabs index where we have the iMessage UI
  return <Redirect href="/(tabs)" />;
} 