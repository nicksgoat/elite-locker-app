import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Exercise, ExerciseSet, useWorkout } from '@/contexts/WorkoutContext';

// Extended Exercise interface to include thumbnail
interface ExtendedExercise extends Exercise {
  thumbnailUrl?: string;
}

// Rest Timer Component
interface RestTimerProps {
  initialTime?: number; // in seconds
  onTimerComplete?: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({
  initialTime = 120, // 2 minutes default
  onTimerComplete,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Start/pause timer
  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(prev => !prev);
  };

  // Reset timer
  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(false);
    setTimeRemaining(initialTime);
  };

  // Adjust time
  const adjustTime = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeRemaining(prev => Math.max(0, prev + seconds));
  };

  // Timer effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer complete
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (onTimerComplete) onTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, onTimerComplete]);

  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerBadge}>
        <Text style={styles.timerBadgeText}>Rest</Text>
      </View>

      <Text style={styles.timerDisplay}>{formatTime(timeRemaining)}</Text>

      <View style={styles.timerControls}>
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => adjustTime(-15)}
        >
          <Text style={styles.timerAdjustText}>-</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => adjustTime(15)}
        >
          <Text style={styles.timerAdjustText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerActionButtons}>
        <TouchableOpacity
          style={styles.timerActionButton}
          onPress={toggleTimer}
        >
          <Ionicons
            name={isActive ? "pause" : "play"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.timerActionButton}
          onPress={resetTimer}
        >
          <Ionicons name="close" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// PR Notification Component
interface PRNotificationProps {
  exercise: string;
  visible: boolean;
  onClose: () => void;
}

const PRNotification: React.FC<PRNotificationProps> = ({
  exercise,
  visible,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.prNotification,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.prIcon}>
        <Ionicons name="trophy" size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.prText}>New Record</Text>
      <TouchableOpacity style={styles.prCloseButton} onPress={onClose}>
        <Ionicons name="close" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Exercise set component
interface LogSetProps {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
  previousWeight?: string;
  previousReps?: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onCompleteToggle: () => void;
}

