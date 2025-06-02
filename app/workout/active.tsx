import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Modal,
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
import WorkoutCompleteModal from '../../components/ui/WorkoutCompleteModal';
import { Exercise, ExerciseSet, useWorkout, WorkoutLogType } from '../../contexts/WorkoutContext';

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
  workoutLogType?: WorkoutLogType | null;
  calculateTemplateWeight?: (exerciseName: string, percentage: number) => number | null;
}

// Timer component for rest periods - Memoized
const RestTimer = React.memo(({ seconds, isActive, onComplete }: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const progress = timeLeft / seconds;

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

  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.timerContainerView}>
      <View style={styles.timerRingContainer}>
        <View style={styles.timerRingBackground} />
        <Svg width={80} height={80} style={styles.timerRingSvg}>
          <Circle
            cx={40}
            cy={40}
            r={35}
            stroke="#007AFF"
            strokeWidth={6}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>
        <View style={styles.timerTextContainer}>
          <Text style={styles.timerTextStyle}>{formatTime(timeLeft)}</Text>
        </View>
      </View>
    </View>
  );
});

// Removed old WorkoutSetComponent - now using dynamic inline component

// Define a local set type that includes previous performance for UI state
interface UILocalSet extends ExerciseSet {
  previousWeight?: string;
  previousReps?: string;
  previousDuration?: string;
  previousDistance?: string;
  previousRpe?: string;
  previousHeight?: string;
  previousAssistedWeight?: string;
  duration?: string;
  distance?: string;
  rpe?: string;
  height?: string;
  assistedWeight?: string;
  percentage?: string; // For percentage mode tracking
}

