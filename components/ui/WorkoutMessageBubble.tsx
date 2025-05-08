import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface WorkoutMessageBubbleProps {
  id: string;
  title: string;
  date: string; 
  duration: string;
  exercises: number;
  completedExercises: number;
  volume?: number;
  personalRecords?: number;
  isUserWorkout?: boolean;
  userName?: string;
  userAvatar?: string;
}

/**
 * A component that displays a workout in an iMessage-style bubble
 */
const WorkoutMessageBubble: React.FC<WorkoutMessageBubbleProps> = ({
  id,
  title,
  date,
  duration,
  exercises,
  completedExercises,
  volume,
  personalRecords = 0,
  isUserWorkout = true,
  userName,
  userAvatar,
}) => {
  const router = useRouter();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}` as any);
  };
  
  // Format volume to be more readable
  const formatVolume = (vol?: number) => {
    if (!vol) return '0';
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}k`;
    }
    return vol.toString();
  };
  
  return (
    <View style={[
      styles.container,
      isUserWorkout ? styles.userMessageContainer : styles.otherMessageContainer
    ]}>
      {/* Avatar for messages from other users */}
      {!isUserWorkout && userAvatar && (
        <Image 
          source={{ uri: userAvatar }} 
          style={styles.avatar} 
        />
      )}
      
      <View style={styles.bubbleWrapper}>
        {/* Username for messages from other users */}
        {!isUserWorkout && userName && (
          <Text style={styles.userName}>{userName}</Text>
        )}
        
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={[
            styles.bubbleContainer,
            isUserWorkout ? styles.userBubble : styles.otherBubble
          ]}
        >
          <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
            {/* Workout header info */}
            <View style={styles.bubbleHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.date}>{date}</Text>
              </View>
              
              {personalRecords > 0 && (
                <View style={styles.prBadge}>
                  <Text style={styles.prText}>
                    {personalRecords} PR{personalRecords > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Workout stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#CCCCCC" />
                <Text style={styles.statText}>{duration}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={16} color="#CCCCCC" />
                <Text style={styles.statText}>{`${completedExercises}/${exercises}`}</Text>
              </View>
              
              {volume !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons name="trending-up-outline" size={16} color="#CCCCCC" />
                  <Text style={styles.statText}>{formatVolume(volume)}</Text>
                </View>
              )}
            </View>
          </BlurView>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 6,
  },
  bubbleWrapper: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    marginLeft: 12,
  },
  bubbleContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
  },
  userBubble: {
    borderColor: 'rgba(10, 132, 255, 0.3)',
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
  },
  otherBubble: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(58, 58, 60, 0.6)',
  },
  blurContainer: {
    padding: 12,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  prBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  prText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    padding: 8,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default WorkoutMessageBubble; 