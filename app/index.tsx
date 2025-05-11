import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to our training tab
  return <Redirect href="/(tabs)/training" />;
}