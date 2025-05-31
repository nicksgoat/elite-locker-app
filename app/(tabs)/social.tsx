import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WorkoutPostCard from '../../components/cards/WorkoutPostCard';
import { mockClubs } from '../../data/mockData';
import { clubService } from '../../services/clubService';
import { EnhancedFeedItem, enhancedFeedService } from '../../services/enhancedFeedService';
import { feedService } from '../../services/feedService';
import { Club } from '../../types/workout';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced interfaces for better social features
interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  timestamp: Date;
  isViewed: boolean;
}

interface LiveSession {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  thumbnailUrl: string;
  viewerCount: number;
  isLive: boolean;
  clubId: string;
  clubName: string;
}

interface TrendingWorkout {
  id: string;
  title: string;
  authorName: string;
  thumbnailUrl: string;
  likeCount: number;
  shareCount: number;
  duration: string;
  isBookmarked: boolean;
}

// Mock data for enhanced features
const mockStories: Story[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Your Story',
    userAvatar: 'https://pbs.twimg.com/profile_images/1234567890/avatar.jpg',
    imageUrl: '',
    timestamp: new Date(),
    isViewed: false
  },
  {
    id: '2',
    userId: '2',
    userName: 'Devon Allen',
    userAvatar: 'https://pbs.twimg.com/profile_images/1234567890/devon.jpg',
    imageUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isViewed: false
  },
  {
    id: '3',
    userId: '3',
    userName: 'Alex Johnson',
    userAvatar: 'https://via.placeholder.com/80x80',
    imageUrl: 'https://via.placeholder.com/400x600',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isViewed: true
  },
];

const mockLiveSessions: LiveSession[] = [
  {
    id: '1',
    title: 'Live Strength Training',
    hostName: 'Coach Miller',
    hostAvatar: 'https://via.placeholder.com/40x40',
    thumbnailUrl: 'https://via.placeholder.com/200x120',
    viewerCount: 234,
    isLive: true,
    clubId: '1',
    clubName: 'Elite Fitness'
  },
  {
    id: '2',
    title: 'Olympic Lifting Workshop',
    hostName: 'Devon Allen',
    hostAvatar: 'https://pbs.twimg.com/profile_images/1234567890/devon.jpg',
    thumbnailUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
    viewerCount: 567,
    isLive: true,
    clubId: '2',
    clubName: 'Track & Field Elite'
  },
];

const mockTrendingWorkouts: TrendingWorkout[] = [
  {
    id: '1',
    title: 'Beast Mode Upper Body',
    authorName: '@mikemental',
    thumbnailUrl: 'https://via.placeholder.com/120x80',
    likeCount: 1234,
    shareCount: 89,
    duration: '45 min',
    isBookmarked: false
  },
  {
    id: '2',
    title: 'Olympic Prep Workout',
    authorName: '@devon_allen',
    thumbnailUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500',
    likeCount: 2341,
    shareCount: 156,
    duration: '60 min',
    isBookmarked: true
  },
];

