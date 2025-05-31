import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import components
import GlobalHeader from '@/components/ui/GlobalHeader';
import { useWorkout } from '@/contexts/WorkoutContext';

// Mock data for program workouts
const mockWorkouts: { [key: string]: ProgramWorkout } = {
  'w1': {
    id: 'w1',
    title: 'Day 1: Upper Hypertrophy',
    week: 1,
    day: 1,
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '8-10 @70%', rest: 90 },
      { name: 'Bent-Over Row', sets: 4, reps: '10-12 @65%', rest: 90 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 60 },
      { name: 'Lat Pulldown', sets: 3, reps: '12-15', rest: 60 },
      { name: 'Lateral Raises', sets: 3, reps: '15-20', rest: 45 },
      { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: 45 }
    ],
    programId: 'p1',
    programTitle: 'ELITE Power Building'
  },
  'w2': {
    id: 'w2',
    title: 'Day 2: Lower Hypertrophy',
    week: 1,
    day: 2,
    exercises: [
      { name: 'Back Squat', sets: 4, reps: '8-10 @70%', rest: 120 },
      { name: 'Romanian Deadlift', sets: 4, reps: '10-12 @65%', rest: 90 },
      { name: 'Leg Press', sets: 3, reps: '12-15', rest: 90 },
      { name: 'Walking Lunges', sets: 3, reps: '12 each leg', rest: 60 },
      { name: 'Leg Extensions', sets: 3, reps: '15-20', rest: 45 },
      { name: 'Standing Calf Raises', sets: 4, reps: '15-20', rest: 45 }
    ],
    programId: 'p1',
    programTitle: 'ELITE Power Building'
  }
};

// Types
interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number;
  completed?: boolean;
}

interface ProgramWorkout {
  id: string;
  title: string;
  week: number;
  day: number;
  exercises: Exercise[];
  programId?: string;
  programTitle?: string;
}

