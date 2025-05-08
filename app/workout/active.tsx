import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  previousWeight: string;
  previousReps: string;
  weight: string;
  reps: string;
  completed: boolean;
  onCompleteToggle: () => void;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
}

interface ExerciseProps {
  exercise: Exercise;
  index: number;
  isActive: boolean;
  onComplete: (exerciseId: string) => void;
  onSuperSetPress: (exerciseId: string) => void;
}

// Timer component for rest periods - Memoized
const RestTimer = React.memo(({ seconds, isActive, onComplete }: RestTimerProps) => {
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
});

// Exercise Set component - Memoized
const WorkoutSetComponent = React.memo(({ 
    setNumber, 
    completed, 
    previousWeight, 
    previousReps, 
    weight,
    reps,
    onCompleteToggle, 
    onWeightChange, 
    onRepsChange 
}: ExerciseSetProps) => {

  // Combine previous performance into a single string
  const previousPerformanceText = `${previousWeight} lb x ${previousReps} reps`;
  const showPrevious = previousWeight !== '--' && previousReps !== '--';

  return (
    <View style={styles.setRowV2}>
      <Text style={styles.setNumberTextV2}>{setNumber}x</Text>
      
      <Text style={styles.previousTextV2} numberOfLines={1}>
        {showPrevious ? previousPerformanceText : '--'}
      </Text>
      
      <View style={styles.inputContainerV2}>
        <TextInput
          style={styles.inputV2}
          placeholder="--"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={weight}
          onChangeText={onWeightChange}
          editable={!completed}
          selectTextOnFocus
        />
        <Text style={styles.inputLabelV2}>lb</Text>
      </View>
      
      <View style={styles.inputContainerV2}>
        <TextInput
          style={styles.inputV2}
          placeholder="--"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={reps}
          onChangeText={onRepsChange}
          editable={!completed}
          selectTextOnFocus
        />
        <Text style={styles.inputLabelV2}>reps</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.completeButtonV2, completed && styles.completedButtonActiveV2]}
        onPress={onCompleteToggle}
      >
        {completed && (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
});

// Define a local set type that includes previous performance for UI state
interface UILocalSet extends ExerciseSet {
  previousWeight?: string; 
  previousReps?: string;
}

// Exercise component - Memoized
const WorkoutExerciseComponent = React.memo(({ 
    exercise, 
    index, 
    isActive, 
    onComplete,
    onSuperSetPress
}: ExerciseProps) => {
  // Use refs to store mutable state that shouldn't trigger rerenders
  const exerciseIdRef = useRef(exercise.id);
  const exerciseNameRef = useRef(exercise.name);
  const exerciseSetsCountRef = useRef(exercise.sets || 1);
  
  // States that should trigger UI updates
  const [sets, setSets] = useState<UILocalSet[]>(() => 
    Array(exercise.sets || 1).fill(null).map((_, i) => ({
      id: i + 1,
      weight: '', 
      reps: '',   
      completed: false,
      previousWeight: '--',
      previousReps: '--'   
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

  // Keep track of personal records - memoized to prevent recalculation
  const personalRecord = useMemo(() => ({
    weight: exercise.name.includes('Bench') ? '225' : 
            exercise.name.includes('Squat') ? '315' : 
            exercise.name.includes('Deadlift') ? '405' : '100',
    reps: '1'
  }), [exercise.name]);
  
  // Load previous performance data once when exercise changes
  useEffect(() => {
    // Skip if exercise hasn't changed
    if (exerciseNameRef.current === exercise.name && 
        exerciseSetsCountRef.current === exercise.sets) {
      return;
    }
    
    // Update refs
    exerciseNameRef.current = exercise.name;
    exerciseSetsCountRef.current = exercise.sets || 1;
    
    if (exercise.name) {
      const performanceHistory = getExercisePreviousPerformance(exercise.name);
      setPreviousPerformance(performanceHistory);
      
      // Create new sets based on updated exercise
      const newSets = Array(exercise.sets || 1).fill(null).map((_, i) => {
        // Look for previous data if available
        const prevData = performanceHistory.length > 0 && 
                        performanceHistory[0]?.sets && 
                        i < performanceHistory[0].sets.length ? 
                        performanceHistory[0].sets[i] : null;
        
        return {
          id: i + 1,
          weight: '', 
          reps: '',   
          completed: false,
          previousWeight: prevData?.weight?.toString() || '--',
          previousReps: prevData?.reps?.toString() || '--'   
        };
      });
      
      setSets(newSets);
    }
  }, [exercise.name, exercise.sets]);
  
  // Update expanded state only when isActive changes
  useEffect(() => {
    if (expanded !== isActive) {
      setExpanded(isActive);
    }
  }, [isActive]);
  
  // Memoize handlers to prevent recreation on each render
  const handleSetCompleteToggle = useCallback((setId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setSets(prevSets => {
      // Check if set was completed before toggle
      const setToToggle = prevSets.find(s => s.id === setId);
      if (!setToToggle) return prevSets;
      
      const wasCompleted = setToToggle.completed;
      
      // Update sets
      const updatedSets = prevSets.map(set => 
        set.id === setId ? { ...set, completed: !set.completed } : set
      );
      
      // Update the exercise sets in the context
      const setsForContext: ExerciseSet[] = updatedSets.map(({ previousWeight, previousReps, ...baseSet }) => baseSet);
      updateExerciseSets && updateExerciseSets(exercise.id, setsForContext);
      
      // Handle toggling rest timer
      if (!wasCompleted && setId < prevSets.length) {
        // Just completed a set (but not the last one)
        setCurrentSet(setId + 1);
        setRestActive(true);
        startRestTimer(customRestTime ?? exercise.restTime);
      } else if (setId === prevSets.length && !wasCompleted) {
        // Just completed the last set
        stopRestTimer();
        setRestActive(false);
        
        // Check if all sets are now complete
        if (updatedSets.every(s => s.completed)) {
          onComplete(exercise.id);
        }
      } else if (wasCompleted) {
        // Uncompleting a set - stop rest timer if running
        stopRestTimer();
        setRestActive(false);
      }
      
      return updatedSets;
    });
  }, [
    exercise.id, 
    exercise.restTime, 
    customRestTime, 
    startRestTimer, 
    stopRestTimer, 
    updateExerciseSets, 
    onComplete
  ]);
  
  const handleRestComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRestActive(false);
    stopRestTimer();
  }, [stopRestTimer]);
  
  const handleWeightChange = useCallback((setId: number, value: string) => {
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
      const setsForContextUpdateWeight: ExerciseSet[] = updatedSets.map(({ previousWeight, previousReps, ...baseSet }) => baseSet);
      updateExerciseSets && updateExerciseSets(exercise.id, setsForContextUpdateWeight);
      
      return updatedSets;
    });
  }, [exercise.id, updateExerciseSets]);
  
  const handleRepsChange = useCallback((setId: number, value: string) => {
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
      const setsForContextUpdateReps: ExerciseSet[] = updatedSets.map(({ previousWeight, previousReps, ...baseSet }) => baseSet);
      updateExerciseSets && updateExerciseSets(exercise.id, setsForContextUpdateReps);
      
      return updatedSets;
    });
  }, [exercise.id, updateExerciseSets]);
  
  const handleAddSet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSets(prevSets => {
      const newSetId = prevSets.length + 1;
      
      // Copy weight and reps from the last set if available
      const lastSet = prevSets[prevSets.length - 1];
      const newSet: UILocalSet = {
        id: newSetId,
        weight: lastSet ? lastSet.weight : '',
        reps: lastSet ? lastSet.reps : '',
        completed: false,
        previousWeight: '--',
        previousReps: '--'
      };
      
      const updatedSets = [...prevSets, newSet];
      
      // Update in context
      const setsForContextAdd: ExerciseSet[] = updatedSets.map(({ previousWeight, previousReps, ...baseSet }) => baseSet);
      updateExerciseSets && updateExerciseSets(exercise.id, setsForContextAdd);
      
      return updatedSets;
    });
  }, [exercise.id, updateExerciseSets]);
  
  const handleRemoveSet = useCallback((setId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setSets(prevSets => {
      // Don't allow removing sets if only one remains
      if (prevSets.length <= 1) return prevSets;
      
      // Don't allow removing completed sets
      const setToRemove = prevSets.find(set => set.id === setId);
      if (setToRemove && setToRemove.completed) {
        Alert.alert("Cannot Remove Set", "Completed sets cannot be removed.");
        return prevSets;
      }
      
      // Remove the set
      const filteredSets = prevSets.filter(set => set.id !== setId);
      
      // Renumber the remaining sets
      const renumberedSets = filteredSets.map((set, idx) => ({
        ...set,
        id: idx + 1
      }));
      
      // Update in context
      const setsForContextRemove: ExerciseSet[] = renumberedSets.map(({ previousWeight, previousReps, ...baseSet }) => baseSet);
      updateExerciseSets && updateExerciseSets(exercise.id, setsForContextRemove);
      
      return renumberedSets;
    });
  }, [exercise.id, updateExerciseSets]);
  
  const calculatePercentOfMax = useCallback((weight: string): string => {
    if (!weight || !personalRecord.weight) return '0%';
    const weightNum = parseFloat(weight);
    const prNum = parseFloat(personalRecord.weight);
    if (isNaN(weightNum) || isNaN(prNum) || prNum === 0) return '0%';
    return `${Math.round((weightNum / prNum) * 100)}%`;
  }, [personalRecord.weight]);
  
  const handleSetCustomRestTime = useCallback((seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCustomRestTime(seconds);
    setCustomRestTimer(seconds);
    setShowRestTimePicker(false);

    // If rest is active, update the current rest
    if (restActive) {
      stopRestTimer();
      startRestTimer(seconds);
    }
  }, [restActive, startRestTimer, stopRestTimer, setCustomRestTimer]);

  const handleStartCustomRest = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowRestTimePicker(true);
  }, []);
  
  const allSetsCompleted = useMemo(() => sets.every(set => set.completed), [sets]);
  
  const checkIsPersonalRecord = useCallback((weight: string, reps: string) => {
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
  }, [previousPerformance]);
  
  const handleToggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);
  
  return (
    <View style={styles.exerciseCardOuterContainer}>
      <BlurView intensity={50} tint="dark" style={styles.exerciseCardBlur}>
        <TouchableOpacity 
          style={styles.exerciseHeader}
          onPress={handleToggleExpand}
          activeOpacity={0.8}
        >
          <View style={styles.exerciseHeaderLeft}>
            <View style={styles.exerciseIconPlaceholder}>
                <Ionicons name="barbell-outline" size={24} color="#C0C0C0" />
            </View>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
          </View>
          
          <View style={styles.exerciseHeaderRight}>
            <TouchableOpacity onPress={() => console.log('More options for:', exercise.name)} style={styles.moreOptionsExerciseButton}>
                <Ionicons name="ellipsis-horizontal" size={22} color="#C0C0C0" />
            </TouchableOpacity>
            <Ionicons
              name={expanded ? "chevron-down-outline" : "chevron-forward-outline"}
              size={22}
              color="#C0C0C0"
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>
        
        {expanded && (
          <View style={styles.exerciseContent}>
            <View style={styles.setTableHeader}>
                <Text style={[styles.setHeaderText, styles.previousHeader]}>PREVIOUS</Text>
                <Text style={[styles.setHeaderText, styles.weightHeader]}>WEIGHT</Text>
                <Text style={[styles.setHeaderText, styles.repsHeader]}>REP</Text>
                <View style={styles.checkHeader} />
            </View>
            
            <View style={styles.setsContainer}>
              {sets.map((set) => (
                <View key={set.id} style={styles.setRowContainer}>
                  <WorkoutSetComponent
                    setNumber={set.id}
                    completed={set.completed}
                    previousWeight={set.previousWeight || '--'}
                    previousReps={set.previousReps || '--'}
                    weight={set.weight}
                    reps={set.reps}
                    onCompleteToggle={() => handleSetCompleteToggle(set.id)}
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
                  
                  {set.weight && (
                    <View style={styles.percentContainer}>
                      <Text style={styles.percentText}>{calculatePercentOfMax(set.weight)}</Text>
                    </View>
                  )}
                  
                  {set.completed && checkIsPersonalRecord(set.weight, set.reps) && (
                    <View style={styles.prBadge}>
                      <Ionicons name="trophy" size={14} color="#FFD700" />
                      <Text style={styles.prBadgeText}>PR</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
            
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleAddSet}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#0A84FF" style={styles.actionButtonIcon} />
                <Text style={styles.actionButtonText}>Add Set</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onSuperSetPress(exercise.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="swap-horizontal-outline" size={20} color="#0A84FF" style={styles.actionButtonIcon} />
                <Text style={styles.actionButtonText}>Super Set</Text>
              </TouchableOpacity>
            </View>
            
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
      </BlurView>
    </View>
  );
});

// HeaderBar as a separate component outside of main component
const HeaderBar = React.memo(({ 
  workoutName, 
  isEditing, 
  isTimerActive,
  onEditName, 
  onSubmitName, 
  onChangeText, 
  onClose,
  inputRef
}: {
  workoutName: string;
  isEditing: boolean;
  isTimerActive: boolean;
  onEditName: () => void;
  onSubmitName: () => void;
  onChangeText: (text: string) => void;
  onClose: () => void;
  inputRef: React.LegacyRef<TextInput>;
}) => {
  // Fixed timer values - should come from context in a real implementation
  const timerValue = 0;
  const displayTime = new Date(timerValue * 1000).toISOString().substr(14, 5);
  
  return (
    <View style={styles.topHeaderContainer}>
      <TouchableOpacity onPress={onClose} style={styles.headerButton}>
        <Ionicons name="close-outline" size={32} color="#C0C0C0" />
      </TouchableOpacity>
      
      <View style={styles.workoutTitleContainer}>
        {isEditing ? (
          <TextInput
            ref={inputRef}
            style={styles.workoutNameInput}
            value={workoutName}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitName}
            onBlur={onSubmitName}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={onEditName} style={styles.workoutNameDisplay}>
            <Text style={styles.headerWorkoutNameText}>{workoutName}</Text>
            <Ionicons name="pencil-outline" size={16} color="#8E8E93" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => console.log('Set Up pressed')} style={styles.setUpButton}>
          <Text style={styles.setUpText}>Set Up {'>'}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerRightControls}>
        <TouchableOpacity 
          onPress={() => console.log("Timer toggle - context function missing")} 
          style={styles.headerButton}
        >
          <Ionicons name={isTimerActive ? "pause-outline" : "play-outline"} size={28} color="#C0C0C0" />
        </TouchableOpacity>
        <Text style={styles.headerTimerText}>{displayTime}</Text>
      </View>
    </View>
  );
});

// Main screen component
export default function ActiveWorkoutScreen() {
  const routerInternal = useRouter();
  const { 
    currentWorkout,
    workoutSummary,
    minimizeWorkout,
    endWorkout,
    completeExercise,
    addExercise,
    removeExercise,
    startRestTimer,
    stopRestTimer,
    updateExerciseSets,
    getExercisePreviousPerformance,
    setCustomRestTimer,
  } = useWorkout();
  
  // Use useMemo for derived values from context
  const activeWorkoutExercises = useMemo(() => 
    currentWorkout?.exercises || [], 
    [currentWorkout?.exercises]
  );
  
  const initialWorkoutName = 'New Workout';

  // Use useRef to avoid rerendering for state that doesn't need UI updates
  const initialized = useRef(false);
  
  // Main component state
  const [editableWorkoutName, setEditableWorkoutName] = useState(initialWorkoutName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isHeaderTimerActive, setIsHeaderTimerActive] = useState(false);
  const workoutNameInputRef = useRef<TextInput>(null);

  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  
  // One-time initialization effect
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      // Set initial workout name from summary
      if (workoutSummary?.title) {
        setEditableWorkoutName(workoutSummary.title);
      }
      
      // Initialize timer state if needed
      if (currentWorkout && !isHeaderTimerActive) {
        setIsHeaderTimerActive(true);
      }
    }
  }, []);
  
  // Update workout name only when summary title changes, not on every render
  useEffect(() => {
    if (workoutSummary?.title && 
        workoutSummary.title !== editableWorkoutName && 
        !isEditingName) {
      setEditableWorkoutName(workoutSummary.title);
    }
  }, [workoutSummary?.title]);
  
  // Handle close action for header
  const handleHeaderClose = useCallback(() => {
    if (routerInternal.canGoBack()) {
      routerInternal.back();
    } else {
      routerInternal.replace('/(tabs)/home');
    }
  }, [routerInternal]);
  
  // Rest of handlers (unchanged)
  const handleNameEdit = useCallback(() => {
    setIsEditingName(true);
    setTimeout(() => workoutNameInputRef.current?.focus(), 0);
  }, []);

  const handleNameSubmit = useCallback(() => {
    setIsEditingName(false);
    // Context function would be called here to update name
  }, []);
  
  const handleFinishWorkout = useCallback(() => {
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
  }, [endWorkout]);
  
  const handleMinimizeWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    minimizeWorkout();
    
    if (routerInternal.canGoBack()) {
        routerInternal.back();
    } else {
        console.warn("Cannot go back from ActiveWorkoutScreen. Navigating to home.");
        routerInternal.replace('/(tabs)/home');
    }
  }, [minimizeWorkout, routerInternal]);
  
  const handleAddExercise = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectorVisible(true);
  }, []);
  
  const handleSelectExercise = useCallback((selectedExercise: ModalExercise) => {
    addExercise({
      id: `e${new Date().getTime()}`,
      name: selectedExercise.name,
      sets: selectedExercise.sets || 3,
      targetReps: selectedExercise.targetReps || '8-12',
      restTime: selectedExercise.restTime || 60,
      completed: false
    });
    setSelectorVisible(false);
  }, [addExercise]);
  
  const handleRemoveExercise = useCallback((exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (activeWorkoutExercises.length <= 1) {
      Alert.alert("Cannot Remove", "Your workout must include at least one exercise.");
      return;
    }
    
    const exerciseToRemove = activeWorkoutExercises.find(ex => ex.id === exerciseId);
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
            removeExercise(exerciseId);
          }
        }
      ]
    );
  }, [activeWorkoutExercises, removeExercise]);
  
  const handleExerciseComplete = useCallback((exerciseId: string) => {
    completeExercise(exerciseId);
    
    const currentIndex = activeWorkoutExercises.findIndex(ex => ex.id === exerciseId);
    let nextActiveId: string | null = null;

    if (activeWorkoutExercises.length > 0) {
        for (let i = 0; i < activeWorkoutExercises.length; i++) {
            const exercise = activeWorkoutExercises[(currentIndex + 1 + i) % activeWorkoutExercises.length];
            if (!exercise.completed) {
                nextActiveId = exercise.id;
                break;
            }
        }
    }
    setActiveExerciseId(nextActiveId);
  }, [activeWorkoutExercises, completeExercise]);
  
  const handleSuperSetPress = useCallback((currentExerciseId: string) => {
    const currentIndex = activeWorkoutExercises.findIndex(ex => ex.id === currentExerciseId);
    if (currentIndex === -1 || currentIndex >= activeWorkoutExercises.length - 1) {
      console.log("Cannot create superset: Not enough subsequent exercises or exercise not found.");
      Alert.alert("Cannot Superset", "This exercise cannot be paired with the next one.");
      return;
    }

    const nextExerciseId = activeWorkoutExercises[currentIndex + 1].id;
    console.log(`Attempting to link ${currentExerciseId} and ${nextExerciseId} into a superset.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Superset Functionality", "Linking exercises is not yet implemented.");
  }, [activeWorkoutExercises]);
  
  const handleCloseSelector = useCallback(() => {
    setSelectorVisible(false);
  }, []);
  
  const handleCloseCompleteModal = useCallback(() => {
    setCompleteModalVisible(false);
  }, []);
  
  // Memoize values that would otherwise cause rerenders
  const allExercisesCompleted = useMemo(() => 
    activeWorkoutExercises.length > 0 && activeWorkoutExercises.every(ex => ex.completed), 
    [activeWorkoutExercises]
  );
  
  // Return with separated HeaderBar
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <HeaderBar 
        workoutName={editableWorkoutName}
        isEditing={isEditingName}
        isTimerActive={isHeaderTimerActive}
        onEditName={handleNameEdit}
        onSubmitName={handleNameSubmit}
        onChangeText={setEditableWorkoutName}
        onClose={handleHeaderClose}
        inputRef={workoutNameInputRef}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeWorkoutExercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseWrapper}>
            <WorkoutExerciseComponent
              exercise={exercise}
              index={index}
              isActive={exercise.id === activeExerciseId}
              onComplete={handleExerciseComplete}
              onSuperSetPress={handleSuperSetPress}
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
        
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={handleAddExercise}
        >
          <Ionicons name="add-circle" size={24} color="#0A84FF" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
        
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
      
      <ExerciseSelectorModal
        visible={selectorVisible}
        onClose={handleCloseSelector}
        onSelectExercise={handleSelectExercise}
      />
      
      <WorkoutCompleteModal
        visible={completeModalVisible}
        onClose={handleCloseCompleteModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#101010',
  },
  headerButton: {
    padding: 6,
  },
  workoutTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  workoutNameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  workoutNameInput: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    borderBottomColor: '#C0C0C0',
    borderBottomWidth: 1,
    textAlign: 'center',
    paddingVertical: 4,
  },
  headerWorkoutNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  setUpButton: {
    marginTop: 2,
  },
  setUpText: {
    fontSize: 13,
    color: '#0A84FF',
    fontWeight: '500',
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTimerText: {
    fontSize: 16,
    color: '#C0C0C0',
    fontWeight: '600',
    marginLeft: 8,
    minWidth: 50,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
    marginTop: 80,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  exerciseWrapper: {
    marginBottom: 16,
  },
  exerciseCardOuterContainer: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  exerciseCardBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  exerciseHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreOptionsExerciseButton: {
      paddingHorizontal: 6,
  },
  expandIcon: {
    marginLeft: 6,
  },
  exerciseContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  setTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 8,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 136, 136, 0.3)',
  },
  setHeaderText: {
    fontSize: 11,
    color: '#A9A9A9',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  previousHeader: { flex: 2.5, textAlign: 'left' },
  weightHeader: { flex: 1.5, textAlign: 'center' },
  repsHeader: { flex: 1.5, textAlign: 'center' },
  checkHeader: { width: 40 },
  setsContainer: {
    marginTop: 4,
  },
  setRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setRowV2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(136, 136, 136, 0.2)',
  },
  setNumberTextV2: {
    color: '#A9A9A9',
    fontSize: 15,
    fontWeight: '600',
    width: 35,
    textAlign: 'center',
  },
  previousTextV2: {
    flex: 2.5,
    color: '#A9A9A9',
    fontSize: 14,
    paddingHorizontal: 5,
    textAlign: 'left',
  },
  inputContainerV2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.7,
  },
  inputV2: {
    minWidth: 45,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 4,
    marginHorizontal: 2,
  },
  inputLabelV2: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  completeButtonV2: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 4,
  },
  completedButtonActiveV2: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
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
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(60, 60, 67, 0.75)',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#0A84FF',
    fontSize: 15,
    fontWeight: '600',
  },
}); 