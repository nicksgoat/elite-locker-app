import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Import clubService with error handling
let clubService: any;
try {
  clubService = require('../../services/clubService').clubService;
} catch (error) {
  console.error('Failed to import clubService:', error);
  // Fallback clubService
  clubService = {
    getClubPosts: async () => {
      console.log('Using fallback clubService.getClubPosts');
      return [];
    }
  };
}

const { width } = Dimensions.get('window');

// Define types for the mock data
interface User {
  name: string;
  avatar: string;
  verified?: boolean;
}

interface FeedContent {
  workout_name?: string;
  duration?: string;
  stats?: string[];
  completion?: number;
  date: string;
  title?: string;
  message?: string;
  type?: string;
  thumbnail?: string;
  description?: string;
}

interface FeedItem {
  id: string;
  type: 'workout_log' | 'announcement' | 'new_content';
  user: User;
  content: FeedContent;
  likes: number;
  comments: number;
}

// Enhanced mock data for a richer feed experience
const feedItems: FeedItem[] = [
  {
    id: 'f1',
    type: 'workout_log',
    user: {
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    content: {
      workout_name: 'Speed Ladder Drill',
      duration: '45 min',
      stats: ['12 exercises', '320 calories', '4 ladders'],
      completion: 100,
      date: '2023-05-12T09:30:00',
    },
    likes: 24,
    comments: 7,
  },
  {
    id: 'f2',
    type: 'announcement',
    user: {
      name: 'Coach Devon Allen',
      avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
      verified: true,
    },
    content: {
      title: 'New Summer Program',
      message: 'Excited to announce our summer speed camp starting next month! Early registration opens this Friday. Limited spots available!',
      date: '2023-05-10T15:45:00',
    },
    likes: 42,
    comments: 15,
  },
  {
    id: 'f3',
    type: 'new_content',
    user: {
      name: 'Coach Devon Allen',
      avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
      verified: true,
    },
    content: {
      title: 'Explosive First Step',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      duration: '8:45',
      description: 'Learn the fundamentals of developing an explosive first step to improve your acceleration.',
      date: '2023-05-09T11:20:00',
    },
    likes: 38,
    comments: 11,
  },
  {
    id: 'f4',
    type: 'workout_log',
    user: {
      name: 'Jason Miller',
      avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2',
    },
    content: {
      workout_name: 'Agility Circuit Pro',
      duration: '55 min',
      stats: ['8 exercises', '450 calories', '4 rounds'],
      completion: 85,
      date: '2023-05-08T17:15:00',
    },
    likes: 19,
    comments: 5,
  },
  {
    id: 'f5',
    type: 'announcement',
    user: {
      name: 'Alex Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=12',
      verified: false,
    },
    content: {
      title: 'Weekly Challenge Complete!',
      message: 'Just finished this week\'s speed challenge! 💪 My best 40-yard time yet. Thanks for all the support from this amazing community!',
      date: '2023-05-07T14:22:00',
    },
    likes: 56,
    comments: 23,
  },
  {
    id: 'f6',
    type: 'new_content',
    user: {
      name: 'Coach Sarah Martinez',
      avatar: 'https://i.pravatar.cc/150?img=25',
      verified: true,
    },
    content: {
      title: 'Recovery Techniques',
      type: 'article',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      duration: '5 min read',
      description: 'Essential recovery techniques every athlete should know to prevent injury and improve performance.',
      date: '2023-05-06T10:15:00',
    },
    likes: 31,
    comments: 8,
  },
];

const formatDate = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);

  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Otherwise return the full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface ClubTabsProps {
  clubId?: string;
  club?: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
}

