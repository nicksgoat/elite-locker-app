import { useWorkout } from '@/contexts/WorkoutContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

// Define Exercise Types
interface Set {
  weight: number;
  reps: number;
}

interface StrengthExercise {
  name: string;
  sets: Set[];
  cardioDetails?: never; // Ensure exclusivity
  hiitDetails?: never; // Ensure exclusivity
}

interface CardioDetails {
  distance: number;
  avgPace: string;
  avgHeartRate: number;
  caloriesBurned: number;
}

interface CardioExercise {
  name: string;
  sets?: never;
  cardioDetails: CardioDetails;
  hiitDetails?: never;
}

interface HiitDetails {
  rounds: number;
  workInterval: number;
  restInterval: number;
  exercises: string[];
  caloriesBurned: number;
  avgHeartRate: number;
  maxHeartRate: number;
}

interface HiitExercise {
  name: string;
  sets?: never;
  cardioDetails?: never;
  hiitDetails: HiitDetails;
}

// Union type for different exercises
type Exercise = StrengthExercise | CardioExercise | HiitExercise;

// Define Workout Components for more flexible structure
interface ExerciseItem {
  type: 'exercise';
  id: string; // Unique ID for the item, e.g., exercise.name or a generated one
  exercise: Exercise;
}

interface SupersetGroup {
  type: 'superset';
  id: string; // Unique ID for the superset
  name?: string; // Optional: e.g., "Arm Blaster Superset"
  exercises: Exercise[]; // Exercises within this superset
  sets: number; // Number of times the superset circuit is performed
  // Note: Individual exercises within a superset might have their own set/rep schemes
  // or the superset 'sets' dictates repeats of the whole block.
  // The provided images (Image 3) suggest individual exercise details like "220 lb • 12 reps"
  // are displayed per exercise within the superset context.
}

type WorkoutComponent = ExerciseItem | SupersetGroup;

// Define Workout Type
interface Workout {
  id: string;
  name: string;
  headerImage?: string; // Added for the main workout image
  date: string;
  duration: number;
  // exercises: Exercise[]; // Replaced by components
  components: WorkoutComponent[]; // New structure
  totalVolume?: number;
  distance?: number;
  categories: string[];
  targetMuscleGroups?: string[]; // Added for metadata
  equipmentNeeded?: string[]; // Added for metadata
  notes?: string;
}

