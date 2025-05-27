import { useEnhancedWorkout } from '@/contexts/EnhancedWorkoutContext';
import { ExerciseSet } from '@/contexts/WorkoutContext';
import { ExerciseTemplate, WorkoutExercise } from '@/services/OfflineWorkoutService';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    LayoutAnimation,
    Modal,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Enhanced Quick Input with gesture controls
interface QuickInputButtonProps {
  value: string;
  onPress: () => void;
  isSelected?: boolean;
  onLongPress?: () => void;
}

const QuickInputButton: React.FC<QuickInputButtonProps> = ({
  value,
  onPress,
  isSelected = false,
  onLongPress
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    if (isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.quickButton, isSelected && styles.quickButtonSelected]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isSelected ? ['#00D4FF20', '#00D4FF10'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.quickButtonGradient}
        >
          <Text style={[styles.quickButtonText, isSelected && styles.quickButtonTextSelected]}>
            {value}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Set Row with swipe actions and better UX
interface SetRowProps {
  set: ExerciseSet;
  index: number;
  onUpdate: (updates: Partial<ExerciseSet>) => void;
  onDelete?: () => void;
  previousPerformance?: { weight: string; reps: string; } | null;
  isPersonalRecord?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  onUpdate,
  onDelete,
  previousPerformance,
  isPersonalRecord = false,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [localWeight, setLocalWeight] = useState(set.weight.toString());
  const [localReps, setLocalReps] = useState(set.reps.toString());
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLocalWeight(set.weight.toString());
    setLocalReps(set.reps.toString());
  }, [set.weight, set.reps]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isCollapsed]);

  const handleComplete = () => {
    if (!localWeight || !localReps) {
      Alert.alert('Missing Data', 'Please enter both weight and reps before completing the set.');
      return;
    }

    // Enhanced completion animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onUpdate({
      weight: localWeight,
      reps: localReps,
      completed: !set.completed
    });

    if (!set.completed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Show achievement toast if PR
      if (isPersonalRecord) {
        showPRCelebration();
      }
    }
  };

  const showPRCelebration = () => {
    Alert.alert(
      '🎉 Personal Record!',
      'You just set a new PR! Keep crushing it!',
      [
        { text: 'Share Achievement', onPress: shareAchievement },
        { text: 'Continue', style: 'default' }
      ]
    );
  };

  const shareAchievement = async () => {
    try {
      await Share.share({
        message: `Just hit a new PR! ${localWeight}lbs × ${localReps} reps 💪 #EliteLocker #PersonalRecord`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const quickWeights = ['95', '135', '185', '225', '275', '315', '365'];
  const quickReps = ['3', '5', '8', '10', '12', '15', '20'];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[
      styles.setRow,
      { transform: [{ scale: scaleAnim }, { translateX: slideAnim }] }
    ]}>
      {/* Set Header with enhanced visual hierarchy */}
      <TouchableOpacity
        style={styles.setHeader}
        onPress={onToggleCollapse}
        activeOpacity={0.8}
      >
        <View style={styles.setHeaderLeft}>
          <LinearGradient
            colors={['#00D4FF20', '#00D4FF10']}
            style={styles.setNumberBadge}
          >
            <Text style={styles.setNumber}>{index + 1}</Text>
          </LinearGradient>

          {isPersonalRecord && (
            <Animated.View style={[styles.prBadge, { transform: [{ rotate: spin }] }]}>
              <LinearGradient
                colors={['#FFD70020', '#FFD70010']}
                style={styles.prBadgeGradient}
              >
                <Ionicons name="trophy" size={14} color="#FFD700" />
                <Text style={styles.prText}>PR</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>

        <View style={styles.setHeaderRight}>
          {set.completed && (
            <View style={styles.completionIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#00D4FF" />
            </View>
          )}
          <Ionicons
            name={isCollapsed ? "chevron-forward" : "chevron-down"}
            size={16}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <View style={styles.setContent}>
          <View style={styles.setInputs}>
            {/* Enhanced Weight Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <View style={styles.inputContainer}>
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
                {localWeight && (
                  <View style={styles.inputUnit}>
                    <Text style={styles.unitText}>lbs</Text>
                  </View>
                )}
              </View>

              {/* Smart Quick Buttons based on previous performance */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickInputs}>
                {quickWeights.map((weight) => (
                  <QuickInputButton
                    key={weight}
                    value={weight}
                    isSelected={localWeight === weight}
                    onPress={() => {
                      setLocalWeight(weight);
                      onUpdate({ weight });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    onLongPress={() => {
                      // Custom weight input
                      Alert.prompt(
                        'Custom Weight',
                        'Enter custom weight:',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Set',
                            onPress: (value) => {
                              if (value) {
                                setLocalWeight(value);
                                onUpdate({ weight: value });
                              }
                            }
                          }
                        ],
                        'plain-text',
                        weight
                      );
                    }}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Enhanced Reps Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reps</Text>
              <View style={styles.inputContainer}>
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
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickInputs}>
                {quickReps.map((reps) => (
                  <QuickInputButton
                    key={reps}
                    value={reps}
                    isSelected={localReps === reps}
                    onPress={() => {
                      setLocalReps(reps);
                      onUpdate({ reps });
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Enhanced Complete Button */}
            <TouchableOpacity
              style={[styles.completeButton, set.completed && styles.completeButtonActive]}
              onPress={handleComplete}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={set.completed ? ['#00D4FF20', '#00D4FF10'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.completeButtonGradient}
              >
                <Ionicons
                  name={set.completed ? "checkmark-circle" : "radio-button-off"}
                  size={28}
                  color={set.completed ? "#00D4FF" : "#666"}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Enhanced Previous Performance with trend indicator */}
          {previousPerformance && (
            <View style={styles.previousPerformance}>
              <View style={styles.previousContent}>
                <Text style={styles.previousLabel}>Previous: </Text>
                <Text style={styles.previousValue}>
                  {previousPerformance.weight}lbs × {previousPerformance.reps}
                </Text>

                {/* Trend indicator */}
                {localWeight && localReps && (
                  <View style={styles.trendIndicator}>
                    {parseFloat(localWeight) > parseFloat(previousPerformance.weight) ? (
                      <Ionicons name="trending-up" size={12} color="#32D74B" />
                    ) : parseFloat(localWeight) < parseFloat(previousPerformance.weight) ? (
                      <Ionicons name="trending-down" size={12} color="#FF3B30" />
                    ) : (
                      <Ionicons name="remove" size={12} color="#888" />
                    )}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Set actions (delete, duplicate, etc.) */}
          {onDelete && (
            <View style={styles.setActions}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    'Delete Set',
                    'Are you sure you want to delete this set?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: onDelete }
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
};

// Enhanced Exercise Card with collapsible sections and better organization
interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdateSet: (setId: number, updates: Partial<ExerciseSet>) => void;
  onAddSet: () => void;
  onDeleteSet?: (setId: number) => void;
  previousPerformance: { date: string; weight: string; reps: string; }[];
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onUpdateSet,
  onAddSet,
  onDeleteSet,
  previousPerformance,
  isExpanded = true,
  onToggleExpanded
}) => {
  const [collapsedSets, setCollapsedSets] = useState<number[]>([]);

  const completedSets = exercise.sets.filter(set => set.completed).length;
  const totalVolume = exercise.sets.reduce((sum, set) => {
    if (set.completed) {
      return sum + (parseFloat(set.weight.toString()) || 0) * (parseFloat(set.reps.toString()) || 0);
    }
    return sum;
  }, 0);

  const toggleSetCollapse = (setIndex: number) => {
    setCollapsedSets(prev =>
      prev.includes(setIndex)
        ? prev.filter(i => i !== setIndex)
        : [...prev, setIndex]
    );
  };

  const getLatestPerformance = (setIndex: number) => {
    return previousPerformance[setIndex] || null;
  };

  const isPersonalRecord = (set: ExerciseSet) => {
    const currentVolume = (parseFloat(set.weight.toString()) || 0) * (parseFloat(set.reps.toString()) || 0);
    const previousBest = previousPerformance.reduce((max, perf) => {
      const volume = (parseFloat(perf.weight) || 0) * (parseFloat(perf.reps) || 0);
      return volume > max ? volume : max;
    }, 0);

    return currentVolume > previousBest && set.completed;
  };

  return (
    <View style={styles.exerciseCard}>
      <BlurView intensity={10} style={styles.exerciseCardBlur}>
        {/* Enhanced Exercise Header */}
        <TouchableOpacity
          style={styles.exerciseHeader}
          onPress={onToggleExpanded}
          activeOpacity={0.8}
        >
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.exerciseMetaRow}>
              <Text style={styles.exerciseMeta}>
                {exercise.muscleGroups?.join(', ') || 'General'} • Intermediate
              </Text>
              <View style={styles.exerciseStats}>
                <Text style={styles.setProgress}>
                  {completedSets}/{exercise.sets.length} sets
                </Text>
                {totalVolume > 0 && (
                  <Text style={styles.volumeDisplay}>
                    {totalVolume.toLocaleString()} lbs
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.exerciseActions}>
            {/* Progress ring indicator */}
            <View style={styles.progressRing}>
              <Text style={styles.progressText}>
                {Math.round((completedSets / exercise.sets.length) * 100)}%
              </Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAddSet}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#00D4FF20', '#00D4FF10']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="add" size={20} color="#00D4FF" />
              </LinearGradient>
            </TouchableOpacity>

            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        {/* Collapsible Sets Container */}
        {isExpanded && (
          <View style={styles.setsContainer}>
            {exercise.sets.map((set, index) => (
              <SetRow
                key={`set-${exercise.id}-${index}-${set.id || index}`}
                set={set}
                index={index}
                onUpdate={(updates) => onUpdateSet(index, updates)}
                onDelete={onDeleteSet ? () => onDeleteSet(index) : undefined}
                previousPerformance={getLatestPerformance(index)}
                isPersonalRecord={isPersonalRecord(set)}
                isCollapsed={collapsedSets.includes(index)}
                onToggleCollapse={() => toggleSetCollapse(index)}
              />
            ))}
          </View>
        )}
      </BlurView>
    </View>
  );
};

// Enhanced Rest Timer with better UX and social features
const RestTimer: React.FC<{
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  pauseRestTimer: () => void;
  resetRestTimer: () => void;
}> = ({ isRestTimerActive, restTimeRemaining, pauseRestTimer, resetRestTimer }) => {
  const [expanded, setExpanded] = useState(false);

  if (!isRestTimerActive && restTimeRemaining <= 0) return null;

  const minutes = Math.floor(restTimeRemaining / 60);
  const seconds = restTimeRemaining % 60;
  const progress = Math.max(0, (120 - restTimeRemaining) / 120); // Assuming 2min default rest

  return (
    <View style={[styles.restTimer, expanded && styles.restTimerExpanded]}>
      <BlurView intensity={20} style={styles.restTimerContent}>
        <TouchableOpacity
          style={styles.restTimerHeader}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.8}
        >
          <Text style={styles.restTimerLabel}>REST TIME</Text>
          <Text style={styles.restTimerTime}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </Text>

          {/* Progress indicator */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.restTimerActions}>
            <TouchableOpacity
              style={styles.restButton}
              onPress={pauseRestTimer}
              activeOpacity={0.8}
            >
              <Ionicons name="pause" size={16} color="#00D4FF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restButton}
              onPress={resetRestTimer}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#00D4FF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.restButton}
              onPress={() => {
                resetRestTimer();
                setExpanded(false);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={16} color="#32D74B" />
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </View>
  );
};

// Main Enhanced Workout Log Screen
export default function EnhancedWorkoutLogScreenV2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    activeWorkout,
    isWorkoutActive,
    elapsedTime,
    exerciseLibrary,
    searchResults,
    userPreferences,
    totalVolume,
    completedSets,
    isRestTimerActive,
    restTimeRemaining,
    lastError,
    clearError,
    addExerciseToWorkout,
    updateSet,
    logSet,
    searchExercises,
    startWorkout,
    endWorkout,
    pauseRestTimer,
    resetRestTimer
  } = useEnhancedWorkout();

  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exercisePerformanceCache, setExercisePerformanceCache] = useState<{[key: string]: any[]}>({});
  const [personalRecords, setPersonalRecords] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const [motivationMode, setMotivationMode] = useState(true);

  // Enhanced search with better filtering
  const handleSearchExercises = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      return;
    }

    try {
      await searchExercises(query);
    } catch (error) {
      console.error('Error searching exercises:', error);
    }
  }, [searchExercises]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddExercise = async (exercise: ExerciseTemplate) => {
    try {
      await addExerciseToWorkout(exercise.id);
      setShowExerciseSearch(false);
      setSearchQuery('');

      // Add to expanded exercises by default
      setExpandedExercises(prev => [...prev, exercise.id]);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const handleUpdateSet = async (exerciseId: string, setId: number, updates: Partial<ExerciseSet>) => {
    try {
      await updateSet(exerciseId, setId, updates);
    } catch (error) {
      console.error('Error updating set:', error);
    }
  };

  const handleAddSet = async (exerciseId: string) => {
    try {
      await logSet(exerciseId, {
        weight: '',
        reps: '',
        completed: false,
        repType: 'standard'
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error adding set:', error);
    }
  };

  const handleStartWorkout = async () => {
    try {
      const workoutName = motivationMode
        ? `Beast Mode ${new Date().toLocaleDateString()}`
        : `Workout ${new Date().toLocaleDateString()}`;
      await startWorkout(workoutName);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };

  const handleEndWorkout = async () => {
    if (!activeWorkout) return;

    Alert.alert(
      '🏁 End Workout',
      'Ready to finish this session? You crushed it!',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Finish Strong',
          style: 'default',
          onPress: async () => {
            try {
              const summary = await endWorkout('Workout completed! 💪');
              if (summary) {
                // Show celebration before navigating
                showWorkoutSummary(summary);
              }
            } catch (error) {
              console.error('Error ending workout:', error);
            }
          }
        }
      ]
    );
  };

  const showWorkoutSummary = (summary: any) => {
    Alert.alert(
      '🎉 Workout Complete!',
      `Amazing session! You completed ${completedSets} sets with ${totalVolume.toLocaleString()} lbs total volume in ${formatTime(elapsedTime)}.`,
      [
        { text: 'Share Achievement', onPress: shareWorkout },
        { text: 'View Details', onPress: () => router.push('/workout/complete') }
      ]
    );
  };

  const shareWorkout = async () => {
    try {
      await Share.share({
        message: `Just crushed a workout! ${completedSets} sets • ${totalVolume.toLocaleString()} lbs volume • ${formatTime(elapsedTime)} 💪 #EliteLocker #WorkoutComplete`,
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  };

  const toggleExerciseExpanded = (exerciseId: string) => {
    setExpandedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // Show error if any
  useEffect(() => {
    if (lastError) {
      Alert.alert('Oops!', lastError, [
        { text: 'Got it', onPress: clearError }
      ]);
    }
  }, [lastError, clearError]);

  // Empty state with motivational messaging
  if (!isWorkoutActive && !activeWorkout) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <ScrollView contentContainerStyle={styles.emptyStateContainer}>
          <View style={styles.emptyState}>
            <BlurView intensity={20} style={styles.emptyStateBlur}>
              <LinearGradient
                colors={['#00D4FF20', '#00D4FF10', 'transparent']}
                style={styles.emptyStateGradient}
              >
                <Ionicons name="fitness" size={80} color="#00D4FF" />
                <Text style={styles.emptyStateTitle}>
                  {motivationMode ? "Time to Dominate! 💪" : "Ready to Train?"}
                </Text>
                <Text style={styles.emptyStateText}>
                  {motivationMode
                    ? "Champions are made in the gym. Let's build greatness, one rep at a time."
                    : "Start a new workout session to begin logging your exercises and tracking your progress."
                  }
                </Text>

                <View style={styles.motivationToggle}>
                  <TouchableOpacity
                    style={[styles.toggleButton, motivationMode && styles.toggleButtonActive]}
                    onPress={() => setMotivationMode(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.toggleText, motivationMode && styles.toggleTextActive]}>
                      Beast Mode
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleButton, !motivationMode && styles.toggleButtonActive]}
                    onPress={() => setMotivationMode(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.toggleText, !motivationMode && styles.toggleTextActive]}>
                      Standard
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.startWorkoutButton}
                  onPress={handleStartWorkout}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#00D4FF', '#0099CC']}
                    style={styles.startWorkoutGradient}
                  >
                    <Ionicons name="play" size={24} color="#FFF" />
                    <Text style={styles.startWorkoutText}>
                      {motivationMode ? "Let's Dominate" : "Start Workout"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </BlurView>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Enhanced Header with better visual hierarchy */}
      <BlurView intensity={20} style={styles.header}>
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.1)', 'transparent']}
          style={styles.headerGradient}
        >
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
                <LinearGradient
                  colors={['#FF3B30', '#CC2B20']}
                  style={styles.endButtonGradient}
                >
                  <Ionicons name="stop" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>

      {/* Enhanced Rest Timer */}
      <RestTimer
        isRestTimerActive={isRestTimerActive}
        restTimeRemaining={restTimeRemaining}
        pauseRestTimer={pauseRestTimer}
        resetRestTimer={resetRestTimer}
      />

      {/* Enhanced Exercises List */}
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
            isExpanded={expandedExercises.includes(exercise.id)}
            onToggleExpanded={() => toggleExerciseExpanded(exercise.id)}
          />
        ))}

        {/* Enhanced Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowExerciseSearch(true)}
          activeOpacity={0.8}
        >
          <BlurView intensity={20} style={styles.addExerciseBlur}>
            <LinearGradient
              colors={['rgba(0, 212, 255, 0.1)', 'rgba(0, 212, 255, 0.05)']}
              style={styles.addExerciseGradient}
            >
              <Ionicons name="add" size={32} color="#00D4FF" />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
              <Text style={styles.addExerciseSubtext}>Tap to explore {exerciseLibrary.length}+ exercises</Text>
            </LinearGradient>
          </BlurView>
        </TouchableOpacity>
      </ScrollView>

      {/* Enhanced Exercise Search Modal */}
      <Modal
        visible={showExerciseSearch}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExerciseSearch(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <BlurView intensity={20} style={styles.modalHeader}>
            <LinearGradient
              colors={['rgba(0, 212, 255, 0.1)', 'transparent']}
              style={styles.modalHeaderGradient}
            >
              <Text style={styles.modalTitle}>Choose Exercise</Text>
              <TouchableOpacity
                onPress={() => setShowExerciseSearch(false)}
                style={styles.closeButton}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises, muscle groups, equipment..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={handleSearchExercises}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
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
                    {item.muscleGroups.join(', ')} • {item.difficulty} • {item.equipment || 'Various'}
                  </Text>
                </View>
                <View style={styles.addExerciseIcon}>
                  <LinearGradient
                    colors={['#00D4FF20', '#00D4FF10']}
                    style={styles.addIconGradient}
                  >
                    <Ionicons name="add" size={20} color="#00D4FF" />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Enhanced Styles with better spacing, typography, and visual hierarchy
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Header Styles
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  workoutTime: {
    fontSize: 18,
    color: '#00D4FF',
    marginTop: 4,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  endButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  endButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },

  // Exercise Card Styles
  exerciseCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  exerciseCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseMeta: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  exerciseStats: {
    alignItems: 'flex-end',
  },
  setProgress: {
    fontSize: 13,
    color: '#00D4FF',
    fontWeight: '600',
  },
  volumeDisplay: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#00D4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00D4FF',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sets Container
  setsContainer: {
    gap: 16,
  },

  // Enhanced Set Row Styles
  setRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  setHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  prBadge: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  prBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  prText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
    textTransform: 'uppercase',
  },
  completionIndicator: {
    width: 20,
    height: 20,
  },
  setContent: {
    padding: 16,
    paddingTop: 0,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
  },
  setInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  setInputCompleted: {
    borderColor: '#00D4FF',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  inputUnit: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  unitText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  quickInputs: {
    marginTop: 12,
  },
  quickButton: {
    borderRadius: 8,
    marginRight: 8,
    overflow: 'hidden',
  },
  quickButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickButtonSelected: {
    // Handled by gradient
  },
  quickButtonText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  quickButtonTextSelected: {
    color: '#00D4FF',
  },
  completeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  completeButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonActive: {
    // Handled by gradient
  },

  // Previous Performance
  previousPerformance: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  previousContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previousLabel: {
    fontSize: 12,
    color: '#666',
  },
  previousValue: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  trendIndicator: {
    marginLeft: 8,
  },

  // Set Actions
  setActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add Exercise Button
  addExerciseButton: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  addExerciseBlur: {
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 20,
    overflow: 'hidden',
  },
  addExerciseGradient: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  addExerciseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00D4FF',
  },
  addExerciseSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Enhanced Rest Timer
  restTimer: {
    position: 'absolute',
    top: 140,
    right: 20,
    zIndex: 1000,
    borderRadius: 16,
    overflow: 'hidden',
  },
  restTimerExpanded: {
    top: 120,
  },
  restTimerContent: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#00D4FF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  restTimerHeader: {
    alignItems: 'center',
  },
  restTimerLabel: {
    fontSize: 10,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  restTimerTime: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00D4FF',
    marginVertical: 8,
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  restTimerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  restButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Enhanced Empty State
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyState: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
  },
  emptyStateBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 32,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 280,
  },
  motivationToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#00D4FF',
  },
  startWorkoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 280,
  },
  startWorkoutGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startWorkoutText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },

  // Enhanced Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    padding: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFF',
  },
  clearButton: {
    marginLeft: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 6,
  },
  exerciseItemMeta: {
    fontSize: 14,
    color: '#888',
  },
  addExerciseIcon: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addIconGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
  },
});