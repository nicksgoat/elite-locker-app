import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkout } from '@/contexts/WorkoutContext';
import { fetchData } from '@/lib/api';

interface PreviousWorkout {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  duration: number;
  exercises: WorkoutExercise[];
  total_volume: number;
  total_sets: number;
}

interface WorkoutExercise {
  id: string;
  exercise: {
    id: string;
    name: string;
  };
  sets: ExerciseSet[];
}

interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

export default function RepeatSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startRepeatWorkout } = useWorkout();
  
  const [workouts, setWorkouts] = useState<PreviousWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

  useEffect(() => {
    loadPreviousWorkouts();
  }, []);

  const loadPreviousWorkouts = async () => {
    try {
      setLoading(true);
      
      // Fetch previous workouts from database
      const workoutsData = await fetchData('workouts', {
        select: `
          *,
          exercises:workout_exercises(
            *,
            exercise:exercises(*),
            sets:exercise_sets(*)
          )
        `,
        filters: { 
          end_time: { operator: 'is not', value: null } // Only completed workouts
        },
        orderBy: { column: 'start_time', ascending: false },
        limit: 20
      });

      setWorkouts(workoutsData || []);
    } catch (error) {
      console.error('Error loading previous workouts:', error);
      // Fallback to mock data
      setWorkouts([
        {
          id: 'workout_1',
          title: 'Push Day Workout',
          start_time: '2024-01-15T10:00:00Z',
          end_time: '2024-01-15T11:30:00Z',
          duration: 90,
          total_volume: 12500,
          total_sets: 15,
          exercises: [
            {
              id: '1',
              exercise: { id: '1', name: 'Bench Press' },
              sets: [
                { id: '1', weight: 185, reps: 8, completed: true },
                { id: '2', weight: 185, reps: 7, completed: true },
                { id: '3', weight: 185, reps: 6, completed: true }
              ]
            },
            {
              id: '2',
              exercise: { id: '2', name: 'Overhead Press' },
              sets: [
                { id: '4', weight: 135, reps: 8, completed: true },
                { id: '5', weight: 135, reps: 7, completed: true },
                { id: '6', weight: 135, reps: 6, completed: true }
              ]
            }
          ]
        },
        {
          id: 'workout_2',
          title: 'Pull Day Workout',
          start_time: '2024-01-13T14:00:00Z',
          end_time: '2024-01-13T15:15:00Z',
          duration: 75,
          total_volume: 9800,
          total_sets: 12,
          exercises: [
            {
              id: '3',
              exercise: { id: '3', name: 'Pull-ups' },
              sets: [
                { id: '7', weight: 0, reps: 12, completed: true },
                { id: '8', weight: 0, reps: 10, completed: true },
                { id: '9', weight: 0, reps: 8, completed: true }
              ]
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkout = (workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWorkout(workoutId);
  };

  const handleStartWorkout = async () => {
    if (!selectedWorkout) {
      Alert.alert('Select Workout', 'Please select a previous workout to repeat.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await startRepeatWorkout(selectedWorkout);
      router.push('/workout/active');
    } catch (error) {
      console.error('Error starting repeat workout:', error);
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderWorkout = (workout: PreviousWorkout) => (
    <TouchableOpacity
      key={workout.id}
      style={[
        styles.workoutCard,
        selectedWorkout === workout.id && styles.selectedWorkout
      ]}
      onPress={() => handleSelectWorkout(workout.id)}
      activeOpacity={0.8}
    >
      <BlurView intensity={30} tint="dark" style={styles.workoutBlur}>
        <View style={styles.workoutContent}>
          <View style={styles.workoutHeader}>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutTitle}>{workout.title}</Text>
              <Text style={styles.workoutDate}>{formatDate(workout.start_time)}</Text>
            </View>
            
            <View style={styles.workoutStats}>
              <Text style={styles.statText}>{formatDuration(workout.duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          </View>

          <View style={styles.workoutDetails}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workout.total_sets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(workout.total_volume / 1000).toFixed(1)}k</Text>
              <Text style={styles.statLabel}>Volume (lbs)</Text>
            </View>
          </View>

          <View style={styles.exercisesList}>
            <Text style={styles.exercisesTitle}>Exercises</Text>
            {workout.exercises.slice(0, 3).map((exercise) => {
              const bestSet = exercise.sets.reduce((best, set) => 
                (set.weight * set.reps) > (best.weight * best.reps) ? set : best
              );
              
              return (
                <View key={exercise.id} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets.length} × {bestSet.weight > 0 ? `${bestSet.weight}lb` : `${bestSet.reps} reps`}
                  </Text>
                </View>
              );
            })}
            {workout.exercises.length > 3 && (
              <Text style={styles.moreExercises}>
                +{workout.exercises.length - 3} more exercises
              </Text>
            )}
          </View>

          {selectedWorkout === workout.id && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#32D74B" />
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Repeat Workout',
          headerShown: false,
        }}
      />
      
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Repeat Workout</Text>
            <Text style={styles.subtitle}>
              Choose a previous workout to repeat exactly
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading workout history...</Text>
            </View>
          ) : workouts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyTitle}>No Previous Workouts</Text>
              <Text style={styles.emptyText}>
                Complete some workouts first to use the repeat feature
              </Text>
            </View>
          ) : (
            <View style={styles.workoutsContainer}>
              {workouts.map(renderWorkout)}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              !selectedWorkout && styles.startButtonDisabled
            ]}
            onPress={handleStartWorkout}
            disabled={!selectedWorkout}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.startButtonText,
              !selectedWorkout && styles.startButtonTextDisabled
            ]}>
              Repeat Workout
            </Text>
            <Ionicons 
              name="repeat-outline" 
              size={20} 
              color={selectedWorkout ? "#FFFFFF" : "#666666"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  workoutsContainer: {
    paddingBottom: 20,
  },
  workoutCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedWorkout: {
    borderWidth: 2,
    borderColor: '#32D74B',
  },
  workoutBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutContent: {
    padding: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutInfo: {
    flex: 1,
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32D74B',
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  exercisesList: {
    marginBottom: 12,
  },
  exercisesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 14,
    color: '#AEAEB2',
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#32D74B',
    fontWeight: '500',
  },
  moreExercises: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#32D74B',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#1C1C1E',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  startButtonTextDisabled: {
    color: '#666666',
  },
});
