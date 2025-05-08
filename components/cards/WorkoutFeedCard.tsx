import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

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

      {/* Simplified card */}
      <TouchableOpacity style={styles.workoutCard} onPress={handlePress} activeOpacity={0.9}>
        {/* Main workout info row */}
        <View style={styles.workoutRow}>
          <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]} />
          <Text style={styles.workoutTitle}>{workoutName}</Text>
        </View>

        {/* Stats row - horizontal layout */}
        <View style={styles.statsRow}>
          {caloriesBurned !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="flame" size={16} color="#FF9500" />
              <Text style={styles.statValue}>{caloriesBurned} cal</Text>
            </View>
          )}

          {totalVolume !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
              <Text style={styles.statValue}>{totalVolume.toLocaleString()} lb</Text>
            </View>
          )}

          {duration !== undefined && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#A2A2A2" />
              <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            </View>
          )}

          {prsAchieved !== undefined && prsAchieved > 0 && (
            <View style={styles.prBadge}>
              <Text style={styles.prText}>PR {prsAchieved}</Text>
            </View>
          )}
        </View>
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
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statValue: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 4,
    fontWeight: '500',
  },
  prBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  prText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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