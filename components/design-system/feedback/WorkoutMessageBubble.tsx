/**
 * Elite Locker Design System - WorkoutMessageBubble Component
 * 
 * A component for displaying workout information in a message bubble format.
 */

import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// WorkoutMessageBubble props
export interface WorkoutMessageBubbleProps {
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
  style?: ViewStyle;
  onPress?: (id: string) => void;
}

/**
 * WorkoutMessageBubble component
 * 
 * A component for displaying workout information in a message bubble format.
 * 
 * @example
 * ```tsx
 * <WorkoutMessageBubble 
 *   id="1"
 *   title="Upper Body Workout"
 *   date="Today"
 *   duration="45:00"
 *   exercises={8}
 *   completedExercises={8}
 *   personalRecords={2}
 * />
 * ```
 */
export const WorkoutMessageBubble: React.FC<WorkoutMessageBubbleProps> = ({
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
  style,
  onPress,
}) => {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  
  // Handle press
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress(id);
    } else {
      router.push(`/workout/detail/${id}` as any);
    }
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
      isUserWorkout ? styles.userMessageContainer : styles.otherMessageContainer,
      style,
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
          <Text 
            variant="bodySmall" 
            color="secondary" 
            style={styles.userName}
          >
            {userName}
          </Text>
        )}
        
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={[
            styles.bubbleContainer,
            isUserWorkout ? {
              borderColor: colors.palette.blue500 + '4D', // 30% opacity
              backgroundColor: colors.palette.blue500 + '26', // 15% opacity
            } : {
              borderColor: colors.palette.gray900 + '4D', // 30% opacity
              backgroundColor: colors.palette.gray900 + '99', // 60% opacity
            },
          ]}
        >
          <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
            {/* Workout header info */}
            <View style={styles.bubbleHeader}>
              <View style={styles.titleContainer}>
                <Text variant="bodySemiBold" color="primary">
                  {title}
                </Text>
                <Text variant="bodySmall" color="secondary">
                  {date}
                </Text>
              </View>
              
              {personalRecords > 0 && (
                <View style={[
                  styles.prBadge,
                  { backgroundColor: colors.palette.orange500 }
                ]}>
                  <Text variant="labelSmall" color="inverse" style={styles.prText}>
                    {personalRecords} PR{personalRecords > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Workout stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons 
                  name="time-outline" 
                  size={16} 
                  color={colors.light.icon.secondary} 
                />
                <Text variant="bodySmall" color="secondary" style={styles.statText}>
                  {duration}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons 
                  name="barbell-outline" 
                  size={16} 
                  color={colors.light.icon.secondary} 
                />
                <Text variant="bodySmall" color="secondary" style={styles.statText}>
                  {`${completedExercises}/${exercises}`}
                </Text>
              </View>
              
              {volume !== undefined && (
                <View style={styles.statItem}>
                  <Ionicons 
                    name="trending-up-outline" 
                    size={16} 
                    color={colors.light.icon.secondary} 
                  />
                  <Text variant="bodySmall" color="secondary" style={styles.statText}>
                    {formatVolume(volume)}
                  </Text>
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
    marginBottom: 4,
    marginLeft: 12,
  },
  bubbleContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
  },
  blurContainer: {
    padding: 12,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  prBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prText: {
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  statText: {
    marginLeft: 4,
  },
});

export default WorkoutMessageBubble;
