import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

// Import workout context
import { useWorkout, Exercise, ExerciseSet } from '../../contexts/WorkoutContext';
import ExerciseSelectorModal, { Exercise as ModalExercise } from '../../components/ui/ExerciseSelectorModal';
import WorkoutCompleteModal from '../../components/ui/WorkoutCompleteModal';

// Types for Component Props
interface RestTimerProps {
  seconds: number;
  isActive: boolean;
  onComplete: () => void;
}

interface ExerciseSetProps {
  setNumber: number;
  completed: boolean;
  onComplete: () => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
}

interface ExerciseProps {
  exercise: Exercise;
  index: number;
  isActive: boolean;
  onComplete: (exerciseId: string) => void;
}

// Timer component for rest periods
const RestTimer = ({ seconds, isActive, onComplete }: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (interval) clearInterval(interval);
            onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive) {
      setTimeLeft(seconds);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, onComplete]);

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.timerContainerView}>
      <Text style={styles.timerTextStyle}>{formatTime(timeLeft)}</Text>
    </View>
  );
};

// Exercise Set component
const WorkoutSetComponent = ({ setNumber, completed, onComplete, onWeightChange, onRepsChange }: ExerciseSetProps) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const handleWeightChange = (text: string) => {
    setWeight(text);
    onWeightChange(text);
  };

  const handleRepsChange = (text: string) => {
    setReps(text);
    onRepsChange(text);
  };

  return (
    <View style={[styles.setRow, completed && styles.completedSetRow]}>
      <View style={styles.setNumberContainer}>
        <Text style={styles.setNumberText}>{setNumber}</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#8E8E93"
          keyboardType="numeric"
          value={weight}
          onChangeText={handleWeightChange}
          editable={!completed}
        />
        <Text style={styles.inputLabel}>lbs</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#8E8E93"
          keyboardType="numeric"
          value={reps}
          onChangeText={handleRepsChange}
          editable={!completed}
        />
        <Text style={styles.inputLabel}>reps</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.completeButton, completed && styles.completedButton]}
        onPress={onComplete}
        disabled={completed}
      >
        {completed ? (
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        ) : (
          <Text style={styles.completeButtonText}>Done</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Exercise component
const WorkoutExerciseComponent = ({ exercise, index, isActive, onComplete }: ExerciseProps) => {
  const [sets, setSets] = useState<ExerciseSet[]>(
    Array(exercise.sets).fill(0).map((_, i) => ({
      id: i + 1,
      weight: '',
      reps: '',
      completed: false
    }))
  );
  const [expanded, setExpanded] = useState(isActive);
  const [currentSet, setCurrentSet] = useState(1);
  const [restActive, setRestActive] = useState(false);
  const [previousPerformance, setPreviousPerformance] = useState<any[]>([]);
  const [customRestTime, setCustomRestTime] = useState<number | null>(null);
  const [showRestTimePicker, setShowRestTimePicker] = useState(false);
  
  // Get context data
  const { startRestTimer, stopRestTimer, updateExerciseSets, getExercisePreviousPerformance, setCustomRestTimer } = useWorkout();

  // Keep track of personal records
  const [personalRecord, setPersonalRecord] = useState({
    weight: '0',
    reps: '0'
  });
  
  useEffect(() => {
    // Mock loading personal record from storage
    // In a real app, this would fetch from AsyncStorage or API
    setPersonalRecord({
      weight: exercise.name.includes('Bench') ? '225' : 
              exercise.name.includes('Squat') ? '315' : 
              exercise.name.includes('Deadlift') ? '405' : '100',
      reps: '1'
    });
  }, [exercise.name]);
  
  // Load previous performance data
  useEffect(() => {
    if (exercise.name) {
      const performanceData = getExercisePreviousPerformance(exercise.name);
      setPreviousPerformance(performanceData);
    }
  }, [exercise.name]);
  
  const handleSetComplete = (setId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update set completion status
    setSets(prevSets => {
      const updatedSets = prevSets.map(set => 
        set.id === setId ? { ...set, completed: true } : set
      );
      
      // Update the exercise sets in the context
      updateExerciseSets && updateExerciseSets(exercise.id, updatedSets);
      
      return updatedSets;
    });
    
    // If this wasn't the last set, start the rest timer
    if (setId < sets.length) {
      setCurrentSet(setId + 1);
      setRestActive(true);
      startRestTimer(exercise.restTime);
    } else {
      // This was the last set, mark the exercise as completed
      onComplete(exercise.id);
    }
  };
  
  const handleRestComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRestActive(false);
    stopRestTimer();
  };
  
  const handleWeightChange = (setId: number, value: string) => {
    setSets(prevSets => {
      const updatedSets = prevSets.map(set => 
        set.id === setId ? { ...set, weight: value } : set
      );
      
      // Auto-fill weight for incomplete sets below if they're empty
      const currentSetIndex = updatedSets.findIndex(set => set.id === setId);
      if (currentSetIndex !== -1) {
        for (let i = currentSetIndex + 1; i < updatedSets.length; i++) {
          if (!updatedSets[i].completed && updatedSets[i].weight === '') {
            updatedSets[i].weight = value;
          }
        }
      }
      
      // Update in context
      updateExerciseSets && updateExerciseSets(exercise.id, updatedSets);
      
      return updatedSets;
    });
  };
  
  const handleRepsChange = (setId: number, value: string) => {
    setSets(prevSets => {
      const updatedSets = prevSets.map(set => 
        set.id === setId ? { ...set, reps: value } : set
      );
      
      // Auto-fill reps for incomplete sets below if they're empty
      const currentSetIndex = updatedSets.findIndex(set => set.id === setId);
      if (currentSetIndex !== -1) {
        for (let i = currentSetIndex + 1; i < updatedSets.length; i++) {
          if (!updatedSets[i].completed && updatedSets[i].reps === '') {
            updatedSets[i].reps = value;
          }
        }
      }
      
      // Update in context
      updateExerciseSets && updateExerciseSets(exercise.id, updatedSets);
      
      return updatedSets;
    });
  };
  
  const handleAddSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSets(prevSets => {
      const newSetId = prevSets.length + 1;
      
      // Copy weight and reps from the last set if available
      const lastSet = prevSets[prevSets.length - 1];
      const newSet = {
        id: newSetId,
        weight: lastSet ? lastSet.weight : '',
        reps: lastSet ? lastSet.reps : '',
        completed: false
      };
      
      const updatedSets = [...prevSets, newSet];
      
      // Update in context
      updateExerciseSets && updateExerciseSets(exercise.id, updatedSets);
      
      return updatedSets;
    });
  };
  
  const handleRemoveSet = (setId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Don't allow removing sets if only one remains
    if (sets.length <= 1) return;
    
    // Don't allow removing completed sets
    const setToRemove = sets.find(set => set.id === setId);
    if (setToRemove && setToRemove.completed) {
      Alert.alert("Cannot Remove Set", "Completed sets cannot be removed.");
      return;
    }
    
    setSets(prevSets => {
      // Remove the set
      const filteredSets = prevSets.filter(set => set.id !== setId);
      
      // Renumber the remaining sets
      const renumberedSets = filteredSets.map((set, idx) => ({
        ...set,
        id: idx + 1
      }));
      
      // Update in context
      updateExerciseSets && updateExerciseSets(exercise.id, renumberedSets);
      
      return renumberedSets;
    });
  };
  
  const calculatePercentOfMax = (weight: string): string => {
    if (!weight || !personalRecord.weight) return '0%';
    const weightNum = parseFloat(weight);
    const prNum = parseFloat(personalRecord.weight);
    if (isNaN(weightNum) || isNaN(prNum) || prNum === 0) return '0%';
    return `${Math.round((weightNum / prNum) * 100)}%`;
  };
  
  // Handle setting custom rest time
  const handleSetCustomRestTime = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCustomRestTime(seconds);
    setCustomRestTimer(seconds);
    setShowRestTimePicker(false);

    // If rest is active, update the current rest
    if (restActive) {
      stopRestTimer();
      startRestTimer(seconds);
    }
  };

  // Handle starting rest timer with custom time
  const handleStartCustomRest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowRestTimePicker(true);
  };
  
  const allSetsCompleted = sets.every(set => set.completed);
  
  // Check if current set is a PR (more weight or reps than previous best)
  const checkIsPersonalRecord = (weight: string, reps: string) => {
    if (!previousPerformance.length || !weight || !reps) return false;
    
    const numWeight = parseFloat(weight);
    const numReps = parseFloat(reps);
    
    if (isNaN(numWeight) || isNaN(numReps)) return false;
    
    // Get the best previous set for this exercise
    let bestPrevious = { weight: 0, reps: 0 };
    
    previousPerformance.forEach(workout => {
      workout.sets?.forEach((set: any) => {
        const prevWeight = parseFloat(set.weight) || 0;
        const prevReps = parseFloat(set.reps) || 0;
        
        // Simple volume calculation (weight * reps) to compare
        if (prevWeight * prevReps > bestPrevious.weight * bestPrevious.reps) {
          bestPrevious = { weight: prevWeight, reps: prevReps };
        }
      });
    });
    
    // Check if current set is better than previous best
    return numWeight * numReps > bestPrevious.weight * bestPrevious.reps;
  };
  
  return (
    <View style={[styles.exerciseCard, allSetsCompleted && styles.completedExerciseCard]}>
      <TouchableOpacity 
        style={styles.exerciseHeader} 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.exerciseHeaderLeft}>
          <Text style={styles.exerciseNumber}>{index + 1}</Text>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
        </View>
        
        <View style={styles.exerciseHeaderRight}>
          {allSetsCompleted ? (
            <View style={styles.completedPill}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.completedText}>Complete</Text>
            </View>
          ) : (
            <Text style={styles.targetReps}>{exercise.targetReps} reps</Text>
          )}
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#8E8E93"
            style={styles.expandIcon}
          />
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.exerciseContent}>
          {/* Previous Performance Section - Only show if we have data */}
          {previousPerformance.length > 0 && (
            <View style={styles.previousPerformanceContainer}>
              <Text style={styles.previousPerformanceTitle}>Previous Best</Text>
              {previousPerformance[0].sets && previousPerformance[0].sets.length > 0 && (
                <View style={styles.prevSetRow}>
                  <Text style={styles.prevSetText}>
                    {previousPerformance[0].sets[0].weight} lbs × {previousPerformance[0].sets[0].reps} reps
                  </Text>
                  <Text style={styles.prevDateText}>
                    {new Date(previousPerformance[0].date).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Personal Record Section */}
          <View style={styles.personalRecordContainer}>
            <Text style={styles.prLabel}>PR: {personalRecord.weight} lbs × {personalRecord.reps}</Text>
          </View>
          
          <View style={styles.setsContainer}>
            {sets.map((set) => (
              <View key={set.id} style={styles.setRowContainer}>
                <WorkoutSetComponent
                  setNumber={set.id}
                  completed={set.completed}
                  onComplete={() => handleSetComplete(set.id)}
                  onWeightChange={(value) => handleWeightChange(set.id, value)}
                  onRepsChange={(value) => handleRepsChange(set.id, value)}
                />
                
                {!set.completed && sets.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeSetButton}
                    onPress={() => handleRemoveSet(set.id)}
                  >
                    <Ionicons name="close-circle" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                )}
                
                {/* Display percentage of PR */}
                {set.weight && (
                  <View style={styles.percentContainer}>
                    <Text style={styles.percentText}>{calculatePercentOfMax(set.weight)}</Text>
                  </View>
                )}
                
                {/* Show PR badge if this set is better than previous best */}
                {set.completed && checkIsPersonalRecord(set.weight, set.reps) && (
                  <View style={styles.prBadge}>
                    <Ionicons name="trophy" size={14} color="#FFD700" />
                    <Text style={styles.prBadgeText}>PR</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          
          {/* Add Set Button */}
          <TouchableOpacity 
            style={styles.addSetButton}
            onPress={handleAddSet}
          >
            <Ionicons name="add-circle-outline" size={18} color="#0A84FF" />
            <Text style={styles.addSetText}>Add Set</Text>
          </TouchableOpacity>
          
          {restActive && (
            <View style={styles.restTimerWrapper}>
              <Text style={styles.restLabel}>REST</Text>
              <RestTimer
                seconds={customRestTime !== null ? customRestTime : exercise.restTime}
                isActive={restActive}
                onComplete={handleRestComplete}
              />
              <View style={styles.restControls}>
                <TouchableOpacity
                  style={styles.customRestButton}
                  onPress={handleStartCustomRest}
                >
                  <Ionicons name="time-outline" size={16} color="#FF9F0A" />
                  <Text style={styles.customRestText}>Custom</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.skipRestButton}
                  onPress={handleRestComplete}
                >
                  <Text style={styles.skipRestText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Rest Timer Picker */}
          {showRestTimePicker && (
            <View style={styles.restTimePickerContainer}>
              <Text style={styles.restTimePickerTitle}>Set Rest Timer</Text>
              <View style={styles.restTimeOptions}>
                {[30, 45, 60, 90, 120, 180].map(seconds => (
                  <TouchableOpacity
                    key={seconds}
                    style={[
                      styles.restTimeOption,
                      customRestTime === seconds && styles.selectedRestTimeOption
                    ]}
                    onPress={() => handleSetCustomRestTime(seconds)}
                  >
                    <Text style={[
                      styles.restTimeOptionText,
                      customRestTime === seconds && styles.selectedRestTimeOptionText
                    ]}>
                      {seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m${seconds % 60 > 0 ? ` ${seconds % 60}s` : ''}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default function ActiveWorkoutScreen() {
  // Get context data
  const { 
    isWorkoutActive, 
    currentWorkout,
    workoutSummary,
    minimizeWorkout, 
    endWorkout, 
    completeExercise,
    addExercise,
    removeExercise
  } = useWorkout();
  
  const { exercises, elapsedTime } = currentWorkout;
  
  // Use router for navigation
  const router = useRouter();
  
  // Local state for active exercise
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  
  // State for exercise selector modal
  const [selectorVisible, setSelectorVisible] = useState(false);
  
  // State for workout complete modal
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  
  // Initialize active exercise when screen loads
  useEffect(() => {
    if (isWorkoutActive && exercises.length > 0) {
      // Find first uncompleted exercise
      const firstUncompleted = exercises.findIndex(ex => !ex.completed);
      if (firstUncompleted !== -1) {
        setActiveExerciseId(exercises[firstUncompleted].id);
      } else {
        setActiveExerciseId(exercises[0].id);
      }
    }
  }, [isWorkoutActive, exercises]);
  
  // Back button handling
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Instead of ending the workout or showing an alert, minimize it
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        handleMinimizeWorkout();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );
  
  // Format timer display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle exercise completion
  const handleExerciseComplete = (exerciseId: string) => {
    completeExercise(exerciseId);
    
    // Find the next uncompleted exercise
    const nextIndex = exercises.findIndex(ex => !ex.completed);
    if (nextIndex !== -1) {
      setActiveExerciseId(exercises[nextIndex].id);
    }
  };
  
  // Handle workout completion
  const handleFinishWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      "Finish Workout",
      "Are you sure you want to end this workout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "End Workout", 
          style: 'destructive',
          onPress: () => {
            endWorkout();
            setCompleteModalVisible(true);
          }
        }
      ]
    );
  };
  
  // Handle minimizing active workout
  const handleMinimizeWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    minimizeWorkout();
    router.back();
  };
  
  // Handle adding a new exercise
  const handleAddExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectorVisible(true);
  };
  
  // Handle selecting an exercise from the modal
  const handleSelectExercise = (exercise: ModalExercise) => {
    // Add the selected exercise to the workout
    addExercise && addExercise({
      id: `e${new Date().getTime()}`,
      name: exercise.name,
      sets: exercise.sets || 3,
      targetReps: exercise.targetReps || '8-12',
      restTime: exercise.restTime || 60,
      completed: false
    });
  };
  
  // Handle removing an exercise
  const handleRemoveExercise = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Don't allow removing if only one exercise remains
    if (exercises.length <= 1) {
      Alert.alert("Cannot Remove", "Your workout must include at least one exercise.");
      return;
    }
    
    // Don't allow removing completed exercises
    const exerciseToRemove = exercises.find(ex => ex.id === exerciseId);
    if (exerciseToRemove && exerciseToRemove.completed) {
      Alert.alert("Cannot Remove", "Completed exercises cannot be removed.");
      return;
    }
    
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeExercise && removeExercise(exerciseId);
          }
        }
      ]
    );
  };
  
  const allExercisesCompleted = exercises.every(ex => ex.completed);
  
  // If no active workout and no summary, redirect back
  useEffect(() => {
    if (!isWorkoutActive && !workoutSummary) {
      router.replace('/workout');
    }
  }, [isWorkoutActive, workoutSummary]);
  
  // Add a header component with a minimize button
  const HeaderBar = () => {
    return (
      <View style={styles.headerBar}>
        <BlurView intensity={30} tint="dark" style={styles.headerBlur}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerControls}>
              <TouchableOpacity 
                style={styles.minimizeButton}
                onPress={handleMinimizeWorkout}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>Active Workout</Text>
                <Text style={styles.workoutTimer}>{formatDuration(elapsedTime)}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.endButton}
                onPress={handleFinishWorkout}
                activeOpacity={0.7}
              >
                <Text style={styles.endButtonText}>End</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </BlurView>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with minimize button */}
      <HeaderBar />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Render exercises here */}
        {exercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseWrapper}>
            <WorkoutExerciseComponent
              exercise={exercise}
              index={index}
              isActive={exercise.id === activeExerciseId}
              onComplete={handleExerciseComplete}
            />
            
            {!exercise.completed && (
              <TouchableOpacity 
                style={styles.removeExerciseButton}
                onPress={() => handleRemoveExercise(exercise.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                <Text style={styles.removeExerciseText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={handleAddExercise}
        >
          <Ionicons name="add-circle" size={24} color="#0A84FF" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
        
        {/* Bottom section with finish button */}
        <View style={styles.bottomSection}>
          {allExercisesCompleted ? (
            <TouchableOpacity
              style={styles.finishWorkoutButton}
              onPress={handleFinishWorkout}
              activeOpacity={0.7}
            >
              <Text style={styles.finishWorkoutText}>Complete Workout</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.completeAllText}>
              Complete all exercises to finish workout
            </Text>
          )}
        </View>
      </ScrollView>
      
      {/* Exercise Selector Modal */}
      <ExerciseSelectorModal
        visible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
        onSelectExercise={handleSelectExercise}
      />
      
      {/* Workout Complete Modal */}
      <WorkoutCompleteModal
        visible={completeModalVisible}
        onClose={() => setCompleteModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerBar: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
  },
  headerBlur: {
    width: '100%',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  workoutTimer: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  minimizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
  },
  endButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  endButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    marginTop: 80, // Account for header height
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  exerciseWrapper: {
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  completedExerciseCard: {
    backgroundColor: 'rgba(48, 209, 88, 0.1)',  // Green tint for completed exercises
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.2)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
    marginRight: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  exerciseHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#30D158',
    marginLeft: 4,
  },
  targetReps: {
    fontSize: 13,
    color: '#8E8E93',
  },
  expandIcon: {
    marginLeft: 8,
  },
  exerciseContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(60, 60, 67, 0.1)',
    padding: 16,
  },
  personalRecordContainer: {
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  prLabel: {
    color: '#FF9F0A',
    fontSize: 14,
    fontWeight: '600',
  },
  setsContainer: {
    marginBottom: 8,
  },
  setRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
  },
  completedSetRow: {
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
  },
  setNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  setNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    width: 60,
    height: 40,
    backgroundColor: 'rgba(60, 60, 67, 0.2)',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginRight: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  completeButton: {
    width: 60,
    height: 36,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completedButton: {
    backgroundColor: '#30D158',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  removeSetButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  percentContainer: {
    position: 'absolute',
    top: 0,
    right: 6,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 159, 10, 0.2)',
  },
  percentText: {
    fontSize: 10,
    color: '#FF9F0A',
    fontWeight: '500',
  },
  restTimerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 159, 10, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  restLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  skipRestButton: {
    backgroundColor: '#FF9F0A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipRestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timerContainerView: {
    backgroundColor: 'rgba(255, 159, 10, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 12,
  },
  timerTextStyle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  addSetText: {
    marginLeft: 8,
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },
  removeExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
    borderRadius: 8, 
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  removeExerciseText: {
    marginLeft: 4,
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
    marginLeft: 8,
  },
  bottomSection: {
    padding: 16,
    alignItems: 'center',
  },
  finishWorkoutButton: {
    backgroundColor: '#FF2D55',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  finishWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  previousPerformanceContainer: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  previousPerformanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
    marginBottom: 4,
  },
  prevSetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prevSetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  prevDateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: -6,
    right: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  prBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 2,
  },
  restControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  customRestText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9F0A',
    marginLeft: 4,
  },
  restTimePickerContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.2)',
  },
  restTimePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  restTimeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  restTimeOption: {
    width: '30%',
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedRestTimeOption: {
    backgroundColor: 'rgba(255, 159, 10, 0.3)',
  },
  restTimeOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedRestTimeOptionText: {
    color: '#FF9F0A',
    fontWeight: '600',
  },
}); 