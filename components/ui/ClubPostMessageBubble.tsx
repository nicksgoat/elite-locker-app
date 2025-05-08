import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface ClubPostMessageBubbleProps {
  id: string;
  clubId: string;
  clubName: string;
  userName: string;
  userAvatar?: string;
  date: string;
  content: string;
  attachedWorkout?: {
    id?: string;
    title: string;
    exercises: number;
    duration: string;
    thumbnailUrl?: string;
    sets?: number;
  };
  likes: number;
  comments: number;
  mediaUrl?: string;
}

/**
 * A component that displays a club post in an iMessage-style bubble
 */
const ClubPostMessageBubble: React.FC<ClubPostMessageBubbleProps> = ({
  id,
  clubId,
  clubName,
  userName,
  userAvatar,
  date,
  content,
  attachedWorkout,
  likes,
  comments,
  mediaUrl,
}) => {
  const router = useRouter();
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${clubId}/post/${id}` as any);
  };
  
  const handleClubPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${clubId}` as any);
  };
  
  const handleWorkoutPress = () => {
    if (!attachedWorkout?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${attachedWorkout.id}` as any);
  };
  
  return (
    <View style={styles.container}>
      {/* User avatar */}
      {userAvatar ? (
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>{userName.charAt(0)}</Text>
        </View>
      )}
      
      <View style={styles.bubbleWrapper}>
        {/* User and club name */}
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.separator}>•</Text>
          <TouchableOpacity onPress={handleClubPress}>
            <Text style={styles.clubName}>{clubName}</Text>
          </TouchableOpacity>
          <Text style={styles.date}>{date}</Text>
        </View>
        
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={styles.bubbleContainer}
        >
          <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
            {/* Post content */}
            <Text style={styles.content}>{content}</Text>
            
            {/* Post media if available */}
            {mediaUrl && (
              <ExpoImage 
                source={{ uri: mediaUrl }} 
                style={styles.mediaImage} 
                contentFit="cover" 
              />
            )}
            
            {/* Attached workout if available */}
            {attachedWorkout && (
              <TouchableOpacity
                style={styles.attachedWorkoutContainer}
                onPress={handleWorkoutPress}
                activeOpacity={0.8}
              >
                <BlurView intensity={20} tint="dark" style={styles.workoutCardBlur}>
                  <View style={styles.workoutImageContainer}>
                    <ExpoImage
                      source={{ uri: attachedWorkout.thumbnailUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd' }}
                      style={styles.workoutImage}
                      contentFit="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={styles.workoutGradient}
                    />
                    <View style={styles.workoutBadgesContainer}>
                      {attachedWorkout.sets && (
                        <View style={styles.statBadge}><Text style={styles.statBadgeText}>{attachedWorkout.sets} sets</Text></View>
                      )}
                      {attachedWorkout.duration && (
                        <View style={styles.statBadge}><Text style={styles.statBadgeText}>{attachedWorkout.duration}</Text></View>
                      )}
                      {attachedWorkout.exercises && (
                        <View style={styles.statBadge}><Text style={styles.statBadgeText}>{attachedWorkout.exercises} exercises</Text></View>
                      )}
                    </View>
                  </View>
                  <View style={styles.workoutTitleContainer}>
                    <Text style={styles.workoutTitle} numberOfLines={1}>{attachedWorkout.title}</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            )}
            
            {/* Post engagement stats */}
            <View style={styles.engagementContainer}>
              <View style={styles.engagementItem}>
                <Ionicons name="heart-outline" size={16} color="#8E8E93" />
                <Text style={styles.engagementText}>{likes}</Text>
              </View>
              <View style={styles.engagementItem}>
                <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
                <Text style={styles.engagementText}>{comments}</Text>
              </View>
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
    maxWidth: '92%',
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bubbleWrapper: {
    flex: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  clubName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A84FF',
    marginRight: 4,
  },
  separator: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 4,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  bubbleContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(58, 58, 60, 0.6)',
  },
  blurContainer: {
    padding: 12,
  },
  content: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 12,
  },
  mediaImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  attachedWorkoutContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutCardBlur: {
  },
  workoutImageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
    backgroundColor: '#222',
  },
  workoutImage: {
    width: '100%',
    height: '100%',
  },
  workoutGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  workoutBadgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  statBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  workoutTitleContainer: {
    padding: 10,
  },
  workoutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  engagementContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  engagementText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
});

export default ClubPostMessageBubble; 