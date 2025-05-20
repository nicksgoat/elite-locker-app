import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

import DayWorkoutItem from './DayWorkoutItem';
import WeekSelector from './WeekSelector';

// Define types for our program workouts
interface ProgramWorkout {
  id: string;
  title: string;
  week: number;
  day: number;
  type?: string;
  image?: string;
  completed?: boolean;
}

interface ProgramScheduleViewProps {
  totalWeeks: number;
  workouts: ProgramWorkout[];
  onWorkoutComplete?: (week: number, day: number) => void;
  isSubscribed?: boolean;
}

export default function ProgramScheduleView({
  totalWeeks,
  workouts,
  onWorkoutComplete,
  isSubscribed = false
}: ProgramScheduleViewProps) {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({});

  // Animation values for the complete button
  const completeButtonScale = useSharedValue(1);

  // Animated style for the complete button
  const completeButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: completeButtonScale.value }],
    };
  });

  const handleWeekPress = (week: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWeek(week);
  };

  const handleWorkoutPress = (workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/workout/detail/${workoutId}`);
  };

  const handleCompleteWorkout = (workout: ProgramWorkout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate the complete button
    completeButtonScale.value = withSpring(1.2, { damping: 2 }, () => {
      completeButtonScale.value = withSpring(1);
    });

    // Mark workout as completed
    const workoutKey = `${workout.week}-${workout.day}`;
    setCompletedWorkouts(prev => ({
      ...prev,
      [workoutKey]: true
    }));

    // Call the onWorkoutComplete callback if provided
    if (onWorkoutComplete) {
      onWorkoutComplete(workout.week, workout.day);
    }

    // Show success message
    Alert.alert(
      'Workout Completed!',
      'Great job! This workout has been marked as complete.',
      [{ text: 'OK' }]
    );
  };

  const isWorkoutCompleted = (workout: ProgramWorkout) => {
    const workoutKey = `${workout.week}-${workout.day}`;
    return completedWorkouts[workoutKey] || workout.completed;
  };

  // Filter workouts for the selected week
  const weekWorkouts = workouts.filter(workout => workout.week === selectedWeek);

  // Sort workouts by day
  weekWorkouts.sort((a, b) => a.day - b.day);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SCHEDULE</Text>

      {/* Week selector */}
      <WeekSelector
        totalWeeks={totalWeeks}
        selectedWeek={selectedWeek}
        onWeekPress={handleWeekPress}
      />

      {/* Day workouts */}
      <View style={styles.workoutsContainer}>
        {weekWorkouts.length > 0 ? (
          weekWorkouts.map(workout => (
            <View key={workout.id} style={styles.workoutRow}>
              <DayWorkoutItem
                id={workout.id}
                day={workout.day}
                title={workout.title}
                type={workout.type || 'Workout'}
                image={workout.image}
                onPress={() => handleWorkoutPress(workout.id)}
              />

              {isSubscribed && (
                <View style={styles.workoutActions}>
                  {isWorkoutCompleted(workout) ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#32D74B" />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  ) : (
                    <Animated.View style={completeButtonAnimatedStyle}>
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => handleCompleteWorkout(workout)}
                      >
                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.completeButtonText}>Mark Complete</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workouts for this week</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  workoutsContainer: {
    paddingHorizontal: 16,
  },
  workoutRow: {
    marginBottom: 16,
  },
  workoutActions: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingLeft: 50, // Align with the workout content
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 215, 75, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completedText: {
    color: '#32D74B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
  },
});
