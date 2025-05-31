import { useEnhancedWorkout } from '@/contexts/EnhancedWorkoutContext';
import { ExerciseSet } from '@/contexts/WorkoutContext';
import { ExerciseTemplate, WorkoutExercise } from '@/services/OfflineWorkoutService';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuickInputButtonProps {
  value: string;
  onPress: () => void;
  isSelected?: boolean;
}

const QuickInputButton: React.FC<QuickInputButtonProps> = ({ value, onPress, isSelected = false }) => (
  <TouchableOpacity
    style={[styles.quickButton, isSelected && styles.quickButtonSelected]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.quickButtonText, isSelected && styles.quickButtonTextSelected]}>
      {value}
    </Text>
  </TouchableOpacity>
);

interface SetRowProps {
  set: ExerciseSet;
  index: number;
  onUpdate: (updates: Partial<ExerciseSet>) => void;
  previousPerformance?: { weight: string; reps: string; } | null;
  isPersonalRecord?: boolean;
}

const SetRow: React.FC<SetRowProps> = ({ 
  set, 
  index, 
  onUpdate, 
  previousPerformance,
  isPersonalRecord = false 
}) => {
  const [localWeight, setLocalWeight] = useState(set.weight.toString());
  const [localReps, setLocalReps] = useState(set.reps.toString());
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLocalWeight(set.weight.toString());
    setLocalReps(set.reps.toString());
  }, [set.weight, set.reps]);

  const handleComplete = () => {
    if (!localWeight || !localReps) {
      Alert.alert('Missing Data', 'Please enter both weight and reps before completing the set.');
      return;
    }

    // Animate completion
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onUpdate({
      weight: localWeight,
      reps: localReps,
      completed: !set.completed
    });

    if (!set.completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const quickWeights = ['135', '185', '225', '275', '315'];
  const quickReps = ['5', '8', '10', '12', '15'];

  return (
    <Animated.View style={[styles.setRow, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.setHeader}>
        <Text style={styles.setNumber}>{index + 1}</Text>
        {isPersonalRecord && (
          <View style={styles.prBadge}>
            <Ionicons name="trophy" size={12} color="#FFD700" />
            <Text style={styles.prText}>PR</Text>
          </View>
        )}
      </View>

      <View style={styles.setInputs}>
        {/* Weight Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight</Text>
          <TextInput
            style={[styles.setInput, set.completed && styles.setInputCompleted]}
            value={localWeight}
            onChangeText={(text) => {
              setLocalWeight(text);
              onUpdate({ weight: text });
            }}
            placeholder="0"
            placeholderTextColor="#666"
            keyboardType="numeric"
            returnKeyType="next"
          />
          
          {/* Quick Weight Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickInputs}>
            {quickWeights.map((weight) => (
              <QuickInputButton
                key={weight}
                value={weight}
                isSelected={localWeight === weight}
                onPress={() => {
                  setLocalWeight(weight);
                  onUpdate({ weight });
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Reps Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            style={[styles.setInput, set.completed && styles.setInputCompleted]}
            value={localReps}
            onChangeText={(text) => {
              setLocalReps(text);
              onUpdate({ reps: text });
            }}
            placeholder="0"
            placeholderTextColor="#666"
            keyboardType="numeric"
            returnKeyType="done"
          />

          {/* Quick Reps Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickInputs}>
            {quickReps.map((reps) => (
              <QuickInputButton
                key={reps}
                value={reps}
                isSelected={localReps === reps}
                onPress={() => {
                  setLocalReps(reps);
                  onUpdate({ reps });
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[styles.completeButton, set.completed && styles.completeButtonActive]}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={set.completed ? "checkmark-circle" : "radio-button-off"} 
            size={24} 
            color={set.completed ? "#00D4FF" : "#666"} 
          />
        </TouchableOpacity>
      </View>

      {/* Previous Performance */}
      {previousPerformance && (
        <View style={styles.previousPerformance}>
          <Text style={styles.previousLabel}>Last: </Text>
          <Text style={styles.previousValue}>
            {previousPerformance.weight}lbs × {previousPerformance.reps}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdateSet: (setId: number, updates: Partial<ExerciseSet>) => void;
  onAddSet: () => void;
  previousPerformance: { date: string; weight: string; reps: string; }[];
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  onUpdateSet, 
  onAddSet, 
  previousPerformance 
}) => {
  const completedSets = exercise.sets.filter(set => set.completed).length;
  const totalSets = exercise.sets.length;

  return (
    <View style={styles.exerciseCard}>
      <BlurView intensity={10} style={styles.exerciseCardBlur}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseMeta}>
              {exercise.muscleGroups.join(', ')} • {exercise.equipment}
            </Text>
            <Text style={styles.setProgress}>
              {completedSets}/{totalSets} sets completed
            </Text>
          </View>
          
          <View style={styles.exerciseActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAddSet}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={24} color="#00D4FF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.setsContainer}>
          {exercise.sets.map((set, index) => {
            const prevPerf = previousPerformance[index] || null;
            // Simple PR detection (in production, this would be more sophisticated)
            const isPersonalRecord = prevPerf && 
              parseFloat(set.weight.toString()) > parseFloat(prevPerf.weight);

            return (
              <SetRow
                key={set.id}
                set={set}
                index={index}
                onUpdate={(updates) => onUpdateSet(set.id, updates)}
                previousPerformance={prevPerf}
                isPersonalRecord={isPersonalRecord}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const RestTimer: React.FC = () => {
  const { isRestTimerActive, restTimeRemaining, pauseRestTimer, resetRestTimer } = useEnhancedWorkout();

  if (!isRestTimerActive) return null;

  const minutes = Math.floor(restTimeRemaining / 60);
  const seconds = restTimeRemaining % 60;

  return (
    <BlurView intensity={20} style={styles.restTimer}>
      <View style={styles.restTimerContent}>
        <Text style={styles.restTimerLabel}>Rest Timer</Text>
        <Text style={styles.restTimerTime}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
        <View style={styles.restTimerActions}>
          <TouchableOpacity onPress={pauseRestTimer} style={styles.restButton}>
            <Ionicons name="pause" size={16} color="#00D4FF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={resetRestTimer} style={styles.restButton}>
            <Ionicons name="stop" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
};

export default function EnhancedWorkoutLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    activeWorkout,
    isWorkoutActive,
    elapsedTime,
    exerciseLibrary,
    searchResults,
    isSearching,
    totalVolume,
    completedSets,
    personalRecords,
    lastError,
    startWorkout,
    endWorkout,
    searchExercises,
    addExerciseToWorkout,
    logSet,
    getExercisePreviousPerformance,
    clearError
  } = useEnhancedWorkout();

  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exercisePerformanceCache, setExercisePerformanceCache] = useState<
    Record<string, { date: string; weight: string; reps: string; }[]>
  >({});

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Load previous performance for exercises
  useEffect(() => {
    if (activeWorkout) {
      activeWorkout.exercises.forEach(async (exercise) => {
        if (!exercisePerformanceCache[exercise.name]) {
          const performance = await getExercisePreviousPerformance(exercise.name);
          setExercisePerformanceCache(prev => ({
            ...prev,
            [exercise.name]: performance
          }));
        }
      });
    }
  }, [activeWorkout?.exercises]);

  // Handle exercise search
  const handleSearchExercises = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchExercises(query);
    }
  }, [searchExercises]);

  // Add exercise to workout
  const handleAddExercise = async (exercise: ExerciseTemplate) => {
    try {
      await addExerciseToWorkout(exercise.id);
      setShowExerciseSearch(false);
      setSearchQuery('');
      
      // Preload performance data
      const performance = await getExercisePreviousPerformance(exercise.name);
      setExercisePerformanceCache(prev => ({
        ...prev,
        [exercise.name]: performance
      }));
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  // Update set
  const handleUpdateSet = async (exerciseId: string, setId: number, updates: Partial<ExerciseSet>) => {
    try {
      await logSet(exerciseId, { id: setId, ...updates });
    } catch (error) {
      console.error('Error updating set:', error);
    }
  };

  // Add new set to exercise
  const handleAddSet = async (exerciseId: string) => {
    const exercise = activeWorkout?.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const newSetNumber = exercise.sets.length + 1;
    await logSet(exerciseId, {
      id: newSetNumber,
      weight: '',
      reps: '',
      completed: false,
      repType: 'standard'
    });
  };

  // Start new workout
  const handleStartWorkout = async () => {
    try {
      await startWorkout(`Workout ${new Date().toLocaleDateString()}`);
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };

  // End workout
  const handleEndWorkout = async () => {
    if (!activeWorkout) return;

    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Workout',
          style: 'destructive',
          onPress: async () => {
            try {
              const summary = await endWorkout();
              if (summary) {
                router.push('/workout/complete');
              }
            } catch (error) {
              console.error('Error ending workout:', error);
            }
          }
        }
      ]
    );
  };

  // Show error if any
  useEffect(() => {
    if (lastError) {
      Alert.alert('Error', lastError, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [lastError, clearError]);

  if (!isWorkoutActive && !activeWorkout) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        <View style={styles.emptyState}>
          <BlurView intensity={20} style={styles.emptyStateBlur}>
            <Ionicons name="fitness" size={64} color="#00D4FF" />
            <Text style={styles.emptyStateTitle}>Ready to Train?</Text>
            <Text style={styles.emptyStateText}>
              Start a new workout session to begin logging your exercises and tracking your progress.
            </Text>
            
            <TouchableOpacity
              style={styles.startWorkoutButton}
              onPress={handleStartWorkout}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.startWorkoutBlur}>
                <Ionicons name="play" size={24} color="#00D4FF" />
                <Text style={styles.startWorkoutText}>Start Workout</Text>
              </BlurView>
            </TouchableOpacity>
          </BlurView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <BlurView intensity={20} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.workoutTitle}>{activeWorkout?.name}</Text>
            <Text style={styles.workoutTime}>{formatTime(elapsedTime)}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalVolume.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Volume</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{completedSets}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{personalRecords}</Text>
                <Text style={styles.statLabel}>PRs</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndWorkout}
              activeOpacity={0.8}
            >
              <Ionicons name="stop" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* Rest Timer */}
      <RestTimer />

      {/* Exercises List */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeWorkout?.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdateSet={(setId, updates) => handleUpdateSet(exercise.id, setId, updates)}
            onAddSet={() => handleAddSet(exercise.id)}
            previousPerformance={exercisePerformanceCache[exercise.name] || []}
          />
        ))}

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowExerciseSearch(true)}
          activeOpacity={0.8}
        >
          <BlurView intensity={20} style={styles.addExerciseBlur}>
            <Ionicons name="add" size={24} color="#00D4FF" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </BlurView>
        </TouchableOpacity>
      </ScrollView>

      {/* Exercise Search Modal */}
      <Modal
        visible={showExerciseSearch}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExerciseSearch(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <TouchableOpacity onPress={() => setShowExerciseSearch(false)}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={handleSearchExercises}
              autoFocus
            />
          </View>

          <FlatList
            data={searchQuery ? searchResults : exerciseLibrary}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => handleAddExercise(item)}
                activeOpacity={0.8}
              >
                <View style={styles.exerciseItemContent}>
                  <Text style={styles.exerciseItemName}>{item.name}</Text>
                  <Text style={styles.exerciseItemMeta}>
                    {item.muscleGroups.join(', ')} • {item.difficulty}
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" size={24} color="#00D4FF" />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  workoutTime: {
    fontSize: 16,
    color: '#00D4FF',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  endButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  exerciseCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  setProgress: {
    fontSize: 12,
    color: '#00D4FF',
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setsContainer: {
    gap: 12,
  },
  setRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  prText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  setInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
  },
  setInputCompleted: {
    borderColor: '#00D4FF',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  quickInputs: {
    marginTop: 8,
  },
  quickButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  quickButtonSelected: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#00D4FF',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  quickButtonTextSelected: {
    color: '#00D4FF',
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  previousPerformance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  previousLabel: {
    fontSize: 12,
    color: '#666',
  },
  previousValue: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  addExerciseButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addExerciseBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D4FF',
  },
  restTimer: {
    position: 'absolute',
    top: 140,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restTimerContent: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00D4FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  restTimerLabel: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  restTimerTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00D4FF',
    marginVertical: 4,
  },
  restTimerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  restButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startWorkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  startWorkoutBlur: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00D4FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startWorkoutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00D4FF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  searchContainer: {
    padding: 20,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFF',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  exerciseItemMeta: {
    fontSize: 14,
    color: '#888',
  },
}); 