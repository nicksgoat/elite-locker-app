/**
 * Elite Locker Design System - WorkoutCard Component
 *
 * A card component for displaying workout information.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// Workout data interface
export interface WorkoutCardData {
  id: string;
  title: string;
  duration?: number; // in seconds
  exerciseCount?: number;
  thumbnailUrl?: string;
  personalRecords?: number;
  caloriesBurned?: number;
  totalVolume?: number;
  date?: string;
  isCompleted?: boolean;
}

// WorkoutCard props
export interface WorkoutCardProps {
  workout: WorkoutCardData;
  variant?: 'default' | 'compact' | 'feed';
  onPress?: (workoutId: string) => void;
  onMoreOptions?: (workoutId: string) => void;
  showHeader?: boolean;
  userName?: string;
  userAvatarUrl?: string;
  timestamp?: string;
  location?: string;
}

/**
 * WorkoutCard component
 *
 * A card component for displaying workout information.
 *
 * @example
 * ```tsx
 * <WorkoutCard
 *   workout={workoutData}
 *   onPress={(id) => console.log(`Workout ${id} pressed`)}
 * />
 * ```
 */
export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  variant = 'default',
  onPress,
  onMoreOptions,
  showHeader = false,
  userName,
  userAvatarUrl,
  timestamp,
  location,
}) => {
  const { colors, spacing } = useTheme();
  const { width } = Dimensions.get('window');

  // Format duration (seconds to MM:SS or HH:MM:SS)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };

  // Handle card press
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(workout.id);
    }
  };

  // Handle more options press
  const handleMoreOptions = () => {
    if (onMoreOptions) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMoreOptions(workout.id);
    }
  };

  // Get workout icon color
  const getWorkoutIconColor = () => {
    if (workout.personalRecords && workout.personalRecords > 0) {
      return '#FF9500'; // Orange for PRs
    }
    if (workout.isCompleted) {
      return '#30D158'; // Green for completed
    }
    return '#0A84FF'; // Default blue
  };

  // Render compact variant
  if (variant === 'compact') {
    return (
      <Card
        variant="blur"
        blurIntensity={15}
        blurTint="dark"
        style={styles.compactCard}
        onPress={handlePress}
      >
        <View style={styles.compactCardContent}>
          <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]} />
          <View style={styles.compactCardDetails}>
            <Text variant="bodySemiBold" color="inverse" numberOfLines={1}>
              {workout.title}
            </Text>
            <View style={styles.compactCardMeta}>
              {workout.duration ? (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={colors.icon.secondary} />
                  <Text variant="bodySmall" color="secondary" style={styles.metaText}>
                    {formatDuration(workout.duration)}
                  </Text>
                </View>
              ) : null}

              {workout.exerciseCount ? (
                <View style={styles.metaItem}>
                  <Ionicons name="barbell-outline" size={14} color={colors.icon.secondary} />
                  <Text variant="bodySmall" color="secondary" style={styles.metaText}>
                    {workout.exerciseCount} exercises
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Card>
    );
  }

  // Render feed variant
  if (variant === 'feed') {
    return (
      <View style={styles.feedContainer}>
        {/* User header section - only show if avatar available */}
        {showHeader && userAvatarUrl && (
          <View style={styles.userHeader}>
            <Image
              source={{ uri: userAvatarUrl }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text variant="bodySemiBold" color="inverse">
                {userName || 'User'}
              </Text>
              <Text variant="bodySmall" color="secondary">
                finished <Text style={styles.workoutNameLink}>{workout.title}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={handleMoreOptions} style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.icon.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Dark themed workout card */}
        <Card
          variant="default"
          style={styles.feedCard}
          onPress={handlePress}
        >
          {/* Card header with workout name and PR badge */}
          <View style={styles.feedCardHeader}>
            <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]} />
            <Text variant="bodySemiBold" color="inverse" style={styles.feedCardTitle}>
              {workout.title}
            </Text>

            {workout.personalRecords && workout.personalRecords > 0 && (
              <View style={styles.prBadge}>
                <Text variant="labelSmall" color="inverse" style={styles.prText}>
                  {workout.personalRecords} PR
                </Text>
              </View>
            )}
          </View>

          {/* Timestamp if available */}
          {timestamp && (
            <Text variant="bodySmall" color="secondary" style={styles.timestamp}>
              {timestamp}
            </Text>
          )}

          {/* Stats row */}
          <View style={styles.statsRow}>
            {workout.totalVolume ? (
              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={16} color={colors.icon.secondary} />
                <Text variant="bodySmall" color="secondary">
                  {workout.totalVolume.toLocaleString()} lb
                </Text>
              </View>
            ) : null}

            {workout.duration ? (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color={colors.icon.secondary} />
                <Text variant="bodySmall" color="secondary">
                  {formatDuration(workout.duration)}
                </Text>
              </View>
            ) : null}

            {workout.caloriesBurned ? (
              <View style={styles.statItem}>
                <Ionicons name="flame-outline" size={16} color={colors.icon.secondary} />
                <Text variant="bodySmall" color="secondary">
                  {workout.caloriesBurned} cal
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
      </View>
    );
  }

  // Render default variant
  return (
    <Card
      variant="blur"
      blurIntensity={20}
      blurTint="dark"
      style={styles.card}
      onPress={handlePress}
    >
      {/* Image with overlay */}
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: workout.thumbnailUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd' }}
          style={styles.cardImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />

        {/* Duration badge */}
        {workout.duration ? (
          <View style={styles.durationBadge}>
            <Text variant="labelSmall" color="inverse">
              {formatDuration(workout.duration)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Card content */}
      <View style={styles.cardContent}>
        <Text variant="bodySemiBold" color="inverse" numberOfLines={1}>
          {workout.title}
        </Text>

        {/* Exercise count */}
        {workout.exerciseCount ? (
          <View style={styles.exerciseCount}>
            <Ionicons name="barbell-outline" size={14} color={colors.icon.secondary} />
            <Text variant="bodySmall" color="secondary" style={styles.exerciseCountText}>
              {workout.exerciseCount} exercises
            </Text>
          </View>
        ) : null}

        {/* PR badge */}
        {workout.personalRecords && workout.personalRecords > 0 && (
          <View style={styles.cardPrBadge}>
            <Text variant="labelSmall" color="inverse" style={styles.cardPrText}>
              {workout.personalRecords} PR
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Default card styles
  card: {
    height: screenWidth >= 414 ? 200 : 180, // Taller cards on larger screens
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImageContainer: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  durationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: screenWidth >= 428 ? 20 : (screenWidth >= 414 ? 16 : 12),
  },
  exerciseCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  exerciseCountText: {
    marginLeft: 4,
  },
  cardPrBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardPrText: {
    color: '#FFFFFF',
  },

  // Compact card styles
  compactCard: {
    height: 70,
    marginBottom: 8,
  },
  compactCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  workoutIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  compactCardDetails: {
    flex: 1,
  },
  compactCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    marginLeft: 4,
  },

  // Feed card styles
  feedContainer: {
    marginBottom: 20,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: screenWidth >= 428 ? 24 : (screenWidth >= 414 ? 20 : 16),
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
  workoutNameLink: {
    color: '#63A1FF',
  },
  moreButton: {
    padding: 5,
  },
  feedCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    padding: screenWidth >= 428 ? 20 : (screenWidth >= 414 ? 16 : 12),
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  feedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedCardTitle: {
    flex: 1,
    marginLeft: 8,
  },
  prBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prText: {
    color: '#FFFFFF',
  },
  timestamp: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
});

export default WorkoutCard;
