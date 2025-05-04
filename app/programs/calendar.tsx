import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useProgram } from '../../contexts/ProgramContext';

// Helper function to get the day name
const getDayName = (dayIndex: number): string => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days[dayIndex - 1] || '';
};

// Helper function to get the date from a start date and day offset
const getDateFromOffset = (startDate: Date, dayOffset: number): Date => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayOffset);
  return date;
};

export default function ProgramCalendarScreen() {
  const router = useRouter();
  const { subscriptionId } = useLocalSearchParams();
  const subscriptionIdStr = Array.isArray(subscriptionId) ? subscriptionId[0] : subscriptionId;
  
  const { 
    mySubscriptions, 
    getProgram, 
    getNextScheduledWorkout,
    calculateWorkingWeight
  } = useProgram();
  
  const [subscription, setSubscription] = useState(
    mySubscriptions.find(s => s.id === subscriptionIdStr) || mySubscriptions[0]
  );
  const [selectedWeek, setSelectedWeek] = useState(subscription?.currentWeek || 1);
  const [program, setProgram] = useState(
    subscription ? getProgram(subscription.programId) : null
  );

  useEffect(() => {
    if (subscription) {
      setProgram(getProgram(subscription.programId));
    }
  }, [subscription]);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleWeekChange = (week: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWeek(week);
  };

  const handleWorkoutPress = (workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (subscription) {
      router.push({
        pathname: '/programs/workout',
        params: { programId: subscription.programId, workoutId }
      });
    }
  };

  // Filter workouts for the selected week
  const weekWorkouts = program?.workouts.filter(workout => workout.week === selectedWeek) || [];
  
  // Calculate status for each workout
  const getWorkoutStatus = (workout: any) => {
    if (!subscription) return 'pending';
    
    const workoutDate = getDateFromOffset(
      subscription.startDate,
      ((workout.week - 1) * 7) + (workout.day - 1)
    );
    const today = new Date();
    
    // If workout's week and day are before the current progress
    if (workout.week < subscription.currentWeek || 
        (workout.week === subscription.currentWeek && workout.day < subscription.currentDay)) {
      return 'completed';
    }
    
    // If workout is scheduled for today and is the current workout
    if (workout.week === subscription.currentWeek && workout.day === subscription.currentDay) {
      return 'today';
    }
    
    // If workout date is in the past but not marked as completed
    if (workoutDate < today) {
      return 'missed';
    }
    
    return 'pending';
  };

  if (!subscription || !program) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No active program subscription found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Program Calendar</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Program Title */}
        <View style={styles.programHeader}>
          <Text style={styles.programTitle}>{program.title}</Text>
          <View style={styles.programProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((subscription.currentWeek - 1) / program.duration_weeks) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Week {subscription.currentWeek} of {program.duration_weeks}
            </Text>
          </View>
        </View>

        {/* Week Selector */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weeksContainer}
        >
          {Array.from({ length: program.duration_weeks }, (_, i) => i + 1).map(week => {
            const isActive = selectedWeek === week;
            const isCurrent = subscription.currentWeek === week;
            const isCompleted = week < subscription.currentWeek;
            
            return (
              <TouchableOpacity
                key={week}
                style={[
                  styles.weekButton,
                  isActive && styles.weekButtonActive,
                  isCurrent && styles.weekButtonCurrent,
                  isCompleted && styles.weekButtonCompleted
                ]}
                onPress={() => handleWeekChange(week)}
              >
                <Text 
                  style={[
                    styles.weekButtonText,
                    isActive && styles.weekButtonTextActive
                  ]}
                >
                  Week {week}
                </Text>
                {isCompleted && (
                  <Ionicons name="checkmark-circle" size={14} color="#0A84FF" style={styles.weekCompletedIcon} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Phase Info */}
        {program.phases_config.map((phase, index) => {
          // Calculate the start and end weeks for this phase
          const startWeek = program.phases_config.slice(0, index).reduce((sum, p) => sum + p.weeks, 0) + 1;
          const endWeek = startWeek + phase.weeks - 1;
          
          // Check if the selected week falls within this phase
          if (selectedWeek >= startWeek && selectedWeek <= endWeek) {
            return (
              <View key={index} style={styles.phaseInfo}>
                <Text style={styles.phaseTitle}>{phase.name} Phase</Text>
                <Text style={styles.phaseSubtitle}>
                  Weeks {startWeek}-{endWeek}
                  {phase.deload && ' • Deload'}
                </Text>
              </View>
            );
          }
          return null;
        })}

        {/* Workouts For Selected Week */}
        <View style={styles.workoutsContainer}>
          {weekWorkouts.length > 0 ? (
            weekWorkouts.map(workout => {
              const status = getWorkoutStatus(workout);
              const workoutDate = getDateFromOffset(
                subscription.startDate,
                ((workout.week - 1) * 7) + (workout.day - 1)
              );
              
              return (
                <TouchableOpacity
                  key={workout.id}
                  style={[
                    styles.workoutCard,
                    status === 'today' && styles.workoutCardToday,
                    status === 'completed' && styles.workoutCardCompleted
                  ]}
                  onPress={() => handleWorkoutPress(workout.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.workoutDay}>
                    <Text style={styles.workoutDayName}>
                      {getDayName(workout.day)}
                    </Text>
                    <Text style={styles.workoutDayDate}>
                      {workoutDate.getDate()}/{workoutDate.getMonth() + 1}
                    </Text>
                    <View 
                      style={[
                        styles.workoutStatusIndicator,
                        status === 'completed' && styles.statusCompleted,
                        status === 'missed' && styles.statusMissed,
                        status === 'today' && styles.statusToday,
                        status === 'pending' && styles.statusPending
                      ]}
                    />
                  </View>
                  
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutTitle}>{workout.title}</Text>
                    <Text style={styles.workoutExerciseCount}>
                      {workout.exercises.length} exercises
                    </Text>
                    
                    <View style={styles.exercisePreview}>
                      {workout.exercises.slice(0, 3).map((exercise, index) => {
                        let exerciseDisplay = exercise.name;
                        if (exercise.percentage) {
                          const workingWeight = calculateWorkingWeight(exercise.name, exercise.percentage);
                          if (workingWeight) {
                            exerciseDisplay += ` (${workingWeight} lb)`;
                          }
                        }
                        
                        return (
                          <Text key={index} style={styles.exerciseName} numberOfLines={1}>
                            • {exerciseDisplay}
                          </Text>
                        );
                      })}
                      
                      {workout.exercises.length > 3 && (
                        <Text style={styles.moreExercises}>
                          +{workout.exercises.length - 3} more
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.workoutStatus}>
                    {status === 'completed' && (
                      <View style={styles.statusBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#fff" />
                        <Text style={styles.statusText}>Completed</Text>
                      </View>
                    )}
                    {status === 'today' && (
                      <View style={[styles.statusBadge, styles.statusBadgeToday]}>
                        <Ionicons name="fitness" size={14} color="#fff" />
                        <Text style={styles.statusText}>Today</Text>
                      </View>
                    )}
                    {status === 'missed' && (
                      <View style={[styles.statusBadge, styles.statusBadgeMissed]}>
                        <Ionicons name="alert-circle" size={14} color="#fff" />
                        <Text style={styles.statusText}>Missed</Text>
                      </View>
                    )}
                    {status === 'pending' && (
                      <View style={[styles.statusBadge, styles.statusBadgePending]}>
                        <Ionicons name="time-outline" size={14} color="#fff" />
                        <Text style={styles.statusText}>Upcoming</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyWorkoutsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#A0A0A0" />
              <Text style={styles.emptyWorkoutsText}>No workouts scheduled for this week</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderButton: {
    width: 36,
    height: 36,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  programHeader: {
    padding: 16,
  },
  programTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  programProgress: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0A84FF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  weeksContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  weekButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekButtonActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderColor: '#0A84FF',
  },
  weekButtonCurrent: {
    borderColor: '#0A84FF',
  },
  weekButtonCompleted: {
    borderColor: '#2C2C2E',
  },
  weekButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  weekButtonTextActive: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  weekCompletedIcon: {
    marginLeft: 6,
  },
  phaseInfo: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  workoutsContainer: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  workoutCard: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  workoutCardToday: {
    borderColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  workoutCardCompleted: {
    opacity: 0.8,
  },
  workoutDay: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    paddingRight: 8,
  },
  workoutDayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  workoutDayDate: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 6,
  },
  workoutStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A0A0A0',
  },
  statusCompleted: {
    backgroundColor: '#0A84FF',
  },
  statusMissed: {
    backgroundColor: '#FF3B30',
  },
  statusToday: {
    backgroundColor: '#30D158',
  },
  statusPending: {
    backgroundColor: '#A0A0A0',
  },
  workoutInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutExerciseCount: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 8,
  },
  exercisePreview: {
    marginTop: 4,
  },
  exerciseName: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  moreExercises: {
    fontSize: 12,
    color: '#0A84FF',
    marginTop: 2,
  },
  workoutStatus: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0A84FF',
    borderRadius: 4,
  },
  statusBadgeToday: {
    backgroundColor: '#30D158',
  },
  statusBadgeMissed: {
    backgroundColor: '#FF3B30',
  },
  statusBadgePending: {
    backgroundColor: '#636366',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  emptyWorkoutsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWorkoutsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
  },
}); 