const LogSet: React.FC<LogSetProps> = ({
  setNumber,
  weight,
  reps,
  completed,
  previousWeight = '--',
  previousReps = '--',
  onWeightChange,
  onRepsChange,
  onCompleteToggle,
}) => {
  return (
    <View style={styles.setRow}>
      <View style={styles.previousContainer}>
        <Text style={styles.setNumber}>{setNumber}×</Text>
        <Text style={styles.previousText}>{previousWeight}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="--"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={weight}
          onChangeText={onWeightChange}
          editable={!completed}
          selectTextOnFocus
        />
        <Text style={styles.inputLabel}>lb</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="--"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={reps}
          onChangeText={onRepsChange}
          editable={!completed}
          selectTextOnFocus
        />
        <Text style={styles.inputLabel}>reps</Text>
      </View>

      <TouchableOpacity
        style={[styles.completeButton, completed && styles.completedButtonActive]}
        onPress={onCompleteToggle}
      >
        {completed && (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

// Exercise component
interface LogExerciseProps {
  exercise: ExtendedExercise;
  sets: ExerciseSet[];
  onUpdateSets: (sets: ExerciseSet[]) => void;
  onAddSet: () => void;
  onSuperSet: () => void;
  onComplete: () => void;
}

const LogExercise: React.FC<LogExerciseProps> = ({
  exercise,
  sets,
  onUpdateSets,
  onAddSet,
  onSuperSet,
  onComplete,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showPR, setShowPR] = useState(false);

  const handleSetCompleteToggle = (setId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedSets = sets.map(set =>
      set.id === setId ? { ...set, completed: !set.completed } : set
    );

    // Check if this is a PR (for demo purposes, randomly show PR notification)
    if (Math.random() > 0.7 && !showPR) {
      setShowPR(true);
      setTimeout(() => setShowPR(false), 3000);
    }

    onUpdateSets(updatedSets);
  };

  const handleWeightChange = (setId: number, value: string) => {
    const updatedSets = sets.map(set =>
      set.id === setId ? { ...set, weight: value } : set
    );

    onUpdateSets(updatedSets);
  };

  const handleRepsChange = (setId: number, value: string) => {
    const updatedSets = sets.map(set =>
      set.id === setId ? { ...set, reps: value } : set
    );

    onUpdateSets(updatedSets);
  };

  return (
    <View style={styles.exerciseCard}>
      {showPR && (
        <PRNotification
          exercise={exercise.name}
          visible={showPR}
          onClose={() => setShowPR(false)}
        />
      )}

      <TouchableOpacity
        style={styles.exerciseHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.exerciseIconContainer}>
          {exercise.thumbnailUrl ? (
            <Image
              source={{ uri: exercise.thumbnailUrl }}
              style={styles.exerciseIcon}
            />
          ) : (
            <Ionicons name="barbell-outline" size={16} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity style={styles.exerciseMenuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
        </TouchableOpacity>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={16}
          color="#8E8E93"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.exerciseContent}>
          <View style={styles.setsHeader}>
            <Text style={styles.setsHeaderText}>PREVIOUS</Text>
            <Text style={styles.setsHeaderText}>WEIGHT</Text>
            <Text style={styles.setsHeaderText}>REP</Text>
          </View>

          {sets.map((set) => (
            <LogSet
              key={set.id}
              setNumber={set.id}
              weight={set.weight}
              reps={set.reps}
              completed={set.completed}
              previousWeight={set.previousWeight}
              previousReps={set.previousReps}
              onWeightChange={(value) => handleWeightChange(set.id, value)}
              onRepsChange={(value) => handleRepsChange(set.id, value)}
              onCompleteToggle={() => handleSetCompleteToggle(set.id)}
            />
          ))}

          <View style={styles.setActionButtons}>
            <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.superSetButton} onPress={onSuperSet}>
              <Ionicons name="repeat" size={16} color="#FFFFFF" />
              <Text style={styles.superSetText}>Super Set</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.completeExerciseButton} onPress={onComplete}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.completeExerciseText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Styles for the workout log screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  backButton: {
    padding: 8,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  setupLink: {
    fontSize: 16,
    color: '#0A84FF',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginVertical: 40,
  },
  exerciseCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  exerciseIcon: {
    width: 32,
    height: 32,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  exerciseMenuButton: {
    padding: 8,
    marginRight: 8,
  },
  exerciseContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 40,
  },
  setsHeaderText: {
    fontSize: 11,
    color: '#8E8E93',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: 40,
  },
  previousContainer: {
    width: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  setNumber: {
    fontSize: 14,
    color: '#8E8E93',
    width: 25,
  },
  previousText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 4,
  },
  completeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  completedButtonActive: {
    backgroundColor: '#30D158',
    borderColor: '#30D158',
  },
  setActionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  addSetText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  superSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  superSetText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  completeExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  completeExerciseText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
  },
  addExerciseText: {
    fontSize: 16,
    color: '#0A84FF',
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  completeWorkoutButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timerContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  timerBadge: {
    backgroundColor: '#FFD60A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  timerBadgeText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 12,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  timerControls: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  timerAdjustText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  timerActionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  timerActionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  prNotification: {
    position: 'absolute',
    top: -20,
    right: 16,
    left: 16,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  prIcon: {
    marginRight: 8,
  },
  prText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
  },
  prCloseButton: {
    padding: 4,
  },
});

export default function WorkoutLogScreen() {
  const router = useRouter();
  const { startWorkout, updateExerciseSets, addExercise, endWorkout } = useWorkout();

  // State for the workout
  const [workoutName, setWorkoutName] = useState('New Workout');
  const [isEditingName, setIsEditingName] = useState(false);
  const [exercises, setExercises] = useState<ExtendedExercise[]>([]);
  const [exerciseSets, setExerciseSets] = useState<Record<string, ExerciseSet[]>>({});
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize with sample data
  useEffect(() => {
    // Sample exercises based on the screenshots
    const sampleExercises: ExtendedExercise[] = [
      {
        id: 'ex1',
        name: 'Smith Machine Hip Thrust',
        sets: 2,
        targetReps: '10-12',
        restTime: 90,
      },
      {
        id: 'ex2',
        name: 'Smith Machine KAS Glute Bridge',
        sets: 1,
        targetReps: '5',
        restTime: 90,
      },
      {
        id: 'ex3',
        name: 'Dumbbell Romanian Deadlift',
        sets: 3,
        targetReps: '12-15',
        restTime: 60,
      },
      {
        id: 'ex4',
        name: 'Seated Leg Curl',
        sets: 3,
        targetReps: '8-12',
        restTime: 60,
      },
    ];

    setExercises(sampleExercises);

    // Initialize sets for each exercise
    const initialSets: Record<string, ExerciseSet[]> = {};
    sampleExercises.forEach(exercise => {
      initialSets[exercise.id] = Array(exercise.sets).fill(0).map((_, idx) => ({
        id: idx + 1,
        weight: '',
        reps: '',
        completed: false,
        previousWeight: '--',
        previousReps: '--',
      }));
    });

    setExerciseSets(initialSets);

    // Start the workout in the context
    startWorkout(sampleExercises);
    startWorkoutTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Start workout timer
  const startWorkoutTimer = () => {
    setIsTimerActive(true);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  // Pause workout timer
  const pauseWorkoutTimer = () => {
    setIsTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle editing the workout name
  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleNameSubmit = () => {
    setIsEditingName(false);
  };

  // Handle toggling the timer
  const handleToggleTimer = () => {
    if (isTimerActive) {
      pauseWorkoutTimer();
    } else {
      startWorkoutTimer();
    }
  };

  // Handle updating sets for an exercise
  const handleUpdateSets = (exerciseId: string, sets: ExerciseSet[]) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: sets
    }));

    // Update in context
    updateExerciseSets(exerciseId, sets);
  };

  // Handle adding a set to an exercise
  const handleAddSet = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setExerciseSets(prev => {
      const currentSets = prev[exerciseId] || [];
      const newSetId = currentSets.length + 1;

      // Copy weight and reps from the last set if available
      const lastSet = currentSets[currentSets.length - 1];
      const newSet: ExerciseSet = {
        id: newSetId,
        weight: lastSet ? lastSet.weight : '',
        reps: lastSet ? lastSet.reps : '',
        completed: false,
        previousWeight: lastSet ? lastSet.previousWeight : '--',
        previousReps: lastSet ? lastSet.previousReps : '--',
      };

      const updatedSets = [...currentSets, newSet];

      // Update in context
      updateExerciseSets(exerciseId, updatedSets);

      return {
        ...prev,
        [exerciseId]: updatedSets
      };
    });
  };

  // Handle creating a superset
  const handleSuperSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // This would be implemented to create a superset
    console.log('Create superset');
  };

  // Handle completing an exercise
  const handleCompleteExercise = (exerciseId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Mark all sets as completed
    const updatedSets = exerciseSets[exerciseId].map(set => ({
      ...set,
      completed: true
    }));

    handleUpdateSets(exerciseId, updatedSets);

    // Show rest timer
    setShowRestTimer(true);
  };

  // Handle completing the workout
  const handleCompleteWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    endWorkout();
    router.push('/workout/share-workout');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerTitleContainer} onPress={handleEditName}>
          {isEditingName ? (
            <TextInput
              style={styles.headerTitle}
              value={workoutName}
              onChangeText={setWorkoutName}
              onBlur={handleNameSubmit}
              autoFocus
              selectTextOnFocus
              onSubmitEditing={handleNameSubmit}
            />
          ) : (
            <>
              <Text style={styles.headerTitle}>{workoutName}</Text>
              <Ionicons name="chevron-down" size={16} color="#8E8E93" />
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.timerButton} onPress={handleToggleTimer}>
          {isTimerActive ? (
            <Ionicons name="pause" size={18} color="#FFFFFF" />
          ) : (
            <Ionicons name="play" size={18} color="#FFFFFF" />
          )}
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {exercises.length > 0 ? (
          exercises.map((exercise) => (
            <LogExercise
              key={exercise.id}
              exercise={exercise}
              sets={exerciseSets[exercise.id] || []}
              onUpdateSets={(sets) => handleUpdateSets(exercise.id, sets)}
              onAddSet={() => handleAddSet(exercise.id)}
              onSuperSet={handleSuperSet}
              onComplete={() => handleCompleteExercise(exercise.id)}
            />
          ))
        ) : (
          <Text style={styles.emptyStateText}>Complete all exercises to finish workout</Text>
        )}

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // This would open the exercise selector
            console.log('Open exercise selector');
          }}
        >
          <Ionicons name="add-circle" size={24} color="#0A84FF" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        {showRestTimer && (
          <RestTimer
            initialTime={120}
            onTimerComplete={() => setShowRestTimer(false)}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeWorkoutButton}
          onPress={handleCompleteWorkout}
        >
          <Text style={styles.completeWorkoutText}>Complete Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
