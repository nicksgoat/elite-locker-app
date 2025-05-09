import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Exercise set type for workout feed
interface ExerciseSet {
  id: number;
  weight: string | number;
  reps: string | number;
  completed?: boolean;
  isPersonalRecord?: boolean;
}

// Exercise type for workout feed
interface WorkoutExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  superSetId?: string; // If part of a superset
}

// Superset type for workout feed
interface SuperSet {
  id: string;
  exercises: WorkoutExercise[];
  setCount: number;
}

// Assuming a simplified Workout type for the feed card, or use the full one and pick fields
interface WorkoutFeedItem {
  id: string;
  userName: string;
  userAvatarUrl?: string;
  workoutName: string;
  caloriesBurned?: number;
  totalVolume?: number;
  duration?: number; // in seconds
  prsAchieved?: number;
  timestamp: string; // e.g., "4 hours ago"
  location?: string; // e.g., "Canada"
  // Add any other relevant fields like workoutId to navigate to detail
  workoutId?: string;
  // Exercise data
  exercises?: WorkoutExercise[];
  superSets?: SuperSet[];
}

interface WorkoutFeedCardProps {
  workoutItem: WorkoutFeedItem;
  onPress?: (workoutId: string) => void;
  onLike?: (workoutId: string) => void;
  onComment?: (workoutId: string) => void;
  onMoreOptions?: (workoutId: string) => void;
}