export default function SocialScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Enhanced state management
  const [posts, setPosts] = useState<EnhancedFeedItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>(mockClubs);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [stories] = useState<Story[]>(mockStories);
  const [liveSessions] = useState<LiveSession[]>(mockLiveSessions);
  const [trendingWorkouts, setTrendingWorkouts] = useState<TrendingWorkout[]>(mockTrendingWorkouts);
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'live'>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  // Enhanced create content functionality
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const createMenuScale = useRef(new Animated.Value(0)).current;
  const createMenuOpacity = useRef(new Animated.Value(0)).current;

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Fetch real posts from backend
  const fetchPosts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setIsLoadingPosts(true);
      }

      console.log('Social tab - Fetching enhanced feed from backend...');

      // Get posts from the enhanced feed service
      const feedPosts = await enhancedFeedService.getFeed({
        limit: 20,
        offset: 0,
        clubIds: selectedClubIds,
        includeFollowing: true
      });

      console.log(`Social tab - Loaded ${feedPosts.length} enhanced feed items`);
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error fetching enhanced feed:', error);
      // Keep existing posts on error, don't clear them
    } finally {
      setIsLoadingPosts(false);
      setRefreshing(false);
    }
  }, [selectedClubIds]);

  // Fetch user's clubs on component mount
  useEffect(() => {
    const fetchUserClubs = async () => {
      try {
        const [memberships, ownedClubs, allClubs] = await Promise.all([
          clubService.getMyMemberships().catch(() => []),
          clubService.getMyClubs().catch(() => []),
          clubService.getClubs({ limit: 10 }).catch(() => [])
        ]);

        // Combine and deduplicate user's clubs
        const userClubsList = [...(memberships || []), ...(ownedClubs || [])];
        const uniqueUserClubs = userClubsList.filter((club, index, self) =>
          index === self.findIndex(c => c.id === club.id)
        );

        // Set user clubs (can be empty)
        setUserClubs(uniqueUserClubs);
        setSelectedClubIds(uniqueUserClubs.map(club => club.id));

        // Set all clubs for discovery (fallback to empty array if none found)
        setClubs(allClubs || []);

        console.log(`Loaded ${uniqueUserClubs.length} user clubs and ${(allClubs || []).length} total clubs`);
      } catch (error) {
        console.error('Error fetching clubs:', error);
        // Set empty arrays instead of mock data to avoid stale references
        setUserClubs([]);
        setSelectedClubIds([]);
        setClubs([]);
      }
    };

    fetchUserClubs();
  }, []);

  // Fetch posts when clubs are loaded
  useEffect(() => {
    if (selectedClubIds.length >= 0) { // Allow fetching even with no clubs (for following feed)
      fetchPosts();
    }
  }, [fetchPosts]);

  // Enhanced navigation handlers
  const handlePostPress = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/social/post/${postId}`);
  }, [router]);

  const handleUserPress = useCallback((userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${userId}`);
  }, [router]);

  const handleClubPress = useCallback((clubId: string) => {
    // Validate club ID before navigation
    if (!clubId || typeof clubId !== 'string' || clubId.trim() === '') {
      console.warn('Invalid club ID provided for navigation:', clubId);
      Alert.alert('Error', 'Unable to open club. Please try again.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${clubId.trim()}`);
  }, [router]);

  const formatPostDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleLiveSessionPress = (session: LiveSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/club/${session.clubId}`);
  };

  const handleStoryPress = (story: Story) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (story.userId === '1') {
      // Your story - open camera/media picker
      Alert.alert('Create Story', 'Camera functionality coming soon!');
    } else {
      // View story
      Alert.alert('Story Viewer', `Viewing ${story.userName}'s story`);
    }
  };

  const handleWorkoutBookmark = (workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTrendingWorkouts(prev =>
      prev.map(workout =>
        workout.id === workoutId
          ? { ...workout, isBookmarked: !workout.isBookmarked }
          : workout
      )
    );
  };

  // Track pending likes to prevent duplicates
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  const handleLikePress = useCallback(async (postId: string) => {
    // Prevent duplicate like requests
    if (pendingLikes.has(postId)) {
      console.log(`Like request already pending for post ${postId}`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add to pending likes
    setPendingLikes(prev => new Set(prev).add(postId));

    // Optimistic update
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.is_liked;
        const likeCount = isLiked ? post.like_count + 1 : post.like_count - 1;
        return { ...post, is_liked: isLiked, like_count: likeCount };
      }
      return post;
    });
    setPosts(updatedPosts);

    try {
      // Call the backend to update the like
      await feedService.likePost(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      setPosts(posts);
    } finally {
      // Remove from pending likes
      setPendingLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  }, [posts, pendingLikes]);

  const handleCommentPress = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/social/post/${postId}`);
  };

  const handleSharePress = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Share Post', 'Share functionality coming soon!');
  };

  const handleTabChange = (tab: 'feed' | 'discover' | 'live') => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const onRefresh = useCallback(() => {
    console.log('Social tab - Refreshing feed...');
    fetchPosts(true);
  }, [fetchPosts]);

  const handleStoryReaction = (storyId: string, reaction: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Story Reaction', `You reacted with ${reaction} to the story`);
  };

  const handleJoinLiveSession = (session: LiveSession) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert('Join Live Session', `Joining ${session.title}...`);
  };

  const handleWorkoutPreview = (workout: TrendingWorkout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Workout Preview', `Previewing ${workout.title}`);
  };

  // Enhanced create content functionality
  const toggleCreateMenu = () => {
    const isShowing = !showCreateMenu;
    Haptics.impactAsync(isShowing ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);

    if (isShowing) {
      setShowCreateMenu(true);
      Animated.parallel([
        Animated.spring(createMenuScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(createMenuOpacity, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(createMenuScale, { toValue: 0, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(createMenuOpacity, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start(() => setShowCreateMenu(false));
    }
  };

  const handleCreatePost = () => {
    toggleCreateMenu();
    if (userClubs.length > 0) {
      // Navigate to create post in the first club (or show club selector)
      router.push(`/club/${userClubs[0].id}/create-post`);
    } else {
      Alert.alert('No Clubs', 'Join a club to create posts!');
    }
  };

  const handleCreateStory = () => {
    toggleCreateMenu();
    Alert.alert('Create Story', 'Story creation coming soon!');
  };

  const handleGoLive = () => {
    toggleCreateMenu();
    Alert.alert('Go Live', 'Live streaming coming soon!');
  };

  // Enhanced component renderers
  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => handleStoryPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.storyImageContainer, !item.isViewed && styles.unviewedStory]}>
        {item.userId === '1' ? (
          <View style={styles.addStoryContainer}>
            <Ionicons name="add" size={24} color="#0A84FF" />
          </View>
        ) : (
          <Image source={{ uri: item.userAvatar }} style={styles.storyImage} />
        )}
      </View>
      <Text style={styles.storyUserName} numberOfLines={1}>{item.userName}</Text>
    </TouchableOpacity>
  );

  const renderLiveSessionItem = ({ item }: { item: LiveSession }) => (
    <TouchableOpacity
      style={styles.liveSessionCard}
      onPress={() => handleLiveSessionPress(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.liveSessionThumbnail} />
      <BlurView intensity={80} tint="dark" style={styles.liveSessionOverlay}>
        <View style={styles.liveSessionHeader}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <View style={styles.viewerCount}>
            <Ionicons name="eye" size={12} color="#FFFFFF" />
            <Text style={styles.viewerCountText}>{item.viewerCount}</Text>
          </View>
        </View>
        <View style={styles.liveSessionInfo}>
          <Text style={styles.liveSessionTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.liveSessionHost}>
            <Image source={{ uri: item.hostAvatar }} style={styles.liveHostAvatar} />
            <Text style={styles.liveHostName}>{item.hostName}</Text>
          </View>

          {/* Enhanced Join Button */}
          <TouchableOpacity
            style={styles.joinLiveButton}
            onPress={() => handleJoinLiveSession(item)}
          >
            <Ionicons name="play-circle" size={16} color="#FFFFFF" />
            <Text style={styles.joinLiveText}>Join Now</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderTrendingWorkoutItem = ({ item }: { item: TrendingWorkout }) => (
    <TouchableOpacity style={styles.trendingWorkoutCard} activeOpacity={0.9} onPress={() => handleWorkoutPreview(item)}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.trendingWorkoutThumbnail} />
      <View style={styles.trendingWorkoutInfo}>
        <Text style={styles.trendingWorkoutTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.trendingWorkoutAuthor}>{item.authorName}</Text>
        <View style={styles.trendingWorkoutStats}>
          <View style={styles.trendingWorkoutStat}>
            <Ionicons name="heart" size={12} color="#FF6B6B" />
            <Text style={styles.trendingWorkoutStatText}>{item.likeCount}</Text>
          </View>
          <View style={styles.trendingWorkoutStat}>
            <Ionicons name="time" size={12} color="#8E8E93" />
            <Text style={styles.trendingWorkoutStatText}>{item.duration}</Text>
          </View>
          <View style={styles.trendingWorkoutStat}>
            <Ionicons name="share-social" size={12} color="#8E8E93" />
            <Text style={styles.trendingWorkoutStatText}>{item.shareCount}</Text>
          </View>
        </View>

        {/* Enhanced Action Buttons */}
        <View style={styles.trendingWorkoutActions}>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => handleWorkoutPreview(item)}
          >
            <Ionicons name="play-outline" size={14} color="#0A84FF" />
            <Text style={styles.previewButtonText}>Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => handleWorkoutBookmark(item.id)}
      >
        <Ionicons
          name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
          size={20}
          color={item.isBookmarked ? "#0A84FF" : "#8E8E93"}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderClubItem = ({ item }: { item: Club }) => (
    <TouchableOpacity
      style={styles.clubCard}
      onPress={() => handleClubPress(item.id)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.clubImage} />
      <BlurView intensity={30} tint="dark" style={styles.clubOverlay}>
        <Text style={styles.clubName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.clubMemberRow}>
          <Ionicons name="people-outline" size={12} color="#FFFFFF" />
          <Text style={styles.clubMemberCount}>{item.memberCount}k</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderFeedItem = ({ item }: { item: EnhancedFeedItem }) => {
    // If this is a workout post, use the WorkoutPostCard
    if (item.type === 'workout_post' && item.workout) {
      return (
        <WorkoutPostCard
          id={item.id}
          author={item.author || { id: 'unknown', username: 'Unknown User', full_name: 'Unknown User', avatar_url: null }}
          club={item.club}
          workout={item.workout}
          content={item.content}
          image_urls={item.image_urls}
          like_count={item.like_count}
          comment_count={item.comment_count}
          created_at={item.created_at}
          location="United States" // TODO: Get from user location or post data
          onPress={() => router.push(`/social/post/${item.id}`)}
          onLike={() => handleLikePress(item.id)}
          onComment={() => handleCommentPress(item.id)}
          onShare={() => handleSharePress(item.id)}
          onMoreOptions={() => console.log('More options for post:', item.id)}
          onUserPress={(userId) => router.push(`/profile/${userId}`)}
          onClubPress={(clubId) => handleClubPress(clubId)}
          onWorkoutPress={(workoutId) => router.push(`/workout/detail/${workoutId}`)}
        />
      );
    }

    // For regular posts, render a simple post card
    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => router.push(`/social/post/${item.id}` as any)}
        activeOpacity={0.95}
      >
        <View style={styles.postHeader}>
          <TouchableOpacity onPress={() => router.push(`/profile/${item.author?.id}` as any)}>
            <Image
              source={{
                uri: item.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author?.username || 'User')}&background=1C1C1E&color=FFFFFF`
              }}
              style={styles.authorImage}
            />
          </TouchableOpacity>
          <View style={styles.postHeaderInfo}>
            <View style={styles.authorRow}>
              <TouchableOpacity onPress={() => router.push(`/profile/${item.author?.id}` as any)}>
                <Text style={styles.authorName}>
                  {item.author?.full_name || item.author?.username || 'Unknown User'}
                </Text>
              </TouchableOpacity>
              {item.club && (
                <TouchableOpacity
                  style={styles.clubTagRegular}
                  onPress={() => handleClubPress(item.club!.id)}
                >
                  <Text style={styles.clubTagRegularText}>{item.club.name}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.image_urls && item.image_urls.length > 0 && (
          <View style={styles.postImagesContainer}>
            {item.image_urls.map((url, index) => (
              <Image
                key={`${item.id}-img-${index}`}
                source={{ uri: url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleLikePress(item.id)}
          >
            <Ionicons
              name={item.is_liked ? "heart" : "heart-outline"}
              size={22}
              color={item.is_liked ? "#FF6B6B" : "#8E8E93"}
            />
            <Text style={[styles.postActionText, item.is_liked && { color: '#FF6B6B' }]}>
              {item.like_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleCommentPress(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#8E8E93" />
            <Text style={styles.postActionText}>{item.comment_count || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleSharePress(item.id)}
          >
            <Ionicons name="share-social-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="bookmark-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.title}>Social</Text>
        <Text style={styles.subtitle}>Connect with your fitness community</Text>

        {/* Enhanced Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'feed' && styles.activeTabButton]}
            onPress={() => handleTabChange('feed')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'feed' && styles.activeTabButtonText]}>
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'discover' && styles.activeTabButton]}
            onPress={() => handleTabChange('discover')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'discover' && styles.activeTabButtonText]}>
              Discover
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'live' && styles.activeTabButton]}
            onPress={() => handleTabChange('live')}
          >
            <View style={styles.liveTabContent}>
              <View style={styles.liveDotSmall} />
              <Text style={[styles.tabButtonText, activeTab === 'live' && styles.activeTabButtonText]}>
                Live
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Content based on active tab */}
      {activeTab === 'feed' && (
        <Animated.ScrollView
          style={styles.scrollContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Stories Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stories</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesList}
          >
            {stories.map((item) => (
              <View key={item.id}>
                {renderStoryItem({ item })}
              </View>
            ))}
          </ScrollView>

          {/* My Clubs Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Clubs</Text>
            <TouchableOpacity onPress={() => router.push('/clubs')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clubsList}
          >
            {(userClubs.length > 0 ? userClubs : clubs).map((item) => (
              <View key={item.id}>
                {renderClubItem({ item })}
              </View>
            ))}
          </ScrollView>

          {/* Social Feed Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feed</Text>
          </View>

          {/* Feed Posts - Render directly in the main ScrollView */}
          {posts.map((item) => (
            <View key={item.id}>
              {renderFeedItem({ item })}
            </View>
          ))}
        </Animated.ScrollView>
      )}

      {activeTab === 'discover' && (
        <ScrollView style={styles.scrollContainer}>
          {/* Trending Workouts */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Workouts</Text>
          </View>
          <View style={styles.trendingWorkoutsList}>
            {trendingWorkouts.map((item) => (
              <View key={item.id}>
                {renderTrendingWorkoutItem({ item })}
              </View>
            ))}
          </View>

          {/* Discover Clubs */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover Clubs</Text>
          </View>
          <View style={styles.discoverClubsGrid}>
            {clubs.reduce((rows: any[], item, index) => {
              if (index % 2 === 0) {
                rows.push([item]);
              } else {
                rows[rows.length - 1].push(item);
              }
              return rows;
            }, []).map((row: any[], rowIndex: number) => (
              <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                {row.map((item) => (
                  <View key={item.id}>
                    {renderClubItem({ item })}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {activeTab === 'live' && (
        <ScrollView style={styles.scrollContainer}>
          {/* Live Sessions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Now</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{liveSessions.length} Live</Text>
            </View>
          </View>
          <View style={styles.liveSessionsList}>
            {liveSessions.map((item) => (
              <View key={item.id}>
                {renderLiveSessionItem({ item })}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Floating Action Button with Create Menu */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 100 }]}>
        {showCreateMenu && (
          <Animated.View style={[
            styles.createMenuBackdrop,
            { opacity: createMenuOpacity }
          ]}>
            <TouchableOpacity style={styles.backdropTouchable} onPress={toggleCreateMenu} />
          </Animated.View>
        )}

        {showCreateMenu && (
          <Animated.View style={[
            styles.createMenu,
            {
              opacity: createMenuOpacity,
              transform: [{ scale: createMenuScale }]
            }
          ]}>
            <TouchableOpacity style={styles.createMenuItem} onPress={handleGoLive}>
              <View style={[styles.createMenuIcon, { backgroundColor: '#FF3B30' }]}>
                <Ionicons name="videocam" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.createMenuText}>Go Live</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createMenuItem} onPress={handleCreateStory}>
              <View style={[styles.createMenuIcon, { backgroundColor: '#FF9F0A' }]}>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.createMenuText}>Story</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createMenuItem} onPress={handleCreatePost}>
              <View style={[styles.createMenuIcon, { backgroundColor: '#0A84FF' }]}>
                <Ionicons name="create" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.createMenuText}>Post</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <TouchableOpacity
          style={styles.fabButton}
          onPress={toggleCreateMenu}
          activeOpacity={0.8}
        >
          <Animated.View style={{
            transform: [{
              rotate: createMenuScale.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg']
              })
            }]
          }}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#0A84FF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  liveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100, // Add padding to prevent content from being hidden behind FAB
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },

  // Stories Styles
  storiesList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  storyItem: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  storyImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333333',
  },
  unviewedStory: {
    borderColor: '#0A84FF',
  },
  addStoryContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0A84FF',
    borderStyle: 'dashed',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyUserName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Live Sessions Styles
  liveSessionsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  liveSessionCard: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  liveSessionThumbnail: {
    width: '100%',
    height: '100%',
  },
  liveSessionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  liveSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 4,
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewerCountText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  liveSessionInfo: {
    justifyContent: 'flex-end',
  },
  liveSessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  liveSessionHost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveHostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  liveHostName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Trending Workouts Styles
  trendingWorkoutsList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  trendingWorkoutCard: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  trendingWorkoutThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  trendingWorkoutInfo: {
    flex: 1,
  },
  trendingWorkoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trendingWorkoutAuthor: {
    fontSize: 14,
    color: '#0A84FF',
    marginBottom: 6,
  },
  trendingWorkoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingWorkoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  trendingWorkoutStatText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  bookmarkButton: {
    padding: 8,
  },

  // Enhanced Club Styles
  clubsList: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  discoverClubsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  clubCard: {
    width: (screenWidth - 36) / 2,
    height: 50,
    marginRight: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  clubImage: {
    width: '100%',
    height: '100%',
  },
  clubOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    justifyContent: 'flex-end',
  },
  clubName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  clubMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubMemberCount: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
  },

  // Enhanced Post Styles
  postCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  clubTagRegular: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  clubTagRegularText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A84FF',
  },
  postClubName: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  postContent: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 22,
  },
  postImagesContainer: {
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  postActionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '600',
  },
  workoutAttachment: {
    backgroundColor: '#0A84FF15',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0A84FF30',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
    marginLeft: 8,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },

  // Enhanced Join Button Styles
  joinLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#0A84FF',
    borderRadius: 6,
  },
  joinLiveText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
    marginLeft: 4,
  },

  // Enhanced Trending Workout Styles
  trendingWorkoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#0A84FF',
    borderRadius: 6,
  },
  previewButtonText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
    marginLeft: 4,
  },

  // Floating Action Button Styles
  fabContainer: {
    position: 'absolute',
    bottom: 20, // This will be overridden by dynamic positioning with safe area insets
    right: 20,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    padding: 8,
  },
  createMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  createMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#1C1C1E',
    padding: 16,
  },
  createMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    borderStyle: 'solid',
    borderRadius: 8,
  },
  createMenuIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  createMenuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
