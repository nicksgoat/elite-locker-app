import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// This component handles social share URLs in format /user/username/workoutName
// and redirects to the appropriate workout detail screen
export default function UserWorkoutLinkHandler() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { username, workoutName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  console.log('UserWorkoutLinkHandler mounted with params:', { username, workoutName });

  useEffect(() => {
    console.log('useEffect triggered with:', { username, workoutName });
    handleUserWorkoutLink();
  }, [username, workoutName]);

  const handleUserWorkoutLink = async () => {
    try {
      setLoading(true);
      
      const cleanUsername = username as string || '';
      const cleanWorkoutName = workoutName as string || '';
      
      console.log('Handling user workout link:', { cleanUsername, cleanWorkoutName });
      
      // Simulate API lookup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock workout lookup
      const workoutMapping: Record<string, Record<string, string>> = {
        'devonallen': {
          'UpperHypertrophy': 'workout_123',
          'LowerHypertrophy': 'workout_456',
          'OlympicHurdleTraining': 'workout_789',
        },
        'sarahfit': {
          'PushDay': 'workout_234',
          'HIITCircuit': 'workout_345',
        }
      };
      
      const workoutId = workoutMapping[cleanUsername]?.[cleanWorkoutName];
      
      console.log('Found workout ID:', workoutId);
      
      if (workoutId) {
        console.log('Redirecting to workout detail:', `/workout/detail/${workoutId}`);
        router.replace(`/workout/detail/${workoutId}`);
      } else {
        console.log('Workout not found');
        Alert.alert(
          'Workout Not Found',
          `Could not find workout "${cleanWorkoutName}" by ${cleanUsername}`,
          [
            { text: 'Browse Workouts', onPress: () => router.push('/(tabs)/training') },
            { text: 'Go Home', onPress: () => router.push('/(tabs)') }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error handling user workout link:', error);
      Alert.alert(
        'Error',
        'Failed to load workout. Please try again.',
        [
          { text: 'Go Home', onPress: () => router.push('/(tabs)') }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading workout...</Text>
          <Text style={styles.loadingSubtext}>
            {username}/{workoutName}
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
}); 