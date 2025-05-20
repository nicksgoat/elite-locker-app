import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Types for our program workouts
interface ProgramExercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  percentage?: number;
  note?: string;
}

interface ProgramWorkout {
  id: string;
  title: string;
  week: number;
  day: number;
  exercises: ProgramExercise[];
  notes?: string;
}

// Mock data for program workouts
const mockWorkouts: { [key: string]: ProgramWorkout } = {
  'w1': {
    id: 'w1',
    title: 'Day 1: Upper Hypertrophy',
    week: 1,
    day: 1,
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '8-10 @70%', rest: 90, percentage: 70, note: 'Focus on chest contraction' },
      { name: 'Bent-Over Row', sets: 4, reps: '10-12 @65%', rest: 90, percentage: 65 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 60 },
      { name: 'Lat Pulldown', sets: 3, reps: '12-15', rest: 60 },
      { name: 'Lateral Raises', sets: 3, reps: '15-20', rest: 45 },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: 45 }
    ],
    notes: 'This workout focuses on upper body hypertrophy with a balance of pushing and pulling movements. The first two exercises use percentage-based loading off your training max.'
  },
  'w2': {
    id: 'w2',
    title: 'Day 2: Lower Hypertrophy',
    week: 1,
    day: 2,
    exercises: [
      { name: 'Back Squat', sets: 4, reps: '8-10 @70%', rest: 120, percentage: 70 },
      { name: 'Romanian Deadlift', sets: 3, reps: '8-10 @65%', rest: 90, percentage: 65 },
      { name: 'Leg Press', sets: 3, reps: '10-12', rest: 90 },
      { name: 'Leg Curl', sets: 3, reps: '12-15', rest: 60 },
      { name: 'Standing Calf Raise', sets: 4, reps: '15-20', rest: 45 }
    ],
    notes: 'Focus on form and tempo for all exercises. Keep rest periods strict between sets.'
  }
};

export default function WorkoutPreviewScreen() {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams();
  const workoutIdStr = Array.isArray(workoutId) ? workoutId[0] : workoutId;
  const [workout, setWorkout] = useState<ProgramWorkout | null>(null);
  const { startWorkout } = useWorkout();

  useEffect(() => {
    // In a real app, this would be an API call to get the workout details
    if (workoutIdStr && mockWorkouts[workoutIdStr]) {
      setWorkout(mockWorkouts[workoutIdStr]);
    }
  }, [workoutIdStr]);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (workout) {
      // Convert program exercises to workout exercises
      const exercises = workout.exercises.map((exercise, index) => ({
        id: `ex-${index}`,
        name: exercise.name,
        sets: exercise.sets,
        targetReps: exercise.reps,
        restTime: exercise.rest,
        note: exercise.note,
      }));

      // Start the workout with these exercises
      startWorkout(exercises);

      // Navigate to the active workout screen
      router.push('/workout/active');
    }
  };

  // Calculate approximate workout duration
  const calculateDuration = (workout: ProgramWorkout): number => {
    if (!workout) return 0;

    // Calculate total rest time
    const totalRestTime = workout.exercises.reduce((total, exercise) => {
      return total + (exercise.rest * (exercise.sets - 1));
    }, 0);

    // Approximate time for each set (in seconds)
    const timePerSet = 30;
    const totalSetTime = workout.exercises.reduce((total, exercise) => {
      return total + (timePerSet * exercise.sets);
    }, 0);

    // Total estimated time in minutes
    return Math.ceil((totalRestTime + totalSetTime) / 60);
  };

  if (!workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  const estimatedDuration = calculateDuration(workout);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Preview</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Workout Title and Meta */}
        <View style={styles.workoutHeaderContainer}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <Text style={styles.workoutMeta}>Week {workout.week} · Day {workout.day}</Text>

          <View style={styles.workoutMetaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#A0A0A0" />
              <Text style={styles.metaText}>~{estimatedDuration} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="barbell-outline" size={16} color="#A0A0A0" />
              <Text style={styles.metaText}>{workout.exercises.length} exercises</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="repeat-outline" size={16} color="#A0A0A0" />
              <Text style={styles.metaText}>{workout.exercises.reduce((total, ex) => total + ex.sets, 0)} sets</Text>
            </View>
          </View>

          {workout.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{workout.notes}</Text>
            </View>
          )}
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {workout.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseSpecsContainer}>
                  <Text style={styles.exerciseSpecs}>
                    {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'} • {exercise.reps}
                  </Text>
                  {exercise.percentage && (
                    <View style={styles.percentageBadge}>
                      <Text style={styles.percentageText}>{exercise.percentage}%</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.exerciseDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color="#A0A0A0" />
                  <Text style={styles.detailText}>{exercise.rest}s rest</Text>
                </View>

                {exercise.note && (
                  <View style={styles.detailItem}>
                    <Ionicons name="information-circle-outline" size={14} color="#A0A0A0" />
                    <Text style={styles.detailText}>{exercise.note}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Auto Progression Explanation */}
        <View style={styles.autoProgressContainer}>
          <View style={styles.autoProgressHeader}>
            <Ionicons name="trending-up" size={18} color="#0A84FF" />
            <Text style={styles.autoProgressTitle}>Auto-Progression</Text>
          </View>
          <Text style={styles.autoProgressText}>
            This workout contains percentage-based exercises that automatically calculate weight based on your training maxes. The program will automatically suggest increases to your training max when you exceed the prescribed reps.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Start Workout Button */}
      <View style={styles.floatingButtonContainer}>
        <BlurView intensity={80} tint="dark" style={styles.floatingButtonBlur}>
          <TouchableOpacity
            style={styles.floatingStartWorkoutButton}
            onPress={handleStartWorkout}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.floatingStartWorkoutText}>Start Workout</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderButton: {
    width: 36,
    height: 36,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  workoutHeaderContainer: {
    padding: 16,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 12,
  },
  workoutMetaContainer: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 6,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#A0A0A0',
    lineHeight: 18,
  },
  exercisesContainer: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  exerciseCard: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  exerciseHeader: {
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseSpecsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseSpecs: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  percentageBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  percentageText: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '600',
  },
  exerciseDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#A0A0A0',
    marginLeft: 6,
  },
  autoProgressContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  autoProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  autoProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
    marginLeft: 8,
  },
  autoProgressText: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 20,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  floatingButtonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingStartWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
  },
  floatingStartWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});