// Mock data for workout history (using defined types)
const workoutHistory: Workout[] = [
  {
    id: '1',
    name: 'Hamstrings + Glutes', // Changed to match images
    headerImage: 'https://example.com/hamstrings_glutes_banner.jpg', // Placeholder
    date: '2023-07-28T09:30:00', // Example date
    duration: 42, // in minutes, from Image 2
    targetMuscleGroups: ['Back', 'Legs'], // From Image 2
    equipmentNeeded: ['Dumbbell', 'Machines', 'Other'], // From Image 2
    components: [
      {
        type: 'superset',
        id: 'ss1',
        name: 'Smith Machine Superset', // Example name
        sets: 3, // From Image 2 "3 sets >"
        exercises: [
          {
            name: 'Smith Machine Hip Thrust',
            // Assuming StrengthExercise structure for exercises within superset
            sets: [{ weight: 220, reps: 12 }], // Example, adjust as needed
          } as StrengthExercise, // Type assertion
          {
            name: 'Smith Machine KAS Glute Bridge',
            sets: [{ weight: 220, reps: 5 }], // Example
          } as StrengthExercise, // Type assertion
        ],
      },
      {
        type: 'exercise',
        id: 'ex1',
        exercise: {
          name: 'Dumbbell Romanian Deadlift',
          sets: [ // From Image 1
            { weight: 60, reps: 13 },
            { weight: 70, reps: 12 },
            { weight: 70, reps: 12 },
          ],
        } as StrengthExercise,
      },
      {
        type: 'exercise',
        id: 'ex2',
        exercise: {
          name: 'Seated Leg Curl',
          sets: [ // From Image 1 (partially visible)
            { weight: 75, reps: 11 },
            { weight: 75, reps: 7 },
            { weight: 70, reps: 8 },
          ],
        } as StrengthExercise,
      },
      // Adding other exercises from Image 4 for completeness
      {
        type: 'exercise',
        id: 'ex3',
        exercise: {
          name: 'Hyperextension',
          // Assuming 3 sets based on "3 sets >" in image, add actual data if known
          sets: [ {weight: 0, reps: 15}, {weight: 0, reps: 15}, {weight: 0, reps: 15}],
        } as StrengthExercise,
      },
      {
        type: 'exercise',
        id: 'ex4',
        exercise: {
          name: 'Machine Adduction',
          sets: [ {weight: 100, reps: 12}, {weight: 100, reps: 12}, {weight: 100, reps: 12}],
        } as StrengthExercise,
      }
    ],
    totalVolume: 21405, // From Image 5 (example for a similar workout)
    categories: ['strength', 'glutes', 'hamstrings'], // Example categories
    notes: 'Focused on glute activation and hamstring development.',
  },
  {
    id: '2',
    name: 'Morning Run',
    date: '2023-05-03T07:15:00',
    duration: 32,
    components: [ // Updated to use new structure
      {
        type: 'exercise',
        id: 'run1',
        exercise: {
          name: 'Treadmill Run',
          cardioDetails: {
            distance: 5.2, // in km
            avgPace: '6:10', // min/km
            avgHeartRate: 158, // bpm
            caloriesBurned: 420,
          },
        } as CardioExercise,
      }
    ],
    distance: 5.2, // in km
    categories: ['cardio'],
    notes: 'Great morning run. Weather was cool and perfect for running.',
  },
  {
    id: '3',
    name: 'Upper Body',
    date: '2023-05-04T16:45:00',
    duration: 55,
    components: [ // Updated to use new structure
      { type: 'exercise', id: 'ub1', exercise: { name: 'Bench Press', sets: [ { weight: 185, reps: 8 }, { weight: 185, reps: 7 }, { weight: 185, reps: 7 } ] } as StrengthExercise },
      { type: 'exercise', id: 'ub2', exercise: { name: 'Shoulder Press', sets: [ { weight: 135, reps: 10 }, { weight: 135, reps: 9 }, { weight: 135, reps: 8 } ] } as StrengthExercise },
      { type: 'exercise', id: 'ub3', exercise: { name: 'Lat Pulldown', sets: [ { weight: 160, reps: 12 }, { weight: 160, reps: 12 }, { weight: 170, reps: 10 } ] } as StrengthExercise },
      { type: 'exercise', id: 'ub4', exercise: { name: 'Bicep Curls', sets: [ { weight: 35, reps: 12 }, { weight: 35, reps: 12 }, { weight: 40, reps: 10 } ] } as StrengthExercise },
    ],
    totalVolume: 6520,
    categories: ['strength'],
    notes: 'Shoulders felt a bit tight. Need to work on mobility.',
  },
  {
    id: '4',
    name: 'HIIT Session',
    date: '2023-05-06T18:00:00',
    duration: 25,
    components: [ // Updated to use new structure
      {
        type: 'exercise',
        id: 'hiit1',
        exercise: {
          name: 'Circuit',
          hiitDetails: {
            rounds: 5,
            workInterval: 40,
            restInterval: 20,
            exercises: [ 'Burpees', 'Mountain Climbers', 'Jump Squats', 'Kettlebell Swings' ],
            caloriesBurned: 320,
            avgHeartRate: 172,
            maxHeartRate: 186,
          },
        } as HiitExercise,
      }
    ],
    categories: ['hiit', 'cardio'],
    notes: 'Pushed the pace on the last two rounds. Really challenging today!',
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const workout = workoutHistory.find((w) => w.id === id);
  const { startWorkout } = useWorkout();

  // Animation values for header and start button
  const scrollY = useSharedValue(0);
  const startButtonScale = useSharedValue(1);

  // Handle scroll events
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 50],
        [1, 0.8],
        Extrapolate.CLAMP
      ),
    };
  });

  const startButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: startButtonScale.value }],
    };
  });

  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate button press
    startButtonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Convert workout components to exercises format expected by startWorkout
    const exercises = workout.components
      .filter(component => component.type === 'exercise') // Only include regular exercises
      .map(component => {
        const exercise = component.exercise as StrengthExercise;
        return {
          id: component.id,
          name: exercise.name,
          sets: exercise.sets?.length || 3,
          targetReps: exercise.sets?.[0]?.reps.toString() || '10',
          restTime: 90, // Default rest time
        };
      });

    // Start the workout with these exercises
    startWorkout(exercises);

    // Navigate to the active workout screen
    router.push('/workout/active');
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Implement share functionality here
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!workout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Workout not found</Text>
      </View>
    );
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength':
        return '#0A84FF';
      case 'cardio':
        return '#FF2D55';
      case 'hiit':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with back button and share */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Content ScrollView */}
      <Animated.ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: workout.headerImage || 'https://example.com/default_workout.jpg' }}
            style={styles.bannerImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bannerGradient}
          />
        </View>

        {/* Workout Title and Badges */}
        <View style={styles.titleContainer}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>

          <View style={styles.badgesContainer}>
            {workout.duration && (
              <View style={styles.badgeItem}>
                <Ionicons name="time-outline" size={18} color="#FFFFFF" />
                <Text style={styles.badgeText}>{workout.duration} min</Text>
              </View>
            )}

            {workout.targetMuscleGroups && workout.targetMuscleGroups.length > 0 && (
              <View style={styles.badgeItem}>
                <Ionicons name="body-outline" size={18} color="#FFFFFF" />
                <Text style={styles.badgeText}>{workout.targetMuscleGroups.join(' • ')}</Text>
              </View>
            )}

            {workout.equipmentNeeded && workout.equipmentNeeded.length > 0 && (
              <View style={styles.badgeItem}>
                <Ionicons name="hardware-chip-outline" size={18} color="#FFFFFF" />
                <Text style={styles.badgeText}>{workout.equipmentNeeded.join(' • ')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>STATS</Text>
          <View style={styles.statsContainer}>
            {workout.totalVolume && (
              <View style={styles.statCard}>
                <Ionicons name="barbell-outline" size={20} color="#0A84FF" />
                <Text style={styles.statValue}>{workout.totalVolume} lbs</Text>
                <Text style={styles.statLabel}>Volume</Text>
              </View>
            )}

            {workout.distance && (
              <View style={styles.statCard}>
                <Ionicons name="trail-sign-outline" size={20} color="#0A84FF" />
                <Text style={styles.statValue}>{workout.distance} km</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
            )}

            <View style={styles.statCard}>
              <Ionicons name="fitness-outline" size={20} color="#0A84FF" />
              <Text style={styles.statValue}>{workout.components.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>CATEGORIES</Text>
          <View style={styles.categoriesContainer}>
            {workout.categories.map((category) => (
              <View
                key={category}
                style={[
                  styles.categoryPill,
                  { backgroundColor: `${getCategoryColor(category)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: getCategoryColor(category) },
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exercises Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>EXERCISES</Text>

          {workout.components
          .filter(component => component.type !== 'superset') // Filter out supersets
          .map((component) => {
            // Render ExerciseItem
            const { exercise } = component;
            return (
              <View key={component.id} style={styles.exerciseItemContainer}>
                <BlurView intensity={50} tint="dark" style={styles.exerciseCard}>
                  <View style={styles.exerciseItemHeader}>
                     <Ionicons name="barbell-outline" size={24} color="#C0C0C0" style={styles.exerciseItemIcon} />
                     <Text style={styles.exerciseName}>{exercise.name}</Text>
                  </View>

                  {exercise.sets && (
                    <View style={styles.exerciseSetsDisplayContainer}>
                      {exercise.sets.map((set, setIndex) => (
                        <View key={setIndex} style={styles.exerciseSetRow}>
                          <Text style={styles.exerciseSetNumber}>{(setIndex + 1).toString()}x</Text>
                          <Text style={styles.exerciseSetDetailWeight}>{set.weight > 0 ? `${set.weight} lb` : '--'}</Text>
                          <Text style={styles.exerciseSetDetailReps}>{set.reps} reps</Text>
                          <View style={styles.exerciseSetCheckPlaceholder} />
                        </View>
                      ))}
                    </View>
                  )}

                  {exercise.cardioDetails && (
                     <View style={styles.cardioContainer}>
                        <View style={styles.cardioRow}>
                          <View style={styles.cardioItem}>
                            <Text style={styles.cardioLabel}>Distance</Text>
                            <Text style={styles.cardioValue}>{exercise.cardioDetails.distance} km</Text>
                          </View>
                          <View style={styles.cardioItem}>
                            <Text style={styles.cardioLabel}>Pace</Text>
                            <Text style={styles.cardioValue}>{exercise.cardioDetails.avgPace} /km</Text>
                          </View>
                        </View>
                        <View style={styles.cardioRow}>
                          <View style={styles.cardioItem}>
                            <Text style={styles.cardioLabel}>Heart Rate</Text>
                            <Text style={styles.cardioValue}>{exercise.cardioDetails.avgHeartRate} bpm</Text>
                          </View>
                          <View style={styles.cardioItem}>
                            <Text style={styles.cardioLabel}>Calories</Text>
                            <Text style={styles.cardioValue}>{exercise.cardioDetails.caloriesBurned} kcal</Text>
                          </View>
                        </View>
                     </View>
                  )}
                  {exercise.hiitDetails && (
                     <View style={styles.hiitContainer}>
                        <View style={styles.hiitInfo}>
                          <View style={styles.hiitDetail}>
                            <Text style={styles.hiitLabel}>Rounds</Text>
                            <Text style={styles.hiitValue}>{exercise.hiitDetails.rounds}</Text>
                          </View>
                          <View style={styles.hiitDetail}>
                            <Text style={styles.hiitLabel}>Work</Text>
                            <Text style={styles.hiitValue}>{exercise.hiitDetails.workInterval}s</Text>
                          </View>
                          <View style={styles.hiitDetail}>
                            <Text style={styles.hiitLabel}>Rest</Text>
                            <Text style={styles.hiitValue}>{exercise.hiitDetails.restInterval}s</Text>
                          </View>
                        </View>

                        <Text style={styles.hiitExercisesTitle}>Exercises</Text>
                        <View style={styles.hiitExercises}>
                          {exercise.hiitDetails.exercises.map((ex, exIndex) => (
                            <View key={exIndex} style={styles.hiitExerciseItem}>
                              <View style={styles.hiitExerciseNumber}>
                                <Text style={styles.hiitExerciseNumberText}>{exIndex + 1}</Text>
                              </View>
                              <Text style={styles.hiitExerciseName}>{ex}</Text>
                            </View>
                          ))}
                        </View>

                        <View style={styles.hiitStats}>
                          <View style={styles.hiitStatItem}>
                            <Text style={styles.hiitStatLabel}>Avg HR</Text>
                            <Text style={styles.hiitStatValue}>{exercise.hiitDetails.avgHeartRate} bpm</Text>
                          </View>
                          <View style={styles.hiitStatItem}>
                            <Text style={styles.hiitStatLabel}>Max HR</Text>
                            <Text style={styles.hiitStatValue}>{exercise.hiitDetails.maxHeartRate} bpm</Text>
                          </View>
                          <View style={styles.hiitStatItem}>
                            <Text style={styles.hiitStatLabel}>Calories</Text>
                            <Text style={styles.hiitStatValue}>{exercise.hiitDetails.caloriesBurned} kcal</Text>
                          </View>
                        </View>
                     </View>
                  )}
                </BlurView>
              </View>
            );
          })}
        </View>

        {/* Notes Section */}
        {workout.notes && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>NOTES</Text>
            <Text style={styles.notesText}>{workout.notes}</Text>
          </View>
        )}

        {/* Placeholder for bottom spacing */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Start Workout Button (Fixed at bottom) */}
      <View style={styles.startButtonContainer}>
        <BlurView intensity={80} tint="dark" style={styles.startButtonBlur}>
          <Animated.View style={startButtonAnimatedStyle}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWorkout}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </Animated.View>
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
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    height: height * 0.5,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginTop: -60,
    marginBottom: 24,
  },
  workoutTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 16,
    color: '#AEAEB2',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  setsContainer: {
    marginTop: 8,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.1)',
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.05)',
  },
  setText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  cardioContainer: {
    marginTop: 8,
  },
  cardioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardioItem: {
    flex: 1,
    alignItems: 'center',
  },
  cardioLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  cardioValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hiitContainer: {
    marginTop: 8,
  },
  hiitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hiitDetail: {
    alignItems: 'center',
  },
  hiitLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  hiitValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hiitExercisesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  hiitExercises: {
    marginBottom: 16,
  },
  hiitExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hiitExerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hiitExerciseNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hiitExerciseName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  hiitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  hiitStatItem: {
    alignItems: 'center',
  },
  hiitStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  hiitStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E5E5EA',
  },
  shareAction: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  shareActionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  startButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 100,
  },
  startButtonBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  supersetContainer: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supersetCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  supersetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  supersetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supersetExerciseIconCollapsed: {
    marginRight: 6,
  },
  supersetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  supersetHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supersetSetsText: {
    fontSize: 14,
    color: '#A9A9A9',
    marginRight: 8,
  },
  supersetContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  supersetInstanceContainer: {
    marginTop: 8,
  },
  supersetInstanceSetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C0C0C0',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseCardInSuperset: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseDetailText: {
    fontSize: 14,
    color: '#F0F0F0',
    marginTop: 2,
  },
  exerciseItemContainer: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseItemIcon: {
    marginRight: 10,
  },
  exerciseItemTextContainer: {
    flex: 1,
  },
  exerciseSetsDisplayContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  exerciseSetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 136, 136, 0.25)',
  },
  exerciseSetNumber: {
    fontSize: 15,
    color: '#A9A9A9',
    fontWeight: '500',
    minWidth: 30,
  },
  exerciseSetDetailWeight: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'left',
    flex: 1.5,
  },
  exerciseSetDetailReps: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
  },
  exerciseSetCheckPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderColor: '#0A84FF',
    borderWidth: 1.5,
  },
});