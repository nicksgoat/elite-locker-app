import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useWorkout } from '../../contexts/WorkoutContext';
import FloatingActionButton from './FloatingActionButton';

const { width } = Dimensions.get('window');

interface FloatingWorkoutTrackerProps {
  visible?: boolean;
}

/**
 * A component that adds a floating action button for workout tracking
 * This can be included in any screen where workout tracking should be available
 */
const FloatingWorkoutTracker: React.FC<FloatingWorkoutTrackerProps> = ({
  visible = true,
}) => {
  if (!visible) return null;
  
  const { 
    isWorkoutActive,
    isWorkoutMinimized,
    currentWorkout, 
    maximizeWorkout,
    endWorkout,
  } = useWorkout();
  
  const router = useRouter();
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  // Show animation when tracker appears
  React.useEffect(() => {
    if (isWorkoutActive && isWorkoutMinimized) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [isWorkoutActive, isWorkoutMinimized]);
  
  if (!isWorkoutActive || !isWorkoutMinimized) {
    return null;
  }
  
  const { 
    exercises, 
    elapsedTime, 
    isRestTimerActive, 
    restTimeRemaining, 
    currentExerciseIndex,
    totalVolume,
    completedSets,
    totalSets,
    personalRecords
  } = currentWorkout;
  
  // Calculate completion percentage
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(ex => ex.completed).length;
  const completionPercentage = totalExercises > 0 
    ? (completedExercises / totalExercises) * 100 
    : 0;
  const setsCompletionPercentage = totalSets > 0 
    ? (completedSets / totalSets) * 100 
    : 0;
  
  // Get the current exercise
  const currentExercise = exercises[currentExerciseIndex] || exercises[0];
  
  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Format total volume
  const formatVolume = (vol: number) => {
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}k`;
    }
    return vol.toString();
  };

  // Handle maximize workout
  const handleMaximize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    maximizeWorkout();
    router.push('/workout/active');
  };
  
  // Handle end workout confirmation
  const handleEndWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    Alert.alert(
      "End Workout",
      "Are you sure you want to end this workout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "End Workout",
          style: "destructive",
          onPress: () => {
            endWorkout();
            router.replace('/workout');
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.container} pointerEvents="box-none">
      <FloatingActionButton />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              },
              { scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }
            ],
            opacity: animatedValue
          }
        ]}
      >
        <TouchableOpacity
          style={styles.trackerContainer}
          onPress={handleMaximize}
          activeOpacity={0.9}
        >
          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            {/* Quick stats row */}
            <View style={styles.quickStatsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatElapsedTime(elapsedTime)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatVolume(totalVolume)}</Text>
                <Text style={styles.statLabel}>Volume</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{`${completedSets}/${totalSets}`}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
              
              {personalRecords > 0 && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.prValue}>{personalRecords}</Text>
                    <Text style={styles.prLabel}>PR</Text>
                  </View>
                </>
              )}
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${setsCompletionPercentage}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {completedExercises}/{totalExercises} exercises
              </Text>
            </View>
            
            <View style={styles.contentContainer}>
              <View style={styles.exerciseInfo}>
                <Ionicons name="barbell-outline" size={18} color="#FFFFFF" style={styles.exerciseIcon} />
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {currentExercise?.name || 'Workout in progress'}
                </Text>
              </View>
              
              {isRestTimerActive ? (
                <View style={styles.restTimerContainer}>
                  <Text style={styles.restLabel}>REST</Text>
                  <View style={styles.restTimer}>
                    <Text style={styles.restTimeText}>{formatElapsedTime(restTimeRemaining)}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={16} color="#8E8E93" />
                  <Text style={styles.timeText}>{formatElapsedTime(elapsedTime)}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={handleMaximize}>
                <Ionicons name="expand" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={handleEndWorkout}>
                <Ionicons name="close-circle" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    pointerEvents: 'box-none',
    zIndex: 1000,
  },
  trackerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70, // Above tab bar
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
  },
  blurContainer: {
    padding: 12,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(30, 30, 30, 0.4)',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  prValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  prLabel: {
    fontSize: 10,
    color: '#FF9500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    alignSelf: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0A84FF',
  },
  progressText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  exerciseIcon: {
    marginRight: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
  },
  restTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restLabel: {
    color: '#FF9F0A',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  restTimer: {
    backgroundColor: 'rgba(255, 159, 10, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  restTimeText: {
    color: '#FF9F0A',
    fontSize: 13,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default FloatingWorkoutTracker; 