const WorkoutFeedCard: React.FC<WorkoutFeedCardProps> = ({
  workoutItem,
  onPress,
  onLike,
  onComment,
  onMoreOptions
}) => {
  const {
    id,
    userName,
    userAvatarUrl,
    workoutName,
    caloriesBurned,
    totalVolume,
    duration,
    prsAchieved,
    timestamp,
    location,
    workoutId
  } = workoutItem;

  const handlePress = () => {
    if (onPress && workoutId) {
      onPress(workoutId);
    }
  };

  const handleLike = () => onLike && onLike(id);
  const handleComment = () => onComment && onComment(id);
  const handleMoreOptions = () => onMoreOptions && onMoreOptions(id);

  // Format duration for display (e.g. 1:00:15)
  const formatDuration = (seconds?: number) => {
    if (seconds === undefined) return '--:--';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };

  // Get workout icon color based on workout name
  const getWorkoutIconColor = () => {
    // Default to red for common strength workouts
    if (workoutName.toLowerCase().includes('leg') ||
        workoutName.toLowerCase().includes('glute') ||
        workoutName.toLowerCase().includes('hamstring')) {
      return '#FF3B30'; // Red
    } else if (workoutName.toLowerCase().includes('pull') ||
        workoutName.toLowerCase().includes('back')) {
      return '#007AFF'; // Blue
    } else if (workoutName.toLowerCase().includes('push') ||
        workoutName.toLowerCase().includes('chest')) {
      return '#5856D6'; // Purple
    } else if (workoutName.toLowerCase().includes('cycle') ||
        workoutName.toLowerCase().includes('cardio') ||
        workoutName.toLowerCase().includes('run')) {
      return '#FF9500'; // Orange
    }
    return '#FF3B30'; // Default red
  };

  return (
    <View style={styles.container}>
      {/* User header section - only show if avatar available */}
      {userAvatarUrl && (
        <View style={styles.userHeader}>
          <Image
            source={{ uri: userAvatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.finishedText}>
              finished <Text style={styles.workoutNameLink}>{workoutName}</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={handleMoreOptions} style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      )}

      {/* Dark themed workout card */}
      <TouchableOpacity
        style={styles.darkWorkoutCard}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Card header with workout name and PR badge */}
        <View style={styles.darkCardHeader}>
          <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]} />
          <Text style={styles.darkCardTitle}>{workoutName}</Text>

          {prsAchieved !== undefined && prsAchieved > 0 && (
            <View style={styles.darkPrBadge}>
              <Text style={styles.darkPrText}>{prsAchieved} PR</Text>
            </View>
          )}
        </View>

        {/* Stats row - horizontal layout */}
        <View style={styles.darkStatsRow}>
          {duration !== undefined && (
            <View style={styles.darkStatItem}>
              <Ionicons name="time-outline" size={16} color="#A2A2A2" />
              <Text style={styles.darkStatValue}>{formatDuration(duration)}</Text>
            </View>
          )}

          {totalVolume !== undefined && (
            <View style={styles.darkStatItem}>
              <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
              <Text style={styles.darkStatValue}>
                {totalVolume >= 1000
                  ? `${(totalVolume/1000).toFixed(1)}k`
                  : totalVolume.toLocaleString()}
              </Text>
            </View>
          )}

          {caloriesBurned !== undefined && (
            <View style={styles.darkStatItem}>
              <Ionicons name="flame" size={16} color="#FF9500" />
              <Text style={styles.darkStatValue}>{caloriesBurned} cal</Text>
            </View>
          )}
        </View>

        {/* Exercise List */}
        {workoutItem.exercises && workoutItem.exercises.length > 0 && (
          <View style={styles.exercisesList}>
            {workoutItem.exercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseIconContainer}>
                    <Ionicons name="barbell-outline" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Ionicons
                    name={exercise.sets.length > 0 ? "chevron-down" : "chevron-forward"}
                    size={16}
                    color="#8E8E93"
                  />
                </View>

                {/* Exercise Sets */}
                {exercise.sets.length > 0 && (
                  <View style={styles.setsContainer}>
                    <View style={styles.setsHeader}>
                      <Text style={styles.setsHeaderText}>PREVIOUS</Text>
                      <Text style={styles.setsHeaderText}>WEIGHT</Text>
                      <Text style={styles.setsHeaderText}>REP</Text>
                    </View>

                    {exercise.sets.map((set) => (
                      <View key={set.id} style={styles.setRow}>
                        <Text style={styles.setNumber}>{set.id}x</Text>
                        <Text style={styles.setWeight}>{set.weight} lb</Text>
                        <Text style={styles.setReps}>{set.reps}</Text>
                        <View style={styles.setCompleted}>
                          {set.completed && (
                            <Ionicons name="checkmark" size={16} color="#30D158" />
                          )}
                        </View>
                      </View>
                    ))}

                    {/* Add Set Button - for display only in feed */}
                    <View style={styles.addSetButtonContainer}>
                      <View style={styles.addSetButton}>
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.addSetText}>Add Set</Text>
                      </View>

                      <View style={styles.superSetButton}>
                        <Text style={styles.superSetText}>Super Set</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Super Sets */}
        {workoutItem.superSets && workoutItem.superSets.length > 0 && (
          <View style={styles.superSetsContainer}>
            {workoutItem.superSets.map((superSet) => (
              <View key={superSet.id} style={styles.superSetItem}>
                <View style={styles.superSetHeader}>
                  <Text style={styles.superSetTitle}>Super Set</Text>
                  <Text style={styles.superSetCount}>{superSet.setCount} sets</Text>
                  <Ionicons name="chevron-down" size={16} color="#8E8E93" />
                </View>

                {/* Super Set Exercises */}
                {superSet.exercises.map((exercise) => (
                  <View key={exercise.id} style={styles.superSetExercise}>
                    <View style={styles.exerciseIconContainer}>
                      <Ionicons name="barbell-outline" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Social actions and timestamp */}
      <View style={styles.socialContainer}>
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Ionicons name="heart-outline" size={22} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleComment} style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
          </TouchableOpacity>
        </View>
        <Text style={styles.timestamp}>{timestamp} {location ? `• ${location}` : ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishedText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  workoutNameLink: {
    fontSize: 14,
    color: '#63A1FF',
    fontWeight: '500',
  },
  moreButton: {
    padding: 5,
  },

  // Dark styled workout card
  darkWorkoutCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  darkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  darkCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  darkPrBadge: {
    backgroundColor: '#8B5500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  darkPrText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  darkStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  darkStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 8,
  },
  darkStatValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },

  // Exercise list styles
  exercisesList: {
    marginTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  exerciseItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },

  // Sets styles
  setsContainer: {
    marginTop: 8,
    paddingLeft: 38, // Align with exercise name
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 30,
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
    height: 30,
  },
  setNumber: {
    width: 30,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'left',
  },
  setWeight: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  setReps: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  setCompleted: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add Set button
  addSetButtonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  addSetText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  superSetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  superSetText: {
    fontSize: 13,
    color: '#FFFFFF',
  },

  // Super Set styles
  superSetsContainer: {
    marginTop: 8,
  },
  superSetItem: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  superSetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  superSetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  superSetCount: {
    fontSize: 13,
    color: '#8E8E93',
    marginRight: 10,
  },
  superSetExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },

  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
});

export default WorkoutFeedCard;