import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import components
import GlobalHeader from '@/components/ui/GlobalHeader';
import WeekSelector from '@/components/ui/WeekSelector';
import { mockPrograms } from '@/data/mockData';

// Types
interface ProgramWorkout {
  id: string;
  title: string;
  week: number;
  day: number;
  exercises: any[];
  completed?: boolean;
  completedDate?: string;
}

interface Program {
  id: string;
  title: string;
  description: string;
  duration: number;
  level: string;
  thumbnail?: string;
  workouts: ProgramWorkout[];
  progress?: {
    currentWeek: number;
    completedWorkouts: number;
    totalWorkouts: number;
  };
}

export default function ProgramProgressScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [workoutsForWeek, setWorkoutsForWeek] = useState<ProgramWorkout[]>([]);
  const [completionStats, setCompletionStats] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });

  // Animation values
  const progressBarWidth = useSharedValue(0);

  // Load program data
  useEffect(() => {
    // In a real app, this would fetch from an API or database
    // Create mock program data if mockPrograms is undefined
    const mockProgramsData = mockPrograms || [
      {
        id: 'p1',
        title: 'ELITE Power Building',
        description: 'Complete 8-week program focusing on strength and hypertrophy with built-in progression.',
        duration_weeks: 8,
        phases_config: [
          { name: 'Hypertrophy', weeks: 3, deload: false },
          { name: 'Deload', weeks: 1, deload: true },
          { name: 'Strength', weeks: 3, deload: false },
          { name: 'Peak', weeks: 1, deload: false }
        ],
        is_public: true,
        thumbnail: 'https://www.si.com/.image/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/MTk5MTMzNzI1MDQzMjA1OTA1/devon-allen.jpg',
        goal: 'Strength',
        level: 'Intermediate',
        status: 'active',
        progress: 35,
        currentWeek: 3,
        nextWorkoutDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      }
    ];

    const foundProgram = mockProgramsData.find(p => p.id === id);

    if (foundProgram) {
      // Create mock workouts if they don't exist
      const mockWorkouts = foundProgram.workouts || Array(15).fill(0).map((_, index) => ({
        id: `workout-${index + 1}`,
        title: `Workout ${index + 1}`,
        week: Math.floor(index / 5) + 1,
        day: (index % 5) + 1,
        exercises: Array(Math.floor(Math.random() * 5) + 3).fill(0).map((_, i) => ({
          id: `exercise-${i + 1}`,
          name: ['Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'Push-ups', 'Lunges'][i % 6],
          sets: Math.floor(Math.random() * 3) + 2,
          reps: `${Math.floor(Math.random() * 5) + 8}-${Math.floor(Math.random() * 5) + 10}`,
          rest: (Math.floor(Math.random() * 3) + 1) * 30,
        })),
      }));

      // Add mock progress data
      const programWithProgress = {
        ...foundProgram,
        progress: {
          currentWeek: 2,
          completedWorkouts: 5,
          totalWorkouts: mockWorkouts.length,
        },
        workouts: mockWorkouts.map((workout, index) => ({
          ...workout,
          completed: index < 5, // Mark first 5 workouts as completed
          completedDate: index < 5 ? new Date(Date.now() - (index * 86400000)).toISOString() : undefined,
        })),
      };

      setProgram(programWithProgress);

      // Set initial week to current week
      if (programWithProgress.progress) {
        setSelectedWeek(programWithProgress.progress.currentWeek);
      }

      // Calculate completion stats
      const completed = programWithProgress.workouts.filter(w => w.completed).length;
      const total = programWithProgress.workouts.length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;

      setCompletionStats({
        completed,
        total,
        percentage,
      });

      // Animate progress bar
      progressBarWidth.value = withSpring(percentage / 100, { damping: 15 });
    }
  }, [id]);

  // Update workouts when selected week changes
  useEffect(() => {
    if (program) {
      const workouts = program.workouts.filter(w => w.week === selectedWeek);
      setWorkoutsForWeek(workouts);
    }
  }, [selectedWeek, program]);

  // Handle week selection
  const handleWeekPress = (week: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWeek(week);
  };

  // Handle day selection
  const handleDayPress = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(day);
  };

  // Handle workout press
  const handleWorkoutPress = (workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to the workout detail page, which will use the standard workout flow
    router.push(`/programs/workout/${workoutId}`);
  };

  // Handle back press
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Animated styles
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressBarWidth.value * 100}%`,
    };
  });

  if (!program) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader
          title="Program Progress"
          showBackButton
          onBackPress={handleBackPress}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading program...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader
        title="Program Progress"
        showBackButton
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Program Header */}
        <View style={styles.programHeader}>
          {program.thumbnail ? (
            <Image
              source={{ uri: program.thumbnail }}
              style={styles.programThumbnail}
              contentFit="cover"
            />
          ) : (
            <View style={styles.programThumbnailPlaceholder}>
              <Ionicons name="calendar-outline" size={40} color="#FFFFFF" />
            </View>
          )}

          <View style={styles.programInfo}>
            <Text style={styles.programTitle}>{program.title}</Text>
            <Text style={styles.programSubtitle}>
              {program.duration} weeks • {program.level}
            </Text>
          </View>
        </View>

        {/* Progress Overview */}
        <View style={styles.progressOverview}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress Overview</Text>
            <Text style={styles.progressPercentage}>{Math.round(completionStats.percentage)}%</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, progressBarStyle]} />
          </View>

          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{completionStats.completed}</Text>
              <Text style={styles.progressStatLabel}>Completed</Text>
            </View>

            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{completionStats.total - completionStats.completed}</Text>
              <Text style={styles.progressStatLabel}>Remaining</Text>
            </View>

            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{program.progress?.currentWeek || 1}</Text>
              <Text style={styles.progressStatLabel}>Current Week</Text>
            </View>
          </View>
        </View>

        {/* Week Selector */}
        <View style={styles.weekSelectorContainer}>
          <WeekSelector
            totalWeeks={program.duration}
            selectedWeek={selectedWeek}
            onWeekPress={handleWeekPress}
          />
        </View>

        {/* Workouts for Selected Week */}
        <View style={styles.workoutsContainer}>
          <Text style={styles.workoutsTitle}>Week {selectedWeek} Workouts</Text>

          {workoutsForWeek.length > 0 ? (
            workoutsForWeek.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={styles.workoutCard}
                onPress={() => handleWorkoutPress(workout.id)}
                activeOpacity={0.8}
              >
                <BlurView intensity={30} tint="dark" style={styles.workoutCardBlur}>
                  <View style={styles.workoutCardContent}>
                    <View style={styles.workoutCardInfo}>
                      <Text style={styles.workoutCardTitle}>{workout.title}</Text>
                      <Text style={styles.workoutCardSubtitle}>
                        Day {workout.day} • {workout.exercises.length} exercises
                      </Text>

                      {workout.completed && (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                          <Text style={styles.completedText}>Completed</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.workoutCardAction}>
                      {workout.completed ? (
                        <TouchableOpacity
                          style={styles.viewButton}
                          onPress={() => handleWorkoutPress(workout.id)}
                        >
                          <Text style={styles.viewButtonText}>View</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.startButton}
                          onPress={() => handleWorkoutPress(workout.id)}
                        >
                          <Text style={styles.startButtonText}>Start</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No workouts for this week</Text>
              <Text style={styles.emptyStateSubtext}>Try selecting a different week</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  programThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  programThumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  programSubtitle: {
    fontSize: 14,
    color: '#AEAEB2',
  },
  progressOverview: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0A84FF',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#AEAEB2',
  },
  weekSelectorContainer: {
    marginBottom: 24,
  },
  workoutsContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  workoutsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  workoutCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  workoutCardBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  workoutCardInfo: {
    flex: 1,
  },
  workoutCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutCardSubtitle: {
    fontSize: 14,
    color: '#AEAEB2',
    marginBottom: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 4,
  },
  workoutCardAction: {
    marginLeft: 16,
  },
  startButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  viewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#AEAEB2',
    textAlign: 'center',
  },
});
