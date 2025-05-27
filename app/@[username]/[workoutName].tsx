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

// This component handles social share URLs in format /@username/workoutName
// and redirects to the appropriate workout detail screen
export default function SocialWorkoutLinkHandler() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { username, workoutName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  console.log('SocialWorkoutLinkHandler mounted with params:', { username, workoutName });

  useEffect(() => {
    console.log('useEffect triggered with:', { username, workoutName });
    handleSocialLink();
  }, [username, workoutName]);

  const handleSocialLink = async () => {
    try {
      setLoading(true);
      
      // Extract username (remove @ if present)
      const cleanUsername = (username as string)?.replace('@', '') || '';
      const cleanWorkoutName = workoutName as string || '';
      
      console.log('Handling social link:', { cleanUsername, cleanWorkoutName });
      
      // In production, you would:
      // 1. Query your backend to find the workout by username and workout name
      // 2. Get the actual workout ID
      // 3. Redirect to the workout detail screen
      
      // For now, we'll simulate this with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock workout lookup - in production this would be a real API call
      const workoutMapping: Record<string, Record<string, string>> = {
        'devonallen': {
          'UpperHypertrophy': 'workout_123',
          'LowerHypertrophy': 'workout_456',
          'OlympicHurdleTraining': 'workout_789',
          'NFLRouteRunning': 'workout_890',
          'TrackFieldPowerSession': 'workout_901'
        },
        'sarahfit': {
          'PushDay': 'workout_234',
          'HIITCircuit': 'workout_345',
          'FullBodyStrength': 'workout_567'
        },
        'mikefit': {
          'StrengthFundamentals': 'workout_678',
          'ChestTricepsPower': 'workout_987'
        }
      };
      
      const workoutId = workoutMapping[cleanUsername]?.[cleanWorkoutName];
      
      if (workoutId) {
        // Redirect to workout detail screen with the found workout ID
        router.replace(`/workout/detail/${workoutId}`);
      } else {
        // Workout not found, show error
        Alert.alert(
          'Workout Not Found',
          `Could not find workout "${cleanWorkoutName}" by @${cleanUsername}`,
          [
            { text: 'Browse Workouts', onPress: () => router.push('/(tabs)/training') },
            { text: 'Go Home', onPress: () => router.push('/(tabs)') }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error handling social link:', error);
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
            @{username}/{workoutName}
          </Text>
        </View>
      </View>
    );
  }

  // This should never render as we redirect immediately
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