// Exercise component - Memoized
const WorkoutExerciseComponent = React.memo(({
  exercise,
  index,
  isActive,
  onComplete,
  onSuperSetPress,
  workoutLogType,
  calculateTemplateWeight
}: ExerciseProps) => {
  const exerciseIdRef = useRef(exercise.id);
  const exerciseNameRef = useRef(exercise.name);
  const exerciseSetsCountRef = useRef(exercise.sets || 1);

  const [sets, setSets] = useState<UILocalSet[]>(() =>
    Array(exercise.sets || 1).fill(null).map((_, i) => {
      // Try to calculate initial weight if possible
      let initialWeight = '';
      let initialPercentage = exercise.percentage?.toString() || '';

      if (calculateTemplateWeight && (exercise.percentage || workoutLogType === 'template')) {
        const currentPercentage = exercise.percentage || 85;
        const templateWeight = calculateTemplateWeight(exercise.name, currentPercentage);
        console.log('Initial weight calculation:', {
          exerciseName: exercise.name,
          currentPercentage,
          templateWeight,
          workoutLogType
        });
        if (templateWeight) {
          initialWeight = templateWeight.toString();
          initialPercentage = currentPercentage.toString();
        }
      }

      return {
        id: i + 1,
        weight: initialWeight,
        reps: exercise.targetReps || '',
        completed: false,
        previousWeight: '--',
        previousReps: '--',
        percentage: initialPercentage
      };
    })
  );
  const [expanded, setExpanded] = useState(isActive || workoutLogType === 'template');

  // Debug log for expanded state
  console.log('Exercise component render:', {
    exerciseName: exercise.name,
    expanded,
    isActive,
    workoutLogType
  });
  const [currentSet, setCurrentSet] = useState(1);
  const [restActive, setRestActive] = useState(false);
  const [previousPerformance, setPreviousPerformance] = useState<any[]>([]);
  const [customRestTime, setCustomRestTime] = useState<number | null>(null);
  const [showPercentage, setShowPercentage] = useState(
    !!(exercise.percentage || workoutLogType === 'template') // Show percentage by default for template workouts
  );

  const { startRestTimer, stopRestTimer, updateExerciseSets, getExercisePreviousPerformance, setCustomRestTimer } = useWorkout();

  // Use refs to track if we've already initialized this exercise
  const initializedExerciseRef = useRef<string | null>(null);

  useEffect(() => {
    // Only initialize sets once per exercise, not on every exercise object change
    if (exercise.name && calculateTemplateWeight && initializedExerciseRef.current !== exercise.id) {
      console.log('ExerciseCard - Initializing sets for exercise:', exercise.name, 'ID:', exercise.id);
      initializedExerciseRef.current = exercise.id;

      const fetchPerformanceHistory = async () => {
        try {
          const performanceHistory = await getExercisePreviousPerformance(exercise.name);
          setPreviousPerformance(performanceHistory);

          const newSets = Array(exercise.sets || 1).fill(null).map((_, i) => {
            const prevData = performanceHistory.length > 0 &&
                            performanceHistory[0]?.sets &&
                            i < performanceHistory[0].sets.length ?
                            performanceHistory[0].sets[i] : null;

            // Calculate template weight if this is a template workout
            let calculatedWeight = "";
            let defaultPercentage = "";

            // Default to 85% for template workouts without percentage
            const currentPercentage = exercise.percentage || (workoutLogType === 'template' ? 85 : null);

            if (currentPercentage && calculateTemplateWeight) {
              const templateWeight = calculateTemplateWeight(exercise.name, currentPercentage);
              if (templateWeight) {
                calculatedWeight = templateWeight.toString();
                defaultPercentage = currentPercentage.toString();
              }
            }

            return {
              id: i + 1,
              weight: calculatedWeight || prevData?.weight?.toString() || "",
              reps: exercise.targetReps || prevData?.reps?.toString() || "", // Use template target reps
              completed: false,
              previousWeight: prevData?.weight?.toString() || "--",
              previousReps: prevData?.reps?.toString() || "--",
              percentage: defaultPercentage || exercise.percentage?.toString() || "", // Initialize percentage for template workouts
            };
          });

          console.log('ExerciseCard - Setting initial sets:', newSets);
          setSets(newSets);
        } catch (error) {
          console.error('Error fetching performance history:', error);
          const defaultSets = Array(exercise.sets || 1).fill(null).map((_, i) => {
            // Default to 85% for template workouts without percentage
            const currentPercentage = exercise.percentage || (workoutLogType === 'template' ? 85 : null);
            let calculatedWeight = "";
            let defaultPercentage = "";

            if (currentPercentage && calculateTemplateWeight) {
              const templateWeight = calculateTemplateWeight(exercise.name, currentPercentage);
              if (templateWeight) {
                calculatedWeight = templateWeight.toString();
                defaultPercentage = currentPercentage.toString();
              }
            }

            return {
              id: i + 1,
              weight: calculatedWeight,
              reps: exercise.targetReps || "", // Use template target reps
              completed: false,
              previousWeight: "--",
              previousReps: "--",
              percentage: defaultPercentage || exercise.percentage?.toString() || "",
            };
          });
          console.log('ExerciseCard - Setting default sets:', defaultSets);
          setSets(defaultSets);
        }
      };

      fetchPerformanceHistory();
    }
  }, [exercise.id, exercise.name, calculateTemplateWeight, workoutLogType]);

  useEffect(() => {
    if (expanded !== isActive) {
      setExpanded(isActive);
    }
  }, [isActive]);

  // Add state to track if toggle is in progress to prevent double-taps
  const [toggleInProgress, setToggleInProgress] = useState(false);

  const handleSetCompleteToggle = useCallback((setId: number) => {
    // Prevent multiple rapid calls
    if (toggleInProgress) {
      console.log('ExerciseCard - Toggle already in progress, ignoring');
      return;
    }

    setToggleInProgress(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setSets(prevSets => {
      const updatedSets = prevSets.map(set => {
        if (set.id === setId) {
          return { ...set, completed: !set.completed };
        }
        return set;
      });

      console.log('ExerciseCard - Set completion toggle:', {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        setId: setId,
        wasCompleted: prevSets.find(s => s.id === setId)?.completed,
        nowCompleted: updatedSets.find(s => s.id === setId)?.completed,
        updatedSetsLength: updatedSets.length
      });

      const toggledSet = updatedSets.find(set => set.id === setId);

      // Schedule context update and other side effects after render
      setTimeout(() => {
        // Update context with the new sets
        updateExerciseSets && updateExerciseSets(exercise.id, updatedSets);

        if (toggledSet?.completed) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        if (!toggledSet?.completed && setId < prevSets.length) {
          setCurrentSet(setId + 1);
          setRestActive(true);
          startRestTimer(customRestTime ?? exercise.restTime);
        } else if (setId === prevSets.length && !toggledSet?.completed) {
          stopRestTimer();
          setRestActive(false);

          if (updatedSets.every(s => s.completed)) {
            onComplete(exercise.id);
          }
        } else if (toggledSet?.completed) {
          stopRestTimer();
          setRestActive(false);
        }

        // Reset the toggle flag
        setToggleInProgress(false);
      }, 0);

      console.log('ExerciseCard - About to update local sets state:', updatedSets);
      return updatedSets;
    });
  }, [
    exercise.id,
    exercise.restTime,
    customRestTime,
    startRestTimer,
    stopRestTimer,
    updateExerciseSets,
    onComplete,
    toggleInProgress
  ]);

  const handleRestComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRestActive(false);
    stopRestTimer();
  }, [stopRestTimer]);

  // Removed old handleWeightChange and handleRepsChange - now using handleValueChange

  // Dynamic value change handler for different measurement types
  const handleValueChange = useCallback((setId: number, field: string, value: string) => {
    setSets(prevSets => {
      const updatedSets = prevSets.map(set =>
        set.id === setId ? { ...set, [field]: value } : set
      );

      // Auto-fill subsequent sets with the same value if they're empty
      const currentSetIndex = updatedSets.findIndex(set => set.id === setId);
      if (currentSetIndex !== -1) {
        for (let i = currentSetIndex + 1; i < updatedSets.length; i++) {
          if (!updatedSets[i].completed && !updatedSets[i][field as keyof UILocalSet]) {
            (updatedSets[i] as any)[field] = value;
          }
        }
      }

      // Update context with clean data
      const setsForContext: ExerciseSet[] = updatedSets.map(({
        previousWeight,
        previousReps,
        previousDuration,
        previousDistance,
        previousRpe,
        previousHeight,
        previousAssistedWeight,
        ...baseSet
      }) => baseSet);
      updateExerciseSets && updateExerciseSets(exercise.id, setsForContext);

      return updatedSets;
    });
  }, [exercise.id, updateExerciseSets]);

  const handleAddSet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setSets(prevSets => {
      const newSetId = prevSets.length + 1;
      const lastSet = prevSets[prevSets.length - 1];
      const newSet: UILocalSet = {
        id: newSetId,
        weight: lastSet ? lastSet.weight : '',
        reps: lastSet ? lastSet.reps : '',
        completed: false,
        previousWeight: '--',
        previousReps: '--',
        percentage: lastSet ? lastSet.percentage : (exercise.percentage?.toString() || '')
      };

      const updatedSets = [...prevSets, newSet];
      const setsForContextAdd: ExerciseSet[] = updatedSets.map(({
        previousWeight,
        previousReps,
        previousDuration,
        previousDistance,
        previousRpe,
        previousHeight,
        previousAssistedWeight,
        percentage,
        ...baseSet
      }) => baseSet);
      updateExerciseSets && updateExerciseSets(exercise.id, setsForContextAdd);

      return updatedSets;
    });
  }, [exercise.id, updateExerciseSets]);

  const handleToggleExpand = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  const allSetsCompleted = useMemo(() => sets.every(set => set.completed), [sets]);

  return (
    <View style={styles.exerciseCardOuterContainer}>
      <View style={styles.exerciseCardBlur}>
        <TouchableOpacity
          style={styles.exerciseHeader}
          onPress={handleToggleExpand}
          activeOpacity={0.8}
        >
          <View style={styles.exerciseHeaderLeft}>
            <View style={styles.exerciseIconPlaceholder}>
              <Ionicons
                name="barbell-outline"
                size={24}
                color="#8E8E93"
              />
            </View>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
          </View>

          <View style={styles.exerciseHeaderRight}>
            {(exercise.percentage || workoutLogType === 'template') && calculateTemplateWeight && (
              <TouchableOpacity
                style={styles.percentageToggle}
                onPress={() => setShowPercentage(!showPercentage)}
              >
                <Text style={[styles.percentageToggleText, showPercentage && styles.percentageToggleActive]}>
                  {showPercentage ? '%' : 'lb'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#8E8E93" />
            </TouchableOpacity>
            <Ionicons
              name={expanded ? "chevron-down" : "chevron-forward"}
              size={24}
              color="#8E8E93"
              style={styles.expandIcon}
            />
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.exerciseContent}>
            <View style={styles.setTableHeader}>
              <Text style={[styles.setHeaderText, styles.previousHeader]}>PREVIOUS</Text>
              {exercise.measurementType === 'reps' || exercise.measurementType === 'bodyweight' ? (
                <Text style={[styles.setHeaderText, styles.weightHeader]}>REPS</Text>
              ) : exercise.measurementType === 'time_based' ? (
                <Text style={[styles.setHeaderText, styles.weightHeader]}>TIME</Text>
              ) : (
                <>
                  <Text style={[styles.setHeaderText, styles.weightHeader]}>
                    {showPercentage ? 'PERCENT' : 'WEIGHT'}
                  </Text>
                  <Text style={[styles.setHeaderText, styles.repsHeader]}>REP</Text>
                </>
              )}
              <View style={styles.checkHeader} />
            </View>

            <View style={styles.setsContainer}>
              {sets.map((set) => {
                const measurementType = exercise.measurementType || 'weight_reps';

                // Debug log for each set render
                console.log('Rendering set:', {
                  exerciseName: exercise.name,
                  setId: set.id,
                  weight: set.weight,
                  percentage: set.percentage,
                  reps: set.reps,
                  showPercentage,
                  workoutLogType,
                  measurementType,
                  inputValue: showPercentage ? (set.percentage || '85') : (set.weight || '')
                });

                return (
                  <BlurView key={set.id} intensity={50} tint="dark" style={[styles.setRowV2, set.completed && styles.completedSetRow]}>
                    <View style={styles.setNumberContainer}>
                      <Text style={styles.setNumberTextV2}>{set.id}×</Text>
                    </View>

                    <View style={styles.previousContainer}>
                      <Text style={styles.previousTextV2}>
                        {measurementType === 'reps' || measurementType === 'bodyweight' ? (
                          set.previousReps ? `${set.previousReps} reps` : '--'
                        ) : measurementType === 'time_based' ? (
                          set.previousDuration ? `${set.previousDuration}s` : '--'
                        ) : (
                          set.previousWeight && set.previousReps ? (
                            showPercentage && exercise.percentage ?
                              `${exercise.percentage}% × ${set.previousReps}` :
                              `${set.previousWeight} × ${set.previousReps}`
                          ) : '--'
                        )}
                      </Text>
                    </View>

                    <View style={styles.inputsContainer}>
                      {measurementType === 'reps' || measurementType === 'bodyweight' ? (
                        <View style={[styles.inputContainerV2, styles.singleInputContainer, set.completed && styles.completedInputContainer]}>
                          <TextInput
                            style={styles.inputV2}
                            placeholder="0"
                            placeholderTextColor="#666666"
                            keyboardType="numeric"
                            value={set.reps || ''}
                            onChangeText={(value) => handleValueChange(set.id, 'reps', value)}
                            editable={!set.completed}
                            selectTextOnFocus
                          />
                          <Text style={styles.inputLabelV2}>reps</Text>
                        </View>
                      ) : measurementType === 'time_based' ? (
                        <View style={[styles.inputContainerV2, styles.singleInputContainer, set.completed && styles.completedInputContainer]}>
                          <TextInput
                            style={styles.inputV2}
                            placeholder="0"
                            placeholderTextColor="#666666"
                            keyboardType="numeric"
                            value={set.duration || ''}
                            onChangeText={(value) => handleValueChange(set.id, 'duration', value)}
                            editable={!set.completed}
                            selectTextOnFocus
                          />
                          <Text style={styles.inputLabelV2}>sec</Text>
                        </View>
                      ) : (
                        <>
                          {/* Single-Mode Toggle Input - Clean and Focused */}
                          {(exercise.percentage || workoutLogType === 'template') && calculateTemplateWeight ? (
                            // Single-value input that toggles between percentage and weight
                            <View style={[styles.singleModeInputContainer, set.completed && styles.completedInputContainer]}>
                              <TextInput
                                key={`${exercise.id}-${set.id}-${showPercentage ? 'pct' : 'wt'}`}
                                style={styles.focusedInput}
                                placeholder="0"
                                placeholderTextColor="#666666"
                                keyboardType="numeric"
                                value={showPercentage ? (set.percentage || '85') : (set.weight || '')}
                                onChangeText={(value) => {
                                  console.log('Template input change:', {
                                    exerciseName: exercise.name,
                                    setId: set.id,
                                    showPercentage,
                                    currentValue: showPercentage ? set.percentage : set.weight,
                                    newValue: value,
                                    setData: set
                                  });
                                  const defaultPercentage = 85;

                                  if (showPercentage) {
                                    // Editing percentage - calculate and store weight
                                    const percentage = parseFloat(value) || 0;
                                    const calculatedWeight = calculateTemplateWeight(exercise.name, percentage);

                                    setSets(prevSets => {
                                      const updatedSets = prevSets.map(s =>
                                        s.id === set.id ? { ...s, percentage: value, weight: (calculatedWeight || 0).toString() } : s
                                      );

                                      const setsForContext: ExerciseSet[] = updatedSets.map(({
                                        previousWeight, previousReps, previousDuration, previousDistance,
                                        previousRpe, previousHeight, previousAssistedWeight, percentage, ...baseSet
                                      }) => baseSet);
                                      updateExerciseSets && updateExerciseSets(exercise.id, setsForContext);

                                      return updatedSets;
                                    });
                                  } else {
                                    // Editing weight - calculate and store percentage
                                    const weight = parseFloat(value) || 0;
                                    const trainingMax = calculateTemplateWeight(exercise.name, 100); // Get training max
                                    const calculatedPercentage = trainingMax ? Math.round((weight / trainingMax) * 100) : 0;

                                    setSets(prevSets => {
                                      const updatedSets = prevSets.map(s =>
                                        s.id === set.id ? { ...s, weight: value, percentage: calculatedPercentage.toString() } : s
                                      );

                                      const setsForContext: ExerciseSet[] = updatedSets.map(({
                                        previousWeight, previousReps, previousDuration, previousDistance,
                                        previousRpe, previousHeight, previousAssistedWeight, percentage, ...baseSet
                                      }) => baseSet);
                                      updateExerciseSets && updateExerciseSets(exercise.id, setsForContext);

                                      return updatedSets;
                                    });
                                  }
                                }}
                                editable={!set.completed}
                                selectTextOnFocus
                              />
                              <Text style={styles.focusedInputLabel}>
                                {showPercentage ? '%' : 'lb'}
                              </Text>
                            </View>
                          ) : (
                            // Standard single input for non-template workouts
                            <View style={[styles.inputContainerV2, set.completed && styles.completedInputContainer]}>
                              <TextInput
                                style={styles.inputV2}
                                placeholder="0"
                                placeholderTextColor="#666666"
                                keyboardType="numeric"
                                value={set.weight || ''}
                                onChangeText={(value) => handleValueChange(set.id, 'weight', value)}
                                editable={!set.completed}
                                selectTextOnFocus
                              />
                              <Text style={styles.inputLabelV2}>lb</Text>
                            </View>
                          )}

                          {/* Always render reps input for weight_reps exercises */}
                          <View style={[styles.inputContainerV2, set.completed && styles.completedInputContainer]}>
                            <TextInput
                              style={styles.inputV2}
                              placeholder="0"
                              placeholderTextColor="#666666"
                              keyboardType="numeric"
                              value={set.reps || ''}
                              onChangeText={(value) => handleValueChange(set.id, 'reps', value)}
                              editable={!set.completed}
                              selectTextOnFocus
                            />
                            <Text style={styles.inputLabelV2}>reps</Text>
                          </View>
                        </>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.completeButtonV2,
                        set.completed && styles.completedButtonActiveV2
                      ]}
                      onPress={() => handleSetCompleteToggle(set.id)}
                      activeOpacity={0.7}
                      disabled={toggleInProgress}
                    >
                      {set.completed && (
                        <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </BlurView>
                );
              })}
            </View>

            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddSet}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Add Set</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onSuperSetPress(exercise.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="swap-horizontal" size={20} color="#007AFF" />
                <Text style={styles.actionButtonText}>Super Set</Text>
              </TouchableOpacity>

              {allSetsCompleted && (
                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={[styles.actionButtonText, { color: '#34C759' }]}>✓</Text>
                </TouchableOpacity>
              )}
            </View>

            {restActive && (
              <View style={styles.restTimerWrapper}>
                <Text style={styles.restLabel}>REST TIMER</Text>
                <RestTimer
                  seconds={customRestTime !== null ? customRestTime : exercise.restTime}
                  isActive={restActive}
                  onComplete={handleRestComplete}
                />
                <View style={styles.restTimerControls}>
                  <TouchableOpacity
                    style={styles.restTimerButton}
                    onPress={() => {
                      const newTime = (customRestTime || exercise.restTime) + 30;
                      setCustomRestTime(newTime);
                      setCustomRestTimer(newTime);
                    }}
                  >
                    <Text style={styles.restTimerButtonText}>+30s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.skipRestButton}
                    onPress={handleRestComplete}
                  >
                    <Text style={styles.skipRestText}>Skip Rest</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
});

// HeaderBar component
const HeaderBar = React.memo(({
  workoutName,
  workoutTimer,
  onClose,
  onTimerToggle,
  onInvitePress,
}: {
  workoutName: string;
  workoutTimer: number;
  onClose: () => void;
  onTimerToggle: () => void;
  onInvitePress: () => void;
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.topHeaderContainer}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={onClose}
      >
        <Ionicons name="close" size={24} color="#8E8E93" />
      </TouchableOpacity>

      <View style={styles.workoutTitleContainer}>
        <View style={styles.workoutNameDisplay}>
          <Text style={styles.headerWorkoutNameText}>{workoutName}</Text>
          <TouchableOpacity style={{ marginLeft: 8 }}>
            <Ionicons name="pencil" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subHeaderText}>Set Up ›</Text>
      </View>

      <View style={styles.headerRightControls}>
        <TouchableOpacity
          onPress={onInvitePress}
          style={styles.timerButton}
        >
          <Ionicons name="person-add" size={18} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onTimerToggle}
          style={styles.timerButton}
        >
          <Ionicons name="pause" size={18} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.timerText}>{formatTime(workoutTimer)}</Text>
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
    isWorkoutActive,
    workoutLogType,
    calculateTemplateWeight,
  } = useWorkout();

  const activeWorkoutExercises = useMemo(() => {
    return currentWorkout?.exercises || [];
  }, [currentWorkout?.exercises]);

  const initialWorkoutName = 'My Workout';
  const initialized = useRef(false);

  const [editableWorkoutName, setEditableWorkoutName] = useState(initialWorkoutName);
  const [isHeaderTimerActive, setIsHeaderTimerActive] = useState(true);
  const [workoutTimer, setWorkoutTimer] = useState(0);

  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isHeaderTimerActive) {
      console.log('⏱️ Starting workout timer:', {
        isHeaderTimerActive,
        hasCurrentWorkout: !!currentWorkout,
        currentTimer: workoutTimer
      });

      interval = setInterval(() => {
        setWorkoutTimer(prev => {
          const newTime = prev + 1;
          // Log every 10 seconds to avoid spam
          if (newTime % 10 === 0) {
            console.log('⏱️ Timer tick:', newTime);
          }
          return newTime;
        });
      }, 1000);
    } else {
      console.log('⏱️ Timer not active:', { isHeaderTimerActive, hasCurrentWorkout: !!currentWorkout });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHeaderTimerActive, currentWorkout]);

  useEffect(() => {
    if (!initialized.current && currentWorkout) {
      initialized.current = true;
      console.log('🏃‍♂️ Initializing active workout screen with currentWorkout:', currentWorkout);

      if (workoutSummary?.title) {
        setEditableWorkoutName(workoutSummary.title);
      }

      // Start timer immediately when workout is available
      setIsHeaderTimerActive(true);
      setWorkoutTimer(currentWorkout.elapsedTime || 0);

      console.log('⏱️ Timer initialized:', {
        isHeaderTimerActive: true,
        initialTime: currentWorkout.elapsedTime || 0,
        hasCurrentWorkout: !!currentWorkout
      });
    }
  }, [currentWorkout, workoutSummary]);

  // Fallback timer initialization - start timer even if currentWorkout is not available yet
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!initialized.current) {
        console.log('⏱️ Fallback timer initialization - currentWorkout not available yet');
        initialized.current = true;
        setIsHeaderTimerActive(true);
        setWorkoutTimer(0);
        setEditableWorkoutName('New Workout');
      }
    }, 1000); // Wait 1 second for context to load

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleHeaderClose = useCallback(() => {
    if (routerInternal.canGoBack()) {
      routerInternal.back();
    } else {
      routerInternal.replace('/(tabs)/home');
    }
  }, [routerInternal]);

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
            routerInternal.push('/workout/complete');
          }
        }
      ]
    );
  }, [endWorkout, routerInternal]);

  const handleMinimizeWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    minimizeWorkout();

    if (routerInternal.canGoBack()) {
      routerInternal.back();
    } else {
      routerInternal.replace('/(tabs)/home');
    }
  }, [minimizeWorkout, routerInternal]);

  const handleAddExercise = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectorVisible(true);
  }, []);

  const handleSelectExercise = useCallback((selectedExercise: ModalExercise) => {
    // Use the exercise ID from the database instead of generating a new one
    const exerciseId = selectedExercise.id;

    addExercise({
      id: exerciseId,
      name: selectedExercise.name,
      sets: selectedExercise.sets || 3,
      targetReps: selectedExercise.targetReps || '8-12',
      restTime: selectedExercise.restTime || 60,
      completed: false
    });
    setSelectorVisible(false);
  }, [addExercise]);

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
      Alert.alert("Cannot Superset", "This exercise cannot be paired with the next one.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Superset Functionality", "Linking exercises is not yet implemented.");
  }, [activeWorkoutExercises]);

  const handleCloseSelector = useCallback(() => {
    setSelectorVisible(false);
  }, []);

  const handleCloseCompleteModal = useCallback(() => {
    setCompleteModalVisible(false);
  }, []);

  const allExercisesCompleted = useMemo(() =>
    activeWorkoutExercises.length > 0 && activeWorkoutExercises.every(ex => ex.completed),
    [activeWorkoutExercises]
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <HeaderBar
        workoutName={editableWorkoutName}
        workoutTimer={workoutTimer}
        onClose={handleHeaderClose}
        onTimerToggle={handleTimerToggle}
        onInvitePress={() => setInviteModalVisible(true)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.exercisesContainer}>
          {activeWorkoutExercises.map((exercise, index) => (
            <WorkoutExerciseComponent
              key={exercise.id}
              exercise={exercise}
              index={index}
              isActive={exercise.id === activeExerciseId}
              onComplete={handleExerciseComplete}
              onSuperSetPress={handleSuperSetPress}
              workoutLogType={workoutLogType}
              calculateTemplateWeight={calculateTemplateWeight}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={handleAddExercise}
        >
          <Ionicons name="add" size={24} color="#34C759" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.finishWorkoutButton}
            onPress={handleFinishWorkout}
            activeOpacity={0.7}
          >
            <Text style={styles.finishWorkoutText}>Finish Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveForLaterButton}
            onPress={handleMinimizeWorkout}
            activeOpacity={0.7}
          >
            <Text style={styles.saveForLaterText}>Save for Later</Text>
          </TouchableOpacity>
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

      {/* Workout Invite Modal - Inline implementation */}
      <Modal visible={inviteModalVisible} animationType="slide" presentationStyle="pageSheet">
        <BlurView intensity={100} tint="dark" style={styles.inviteModalContainer}>
          <View style={styles.inviteModalHeader}>
            <TouchableOpacity onPress={() => setInviteModalVisible(false)} style={styles.inviteModalCloseButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.inviteModalTitle}>Invite to Workout</Text>
            <TouchableOpacity
              onPress={() => {
                setInviteModalVisible(false);
                Alert.alert('Coming Soon!', 'Group workout invitations will be available in the next update.');
              }}
              style={styles.inviteModalSendButton}
            >
              <Text style={styles.inviteModalSendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inviteModalContent}>
            <Text style={styles.inviteModalWorkoutName}>{editableWorkoutName}</Text>
            <Text style={styles.inviteModalDescription}>
              Invite friends to join your workout session. They'll be able to see your progress and you can motivate each other!
            </Text>
            <TouchableOpacity
              style={styles.inviteModalFeatureButton}
              onPress={() => {
                setInviteModalVisible(false);
                Alert.alert('Coming Soon!', 'Group workout invitations will be available in the next update.');
              }}
            >
              <Ionicons name="people" size={24} color="#007AFF" />
              <Text style={styles.inviteModalFeatureButtonText}>Find Friends</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Header styles
  topHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },

  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  workoutTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  workoutNameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerWorkoutNameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  subHeaderText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },

  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timerButton: {
    marginRight: 8,
  },

  timerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Exercise card styles
  exercisesContainer: {
    marginBottom: 16,
  },

  exerciseCardOuterContainer: {
    marginBottom: 16,
  },

  exerciseCardBlur: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
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

  exerciseIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  exerciseHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  percentageToggle: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    minWidth: 40,
    alignItems: 'center',
  },

  percentageToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },

  percentageToggleActive: {
    color: '#007AFF',
  },

  moreButton: {
    padding: 4,
  },

  expandIcon: {
    marginLeft: 12,
  },

  exerciseContent: {
    paddingBottom: 16,
  },

  // Set table styles
  setTableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },

  setHeaderText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  previousHeader: {
    flex: 2,
    textAlign: 'left',
  },

  weightHeader: {
    flex: 1.5,
    textAlign: 'center',
  },

  repsHeader: {
    flex: 1,
    textAlign: 'center',
  },

  checkHeader: {
    width: 50,
  },

  setsContainer: {
    marginBottom: 8,
  },

  // Set row styles
  setRowV2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },

  completedSetRow: {
    opacity: 0.7,
  },

  setNumberContainer: {
    width: 28,
    marginRight: 12,
  },

  setNumberTextV2: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },

  previousContainer: {
    flex: 2,
    marginRight: 12,
  },

  previousTextV2: {
    color: '#8E8E93',
    fontSize: 16,
  },

  inputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2.5,
  },

  inputContainerV2: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },

  singleInputContainer: {
    flex: 2,
    marginHorizontal: 8,
  },

  completedInputContainer: {
    backgroundColor: '#1C3A28',
  },

  inputV2: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    padding: 0,
  },

  inputLabelV2: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },

  percentageLabel: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '600',
  },

  // Complete button
  completeButtonV2: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },

  completedButtonActiveV2: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },

  // Action buttons
  actionButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  actionButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 6,
  },

  // Rest timer styles
  restTimerWrapper: {
    margin: 16,
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    alignItems: 'center',
  },

  restLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 16,
  },

  timerContainerView: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  timerRingContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  timerRingBackground: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#2C2C2E',
  },

  timerRingSvg: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },

  timerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timerTextStyle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  restTimerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },

  restTimerButton: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  restTimerButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },

  skipRestButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },

  skipRestText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Add exercise button
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 16,
  },

  addExerciseText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#34C759',
    marginLeft: 8,
  },

  // Bottom section
  bottomSection: {
    paddingBottom: 40,
  },

  finishWorkoutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 16,
  },

  finishWorkoutText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },

  saveForLaterButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  saveForLaterText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#8E8E93',
  },

  // Scroll view
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Invite Modal Styles
  inviteModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  inviteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  inviteModalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inviteModalSendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  inviteModalSendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  inviteModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inviteModalWorkoutName: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  inviteModalDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  inviteModalFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  inviteModalFeatureButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },

  // Single-mode toggle input styles - Clean and focused
  singleModeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    flex: 1.5,
    minHeight: 56,
  },
  focusedInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 0,
    minHeight: 32,
  },
  focusedInputLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
    minWidth: 35,
  },

  // Legacy template input styles - Keep for reference
  templateInputContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    flex: 1.5,
    minHeight: 80,
  },
  primaryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  largeInputLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
    minWidth: 30,
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  secondaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
  },
  editIcon: {
    marginLeft: 6,
    opacity: 0.6,
  },

  // Keep old styles for backward compatibility
  dualInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    flex: 1.5,
    minHeight: 44,
  },
  primaryInputSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 50,
    padding: 0,
  },
  primaryInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 6,
  },
  secondaryDisplaySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
    minWidth: 60,
  },
  secondaryDisplayValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
    minWidth: 30,
    textAlign: 'center',
  },
  secondaryDisplayLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
    fontWeight: '500',
  },
});