export default function ProgramWorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workout, setWorkout] = useState<ProgramWorkout | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(-1);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);

  // Import workout context
  const { startQuickWorkout } = useWorkout();

  // Animation values
  const completeButtonScale = useSharedValue(1);

  // Load workout data
  useEffect(() => {
    // In a real app, this would fetch from an API or database
    // For now, we'll use our mock workouts data
    const foundWorkout = mockWorkouts[id as string] || null;

    if (foundWorkout) {
      setWorkout(foundWorkout);
    }
  }, [id]);

  // Handle back press
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Handle exercise press
  const handleExercisePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveExerciseIndex(index);
  };

  // Handle exercise complete
  const handleExerciseComplete = (exerciseName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Add to completed exercises
    const newCompletedExercises = [...completedExercises];
    if (!newCompletedExercises.includes(exerciseName)) {
      newCompletedExercises.push(exerciseName);
    } else {
      // If already completed, remove it (toggle)
      const index = newCompletedExercises.indexOf(exerciseName);
      newCompletedExercises.splice(index, 1);
    }

    setCompletedExercises(newCompletedExercises);

    // Check if all exercises are completed
    if (workout && newCompletedExercises.length === workout.exercises.length) {
      setIsWorkoutComplete(true);
    } else {
      setIsWorkoutComplete(false);
    }
  };

  // Handle start workout
  const handleStartWorkout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (workout) {
      // Convert program exercises to workout exercises
      const exercises = workout.exercises.map((exercise, index) => ({
        id: `ex-${index}`,
        name: exercise.name,
        sets: exercise.sets,
        targetReps: exercise.reps,
        restTime: exercise.rest,
      }));

      // Start the workout with these exercises
      await startQuickWorkout(exercises);

      // Navigate to the active workout screen
      router.push('/workout/active');
    }
  };

  // Handle complete workout
  const handleCompleteWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);

    // Animate complete button
    completeButtonScale.value = withSpring(0.95, { damping: 10 }, () => {
      completeButtonScale.value = withSpring(1);
    });

    // In a real app, this would update the progress in the database
    Alert.alert(
      'Workout Completed!',
      'Great job! Your progress has been saved.',
      [
        {
          text: 'Start Workout',
          onPress: handleStartWorkout,
        },
        {
          text: 'View Program',
          onPress: () => {
            if (workout?.programId) {
              router.push(`/programs/progress/${workout.programId}`);
            }
          },
        },
        {
          text: 'Done',
          onPress: () => router.back(),
          style: 'default',
        },
      ]
    );
  };

  // Animated styles
  const completeButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: completeButtonScale.value }],
    };
  });

  if (!workout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader
          title="Workout"
          showBackButton
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader
        title={`Week ${workout.week} Day ${workout.day}`}
        showBackButton
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Workout Header */}
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          {workout.programTitle && (
            <Text style={styles.programTitle}>From: {workout.programTitle}</Text>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${workout.exercises.length > 0
                    ? (completedExercises.length / workout.exercises.length) * 100
                    : 0}%`
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedExercises.length}/{workout.exercises.length} exercises completed
          </Text>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          {workout.exercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.name);
            const isActive = activeExerciseIndex === index;

            return (
              <View key={`${exercise.name}-${index}`} style={styles.exerciseCard}>
                <TouchableOpacity
                  style={[
                    styles.exerciseHeader,
                    isActive && styles.exerciseHeaderActive,
                    isCompleted && styles.exerciseHeaderCompleted,
                  ]}
                  onPress={() => handleExercisePress(index)}
                  activeOpacity={0.8}
                >
                  <View style={styles.exerciseHeaderContent}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} sets × {exercise.reps}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.completeButton,
                      isCompleted && styles.completeButtonActive,
                    ]}
                    onPress={() => handleExerciseComplete(exercise.name)}
                  >
                    <Ionicons
                      name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
                      size={24}
                      color={isCompleted ? "#34C759" : "#FFFFFF"}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                {isActive && (
                  <View style={styles.exerciseDetails}>
                    <BlurView intensity={30} tint="dark" style={styles.exerciseDetailsBlur}>
                      <View style={styles.exerciseDetailsContent}>
                        <View style={styles.exerciseDetailRow}>
                          <Text style={styles.exerciseDetailLabel}>Sets:</Text>
                          <Text style={styles.exerciseDetailValue}>{exercise.sets}</Text>
                        </View>

                        <View style={styles.exerciseDetailRow}>
                          <Text style={styles.exerciseDetailLabel}>Reps:</Text>
                          <Text style={styles.exerciseDetailValue}>{exercise.reps}</Text>
                        </View>

                        <View style={styles.exerciseDetailRow}>
                          <Text style={styles.exerciseDetailLabel}>Rest:</Text>
                          <Text style={styles.exerciseDetailValue}>{exercise.rest}s</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.viewExerciseButton}
                          onPress={() => {
                            // In a real app, this would navigate to the exercise detail page
                            Alert.alert('View Exercise', `View details for ${exercise.name}`);
                          }}
                        >
                          <Text style={styles.viewExerciseButtonText}>View Exercise</Text>
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.completeWorkoutContainer}>
        <Animated.View style={[styles.completeWorkoutWrapper, completeButtonStyle]}>
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={handleStartWorkout}
            activeOpacity={0.8}
          >
            <Text style={styles.startWorkoutButtonText}>
              Start Workout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.completeWorkoutButton,
              isWorkoutComplete && styles.completeWorkoutButtonActive,
            ]}
            onPress={handleCompleteWorkout}
            disabled={!isWorkoutComplete}
            activeOpacity={0.8}
          >
            <Text style={styles.completeWorkoutButtonText}>
              {isWorkoutComplete ? "Complete Workout" : "Complete All Exercises"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  workoutHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  programTitle: {
    fontSize: 14,
    color: '#AEAEB2',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0A84FF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#AEAEB2',
  },
  exercisesContainer: {
    paddingHorizontal: 16,
    marginBottom: 100,
  },
  exerciseCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  exerciseHeaderActive: {
    backgroundColor: '#2C2C2E',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  exerciseHeaderCompleted: {
    borderColor: '#34C759',
    borderWidth: 1,
  },
  exerciseHeaderContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#AEAEB2',
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  exerciseDetailsBlur: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseDetailsContent: {
    padding: 16,
  },
  exerciseDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseDetailLabel: {
    fontSize: 14,
    color: '#AEAEB2',
  },
  exerciseDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewExerciseButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  viewExerciseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
  },
  completeWorkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  completeWorkoutWrapper: {
    width: '100%',
    gap: 10,
  },
  startWorkoutButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 1,
  },
  startWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeWorkoutButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.5)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    opacity: 0.7,
  },
  completeWorkoutButtonActive: {
    backgroundColor: '#34C759', // Green for completion
    opacity: 1,
  },
  completeWorkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
