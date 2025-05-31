import { useWorkout } from '@/contexts/WorkoutContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkoutPurchase } from '../../contexts/WorkoutPurchaseContext';

const { width, height } = Dimensions.get('window');

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  restTime?: number;
  notes?: string;
}

export default function WorkoutRunScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workoutId, purchased } = useLocalSearchParams();
  const { startQuickWorkout } = useWorkout();
  const { isPurchased } = useWorkoutPurchase();

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchasedWorkout();
  }, []);

  const loadPurchasedWorkout = async () => {
    // Verify purchase
    if (!isPurchased(workoutId as string)) {
      Alert.alert('Access Denied', 'You need to purchase this workout first.');
      router.back();
      return;
    }

    try {
      setLoading(true);

      // Load full workout data (only available to purchasers)
      const fullWorkoutExercises: WorkoutExercise[] = [
        {
          id: '1',
          name: 'Barbell Bench Press',
          sets: 3,
          reps: '8',
          weight: 135,
          restTime: 90,
          notes: 'Focus on chest contraction'
        },
        {
          id: '2',
          name: 'Incline Dumbbell Press',
          sets: 3,
          reps: '10',
          weight: 70,
          restTime: 90,
          notes: 'Squeeze at the top'
        },
        {
          id: '3',
          name: 'Cable Flyes',
          sets: 3,
          reps: '12',
          weight: 50,
          restTime: 60,
          notes: 'Feel the stretch'
        }
      ];

      setExercises(fullWorkoutExercises);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Convert to workout format and start
    const workoutExercises = exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      sets: exercise.sets,
      targetReps: exercise.reps,
      restTime: exercise.restTime || 90,
    }));

    await startQuickWorkout(workoutExercises);
    router.replace('/workout/active');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading full workout...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Full Workout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Badge */}
        <View style={styles.premiumBadge}>
          <BlurView intensity={20} style={styles.premiumBlur}>
            <View style={styles.premiumContent}>
              <Ionicons name="diamond" size={24} color="#FFD700" />
              <Text style={styles.premiumText}>Premium Content Unlocked</Text>
            </View>
          </BlurView>
        </View>

        {/* Full Exercise List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Complete Workout</Text>
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseNumber}>{index + 1}</Text>
              </View>

              <Text style={styles.exerciseDetails}>
                {exercise.sets} sets × {exercise.reps} reps
              </Text>

              {exercise.weight && (
                <Text style={styles.exerciseWeight}>
                  Starting weight: {exercise.weight} lbs
                </Text>
              )}

              {exercise.notes && (
                <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
              )}

              <Text style={styles.restTime}>
                Rest: {exercise.restTime}s between sets
              </Text>
            </View>
          ))}
        </View>

        {/* Workout Instructions */}
        <View style={styles.instructionsSection}>
          <BlurView intensity={20} style={styles.instructionsBlur}>
            <View style={styles.instructionsContent}>
              <Ionicons name="information-circle" size={24} color="#0A84FF" />
              <Text style={styles.instructionsTitle}>Workout Instructions</Text>
              <Text style={styles.instructionsText}>
                • Warm up for 5-10 minutes before starting{'\n'}
                • Focus on proper form over heavy weight{'\n'}
                • Rest between sets as indicated{'\n'}
                • Track your progress for each exercise{'\n'}
                • Cool down and stretch after completion
              </Text>
            </View>
          </BlurView>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
        >
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  premiumBadge: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumBlur: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'center',
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exercisesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  exerciseNumber: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseDetails: {
    color: '#8E8E93',
    fontSize: 16,
    marginBottom: 4,
  },
  exerciseWeight: {
    color: '#0A84FF',
    fontSize: 14,
    marginBottom: 4,
  },
  exerciseNotes: {
    color: '#8E8E93',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  restTime: {
    color: '#30D158',
    fontSize: 12,
    fontWeight: '500',
  },
  instructionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  instructionsBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionsContent: {
    padding: 20,
  },
  instructionsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  instructionsText: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  startButton: {
    backgroundColor: '#30D158',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

// Dark map style for better visibility
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      },
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];