import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// Import workout context
import ExerciseSelectorModal, { Exercise as ModalExercise } from '../../components/ui/ExerciseSelectorModal';
import WorkoutCompletionPopup from '../../components/ui/WorkoutCompletionPopup';
import { Exercise, ExerciseSet, useWorkout } from '../../contexts/WorkoutContext';

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
  const progress = timeLeft / seconds; // Calculate progress for the timer ring

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

  // Calculate the stroke dash values for the progress ring
  const circumference = 2 * Math.PI * 40; // 40 is the radius of our circle
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <BlurView intensity={60} tint="dark" style={styles.timerContainerView}>
      <View style={styles.timerRingContainer}>
        {/* Background ring */}
        <View style={styles.timerRingBackground} />

        {/* Progress ring */}
        <Svg width={100} height={100} style={styles.timerRingSvg}>
          <Circle
            cx={50}
            cy={50}
            r={40}
            stroke="#0A84FF"
            strokeWidth={8}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>

        {/* Timer text */}
        <View style={styles.timerTextContainer}>
          <Text style={styles.timerTextStyle}>{formatTime(timeLeft)}</Text>
        </View>
      </View>
    </BlurView>
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
  const previousPerformanceText = `${previousWeight} lb × ${previousReps}`;
  const showPrevious = previousWeight !== '--' && previousReps !== '--';

  return (
    <BlurView intensity={50} tint="dark" style={[
      styles.setRowV2,
      completed && styles.completedSetRow
    ]}>
      <View style={styles.setNumberContainer}>
        <Text style={styles.setNumberTextV2}>{setNumber}</Text>
      </View>

      {showPrevious && (
        <View style={styles.previousContainer}>
          <Text style={styles.previousLabelV2}>PREVIOUS</Text>
          <Text style={styles.previousTextV2} numberOfLines={1}>
            {previousPerformanceText}
          </Text>
        </View>
      )}

      <View style={styles.inputsContainer}>
        <BlurView intensity={40} tint="dark" style={[
          styles.inputContainerV2,
          completed && styles.completedInputContainer
        ]}>
          <TextInput
            style={[
              styles.inputV2,
              completed && styles.completedInputText
            ]}
            placeholder="--"
            placeholderTextColor="#666666"
            keyboardType="numeric"
            value={weight}
            onChangeText={onWeightChange}
            editable={!completed}
            selectTextOnFocus
          />
          <Text style={[
            styles.inputLabelV2,
            completed && styles.completedInputLabel
          ]}>lb</Text>
        </BlurView>

        <BlurView intensity={40} tint="dark" style={[
          styles.inputContainerV2,
          completed && styles.completedInputContainer
        ]}>
          <TextInput
            style={[
              styles.inputV2,
              completed && styles.completedInputText
            ]}
            placeholder="--"
            placeholderTextColor="#666666"
            keyboardType="numeric"
            value={reps}
            onChangeText={onRepsChange}
            editable={!completed}
            selectTextOnFocus
          />
          <Text style={[
            styles.inputLabelV2,
            completed && styles.completedInputLabel
          ]}>reps</Text>
        </BlurView>
      </View>

      <TouchableOpacity
        style={[
          styles.completeButtonV2,
          completed && styles.completedButtonActiveV2
        ]}
        onPress={onCompleteToggle}
      >
        {completed ? (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        ) : (
          <Text style={styles.completeButtonText}>DONE</Text>
        )}
      </TouchableOpacity>
    </BlurView>
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
    if (exercise.name) {
      const fetchPerformanceHistory = async () => {
        try {
          const performanceHistory = await getExercisePreviousPerformance(exercise.name);
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
              weight: prevData?.weight?.toString() || "",
              reps: prevData?.reps?.toString() || "",
              completed: false,
              previousWeight: prevData?.weight?.toString() || "",
              previousReps: prevData?.reps?.toString() || "",
            };
          });

          setSets(newSets);
        } catch (error) {
          console.error('Error fetching performance history:', error);
          // Create default sets if there's an error
          const defaultSets = Array(exercise.sets || 1).fill(null).map((_, i) => ({
            id: i + 1,
            weight: "",
            reps: "",
            completed: false,
            previousWeight: "",
            previousReps: "",
          }));
          setSets(defaultSets);
        }
      };

      fetchPerformanceHistory();
    }
  }, [exercise]);

  // Update expanded state only when isActive changes
  useEffect(() => {
    if (expanded !== isActive) {
      setExpanded(isActive);
    }
  }, [isActive]);

  // Memoize handlers to prevent recreation on each render
  const handleSetCompleteToggle = useCallback((setId: number) => {
    // Add haptic feedback for better user experience
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const updatedSets = sets.map(set => {
      if (set.id === setId) {
        return { ...set, completed: !set.completed };
      }
      return set;
    });
    
    updateExerciseSets && updateExerciseSets(exercise.id, updatedSets);
    
    // Additional success haptic feedback when completing a set
    const toggledSet = updatedSets.find(set => set.id === setId);
    if (toggledSet?.completed) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 100);
    }
    
    // Handle toggling rest timer
    if (!toggledSet?.completed && setId < sets.length) {
      // Just completed a set (but not the last one)
      setCurrentSet(setId + 1);
      setRestActive(true);
      startRestTimer(customRestTime ?? exercise.restTime);
    } else if (setId === sets.length && !toggledSet?.completed) {
      // Just completed the last set
      stopRestTimer();
      setRestActive(false);

      // Check if all sets are now complete
      if (updatedSets.every(s => s.completed)) {
        onComplete(exercise.id);
      }
    } else if (toggledSet?.completed) {
      // Uncompleting a set - stop rest timer if running
      stopRestTimer();
      setRestActive(false);
    }

    setSets(updatedSets);
  }, [
    exercise.id,
    exercise.restTime,
    customRestTime,
    startRestTimer,
    stopRestTimer,
    updateExerciseSets,
    onComplete,
    sets
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
      <BlurView intensity={50} tint="dark" style={[
        styles.exerciseCardBlur,
        isActive && styles.activeExerciseCard
      ]}>
        <TouchableOpacity
          style={styles.exerciseHeader}
          onPress={handleToggleExpand}
          activeOpacity={0.8}
        >
          <View style={styles.exerciseHeaderLeft}>
            <BlurView intensity={70} tint="dark" style={[
              styles.exerciseIconPlaceholder,
              isActive && styles.activeExerciseIcon
            ]}>
                <Ionicons
                  name="barbell-outline"
                  size={24}
                  color={isActive ? "#FFFFFF" : "#C0C0C0"}
                />
            </BlurView>
            <Text style={[
              styles.exerciseName,
              isActive && styles.activeExerciseName
            ]}>{exercise.name}</Text>

            {allSetsCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              </View>
            )}
          </View>

          <View style={styles.exerciseHeaderRight}>
            <Ionicons
              name={expanded ? "chevron-down-outline" : "chevron-forward-outline"}
              size={22}
              color={isActive ? "#FFFFFF" : "#C0C0C0"}
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
              <BlurView intensity={40} tint="dark" style={styles.actionButtonWrap}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAddSet}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#C0C0C0" style={styles.actionButtonIcon} />
                  <Text style={styles.actionButtonText}>Add Set</Text>
                </TouchableOpacity>
              </BlurView>

              <BlurView intensity={40} tint="dark" style={styles.actionButtonWrap}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onSuperSetPress(exercise.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="swap-horizontal-outline" size={20} color="#C0C0C0" style={styles.actionButtonIcon} />
                  <Text style={styles.actionButtonText}>Super Set</Text>
                </TouchableOpacity>
              </BlurView>
            </View>

            {restActive && (
              <BlurView intensity={80} tint="dark" style={styles.restTimerWrapper}>
                <View style={styles.restTimerHeader}>
                  <Text style={styles.restLabel}>REST TIMER</Text>
                  <Text style={styles.restSubLabel}>Next set: {currentSet}</Text>
                </View>

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
                    <Ionicons name="time-outline" size={18} color="#C0C0C0" />
                    <Text style={styles.customRestText}>Custom</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.skipRestButton}
                    onPress={handleRestComplete}
                  >
                    <Ionicons name="play-skip-forward-outline" size={18} color="#C0C0C0" />
                    <Text style={styles.skipRestText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            )}

            {showRestTimePicker && (
              <BlurView intensity={80} tint="dark" style={styles.restTimePickerContainer}>
                <View style={styles.restTimePickerHeader}>
                  <Text style={styles.restTimePickerTitle}>Set Rest Timer</Text>
                  <TouchableOpacity
                    style={styles.closePickerButton}
                    onPress={() => setShowRestTimePicker(false)}
                  >
                    <Ionicons name="close-circle" size={24} color="#8E8E93" />
                  </TouchableOpacity>
                </View>

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

                <TouchableOpacity
                  style={styles.applyRestTimeButton}
                  onPress={() => setShowRestTimePicker(false)}
                >
                  <Text style={styles.applyRestTimeText}>Apply</Text>
                </TouchableOpacity>
              </BlurView>
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
  exerciseCount,
  workoutTimer,
  onEditName,
  onSubmitName,
  onChangeText,
  onClose,
  onTimerToggle,
  inputRef
}: {
  workoutName: string;
  isEditing: boolean;
  isTimerActive: boolean;
  exerciseCount: number;
  workoutTimer: number;
  onEditName: () => void;
  onSubmitName: () => void;
  onChangeText: (text: string) => void;
  onClose: () => void;
  onTimerToggle: () => void;
  inputRef: React.LegacyRef<TextInput>;
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <BlurView intensity={80} tint="dark" style={styles.topHeaderContainer}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onClose}
      >
        <Ionicons name="chevron-back" size={28} color="#0A84FF" />
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

        <View style={styles.workoutStatsContainer}>
          <View style={styles.workoutStatItem}>
            <Text style={styles.workoutStatValue}>{exerciseCount}</Text>
            <Text style={styles.workoutStatLabel}>EXERCISES</Text>
          </View>
          <View style={styles.workoutStatDivider} />
          <View style={styles.workoutStatItem}>
            <Text style={styles.workoutStatValue}>{formatTime(workoutTimer)}</Text>
            <Text style={styles.workoutStatLabel}>DURATION</Text>
          </View>
        </View>
      </View>

      <View style={styles.headerRightControls}>
        <TouchableOpacity
          onPress={onTimerToggle}
          style={[styles.headerButton, styles.timerButton]}
        >
          <Ionicons name={isTimerActive ? "pause" : "play"} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </BlurView>
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
  const [isHeaderTimerActive, setIsHeaderTimerActive] = useState(true);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const workoutNameInputRef = useRef<TextInput>(null);

  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isHeaderTimerActive && currentWorkout) {
      interval = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHeaderTimerActive, currentWorkout]);

  // One-time initialization effect
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      // Set initial workout name from summary
      if (workoutSummary?.title) {
        setEditableWorkoutName(workoutSummary.title);
      }

      // Initialize timer state
      setIsHeaderTimerActive(true);
      setWorkoutTimer(0);
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

  const handleTimerToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsHeaderTimerActive(prev => !prev);
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
        exerciseCount={activeWorkoutExercises.length}
        workoutTimer={workoutTimer}
        onEditName={handleNameEdit}
        onSubmitName={handleNameSubmit}
        onChangeText={setEditableWorkoutName}
        onClose={handleHeaderClose}
        onTimerToggle={handleTimerToggle}
        inputRef={workoutNameInputRef}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise List */}
        <View style={styles.exercisesContainer}>
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
        </View>

        {/* Add Exercise Button */}
        <BlurView intensity={30} tint="dark" style={styles.addExerciseButtonContainer}>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={handleAddExercise}
          >
            <Ionicons name="add-circle" size={24} color="#C0C0C0" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </BlurView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {activeWorkoutExercises.length > 0 ? (
            <TouchableOpacity
              style={[
                styles.finishWorkoutButton,
                allExercisesCompleted && styles.finishWorkoutButtonCompleted
              ]}
              onPress={handleFinishWorkout}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={allExercisesCompleted ? "checkmark-circle" : "stop-circle"} 
                size={20} 
                color={allExercisesCompleted ? "#000000" : "#FFFFFF"} 
                style={styles.finishWorkoutIcon} 
              />
              <Text style={[
                styles.finishWorkoutText,
                allExercisesCompleted && styles.finishWorkoutTextCompleted
              ]}>
                {allExercisesCompleted ? 'Complete Workout' : 'Finish Early'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completeAllContainer}>
              <Ionicons name="information-circle" size={20} color="#8E8E93" />
              <Text style={styles.completeAllText}>
                Add exercises to start your workout
              </Text>
            </View>
          )}
          
          <BlurView intensity={40} tint="dark" style={styles.saveForLaterContainer}>
            <TouchableOpacity
              style={styles.saveForLaterButton}
              onPress={handleMinimizeWorkout}
              activeOpacity={0.7}
            >
              <Text style={styles.saveForLaterText}>Save for Later</Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </ScrollView>

      <ExerciseSelectorModal
        visible={selectorVisible}
        onClose={handleCloseSelector}
        onSelectExercise={handleSelectExercise}
      />

      <WorkoutCompletionPopup
        visible={completeModalVisible}
        workoutSummary={{
          duration: workoutSummary?.duration || 0,
          totalVolume: workoutSummary?.totalVolume || 0,
          exercisesCompleted: workoutSummary?.totalExercises || 0,
          setsCompleted: workoutSummary?.totalSets || 0,
          personalRecords: workoutSummary?.personalRecords || 0,
          caloriesBurned: Math.round((workoutSummary?.duration || 0) * 0.1) // Rough estimate
        }}
        onClose={handleCloseCompleteModal}
        onShare={() => {
          // Handle sharing functionality
          console.log('Share workout');
        }}
        onSaveToLibrary={() => {
          // Handle save to library functionality
          console.log('Save to library');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  // New styles for improved UI
  exercisesContainer: {
    marginBottom: 16,
  },
  activeExerciseCard: {
    borderWidth: 1,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    shadowColor: '#ffffff50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activeExerciseIcon: {
    backgroundColor: 'rgba(192, 192, 192, 0.25)',
    borderColor: 'rgba(192, 192, 192, 0.5)',
    borderWidth: 1,
  },
  activeExerciseName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  completedBadge: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedSetRow: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderRadius: 12,
    borderColor: 'rgba(52, 199, 89, 0.3)',
    borderWidth: 1,
  },
  setNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(60, 60, 67, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
  },
  previousContainer: {
    flex: 1,
    marginRight: 8,
  },
  previousLabelV2: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 2,
  },
  inputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 2,
  },
  completedInputContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderColor: 'rgba(52, 199, 89, 0.4)',
    borderWidth: 1,
  },
  completedInputText: {
    color: '#34C759',
  },
  completedInputLabel: {
    color: '#34C759',
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C0C0C0',
  },
  // Timer styles
  timerContainerView: {
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
  },
  timerRingContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerRingBackground: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
    borderColor: 'rgba(192, 192, 192, 0.2)',
    borderWidth: 1,
  },
  timerRingSvg: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  timerTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerTextStyle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  restTimerWrapper: {
    margin: 12,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  restTimerHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  restLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C0C0C0',
    letterSpacing: 1.2,
  },
  restSubLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  restControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 12,
  },
  customRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(60, 60, 67, 0.6)',
    borderRadius: 8,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
  },
  customRestText: {
    color: '#C0C0C0',
    marginLeft: 6,
    fontWeight: '600',
  },
  skipRestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(60, 60, 67, 0.6)',
    borderRadius: 8,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
  },
  skipRestText: {
    color: '#C0C0C0',
    marginLeft: 6,
    fontWeight: '600',
  },
  // Rest timer picker styles
  restTimePickerContainer: {
    margin: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
  },
  restTimePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  restTimePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closePickerButton: {
    padding: 4,
  },
  restTimeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  restTimeOption: {
    width: '30%',
    padding: 12,
    backgroundColor: 'rgba(60, 60, 67, 0.6)',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
  },
  selectedRestTimeOption: {
    backgroundColor: 'rgba(192, 192, 192, 0.25)',
    borderColor: 'rgba(192, 192, 192, 0.5)',
    borderWidth: 1,
  },
  restTimeOptionText: {
    color: '#C0C0C0',
    fontWeight: '600',
  },
  selectedRestTimeOptionText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  applyRestTimeButton: {
    backgroundColor: 'rgba(192, 192, 192, 0.8)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  applyRestTimeText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  // Add exercise button styles
  addExerciseButtonContainer: {
    borderRadius: 12,
    marginVertical: 16,
    overflow: 'hidden',
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C0C0C0',
    marginLeft: 8,
  },
  // Complete workout section
  bottomSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  completeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completeAllText: {
    color: '#8E8E93',
    marginLeft: 8,
    fontSize: 14,
  },
  finishWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  finishWorkoutButtonCompleted: {
    backgroundColor: 'rgba(52, 199, 89, 0.8)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  finishWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishWorkoutTextCompleted: {
    color: '#FFFFFF',
  },
  finishWorkoutIcon: {
    marginRight: 8,
  },
  // Header styles
  workoutStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  workoutStatItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  workoutStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  workoutStatLabel: {
    fontSize: 10,
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  workoutStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
    marginHorizontal: 8,
  },
  inputContainerV2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1.7,
    borderRadius: 10,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
    marginHorizontal: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  inputV2: {
    minWidth: 45,
    height: 36,
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 4,
    marginHorizontal: 2,
  },
  inputLabelV2: {
    fontSize: 12,
    color: '#C0C0C0',
    marginLeft: 4,
  },
  setRowV2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderColor: 'rgba(192, 192, 192, 0.2)',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  completeButtonV2: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 4,
    backgroundColor: 'rgba(60, 60, 67, 0.5)',
  },
  completedButtonActiveV2: {
    backgroundColor: 'rgba(52, 199, 89, 0.8)',
    borderColor: 'rgba(52, 199, 89, 0.5)',
  },
  saveForLaterContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    width: '100%',
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
  },
  saveForLaterButton: {
    padding: 14,
    alignItems: 'center',
  },
  saveForLaterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C0C0C0',
  },
  actionButtonWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 10,
    marginHorizontal: 4,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionButtonContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#C0C0C0',
    fontWeight: '600',
    fontSize: 15,
  },
  // Added missing styles that were referenced
  setNumberTextV2: {
    color: '#C0C0C0',
    fontSize: 15,
    fontWeight: '600',
    width: 35,
    textAlign: 'center',
  },
  previousTextV2: {
    flex: 2.5,
    color: '#C0C0C0',
    fontSize: 14,
    paddingHorizontal: 5,
    textAlign: 'left',
  },
  // Header components
  topHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
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
  timerButton: {
    backgroundColor: 'rgba(192, 192, 192, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(192, 192, 192, 0.4)',
    borderWidth: 1,
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
    backgroundColor: 'rgba(60, 60, 67, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderColor: 'rgba(192, 192, 192, 0.3)',
    borderWidth: 1,
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
    right: 40,
    top: 12,
  },
  percentText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
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
  removeExerciseButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 16,
  },
  removeExerciseText: {
    color: '#FF3B30',
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '500',
  },
});