export default function ClubTabs({ clubId = '550e8400-e29b-41d4-a716-446655440001', club }: ClubTabsProps) {
  const router = useRouter();
  const [realPosts, setRealPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real club posts
  useEffect(() => {
    const fetchClubPosts = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching posts for club ID:', clubId);
        const posts = await clubService.getClubPosts(clubId, { limit: 20, bypassCache: true });
        console.log('Fetched club posts:', posts);
        setRealPosts(posts || []);
      } catch (error) {
        console.error('Error fetching club posts:', error);
        setRealPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (clubId) {
      fetchClubPosts();
    }
  }, [clubId]);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const posts = await clubService.getClubPosts(clubId, { limit: 20, bypassCache: true });
      setRealPosts(posts || []);
    } catch (error) {
      console.error('Error refreshing club posts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Feed Item component with enhanced interactions
  const FeedItem: React.FC<{ item: FeedItem }> = ({ item }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(item.likes);

    const handleLike = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleComment = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Navigate to detailed view with comments
      if (item.type === 'workout_log') {
        router.push(`/workout/detail/${item.id}`);
      } else if (item.type === 'announcement' || item.type === 'new_content') {
        router.push(`/club/${clubId}/post/${item.id}`);
      }
    };

    const handleShare = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // For now, keep as alert - in a real app this would open native share sheet
      Alert.alert('Share', `Share this ${item.type}`);
    };

    const handleOpenPost = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (item.type === 'workout_log') {
        router.push(`/workout/detail/${item.id}`);
      } else if (item.type === 'announcement' || item.type === 'new_content') {
        router.push(`/club/${clubId}/post/${item.id}`);
      }
    };

    const handleViewProfile = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const userName = item?.user?.name || 'unknown-user';
      router.push(`/profile/${userName.replace(/\s+/g, '-').toLowerCase()}`);
    };

    const renderContent = () => {
      switch (item.type) {
        case 'workout_log':
          return (
            <View style={styles.workoutLogContainer}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutIcon}>
                  <Ionicons name="barbell" size={20} color="#30D158" />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{item.content.workout_name}</Text>
                  <Text style={styles.workoutDuration}>{item.content.duration}</Text>
                </View>
                <View style={styles.completionBadge}>
                  <Text style={styles.completionText}>{item.content.completion}%</Text>
                </View>
              </View>

              <View style={styles.workoutStats}>
                {item.content.stats?.map((stat, index) => (
                  <View key={index} style={styles.statChip}>
                    <Text style={styles.statText}>{stat}</Text>
                  </View>
                ))}
              </View>
            </View>
          );

        case 'announcement':
          return (
            <View style={styles.announcementContainer}>
              <View style={styles.announcementHeader}>
                <Ionicons name="megaphone" size={20} color="#FF9F0A" />
                <Text style={styles.announcementLabel}>Announcement</Text>
              </View>
              {item.content.title && (
                <Text style={styles.announcementTitle}>{item.content.title}</Text>
              )}
              <Text style={styles.announcementMessage}>{item.content.message}</Text>
            </View>
          );

        case 'new_content':
          return (
            <View style={styles.contentContainer}>
              <View style={styles.contentHeader}>
                <Ionicons
                  name={item.content.type === 'video' ? 'play-circle' : 'document-text'}
                  size={20}
                  color="#0A84FF"
                />
                <Text style={styles.contentLabel}>
                  {item.content.type === 'video' ? 'Video' : 'Article'}
                </Text>
                <Text style={styles.contentDuration}>{item.content.duration}</Text>
              </View>

              {item.content.thumbnail && (
                <TouchableOpacity style={styles.contentThumbnail} onPress={handleOpenPost}>
                  <Image source={{ uri: item.content.thumbnail }} style={styles.thumbnailImage} />
                  {item.content.type === 'video' && (
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={24} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              )}

              <Text style={styles.contentTitle}>{item.content.title}</Text>
              <Text style={styles.contentDescription}>{item.content.description}</Text>
            </View>
          );

        default:
          return null;
      }
    };

    return (
      <View style={styles.feedItemCard}>
        <BlurView intensity={20} tint="dark" style={styles.feedItemBlur}>
          <View style={styles.feedItemContent}>
            {/* User Header */}
            <TouchableOpacity style={styles.userHeader} onPress={handleViewProfile}>
              <Image source={{ uri: item?.user?.avatar || 'https://i.pravatar.cc/150?img=1' }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{item?.user?.name || 'Unknown User'}</Text>
                  {item?.user?.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#0A84FF" style={styles.verifiedIcon} />
                  )}
                </View>
                <Text style={styles.feedItemDate}>{formatDate(item.content.date)}</Text>
              </View>
            </TouchableOpacity>

            {/* Content */}
            {renderContent()}

            {/* Actions */}
            <View style={styles.feedItemActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={20}
                  color={isLiked ? "#FF6B6B" : "#8E8E93"}
                />
                <Text style={[styles.actionText, isLiked && { color: '#FF6B6B' }]}>
                  {likeCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
                <Ionicons name="chatbubble-outline" size={18} color="#8E8E93" />
                <Text style={styles.actionText}>{item.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={18} color="#8E8E93" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="bookmark-outline" size={18} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.scrollContainer, styles.tabContent]}>
          <View style={styles.feedHeader}>
            <Text style={styles.feedTitle}>Club Activity</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A84FF" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        </View>
      </View>
    );
  }

  // Show real posts if available, otherwise show mock data
  const postsToShow = realPosts.length > 0 ? realPosts : feedItems;

  return (
    <View style={styles.container}>
      <View style={[styles.scrollContainer, styles.tabContent]}>
        <View style={styles.feedHeader}>
          <Text style={styles.feedTitle}>Club Activity</Text>
        </View>

        {realPosts.length > 0 ? (
          // Render real posts
          <FlatList
            data={realPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.feedItemCard}
                onPress={() => router.push(`/social/post/${item.id}` as any)}
                activeOpacity={0.9}
              >
                <BlurView intensity={20} tint="dark" style={styles.feedItemBlur}>
                  <View style={styles.feedItemContent}>
                    <View style={styles.userHeader}>
                      <TouchableOpacity onPress={() => router.push(`/profile/${item.author?.id}` as any)}>
                        <Image
                          source={{ uri: item.author?.avatar_url || 'https://i.pravatar.cc/150?img=1' }}
                          style={styles.userAvatar}
                        />
                      </TouchableOpacity>
                      <View style={styles.userInfo}>
                        <View style={styles.userNameRow}>
                          <TouchableOpacity onPress={() => router.push(`/profile/${item.author?.id}` as any)}>
                            <Text style={styles.userName}>{item.author?.username || 'Unknown User'}</Text>
                          </TouchableOpacity>
                          {club && (
                            <View style={styles.clubTagSmall}>
                              <Text style={styles.clubTagSmallText}>{club.name}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.feedItemDate}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.postContent}>{item.content}</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#0A84FF"
              />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          // Render mock data as fallback
          <>
            {feedItems.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 12,
  },
  postContent: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
  },

  // Feed styles
  feedItemCard: {

    borderRadius: 16,
    padding: 0,
    marginBottom: 12,
  },
  feedItemBlur: {
    overflow: 'hidden',
  },
  feedItemContent: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
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
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  clubTagSmall: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 4,
  },
  clubTagSmallText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0A84FF',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  feedItemDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  workoutLogContainer: {
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutDuration: {
    fontSize: 13,
    color: '#8E8E93',
  },
  completionBadge: {
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 12,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#30D158',
  },
  workoutStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  statChip: {
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  statText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  announcementContainer: {
    marginBottom: 12,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  announcementMessage: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  contentContainer: {
    marginBottom: 12,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  contentDuration: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 6,
  },
  contentThumbnail: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 4,
    borderRadius: 12,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  feedItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
});