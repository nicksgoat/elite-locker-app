import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');

interface WorkoutStats {
  calories?: number;
  volume?: number; // in lbs
  duration?: number; // in seconds
  personalRecords?: number;
}

interface WorkoutPostCardProps {
  id: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
  club?: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
  workout: {
    id: string;
    title: string;
    duration?: number;
    total_volume?: number;
    personal_records?: number;
    category?: string;
    calories_burned?: number;
  };
  content?: string;
  image_urls?: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  location?: string;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onMoreOptions?: () => void;
  onUserPress?: (userId: string) => void;
  onClubPress?: (clubId: string) => void;
  onWorkoutPress?: (workoutId: string) => void;
}

const WorkoutPostCard: React.FC<WorkoutPostCardProps> = ({
  id,
  author,
  club,
  workout,
  content,
  image_urls,
  like_count,
  comment_count,
  created_at,
  location,
  onPress,
  onLike,
  onComment,
  onShare,
  onMoreOptions,
  onUserPress,
  onClubPress,
  onWorkoutPress
}) => {
  // State for swipe functionality
  const [showWorkoutCard, setShowWorkoutCard] = useState(true);
  const workoutCardTranslateX = new Animated.Value(0);

  // Function to bring workout card back when photo is tapped
  const handlePhotoTap = () => {
    if (!showWorkoutCard) {
      setShowWorkoutCard(true);
      Animated.spring(workoutCardTranslateX, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  // Format duration from seconds to MM:SS or HH:MM:SS
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format volume to display with commas
  const formatVolume = (volume?: number): string => {
    if (!volume) return '0';
    return volume.toLocaleString();
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Get workout icon based on category
  const getWorkoutIcon = (): string => {
    const category = workout.category?.toLowerCase() || '';
    if (category.includes('strength') || category.includes('weight')) return 'barbell';
    if (category.includes('cardio') || category.includes('running')) return 'heart';
    if (category.includes('yoga') || category.includes('stretch')) return 'leaf';
    if (category.includes('hiit') || category.includes('circuit')) return 'flash';
    return 'fitness';
  };

  // Get workout icon color
  const getWorkoutIconColor = (): string => {
    const category = workout.category?.toLowerCase() || '';
    if (category.includes('strength') || category.includes('weight')) return '#FF6B35';
    if (category.includes('cardio') || category.includes('running')) return '#FF3B30';
    if (category.includes('yoga') || category.includes('stretch')) return '#32D74B';
    if (category.includes('hiit') || category.includes('circuit')) return '#FF9F0A';
    return '#0A84FF';
  };

  const hasMedia = image_urls && image_urls.length > 0;

  // Gesture handler for swipe - no visual tracking, just detect swipe
  const onGestureEvent = () => {
    // Do nothing during gesture - we only care about the end state
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX: translation, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.1; // 10% of screen width - lower threshold for easier triggering

      if (Math.abs(translation) > threshold || Math.abs(velocityX) > 200) {
        // Swipe detected - immediately animate card off screen
        if (showWorkoutCard) {
          setShowWorkoutCard(false);
          // Animate completely off screen in the direction of the swipe
          const targetPosition = translation > 0 ? screenWidth + 50 : -screenWidth - 50;

          Animated.timing(workoutCardTranslateX, {
            toValue: targetPosition,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      }
      // No snap back - if swipe doesn't meet threshold, nothing happens
    }
  };

  return (
    <View style={styles.container}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <TouchableOpacity
          onPress={() => onUserPress?.(author?.id || '')}
          style={styles.userSection}
        >
          <Image
            source={{
              uri: author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.username || 'User')}&background=1C1C1E&color=FFFFFF`
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{author?.full_name || author?.username || 'Unknown User'}</Text>
              {club && (
                <TouchableOpacity
                  style={styles.clubTag}
                  onPress={() => onClubPress?.(club.id)}
                >
                  <Text style={styles.clubTagText}>{club.name}</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.finishedRow}>
              <Text style={styles.finishedText}>finished </Text>
              <TouchableOpacity onPress={() => onWorkoutPress?.(workout?.id || '')}>
                <Text style={styles.workoutNameLink}>{workout?.title || 'Workout'}</Text>
              </TouchableOpacity>
              <Ionicons name="chevron-forward" size={14} color="#0A84FF" style={styles.chevron} />
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onMoreOptions} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Content with optional media background */}
      {hasMedia ? (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          enabled={hasMedia}
        >
          <Animated.View style={styles.contentContainer}>
            <TouchableOpacity
              style={styles.contentTouchable}
              onPress={showWorkoutCard ? onPress : handlePhotoTap}
              activeOpacity={0.95}
            >
              <Image
                source={{ uri: image_urls![0] }}
                style={styles.backgroundImage}
                resizeMode="cover"
              />

              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                style={styles.mediaOverlay}
              />

              {/* Optional content text with iMessage bubble */}
              {content && (
                <View style={[styles.contentTextContainer, styles.contentTextOverlay]}>
                  <View style={styles.speechBubbleContainer}>
                    <View style={styles.messageBubble}>
                      <Text style={[styles.contentText, styles.contentTextOnMedia]}>
                        {content}
                      </Text>
                    </View>
                    <View style={styles.bubbleTail} />
                  </View>
                </View>
              )}

              {/* Swipe indicator */}
              <View style={styles.swipeIndicator}>
                <View style={styles.swipeIndicatorDots}>
                  <View style={[styles.swipeIndicatorDot, showWorkoutCard && styles.swipeIndicatorDotActive]} />
                  <View style={[styles.swipeIndicatorDot, !showWorkoutCard && styles.swipeIndicatorDotActive]} />
                </View>
                <Text style={styles.swipeIndicatorText}>
                  {showWorkoutCard ? 'Swipe to view photo' : 'Swipe to view workout'}
                </Text>
              </View>

              {/* Animated Workout Card */}
              <Animated.View
                style={[
                  styles.workoutCard,
                  styles.workoutCardOverlay,
                  { transform: [{ translateX: workoutCardTranslateX }] }
                ]}
                pointerEvents={showWorkoutCard ? 'auto' : 'none'}
              >
                <BlurView
                  intensity={80}
                  tint="dark"
                  style={styles.workoutCardBlur}
                >
                  {/* Two-tone Workout Card Content */}
                  <View style={styles.workoutCardContent}>
                    {/* Lighter top section for title */}
                    <View style={styles.workoutHeaderSection}>
                      <View style={styles.workoutHeader}>
                        <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]}>
                          <Ionicons name={getWorkoutIcon() as any} size={18} color="#FFFFFF" />
                        </View>
                        <TouchableOpacity
                          onPress={() => onWorkoutPress?.(workout.id)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.workoutTitle} numberOfLines={1}>
                            {workout?.title || 'Workout'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Darker bottom section for stats */}
                    <View style={styles.workoutStatsSection}>
                      <View style={styles.workoutStatsRow}>
                        {/* Calories */}
                        <View style={styles.statItem}>
                          <Ionicons name="flame" size={12} color="#FF6B35" />
                          <Text style={styles.statText}>
                            {workout?.calories_burned || Math.floor(Math.random() * 200 + 100)} cal
                          </Text>
                        </View>

                        {/* Volume */}
                        {workout?.total_volume && (
                          <View style={styles.statItem}>
                            <Ionicons name="barbell" size={12} color="#FF9F0A" />
                            <Text style={styles.statText}>{formatVolume(workout.total_volume)} lb</Text>
                          </View>
                        )}

                        {/* Duration */}
                        {workout?.duration && (
                          <View style={styles.statItem}>
                            <Ionicons name="time" size={12} color="#32D74B" />
                            <Text style={styles.statText}>{formatDuration(workout.duration)}</Text>
                          </View>
                        )}

                        {/* PR Badge */}
                        {workout?.personal_records && workout.personal_records > 0 && (
                          <View style={styles.prBadgeContainer}>
                            <View style={styles.prBadge}>
                              <Text style={styles.prText}>PR</Text>
                            </View>
                            <Text style={styles.prNumber}>{workout.personal_records}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </BlurView>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      ) : (
        <TouchableOpacity
          style={styles.contentContainer}
          onPress={onPress}
          activeOpacity={0.95}
        >
          {/* Optional content text with iMessage bubble */}
          {content && (
            <View style={styles.contentTextContainer}>
              <View style={styles.speechBubbleContainer}>
                <View style={styles.messageBubble}>
                  <Text style={styles.contentText}>
                    {content}
                  </Text>
                </View>
                <View style={styles.bubbleTail} />
              </View>
            </View>
          )}

          {/* Workout Card */}
          <View style={styles.workoutCard}>
            <BlurView
              intensity={0}
              tint="dark"
              style={styles.workoutCardBlur}
            >
              {/* Two-tone Workout Card Content */}
              <View style={styles.workoutCardContent}>
                {/* Lighter top section for title */}
                <View style={styles.workoutHeaderSection}>
                  <View style={styles.workoutHeader}>
                    <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]}>
                      <Ionicons name={getWorkoutIcon() as any} size={18} color="#FFFFFF" />
                    </View>
                    <TouchableOpacity
                      onPress={() => onWorkoutPress?.(workout.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.workoutTitle} numberOfLines={1}>
                        {workout?.title || 'Workout'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Darker bottom section for stats */}
                <View style={styles.workoutStatsSection}>
                  <View style={styles.workoutStatsRow}>
                    {/* Calories */}
                    <View style={styles.statItem}>
                      <Ionicons name="flame" size={12} color="#FF6B35" />
                      <Text style={styles.statText}>
                        {workout?.calories_burned || Math.floor(Math.random() * 200 + 100)} cal
                      </Text>
                    </View>

                    {/* Volume */}
                    {workout?.total_volume && (
                      <View style={styles.statItem}>
                        <Ionicons name="barbell" size={12} color="#FF9F0A" />
                        <Text style={styles.statText}>{formatVolume(workout.total_volume)} lb</Text>
                      </View>
                    )}

                    {/* Duration */}
                    {workout?.duration && (
                      <View style={styles.statItem}>
                        <Ionicons name="time" size={12} color="#32D74B" />
                        <Text style={styles.statText}>{formatDuration(workout.duration)}</Text>
                      </View>
                    )}

                    {/* PR Badge */}
                    {workout?.personal_records && workout.personal_records > 0 && (
                      <View style={styles.prBadgeContainer}>
                        <View style={styles.prBadge}>
                          <Text style={styles.prText}>PR</Text>
                        </View>
                        <Text style={styles.prNumber}>{workout.personal_records}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </TouchableOpacity>
      )}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons name="heart-outline" size={22} color="#8E8E93" />
          <Text style={styles.actionText}>{like_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color="#8E8E93" />
          <Text style={styles.actionText}>{comment_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-social-outline" size={20} color="#8E8E93" />
        </TouchableOpacity>

        <View style={styles.timeLocation}>
          <Text style={styles.timeText}>{formatTimeAgo(created_at)}</Text>
          {location && (
            <>
              <Text style={styles.separator}> • </Text>
              <Text style={styles.locationText}>{location}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  clubTag: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  clubTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A84FF',
  },
  finishedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  finishedText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  workoutNameLink: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 2,
  },
  moreButton: {
    padding: 8,
  },
  contentContainer: {
    position: 'relative',
    minHeight: 200,
  },
  contentTouchable: {
    flex: 1,
    minHeight: 200,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentTextContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: 'flex-start',
  },
  contentTextOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 2,
    alignItems: 'flex-start',
  },
  speechBubbleContainer: {
    position: 'relative',
    maxWidth: '75%',
  },
  messageBubble: {
    backgroundColor: '#2C2C2E',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
  },
  bubbleTail: {
    position: 'absolute',
    left: -6,
    top: 8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: '#2C2C2E',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  contentText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  contentTextOnMedia: {
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  workoutCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  workoutCardOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'transparent',
  },
  workoutCardBlur: {
    padding: 0,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
  },
  workoutCardContent: {
    flex: 1,
  },
  workoutHeaderSection: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  workoutStatsSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  workoutStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  prBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  prBadge: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  prText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  prNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Deprecated styles - keeping for compatibility but not used in new layout
  compactWorkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutIconCompact: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  workoutTitleCompact: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 12,
    minWidth: 80,
  },
  compactStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  compactStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  compactStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  compactPRBadge: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 12,
  },
  compactPRText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  prIcon: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  prIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '600',
  },
  timeLocation: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  separator: {
    fontSize: 12,
    color: '#8E8E93',
  },
  locationText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  swipeIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 3,
  },
  swipeIndicatorDots: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  swipeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 2,
  },
  swipeIndicatorDotActive: {
    backgroundColor: '#FFFFFF',
  },
  swipeIndicatorText: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontWeight: '500',
  },
});

export default WorkoutPostCard;