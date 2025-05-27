import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  Animated,
  StatusBar,
  Platform,
  LayoutAnimation,
  Dimensions,
  Share,
  Keyboard
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEnhancedWorkout } from '../../contexts/EnhancedWorkoutContext';
import { ExerciseTemplate, WorkoutExercise } from '../../services/OfflineWorkoutService';
import { ExerciseSet } from '../../contexts/WorkoutContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// ✨ OPTIMIZED QUICK INPUT COMPONENT
interface QuickInputButtonProps {
  value: string;
  onPress: () => void;
  isSelected?: boolean;
  onLongPress?: () => void;
}

const QuickInputButton = React.memo<QuickInputButtonProps>(({ 
  value, 
  onPress, 
  isSelected = false,
  onLongPress 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
    if (isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [scaleAnim, isSelected]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.quickButton, isSelected && styles.quickButtonSelected]}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
});

// ✨ OPTIMIZED SET ROW COMPONENT
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

const SetRow = React.memo<SetRowProps>(({ 
  set, 
  index, 
  onUpdate, 
  onDelete,
  previousPerformance,
  isPersonalRecord = false,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [localWeight, setLocalWeight] = useState(set.weight?.toString() || '');
  const [localReps, setLocalReps] = useState(set.reps?.toString() || '');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Memoized quick values for better performance
  const quickWeights = useMemo(() => ['95', '135', '185', '225', '275', '315', '365'], []);
  const quickReps = useMemo(() => ['3', '5', '8', '10', '12', '15', '20'], []);

  useEffect(() => {
    setLocalWeight(set.weight?.toString() || '');
    setLocalReps(set.reps?.toString() || '');
  }, [set.weight, set.reps]);

  const handleComplete = useCallback(() => {
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
      if (isPersonalRecord) {
        showPRCelebration();
      }
    }
  }, [localWeight, localReps, set.completed, onUpdate, isPersonalRecord, scaleAnim, rotateAnim]);

  const showPRCelebration = useCallback(() => {
    Alert.alert(
      '🎉 Personal Record!',
      'You just set a new PR! Keep crushing it!',
      [
        { text: 'Share Achievement', onPress: shareAchievement },
        { text: 'Continue', style: 'default' }
      ]
    );
  }, []);

  const shareAchievement = useCallback(async () => {
    try {
      await Share.share({
        message: `Just hit a new PR! ${localWeight}lbs × ${localReps} reps 💪 #EliteLocker #PersonalRecord`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [localWeight, localReps]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderQuickWeightButtons = useCallback(() => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickInputs}>
      {quickWeights.map((weight) => (
        <QuickInputButton
          key={weight}
          value={weight}
          isSelected={localWeight === weight}
          onPress={() => {
            setLocalWeight(weight);
            onUpdate({ weight: weight });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onLongPress={() => {
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
  ), [quickWeights, localWeight, onUpdate]);

  const renderQuickRepButtons = useCallback(() => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickInputs}>
      {quickReps.map((reps) => (
        <QuickInputButton
          key={reps}
          value={reps}
          isSelected={localReps === reps}
          onPress={() => {
            setLocalReps(reps);
            onUpdate({ reps: reps });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        />
      ))}
    </ScrollView>
  ), [quickReps, localReps, onUpdate]);

  return (
    <Animated.View style={[
      styles.setRow, 
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <TouchableOpacity 
        style={styles.setHeader}
        onPress={onToggleCollapse}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

      {!isCollapsed && (
        <View style={styles.setContent}>
          <View style={styles.setInputs}>
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
              {renderQuickWeightButtons()}
            </View>

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
              {renderQuickRepButtons()}
            </View>

            <TouchableOpacity
              style={[styles.completeButton, set.completed && styles.completeButtonActive]}
              onPress={handleComplete}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

          {previousPerformance && (
            <View style={styles.previousPerformance}>
              <View style={styles.previousContent}>
                <Text style={styles.previousLabel}>Previous: </Text>
                <Text style={styles.previousValue}>
                  {previousPerformance.weight}lbs × {previousPerformance.reps}
                </Text>
                
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
});

// ✨ OPTIMIZED EXERCISE CARD COMPONENT
interface ExerciseCardProps {
  exercise: WorkoutExercise;
  onUpdateSet: (setId: number, updates: Partial<ExerciseSet>) => void;
  onAddSet: () => void;
  onDeleteSet?: (setId: number) => void;
  previousPerformance: { date: string; weight: string; reps: string; }[];
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

const ExerciseCard = React.memo<ExerciseCardProps>(({ 
  exercise, 
  onUpdateSet, 
  onAddSet,
  onDeleteSet,
  previousPerformance,
  isExpanded = true,
  onToggleExpanded
}) => {
  const [collapsedSets, setCollapsedSets] = useState<number[]>([]);
  
  const { completedSets, totalVolume } = useMemo(() => {
    const completed = exercise.sets?.filter(set => set.completed).length || 0;
    const volume = exercise.sets?.reduce((sum, set) => {
      if (set.completed) {
        return sum + (parseFloat(set.weight as string) || 0) * (parseInt(set.reps as string) || 0);
      }
      return sum;
    }, 0) || 0;
    return { completedSets: completed, totalVolume: volume };
  }, [exercise.sets]);

  const toggleSetCollapse = useCallback((setIndex: number) => {
    setCollapsedSets(prev => 
      prev.includes(setIndex) 
        ? prev.filter(i => i !== setIndex)
        : [...prev, setIndex]
    );
  }, []);

  const getLatestPerformance = useCallback((setIndex: number) => {
    return previousPerformance[setIndex] || null;
  }, [previousPerformance]);

  const isPersonalRecord = useCallback((set: ExerciseSet) => {
    const currentVolume = (parseFloat(set.weight as string) || 0) * (parseInt(set.reps as string) || 0);
    const previousBest = previousPerformance.reduce((max, perf) => {
      const volume = (parseFloat(perf.weight) || 0) * (parseFloat(perf.reps) || 0);
      return volume > max ? volume : max;
    }, 0);
    
    return currentVolume > previousBest && set.completed;
  }, [previousPerformance]);

  const progressPercentage = useMemo(() => {
    const total = exercise.sets?.length || 0;
    return total > 0 ? Math.round((completedSets / total) * 100) : 0;
  }, [completedSets, exercise.sets?.length]);

  return (
    <View style={styles.exerciseCard}>
      <BlurView intensity={10} style={styles.exerciseCardBlur}>
        <TouchableOpacity 
          style={styles.exerciseHeader}
          onPress={onToggleExpanded}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.exerciseMetaRow}>
              <Text style={styles.exerciseMeta}>
                {exercise.muscleGroups?.join(', ') || 'General'} • Intermediate
              </Text>
              <View style={styles.exerciseStats}>
                <Text style={styles.setProgress}>
                  {completedSets}/{exercise.sets?.length || 0} sets
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
            <View style={styles.progressRing}>
              <Text style={styles.progressText}>{progressPercentage}%</Text>
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAddSet}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

        {isExpanded && exercise.sets && (
          <View style={styles.setsContainer}>
            {exercise.sets.map((set, index) => (
              <SetRow
                key={`${exercise.id}-set-${index}`}
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
});

// ✨ OPTIMIZED REST TIMER COMPONENT
interface RestTimerProps {
  isRestTimerActive: boolean;
  restTimeRemaining: number;
  pauseRestTimer: () => void;
  resetRestTimer: () => void;
}

const RestTimer = React.memo<RestTimerProps>(({ 
  isRestTimerActive, 
  restTimeRemaining, 
  pauseRestTimer, 
  resetRestTimer 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const { minutes, seconds, progress } = useMemo(() => {
    const mins = Math.floor(restTimeRemaining / 60);
    const secs = restTimeRemaining % 60;
    const prog = Math.max(0, (120 - restTimeRemaining) / 120);
    return { minutes: mins, seconds: secs, progress: prog };
  }, [restTimeRemaining]);

  if (!isRestTimerActive && restTimeRemaining <= 0) return null;

  return (
    <View style={[styles.restTimer, expanded && styles.restTimerExpanded]}>
      <BlurView intensity={20} style={styles.restTimerContent}>
        <TouchableOpacity 
          style={styles.restTimerHeader}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.restTimerLabel}>REST TIME</Text>
          <Text style={styles.restTimerTime}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </Text>
          
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
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pause" size={16} color="#00D4FF" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.restButton}
              onPress={resetRestTimer}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="checkmark" size={16} color="#32D74B" />
            </TouchableOpacity>
          </View>
        )}
      </BlurView>
    </View>
  );
});

// ✨ MAIN ENHANCED WORKOUT LOG SCREEN V3 - FULLY OPTIMIZED
export default function EnhancedWorkoutLogScreenV3() {
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

  // Optimized local state management
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exercisePerformanceCache] = useState<{[key: string]: any[]}>({});
  const [personalRecords] = useState(0);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const [motivationMode, setMotivationMode] = useState(true);

  // Memoized values for performance
  const filteredExercises = useMemo(() => {
    return searchQuery ? searchResults : exerciseLibrary;
  }, [searchQuery, searchResults, exerciseLibrary]);

  const formattedTime = useMemo(() => {
    const hours = Math.floor(elapsedTime / 3600);
    const mins = Math.floor((elapsedTime % 3600) / 60);
    const secs = elapsedTime % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedTime]);

  // Optimized search handler with debouncing
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

  const handleAddExercise = useCallback(async (exercise: ExerciseTemplate) => {
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
  }, [addExerciseToWorkout]);

  const handleUpdateSet = useCallback(async (exerciseId: string, setId: number, updates: Partial<ExerciseSet>) => {
    try {
      await updateSet(exerciseId, setId, updates);
    } catch (error) {
      console.error('Error updating set:', error);
    }
  }, [updateSet]);

  const handleAddSet = useCallback(async (exerciseId: string) => {
    try {
      await logSet(exerciseId, {
        weight: '0',
        reps: '0',
        completed: false,
        repType: 'standard'
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error adding set:', error);
    }
  }, [logSet]);

  const handleStartWorkout = useCallback(async () => {
    try {
      const workoutName = motivationMode 
        ? `Beast Mode ${new Date().toLocaleDateString()}`
        : `Workout ${new Date().toLocaleDateString()}`;
      await startWorkout(workoutName);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  }, [motivationMode, startWorkout]);

  const handleEndWorkout = useCallback(async () => {
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
                showWorkoutSummary(summary);
              }
            } catch (error) {
              console.error('Error ending workout:', error);
            }
          }
        }
      ]
    );
  }, [activeWorkout, endWorkout]);

  const showWorkoutSummary = useCallback((summary: any) => {
    Alert.alert(
      '🎉 Workout Complete!',
      `Amazing session! You completed ${completedSets} sets with ${totalVolume.toLocaleString()} lbs total volume in ${formattedTime}.`,
      [
        { text: 'Share Achievement', onPress: shareWorkout },
        { text: 'View Details', onPress: () => router.push('/workout/complete') }
      ]
    );
  }, [completedSets, totalVolume, formattedTime, router]);

  const shareWorkout = useCallback(async () => {
    try {
      await Share.share({
        message: `Just crushed a workout! ${completedSets} sets • ${totalVolume.toLocaleString()} lbs volume • ${formattedTime} 💪 #EliteLocker #WorkoutComplete`,
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  }, [completedSets, totalVolume, formattedTime]);

  const toggleExerciseExpanded = useCallback((exerciseId: string) => {
    setExpandedExercises(prev => 
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  }, []);

  // Error handling
  useEffect(() => {
    if (lastError) {
      Alert.alert('Oops!', lastError, [
        { text: 'Got it', onPress: clearError }
      ]);
    }
  }, [lastError, clearError]);

  // Dismiss keyboard when scrolling
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  // Empty state component
  const EmptyState = useMemo(() => (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView 
        contentContainerStyle={styles.emptyStateContainer}
        onScrollBeginDrag={dismissKeyboard}
      >
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
  ), [insets.top, motivationMode, handleStartWorkout, dismissKeyboard]);

  // Show empty state if no active workout
  if (!isWorkoutActive && !activeWorkout) {
    return EmptyState;
  }

  // Render exercise item for FlatList
  const renderExerciseItem = useCallback(({ item }: { item: ExerciseTemplate }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => handleAddExercise(item)}
      activeOpacity={0.8}
    >
      <View style={styles.exerciseItemContent}>
        <Text style={styles.exerciseItemName}>{item.name}</Text>
        <Text style={styles.exerciseItemMeta}>
          {item.muscleGroups?.join(', ')} • {item.difficulty} • {item.equipment || 'Various'}
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
  ), [handleAddExercise]);

  const keyExtractor = useCallback((item: ExerciseTemplate) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Enhanced Header */}
      <BlurView intensity={20} style={styles.header}>
        <LinearGradient
          colors={['rgba(0, 212, 255, 0.1)', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.workoutTitle}>{activeWorkout?.name}</Text>
              <Text style={styles.workoutTime}>{formattedTime}</Text>
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

      {/* Rest Timer */}
      <RestTimer
        isRestTimerActive={isRestTimerActive}
        restTimeRemaining={restTimeRemaining}
        pauseRestTimer={pauseRestTimer}
        resetRestTimer={resetRestTimer}
      />

      {/* Exercises List */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={dismissKeyboard}
        keyboardShouldPersistTaps="handled"
      >
        {activeWorkout?.exercises?.map((exercise) => (
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

        {/* Add Exercise Button */}
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
              <Text style={styles.addExerciseSubtext}>
                Tap to explore {exerciseLibrary.length}+ exercises
              </Text>
            </LinearGradient>
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={filteredExercises}
            keyExtractor={keyExtractor}
            renderItem={renderExerciseItem}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
            getItemLayout={(data, index) => (
              { length: 80, offset: 80 * index, index }
            )}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ✨ OPTIMIZED STYLES WITH BETTER PERFORMANCE AND CONSISTENCY
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Header Styles
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    gap: 16,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  workoutTime: {
    fontSize: 16,
    color: '#00D4FF',
    marginTop: 2,
    fontWeight: '600',
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
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  endButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  endButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content Styles
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  // Exercise Card Styles
  exerciseCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseCardBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseMeta: {
    fontSize: 13,
    color: '#888',
    flex: 1,
  },
  exerciseStats: {
    alignItems: 'flex-end',
  },
  setProgress: {
    fontSize: 12,
    color: '#00D4FF',
    fontWeight: '600',
  },
  volumeDisplay: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: '#00D4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00D4FF',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sets Container
  setsContainer: {
    gap: 12,
  },

  // Set Row Styles
  setRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  setHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  setNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  prBadge: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  prBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  prText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    textTransform: 'uppercase',
  },
  completionIndicator: {
    width: 18,
    height: 18,
  },
  setContent: {
    padding: 12,
    paddingTop: 0,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
  },
  setInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
    right: 10,
    top: '50%',
    transform: [{ translateY: -7 }],
  },
  unitText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  quickInputs: {
    marginTop: 8,
  },
  quickButton: {
    borderRadius: 6,
    marginRight: 6,
    overflow: 'hidden',
  },
  quickButtonGradient: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickButtonSelected: {},
  quickButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  quickButtonTextSelected: {
    color: '#00D4FF',
  },
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignSelf: 'flex-end',
  },
  completeButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonActive: {},

  // Previous Performance
  previousPerformance: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  previousContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previousLabel: {
    fontSize: 11,
    color: '#666',
  },
  previousValue: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  trendIndicator: {
    marginLeft: 6,
  },

  // Set Actions
  setActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 6,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add Exercise Button
  addExerciseButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addExerciseBlur: {
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
  },
  addExerciseGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  addExerciseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00D4FF',
  },
  addExerciseSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },

  // Rest Timer
  restTimer: {
    position: 'absolute',
    top: 120,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restTimerExpanded: {
    top: 100,
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
  restTimerHeader: {
    alignItems: 'center',
  },
  restTimerLabel: {
    fontSize: 9,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  restTimerTime: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00D4FF',
    marginVertical: 6,
  },
  progressBar: {
    width: 70,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 1.5,
  },
  restTimerActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  restButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyState: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyStateBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 260,
  },
  motivationToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 3,
    marginBottom: 28,
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 7,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
  },
  toggleText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#00D4FF',
  },
  startWorkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 260,
  },
  startWorkoutGradient: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#FFF',
  },
  clearButton: {
    marginLeft: 6,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  exerciseItemMeta: {
    fontSize: 13,
    color: '#888',
  },
  addExerciseIcon: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  addIconGradient: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  },
}); 