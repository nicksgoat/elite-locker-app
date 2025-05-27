import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function WorkoutCreate() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the template create screen
    router.replace('/workout/template/create');
  }, [router]);

  return null;
} 