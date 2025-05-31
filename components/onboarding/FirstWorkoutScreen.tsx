/**
 * Elite Locker - First Workout Screen
 *
 * Final step of onboarding - log first workout using the core tracking system
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEnhancedWorkout } from '../../contexts/EnhancedWorkoutContext';
import { useSocial } from '../../contexts/SocialContext';
import { useOnboarding } from '../../hooks/useOnboarding';

const { width, height } = Dimensions.get('window');

interface FirstWorkoutScreenProps {
  onNext: () => void;
}

// Workout completion modal for onboarding
interface OnboardingWorkoutCompleteModalProps {
  visible: boolean;
  onComplete: () => void;
  workoutSummary: any;
}

const OnboardingWorkoutCompleteModal: React.FC<OnboardingWorkoutCompleteModalProps> = ({
  visible,
  onComplete,
  workoutSummary
}) => {
  const insets = useSafeAreaInsets();
  const { clubs, shareToClub } = useSocial();
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [notes, setNotes] = useState('My first workout on Elite Locker! 💪');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    try {
      setIsSharing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Share to selected clubs
      for (const clubId of selectedClubs) {
        await shareToClub(clubId, {
          content: notes,
          workoutData: workoutSummary,
          type: 'workout'
        });
      }

      Alert.alert(
        '🎉 First Workout Complete!',
        selectedClubs.length > 0
          ? `Your workout has been shared to ${selectedClubs.length} club${selectedClubs.length > 1 ? 's' : ''}!`
          : 'Great job completing your first workout!',
        [
          {
            text: 'Continue',
            onPress: onComplete
          }
        ]
      );
    } catch (error) {
      console.error('Error sharing workout:', error);
      Alert.alert('Error', 'Failed to share workout, but it was saved successfully!');
      onComplete();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <BlurView intensity={100} style={styles.modalBlur}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎉 First Workout Complete!</Text>
              <Text style={styles.modalSubtitle}>
                Congratulations on completing your first workout with Elite Locker!
              </Text>
            </View>

            {/* Workout Summary */}
            {workoutSummary && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Workout Summary</Text>
                <View style={styles.summaryStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{workoutSummary.duration || '0'}</Text>
                    <Text style={styles.statLabel}>Minutes</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{workoutSummary.exercises?.length || 0}</Text>
                    <Text style={styles.statLabel}>Exercises</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{workoutSummary.totalSets || 0}</Text>
                    <Text style={styles.statLabel}>Sets</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Club Sharing */}
            {clubs.length > 0 && (
              <View style={styles.sharingSection}>
                <Text style={styles.sectionTitle}>Share with your clubs</Text>
                <ScrollView style={styles.clubsList} showsVerticalScrollIndicator={false}>
                  {clubs.map((club) => (
                    <TouchableOpacity
                      key={club.id}
                      style={[
                        styles.clubItem,
                        selectedClubs.includes(club.id) && styles.clubItemSelected
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedClubs(prev =>
                          prev.includes(club.id)
                            ? prev.filter(id => id !== club.id)
                            : [...prev, club.id]
                        );
                      }}
                    >
                      <View style={styles.clubInfo}>
                        <Text style={styles.clubName}>{club.name}</Text>
                        <Text style={styles.clubMembers}>{club.memberCount} members</Text>
                      </View>
                      {selectedClubs.includes(club.id) && (
                        <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="share" size={20} color="#FFFFFF" />
                    <Text style={styles.shareButtonText}>
                      {selectedClubs.length > 0 ? 'Share & Continue' : 'Continue'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export const FirstWorkoutScreen: React.FC<FirstWorkoutScreenProps> = ({ onNext }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: onboardingData, completeFirstWorkout } = useOnboarding();

  // Enhanced workout system
  const {
    activeWorkout,
    isWorkoutActive,
    elapsedTime,
    exerciseLibrary,
    totalVolume,
    completedSets,
    startWorkout,
    endWorkout,
    addExerciseToWorkout,
    logSet
  } = useEnhancedWorkout();

  // State management
  const [currentStep, setCurrentStep] = useState<'intro' | 'tracking' | 'complete'>('intro');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [workoutSummary, setWorkoutSummary] = useState<any>(null);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('');

  // Quick start exercises based on workout type
  const getQuickStartExercises = useCallback((workoutType: string) => {
    const exerciseMap: Record<string, string[]> = {
      strength: ['Push-ups', 'Squats', 'Plank'],
      cardio: ['Jumping Jacks', 'High Knees', 'Burpees'],
      hiit: ['Mountain Climbers', 'Jump Squats', 'Push-ups'],
      yoga: ['Downward Dog', 'Warrior Pose', 'Child\'s Pose'],
      running: ['Warm-up Jog', 'Sprint Intervals', 'Cool-down Walk'],
      cycling: ['Warm-up Ride', 'Hill Climbs', 'Cool-down'],
      swimming: ['Freestyle', 'Backstroke', 'Breaststroke'],
      sports: ['Dynamic Warm-up', 'Skill Practice', 'Scrimmage']
    };
    return exerciseMap[workoutType] || ['Push-ups', 'Squats', 'Plank'];
  }, []);

  // Start the workout tracking
  const handleStartWorkout = useCallback(async (workoutType: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedWorkoutType(workoutType);

      // Start the workout with the enhanced system
      await startWorkout(`My First ${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Workout`);

      // Add quick start exercises
      const exercises = getQuickStartExercises(workoutType);
      for (const exerciseName of exercises) {
        // Find exercise in library or create a basic one
        const exercise = exerciseLibrary.find(ex =>
          ex.name.toLowerCase().includes(exerciseName.toLowerCase())
        ) || {
          id: `quick-${exerciseName.toLowerCase().replace(/\s+/g, '-')}`,
          name: exerciseName,
          category: workoutType,
          muscleGroups: [],
          equipment: [],
          instructions: [`Perform ${exerciseName} with proper form`],
          difficulty: 'beginner' as const
        };

        await addExerciseToWorkout(exercise);
      }

      setCurrentStep('tracking');
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    }
  }, [startWorkout, addExerciseToWorkout, exerciseLibrary, getQuickStartExercises]);

  // Complete the workout
  const handleCompleteWorkout = useCallback(async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const summary = await endWorkout('My first workout on Elite Locker! 💪');
      setWorkoutSummary(summary);
      setShowCompleteModal(true);
      setCurrentStep('complete');
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Error', 'Failed to complete workout. Please try again.');
    }
  }, [endWorkout]);

  // Handle workout completion and onboarding progression
  const handleWorkoutComplete = useCallback(() => {
    setShowCompleteModal(false);
    // Mark first workout step as complete
    completeFirstWorkout();
    // Progress onboarding
    onNext();
  }, [onNext, completeFirstWorkout]);

  // Workout types for selection
  const WORKOUT_TYPES = [
    { id: 'strength', label: 'Strength Training', icon: 'barbell', color: '#FF3B30' },
    { id: 'cardio', label: 'Cardio', icon: 'heart', color: '#FF9500' },
    { id: 'hiit', label: 'HIIT', icon: 'flash', color: '#FFCC02' },
    { id: 'yoga', label: 'Yoga', icon: 'leaf', color: '#34C759' },
    { id: 'running', label: 'Running', icon: 'walk', color: '#007AFF' },
    { id: 'cycling', label: 'Cycling', icon: 'bicycle', color: '#5856D6' },
    { id: 'swimming', label: 'Swimming', icon: 'water', color: '#00C7BE' },
    { id: 'sports', label: 'Sports', icon: 'football', color: '#FF2D92' }
  ];

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render intro step
  if (currentStep === 'intro') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Log your first workout</Text>
            <Text style={styles.subtitle}>
              Choose a workout type to start tracking with our full logging system
            </Text>
          </View>

          {/* Workout type selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What type of workout would you like to do?</Text>
            <View style={styles.workoutTypesContainer}>
              {WORKOUT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.workoutTypeCard,
                    { borderColor: type.color }
                  ]}
                  onPress={() => handleStartWorkout(type.id)}
                >
                  <View style={[styles.workoutTypeIcon, { backgroundColor: type.color }]}>
                    <Ionicons name={type.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.workoutTypeLabel}>
                    {type.label}
                  </Text>
                  <Text style={styles.workoutTypeDescription}>
                    Start tracking now
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>What you'll experience:</Text>
            <View style={styles.infoItem}>
              <Ionicons name="fitness-outline" size={20} color="#1DB954" />
              <Text style={styles.infoText}>Real-time exercise tracking with sets, reps, and weight</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="timer-outline" size={20} color="#1DB954" />
              <Text style={styles.infoText}>Built-in rest timer and performance tracking</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color="#1DB954" />
              <Text style={styles.infoText}>Share your achievement with clubs you joined</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Render tracking step - simplified workout interface
  if (currentStep === 'tracking') {
    return (
      <View style={styles.container}>
        {/* Workout Header */}
        <View style={[styles.workoutHeader, { paddingTop: insets.top + 20 }]}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>
              {activeWorkout?.name || 'First Workout'}
            </Text>
            <Text style={styles.workoutTimer}>
              {formatTime(elapsedTime)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.completeWorkoutButton}
            onPress={handleCompleteWorkout}
          >
            <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
            <Text style={styles.completeWorkoutText}>Complete</Text>
          </TouchableOpacity>
        </View>

        {/* Workout Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeWorkout?.exercises?.length || 0}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedSets}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(totalVolume)}</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>

        {/* Exercise List */}
        <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
          {activeWorkout?.exercises?.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <TouchableOpacity
                  style={styles.addSetButton}
                  onPress={() => logSet(exercise.id, {
                    weight: '0',
                    reps: '1',
                    completed: true
                  })}
                >
                  <Ionicons name="add" size={20} color="#1DB954" />
                  <Text style={styles.addSetText}>Add Set</Text>
                </TouchableOpacity>
              </View>

              {/* Simple set display */}
              <View style={styles.setsContainer}>
                {exercise.sets?.map((set, setIndex) => (
                  <View key={setIndex} style={styles.setRow}>
                    <Text style={styles.setNumber}>{setIndex + 1}</Text>
                    <Text style={styles.setDetails}>
                      {set.reps} reps {set.weight ? `@ ${set.weight}lbs` : ''}
                    </Text>
                    <Ionicons
                      name={set.completed ? "checkmark-circle" : "ellipse-outline"}
                      size={20}
                      color={set.completed ? "#1DB954" : "#666666"}
                    />
                  </View>
                )) || (
                  <Text style={styles.noSetsText}>Tap "Add Set" to start tracking</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Completion Modal */}
        <OnboardingWorkoutCompleteModal
          visible={showCompleteModal}
          onComplete={handleWorkoutComplete}
          workoutSummary={workoutSummary}
        />
      </View>
    );
  }

  // Fallback render
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Setting up your workout...</Text>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  workoutTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  workoutTypeCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  workoutTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  workoutTypeDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 12,
    flex: 1,
  },

  // Workout tracking styles
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutTimer: {
    fontSize: 16,
    color: '#1DB954',
    fontWeight: '600',
  },
  completeWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completeWorkoutText: {
    color: '#1DB954',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addSetText: {
    color: '#1DB954',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    width: 30,
  },
  setDetails: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  noSetsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalBlur: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  sharingSection: {
    marginBottom: 32,
  },
  clubsList: {
    maxHeight: 200,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  clubItemSelected: {
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  clubMembers: {
    fontSize: 14,
    color: '#8E8E93',
  },
  modalActions: {
    marginTop: 'auto',
  },
  shareButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
