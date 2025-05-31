import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../../../contexts/ProfileContext';
import { useWorkoutPurchase } from '../../../contexts/WorkoutPurchaseContext';
import { useAuth } from '../../../hooks/useAuth';

const { width: screenWidth } = Dimensions.get('window');

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  restTime?: number;
  notes?: string;
  targetReps?: string;
}

interface WorkoutCreator {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  isVerified?: boolean;
  workoutCount?: number;
}

interface SharedWorkout {
  id: string;
  title: string;
  day: string;
  totalExercises: number;
  previewExercises: WorkoutExercise[];
  creator: WorkoutCreator;
  price: number;
  currency: string;
  isPurchased: boolean;
  createdDate: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration?: number;
}

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, workoutData } = useLocalSearchParams();
  const { isPurchased, purchaseWorkout } = useWorkoutPurchase();
  const { currentProfile } = useProfile();
  const { user } = useAuth();

  // Parse passed workout data if available
  const passedWorkoutData = workoutData ? JSON.parse(workoutData as string) : null;

  const [workout, setWorkout] = useState<SharedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);

  // Check if the current user owns this workout
  const isOwnWorkout = (workout: SharedWorkout | null): boolean => {
    if (!workout || !currentProfile) {
      console.log('Ownership check failed: missing workout or profile', { workout: !!workout, currentProfile: !!currentProfile });
      return false;
    }

    const isOwned = workout.creator.id === currentProfile.id ||
                   workout.creator.id === 'current-user' ||
                   workout.creator.handle === `@${currentProfile.handle}`;

    console.log('Ownership check:', {
      workoutId: workout.id,
      workoutCreatorId: workout.creator.id,
      currentProfileId: currentProfile.id,
      workoutCreatorHandle: workout.creator.handle,
      currentProfileHandle: `@${currentProfile.handle}`,
      isOwned
    });

    return isOwned;
  };

  useEffect(() => {
    loadWorkoutDetails();
  }, [id]);

  // Redirect to template screen if user owns the workout
  useEffect(() => {
    if (workout && isOwnWorkout(workout)) {
      console.log(`Redirecting to template screen for owned workout: ${id}`);
      // Navigate to the workout template screen instead
      router.replace(`/workout/template/${id}`);
    } else if (workout) {
      console.log(`Showing purchase screen for workout: ${id} (not owned)`);
    }
  }, [workout, currentProfile, id, router]);

  const loadWorkoutDetails = async () => {
    try {
      setLoading(true);

      // If we have passed workout data, use it first
      if (passedWorkoutData) {
        const workoutFromData: SharedWorkout = {
          id: passedWorkoutData.id,
          title: passedWorkoutData.title,
          day: 'Day 1',
          totalExercises: passedWorkoutData.exerciseCount || 5,
          previewExercises: [
            {
              id: '1',
              name: 'Sample Exercise',
              sets: 3,
              reps: '8-10',
              weight: 135,
              restTime: 60,
              notes: 'Focus on form',
              targetReps: '8-10'
            }
          ],
          creator: {
            id: 'creator_id',
            name: passedWorkoutData.authorName || 'Unknown Author',
            handle: '@creator',
            isVerified: false,
            workoutCount: 50
          },
          price: passedWorkoutData.price || 0,
          currency: 'USD',
          isPurchased: false,
          createdDate: new Date().toLocaleDateString(),
          description: passedWorkoutData.description,
          difficulty: passedWorkoutData.level === 'beginner' ? 'Beginner' :
                     passedWorkoutData.level === 'intermediate' ? 'Intermediate' : 'Advanced',
          estimatedDuration: passedWorkoutData.duration || 60
        };

        setWorkout(workoutFromData);
        setLoading(false);
        return;
      }

      // Simulate API call - in production, this would fetch from your backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock workout data mapping for different IDs
      const workoutDatabase: Record<string, SharedWorkout> = {
        // Current user's workouts (Devon Allen)
        'workout_123': {
          id: 'workout_123',
          title: 'Olympic Hurdle Training',
          day: 'Day 1',
          totalExercises: 6,
          previewExercises: [
            {
              id: '1',
              name: 'Hurdle Mobility Warm-up',
              sets: 3,
              reps: '10 each leg',
              weight: 0,
              restTime: 60,
              notes: 'Focus on hip flexibility and range of motion',
              targetReps: '10 each leg'
            }
          ],
          creator: {
            id: 'current-user', // Match the current user's ID
            name: 'Devon Allen',
            handle: '@devonallen',
            isVerified: true,
            workoutCount: 312
          },
          price: 0, // Own workouts are free
          currency: 'USD',
          isPurchased: true, // Always purchased since it's owned
          createdDate: '4/12/2025',
          description: 'Olympic-level hurdle training session',
          difficulty: 'Advanced',
          estimatedDuration: 90
        },
        'workout_own_2': {
          id: 'workout_own_2',
          title: 'NFL Route Running',
          day: 'Day 2',
          totalExercises: 5,
          previewExercises: [
            {
              id: '1',
              name: 'Dynamic Warm-up',
              sets: 1,
              reps: '10 minutes',
              weight: 0,
              restTime: 0,
              notes: 'High knees, butt kicks, leg swings',
              targetReps: '10 minutes'
            }
          ],
          creator: {
            id: 'current-user', // Match the current user's ID
            name: 'Devon Allen',
            handle: '@devonallen',
            isVerified: true,
            workoutCount: 312
          },
          price: 0,
          currency: 'USD',
          isPurchased: true,
          createdDate: '4/10/2025',
          description: 'NFL-level route running and catching drills',
          difficulty: 'Advanced',
          estimatedDuration: 70
        },
        // Other users' workouts
        'workout_other_1': {
          id: 'workout_other_1',
          title: 'Upper Hypertrophy',
          day: 'Day 1',
          totalExercises: 6,
          previewExercises: [
            {
              id: '1',
              name: 'Barbell Bench Press',
              sets: 4,
              reps: '8-10',
              weight: 225,
              restTime: 90,
              notes: 'Focus on chest contraction',
              targetReps: '8-10'
            }
          ],
          creator: {
            id: 'other_user_1',
            name: 'Mike Johnson',
            handle: '@mikejohnson',
            isVerified: true,
            workoutCount: 156
          },
          price: 8.00,
          currency: 'USD',
          isPurchased: isPurchased('workout_other_1'),
          createdDate: '4/12/2025',
          description: 'Professional bodybuilder upper body routine',
          difficulty: 'Advanced',
          estimatedDuration: 75
        },
        'workout_other_2': {
          id: 'workout_other_2',
          title: 'Lower Hypertrophy',
          day: 'Day 2',
          totalExercises: 6,
          previewExercises: [
            {
              id: '1',
              name: 'Back Squat',
              sets: 4,
              reps: '8-10',
              weight: 315,
              restTime: 120,
              notes: 'Progressive overload focus',
              targetReps: '8-10'
            }
          ],
          creator: {
            id: 'other_user_2',
            name: 'Sarah Williams',
            handle: '@sarahfit',
            isVerified: false,
            workoutCount: 85
          },
          price: 8.00,
          currency: 'USD',
          isPurchased: isPurchased('workout_other_2'),
          createdDate: '4/10/2025',
          description: 'Elite lower body development program',
          difficulty: 'Advanced',
          estimatedDuration: 80
        },
        'workout_other_3': {
          id: 'workout_other_3',
          title: 'Push Day',
          day: 'Day 1',
          totalExercises: 5,
          previewExercises: [
            {
              id: '1',
              name: 'Incline Dumbbell Press',
              sets: 3,
              reps: '10-12',
              weight: 70,
              restTime: 60,
              notes: 'Control the negative',
              targetReps: '10-12'
            }
          ],
          creator: {
            id: 'other_user_3',
            name: 'Alex Thompson',
            handle: '@alexthompson',
            isVerified: false,
            workoutCount: 42
          },
          price: 5.00,
          currency: 'USD',
          isPurchased: isPurchased('workout_other_3'),
          createdDate: '4/08/2025',
          description: 'Complete push muscle group training',
          difficulty: 'Intermediate',
          estimatedDuration: 60
        }
      };

      // Get workout data by ID, fallback to default if not found
      const mockWorkout = workoutDatabase[id as string] || workoutDatabase['workout_other_1'];

      setWorkout(mockWorkout);
    } catch (error) {
      console.error('Failed to load workout:', error);
      Alert.alert('Error', 'Failed to load workout details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!workout) return;

    try {
      setPurchasing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Use context purchase function
      const success = await purchaseWorkout(
        workout.id,
        workout.price,
        workout.creator.handle
      );

      if (success) {
        // Update local workout state
        setWorkout(prev => prev ? { ...prev, isPurchased: true } : null);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Purchase Successful! 💪',
          'You now have full access to this workout.',
          [
            { text: 'Start Workout', onPress: () => startWorkout() },
            { text: 'View Details', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Purchase Failed', 'Please try again or contact support.');
      }

    } catch (error) {
      Alert.alert('Purchase Failed', 'Please try again or contact support.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleApplyReferralCode = () => {
    if (!referralCode.trim()) {
      Alert.alert('Invalid Code', 'Please enter a valid referral code.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Referral Applied', 'You saved $1.00 with this code!');
    setReferralCode('');
    setShowReferralInput(false);
  };

  const startWorkout = () => {
    if (!workout?.isPurchased) {
      Alert.alert('Purchase Required', 'Please purchase this workout to start training.');
      return;
    }

    // Navigate to workout execution with purchased content
    router.push(`/workout/run?workoutId=${workout.id}&purchased=true`);
  };

  const renderExercisePreview = (exercise: WorkoutExercise, index: number) => (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity style={styles.exerciseMenuButton}>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <Text style={styles.exerciseSetInfo}>
        {exercise.sets} × {exercise.reps}
      </Text>

      {exercise.notes && (
        <Text style={styles.exerciseNotes}>{exercise.notes}</Text>
      )}

      {/* Exercise Details Table */}
      <View style={styles.exerciseTable}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Set</Text>
          <Text style={styles.tableHeaderText}>Target</Text>
          <Text style={styles.tableHeaderText}>Weight</Text>
          <Text style={styles.tableHeaderText}>Reps</Text>
        </View>

        {Array.from({ length: exercise.sets }, (_, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}>{i + 1}</Text>
            <Text style={styles.tableCell}>—</Text>
            <Text style={styles.tableCellValue}>{exercise.weight || 135}</Text>
            <Text style={styles.tableCellValue}>{exercise.reps}</Text>
          </View>
        ))}
      </View>

      {/* Rest Times */}
      <View style={styles.restTimes}>
        <Text style={styles.restTimesTitle}>Rest times</Text>
        <View style={styles.restTimesList}>
          {Array.from({ length: exercise.sets }, (_, i) => (
            <View key={i} style={styles.restTimeItem}>
              <Ionicons name="time-outline" size={12} color="#0A84FF" />
              <Text style={styles.restTimeText}>Set {i + 1}: 1m 30s</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Workout not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Title */}
        <View style={styles.titleSection}>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <Text style={styles.workoutSubtitle}>
            {workout.day} • {workout.totalExercises} exercises
          </Text>
        </View>

        {/* Creator Profile */}
        <View style={styles.creatorSection}>
          <BlurView intensity={20} style={styles.creatorBlur}>
            <View style={styles.creatorContent}>
              <View style={styles.creatorAvatar}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.creatorInfo}>
                <View style={styles.creatorNameRow}>
                  <Text style={styles.creatorName}>{workout.creator.name}</Text>
                  {workout.creator.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color="#0A84FF" />
                  )}
                  <Text style={styles.creatorHandle}> {workout.creator.handle}</Text>
                </View>
                <Text style={styles.creatorSubtitle}>Tap in to my daily workouts</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Exercise Preview */}
        <View style={styles.exercisesSection}>
          {workout.previewExercises.map((exercise, index) =>
            renderExercisePreview(exercise, index)
          )}
        </View>

        {/* Paywall Section */}
        {!workout.isPurchased && (
          <View style={styles.paywallSection}>
            <BlurView intensity={20} style={styles.paywallBlur}>
              <View style={styles.paywallContent}>
                <Ionicons name="lock-closed" size={48} color="#8E8E93" />
                <Text style={styles.paywallTitle}>
                  {workout.totalExercises - workout.previewExercises.length} more exercises available
                </Text>
                <Text style={styles.paywallSubtitle}>
                  Purchase this workout to see the complete details
                </Text>
              </View>
            </BlurView>
          </View>
        )}

        {/* Workout Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
            <Text style={styles.infoText}>Created {workout.createdDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#8E8E93" />
            <Text style={styles.infoText}>Premium workout by certified trainer</Text>
          </View>
        </View>

        {/* Pricing */}
        {!workout.isPurchased && (
          <View style={styles.pricingSection}>
            <Text style={styles.priceText}>${workout.price.toFixed(2)}</Text>
            <Text style={styles.priceSubtext}>one-time</Text>
          </View>
        )}

        {/* Referral Code */}
        {!workout.isPurchased && (
          <View style={styles.referralSection}>
            <TouchableOpacity
              style={styles.referralToggle}
              onPress={() => setShowReferralInput(!showReferralInput)}
            >
              <Text style={styles.referralToggleText}>
                Have a referral code?
              </Text>
            </TouchableOpacity>

            {showReferralInput && (
              <View style={styles.referralInputContainer}>
                <TextInput
                  style={styles.referralInput}
                  placeholder="Enter code"
                  placeholderTextColor="#8E8E93"
                  value={referralCode}
                  onChangeText={setReferralCode}
                />
                <TouchableOpacity
                  style={styles.referralApplyButton}
                  onPress={handleApplyReferralCode}
                >
                  <Text style={styles.referralApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Purchase/Action Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}>
        {workout.isPurchased ? (
          <TouchableOpacity
            style={styles.startWorkoutButton}
            onPress={startWorkout}
          >
            <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.buyButton, purchasing && styles.buyButtonDisabled]}
              onPress={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buyButtonText}>Buy Now</Text>
              )}
            </TouchableOpacity>

            <View style={styles.securityInfo}>
              <View style={styles.securityItem}>
                <Ionicons name="shield-checkmark" size={12} color="#30D158" />
                <Text style={styles.securityText}>Secure payment</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="flash" size={12} color="#0A84FF" />
                <Text style={styles.securityText}>Instant access</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="globe" size={12} color="#FF9F0A" />
                <Text style={styles.securityText}>Global support</Text>
              </View>
            </View>
          </>
        )}
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
  },
  creatorSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  creatorBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  creatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  creatorHandle: {
    color: '#8E8E93',
    fontSize: 16,
  },
  creatorSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
  exercisesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  exerciseMenuButton: {
    padding: 4,
  },
  exerciseSetInfo: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 8,
  },
  exerciseNotes: {
    color: '#8E8E93',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  exerciseTable: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  tableHeaderText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tableCell: {
    color: '#8E8E93',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  tableCellValue: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  restTimes: {
    marginTop: 8,
  },
  restTimesTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  restTimesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  restTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restTimeText: {
    color: '#0A84FF',
    fontSize: 12,
  },
  paywallSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paywallBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  paywallContent: {
    padding: 24,
    alignItems: 'center',
  },
  paywallTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  paywallSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 8,
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  priceSubtext: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 4,
  },
  referralSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  referralToggle: {
    alignItems: 'center',
    marginBottom: 12,
  },
  referralToggleText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  referralInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  referralInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  referralApplyButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  referralApplyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  buyButton: {
    backgroundColor: '#8E8E93',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  startWorkoutButton: {
    backgroundColor: '#30D158',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startWorkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  securityInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    color: '#8E8E93',
    fontSize: 12,
  },
});