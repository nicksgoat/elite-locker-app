import { mockClubs, mockPosts, mockUsers } from '../../data/mockData';
import { Club, Post } from '../../types/workout';
import { workoutDataService, SocialWorkoutData } from '../../services/workoutDataService';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [clubs] = useState<Club[]>(mockClubs);
  const [stories] = useState<Story[]>(mockStories);
  const [liveSessions] = useState<LiveSession[]>(mockLiveSessions);
  const [trendingWorkouts, setTrendingWorkouts] = useState<TrendingWorkout[]>(mockTrendingWorkouts);
  const [feedWorkouts, setFeedWorkouts] = useState<SocialWorkoutData[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'discover' | 'live'>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);

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

  // Load real workout data for feed
  useEffect(() => {
    const loadFeedWorkouts = async () => {
      if (activeTab === 'feed') {
        setLoadingFeed(true);
        try {
          const workouts = await workoutDataService.getFeedWorkouts(20);
          setFeedWorkouts(workouts);
        } catch (error) {
          console.error('Error loading feed workouts:', error);
        } finally {
          setLoadingFeed(false);
        }
      }
    };

    loadFeedWorkouts();
  }, [activeTab]);

  const formatPostDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleClubPress = (club: Club) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${club.id}`);
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

  const handleLikePress = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        const likeCount = isLiked ? post.likeCount + 1 : post.likeCount - 1;
        return { ...post, isLiked, likeCount };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'feed') {
        const workouts = await workoutDataService.getFeedWorkouts(20);
        setFeedWorkouts(workouts);
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      setRefreshing(false);
    }
  };

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
    Alert.alert('Create Post', 'Post creation coming soon!');
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
      onPress={() => handleClubPress(item)}
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

  const renderWorkoutPost = ({ item }: { item: SocialWorkoutData }) => {
    const formatDuration = (seconds: number): string => {
      const minutes = Math.round(seconds / 60);
      return `${minutes} min`;
    };

    const formatVolume = (volume: number): string => {
      if (volume >= 1000) {
        return `${(volume / 1000).toFixed(1)}k lbs`;
      }
      return `${volume.toLocaleString()} lbs`;
    };

    const formatDate = (date: Date): string => {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    };

    return (
      <View style={styles.workoutPostCard}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.authorAvatar }} style={styles.authorImage} />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.authorName}>{item.authorName}</Text>
            {item.clubName && (
              <Text style={styles.postClubName}>in {item.clubName}</Text>
            )}
          </View>
          <Text style={styles.postDate}>{formatDate(item.completedAt)}</Text>
        </View>

        <Text style={styles.postContent}>Completed: {item.title}</Text>

        {/* Workout Stats Card */}
        <View style={styles.workoutStatsCard}>
          <View style={styles.workoutStatsHeader}>
            <Ionicons name="fitness-outline" size={20} color="#0A84FF" />
            <Text style={styles.workoutStatsTitle}>{item.title}</Text>
          </View>

          <View style={styles.workoutStatsGrid}>
            <View style={styles.workoutStatItem}>
              <Text style={styles.workoutStatValue}>{formatDuration(item.duration)}</Text>
              <Text style={styles.workoutStatLabel}>Duration</Text>
            </View>
            <View style={styles.workoutStatItem}>
              <Text style={styles.workoutStatValue}>{formatVolume(item.totalVolume)}</Text>
              <Text style={styles.workoutStatLabel}>Volume</Text>
            </View>
            <View style={styles.workoutStatItem}>
              <Text style={styles.workoutStatValue}>{item.exercisesCompleted}</Text>
              <Text style={styles.workoutStatLabel}>Exercises</Text>
            </View>
            <View style={styles.workoutStatItem}>
              <Text style={styles.workoutStatValue}>{item.setsCompleted}</Text>
              <Text style={styles.workoutStatLabel}>Sets</Text>
            </View>
          </View>

          {item.personalRecords.length > 0 && (
            <View style={styles.personalRecordsSection}>
              <View style={styles.personalRecordHeader}>
                <Ionicons name="trophy" size={16} color="#FF9F0A" />
                <Text style={styles.personalRecordText}>
                  {item.personalRecords.length} Personal Record{item.personalRecords.length > 1 ? 's' : ''}!
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleLikePress(item.id)}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={22}
              color={item.isLiked ? "#FF6B6B" : "#8E8E93"}
            />
            <Text style={[styles.postActionText, item.isLiked && { color: '#FF6B6B' }]}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleCommentPress(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#8E8E93" />
            <Text style={styles.postActionText}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleSharePress(item.id)}
          >
            <Ionicons name="share-social-outline" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.postAction}>
            <Ionicons
              name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={item.isBookmarked ? "#0A84FF" : "#8E8E93"}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const author = mockUsers.find(user => user.id === item.authorId);
    const club = item.clubId ? mockClubs.find(club => club.id === item.clubId) : null;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image source={{ uri: author?.profileImageUrl }} style={styles.authorImage} />
          <View style={styles.postHeaderInfo}>
            <Text style={styles.authorName}>{author?.name}</Text>
            {club && (
              <TouchableOpacity onPress={() => handleClubPress(club)}>
                <Text style={styles.postClubName}>in {club.name}</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.postDate}>{formatPostDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.imageUrls && item.imageUrls.length > 0 && (
          <View style={styles.postImagesContainer}>
            {item.imageUrls.map((url, index) => (
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
              name={item.isLiked ? "heart" : "heart-outline"}
              size={22}
              color={item.isLiked ? "#FF6B6B" : "#8E8E93"}
            />
            <Text style={[styles.postActionText, item.isLiked && { color: '#FF6B6B' }]}>
              {item.likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postAction}
            onPress={() => handleCommentPress(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#8E8E93" />
            <Text style={styles.postActionText}>{item.commentCount}</Text>
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
      </View>
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
        >
          {/* Stories Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stories</Text>
          </View>
          <FlatList
            horizontal
            data={stories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesList}
          />

          {/* My Clubs Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Clubs</Text>
            <TouchableOpacity onPress={() => router.push('/clubs')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={clubs}
            renderItem={renderClubItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clubsList}
          />

          {/* Social Feed */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feed</Text>
          </View>

          {/* Workout Posts */}
          {feedWorkouts.map((workout) => (
            <View key={`workout-${workout.id}`}>{renderWorkoutPost({ item: workout })}</View>
          ))}

          {/* Regular Posts */}
          {posts.map((post) => (
            <View key={`post-${post.id}`}>{renderPostItem({ item: post })}</View>
          ))}
        </Animated.ScrollView>
      )}

      {activeTab === 'discover' && (
        <ScrollView style={styles.scrollContainer}>
          {/* Trending Workouts */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Workouts</Text>
          </View>
          <FlatList
            data={trendingWorkouts}
            renderItem={renderTrendingWorkoutItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.trendingWorkoutsList}
          />

          {/* Discover Clubs */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Discover Clubs</Text>
          </View>
          <FlatList
            data={clubs}
            renderItem={renderClubItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.discoverClubsGrid}
          />
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
          <FlatList
            data={liveSessions}
            renderItem={renderLiveSessionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.liveSessionsList}
          />
        </ScrollView>
      )}

      {/* Floating Action Button with Create Menu */}
      <View style={styles.fabContainer}>
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
    paddingHorizontal: 16,
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
    paddingBottom: 8,
  },
  discoverClubsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  clubCard: {
    width: (screenWidth - 48) / 2,
    height: 120,
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
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    bottom: 20,
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

  // Workout Post Styles
  workoutPostCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  workoutStatsCard: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  workoutStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutStatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  workoutStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workoutStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  workoutStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  personalRecordsSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 159, 10, 0.3)',
  },
  personalRecordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalRecordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9F0A',
    marginLeft: 6,
  },
});
