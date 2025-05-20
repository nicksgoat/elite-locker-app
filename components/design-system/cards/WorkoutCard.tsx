/**
 * Elite Locker Design System - WorkoutCard Component
 * 
 * A unified card component for displaying workout information.
 * This component consolidates the functionality of multiple workout card components.
 */

import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';

import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// Workout data interface
export interface WorkoutCardData {
  id: string;
  title: string;
  description?: string;
  duration?: number; // in seconds
  exercises?: number;
  sets?: number;
  thumbnailUrl?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  personalRecords?: number;
  likes?: number;
  comments?: number;
  isCompleted?: boolean;
  completedDate?: Date;
  createdBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

// Card variants
export type WorkoutCardVariant = 
  | 'default'    // Standard card with image
  | 'compact'    // Smaller card for lists
  | 'feed'       // Card for social feed
  | 'minimal'    // Text-only card
  | 'program';   // Card for program workouts

// Props
export interface WorkoutCardProps {
  workout: WorkoutCardData;
  variant?: WorkoutCardVariant;
  onPress?: (workout: WorkoutCardData) => void;
  onMoreOptions?: (workout: WorkoutCardData) => void;
  showHeader?: boolean;
  userName?: string;
  userAvatarUrl?: string;
  timestamp?: string;
  location?: string;
}

/**
 * WorkoutCard component
 *
 * A unified card component for displaying workout information.
 *
 * @example
 * ```tsx
 * <WorkoutCard
 *   workout={workoutData}
 *   onPress={(workout) => console.log(`Workout ${workout.id} pressed`)}
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
  
  // Safely access workout properties with fallbacks
  const {
    id = '',
    title = 'Untitled Workout',
    description = '',
    duration = 0,
    exercises = 0,
    sets = 0,
    thumbnailUrl = '',
    category = '',
    level = 'beginner',
    personalRecords = 0,
    likes = 0,
    comments = 0,
    isCompleted = false,
    completedDate,
    createdBy,
  } = workout || {};
  
  // Handle card press
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(workout);
    }
  };
  
  // Handle more options press
  const handleMoreOptions = () => {
    if (onMoreOptions) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMoreOptions(workout);
    }
  };
  
  // Format duration (e.g., "45 min")
  const formatDuration = (seconds: number): string => {
    if (!seconds) return '';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m` 
        : `${hours}h`;
    }
  };
  
  // Get workout icon color based on category
  const getWorkoutIconColor = (): string => {
    switch (category?.toLowerCase()) {
      case 'strength':
        return '#0A84FF';
      case 'cardio':
        return '#30D158';
      case 'hiit':
        return '#FF9F0A';
      case 'yoga':
        return '#BF5AF2';
      case 'mobility':
        return '#64D2FF';
      default:
        return '#0A84FF';
    }
  };
  
  // Get workout icon based on category
  const getWorkoutIcon = (): string => {
    switch (category?.toLowerCase()) {
      case 'strength':
        return 'barbell-outline';
      case 'cardio':
        return 'heart-outline';
      case 'hiit':
        return 'timer-outline';
      case 'yoga':
        return 'body-outline';
      case 'mobility':
        return 'fitness-outline';
      default:
        return 'barbell-outline';
    }
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
          <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]}>
            <Ionicons name={getWorkoutIcon() as any} size={14} color="#FFFFFF" />
          </View>
          <View style={styles.compactCardDetails}>
            <Text variant="bodySemiBold" color="inverse" numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.compactCardMeta}>
              {duration ? (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={colors.icon.secondary} />
                  <Text variant="bodySmall" color="secondary" style={styles.metaText}>
                    {formatDuration(duration)}
                  </Text>
                </View>
              ) : null}
              {exercises ? (
                <View style={styles.metaItem}>
                  <Ionicons name="list-outline" size={14} color={colors.icon.secondary} />
                  <Text variant="bodySmall" color="secondary" style={styles.metaText}>
                    {exercises} exercises
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
      </Card>
    );
  }
  
  // Render feed variant
  if (variant === 'feed') {
    return (
      <View style={styles.feedCardContainer}>
        {/* User header if showHeader is true */}
        {showHeader && (
          <View style={styles.userHeader}>
            {userAvatarUrl ? (
              <Image
                source={{ uri: userAvatarUrl }}
                style={styles.userAvatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text variant="bodySmall" color="inverse">
                  {userName?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text variant="bodySemiBold" color="inverse">
                {userName || 'Anonymous'}
              </Text>
              {timestamp && (
                <Text variant="bodySmall" color="secondary">
                  {timestamp}
                </Text>
              )}
            </View>
            <TouchableOpacity style={styles.moreButton} onPress={handleMoreOptions}>
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
            <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]}>
              <Ionicons name={getWorkoutIcon() as any} size={14} color="#FFFFFF" />
            </View>
            <Text variant="bodySemiBold" color="inverse" style={styles.feedCardTitle}>
              {title}
            </Text>

            {personalRecords > 0 && (
              <View style={styles.prBadge}>
                <Text variant="labelSmall" color="inverse" style={styles.prText}>
                  {personalRecords} PR
                </Text>
              </View>
            )}
          </View>

          {/* Timestamp if available */}
          {timestamp && !showHeader && (
            <Text variant="bodySmall" color="secondary" style={styles.timestamp}>
              {timestamp}
            </Text>
          )}

          {/* Workout stats */}
          <View style={styles.feedCardStats}>
            {duration > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color={colors.icon.secondary} />
                <Text variant="bodySmall" color="secondary">
                  {formatDuration(duration)}
                </Text>
              </View>
            )}
            
            {exercises > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="list-outline" size={16} color={colors.icon.secondary} />
                <Text variant="bodySmall" color="secondary">
                  {exercises} exercises
                </Text>
              </View>
            )}
            
            {sets > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="repeat-outline" size={16} color={colors.icon.secondary} />
                <Text variant="bodySmall" color="secondary">
                  {sets} sets
                </Text>
              </View>
            )}
          </View>

          {/* Social interaction buttons */}
          <View style={styles.feedCardActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={20} color={colors.icon.secondary} />
              {likes > 0 && (
                <Text variant="bodySmall" color="secondary" style={styles.actionCount}>
                  {likes}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.icon.secondary} />
              {comments > 0 && (
                <Text variant="bodySmall" color="secondary" style={styles.actionCount}>
                  {comments}
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color={colors.icon.secondary} />
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    );
  }
  
  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        style={styles.minimalCard}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]}>
          <Ionicons name={getWorkoutIcon() as any} size={14} color="#FFFFFF" />
        </View>
        <View style={styles.minimalCardContent}>
          <Text variant="bodySemiBold" color="inverse" numberOfLines={1}>
            {title}
          </Text>
          {duration > 0 && (
            <Text variant="bodySmall" color="secondary">
              {formatDuration(duration)}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.icon.secondary} />
      </TouchableOpacity>
    );
  }
  
  // Render program variant
  if (variant === 'program') {
    return (
      <Card
        variant="blur"
        blurIntensity={15}
        blurTint="dark"
        style={styles.programCard}
        onPress={handlePress}
      >
        <View style={styles.programCardContent}>
          <View style={styles.programCardHeader}>
            <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]}>
              <Ionicons name={getWorkoutIcon() as any} size={14} color="#FFFFFF" />
            </View>
            <Text variant="bodySemiBold" color="inverse" numberOfLines={1}>
              {title}
            </Text>
          </View>
          
          {description ? (
            <Text variant="bodySmall" color="secondary" numberOfLines={2} style={styles.programDescription}>
              {description}
            </Text>
          ) : null}
          
          <View style={styles.programCardFooter}>
            {duration > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.icon.secondary} />
                <Text variant="bodySmall" color="secondary" style={styles.metaText}>
                  {formatDuration(duration)}
                </Text>
              </View>
            )}
            
            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            ) : (
              <TouchableOpacity style={styles.startButton} onPress={handlePress}>
                <Text variant="labelSmall" color="inverse">
                  Start
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
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
          source={{ uri: thumbnailUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3' }}
          style={styles.cardImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />

        {/* Duration badge */}
        {duration > 0 && (
          <View style={styles.durationBadge}>
            <Text variant="labelSmall" color="inverse">
              {formatDuration(duration)}
            </Text>
          </View>
        )}
      </View>

      {/* Card content */}
      <View style={styles.cardContent}>
        {/* Title and category */}
        <View style={styles.cardHeader}>
          <Text variant="bodySemiBold" color="inverse" style={styles.cardTitle}>
            {title}
          </Text>
          {category && (
            <View style={[styles.categoryBadge, { backgroundColor: getWorkoutIconColor() }]}>
              <Text variant="labelSmall" color="inverse">
                {category}
              </Text>
            </View>
          )}
        </View>

        {/* Workout stats */}
        <View style={styles.cardStats}>
          {exercises > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="list-outline" size={16} color={colors.icon.secondary} />
              <Text variant="bodySmall" color="secondary">
                {exercises} exercises
              </Text>
            </View>
          )}
          
          {sets > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="repeat-outline" size={16} color={colors.icon.secondary} />
              <Text variant="bodySmall" color="secondary">
                {sets} sets
              </Text>
            </View>
          )}
          
          {level && (
            <View style={styles.statItem}>
              <Ionicons name="fitness-outline" size={16} color={colors.icon.secondary} />
              <Text variant="bodySmall" color="secondary" style={{ textTransform: 'capitalize' }}>
                {level}
              </Text>
            </View>
          )}
        </View>

        {/* Creator info if available */}
        {createdBy?.name && (
          <View style={styles.creatorInfo}>
            {createdBy.avatarUrl ? (
              <Image
                source={{ uri: createdBy.avatarUrl }}
                style={styles.creatorAvatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.creatorAvatarPlaceholder}>
                <Text variant="bodySmall" color="inverse">
                  {createdBy.name.charAt(0)}
                </Text>
              </View>
            )}
            <Text variant="bodySmall" color="secondary">
              By {createdBy.name}
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
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImageContainer: {
    height: 160,
    width: '100%',
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
    height: 80,
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  creatorAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  
  // Compact card styles
  compactCard: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 12,
  },
  compactCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  compactCardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  compactCardMeta: {
    flexDirection: 'row',
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
  completedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#30D158',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Feed card styles
  feedCardContainer: {
    marginBottom: 16,
    width: '100%',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  moreButton: {
    padding: 8,
  },
  feedCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
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
    backgroundColor: '#FF9F0A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prText: {
    fontSize: 10,
  },
  timestamp: {
    marginBottom: 12,
  },
  feedCardStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  feedCardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionCount: {
    marginLeft: 4,
  },
  
  // Minimal card styles
  minimalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
  },
  minimalCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  
  // Program card styles
  programCard: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 12,
  },
  programCardContent: {
    padding: 12,
  },
  programCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  programDescription: {
    marginBottom: 12,
  },
  programCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  
  // Shared styles
  workoutIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WorkoutCard;
