import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function NewClub() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the create club screen
    router.replace('/club/create');
  }, [router]);

  return null;
} 