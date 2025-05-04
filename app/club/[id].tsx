import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  StatusBar,
  FlatList,
  RefreshControl,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import ClubTabs from '../../components/ui/ClubTabs';
import GlobalHeader from '../../components/ui/GlobalHeader';

// Types for the club interface
interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  timestamp: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  images?: string[];
  isStickied?: boolean;
  tags?: string[];
  videoUrl?: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
}

interface ClubData {
  id: string;
  name: string;
  description: string;
  members: number;
  onlineNow: number;
  createdAt: string;
  bannerImage: string;
  icon: string;
  tags: string[];
  rules: string[];
  moderators: {
    name: string;
    avatar: string;
    isOwner?: boolean;
  }[];
  posts: Post[];
  isJoined: boolean;
}

// Mock data for the club
const mockClubData: ClubData = {
  id: '1',
  name: 'EliteSpeed Academy',
  description: 'Professional speed and agility training for athletes looking to improve their performance. Share your training videos, ask questions, and connect with other speed-focused athletes.',
  members: 1234,
  onlineNow: 42,
  createdAt: '2021-06-15T00:00:00Z',
  bannerImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  icon: 'https://i.pravatar.cc/150?img=1',
  tags: ['Speed Training', 'Agility', 'Sports Performance'],
  rules: [
    'Be respectful to all members',
    'No self-promotion or spam',
    'Training videos must include a description',
    'Use proper form check format for feedback',
    'Keep discussions relevant to speed training'
  ],
  moderators: [
    {
      name: 'Coach Mike Johnson',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isOwner: true
    },
    {
      name: 'Sarah Performance',
      avatar: 'https://i.pravatar.cc/150?img=5'
    }
  ],
  posts: [
    {
      id: 'p1',
      title: 'Welcome to Elite Speed Academy!',
      content: 'Welcome to our community! This is the place to discuss all things related to speed development, share your progress, and get feedback from coaches and peers.',
      author: {
        name: 'Coach Mike Johnson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        isVerified: true
      },
      timestamp: '2023-04-01T14:30:00Z',
      upvotes: 156,
      downvotes: 0,
      commentCount: 24,
      isStickied: true,
      tags: ['Announcement']
    },
    {
      id: 'p2',
      title: 'Form Check: My 40-yard dash technique',
      content: 'I\'ve been working on my start position and first 10 yards. Would appreciate some feedback on my form!',
      author: {
        name: 'SpeedSeeker23',
        avatar: 'https://i.pravatar.cc/150?img=12',
        isVerified: false
      },
      timestamp: '2023-05-12T09:45:00Z',
      upvotes: 28,
      downvotes: 2,
      commentCount: 15,
      videoUrl: 'https://example.com/video/dash.mp4',
      images: ['https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
      tags: ['Form Check', 'Sprint']
    },
    {
      id: 'p3',
      title: 'New PR! Sub-4.5 40-yard dash',
      content: 'After 6 months of dedicated training, I finally broke the 4.5 barrier! Thanks to everyone in this community for the advice and support.',
      author: {
        name: 'TrackStar',
        avatar: 'https://i.pravatar.cc/150?img=23',
        isVerified: false
      },
      timestamp: '2023-05-11T16:20:00Z',
      upvotes: 94,
      downvotes: 0,
      commentCount: 32,
      images: ['https://images.unsplash.com/photo-1539794830467-1f18a61c4554?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
      tags: ['Success', 'Progress']
    },
    {
      id: 'p4',
      title: 'Speed vs. Endurance Training Question',
      content: 'For those who compete in sports requiring both speed and endurance (soccer, basketball, etc.), how do you balance your training between the two? I\'m finding it challenging to improve both simultaneously.',
      author: {
        name: 'MultiSportAthlete',
        avatar: 'https://i.pravatar.cc/150?img=42',
        isVerified: false
      },
      timestamp: '2023-05-10T11:05:00Z',
      upvotes: 45,
      downvotes: 3,
      commentCount: 28,
      tags: ['Question', 'Training']
    },
    {
      id: 'p5',
      title: 'Best shoes for sprint training?',
      content: 'Looking for recommendations on sprint spikes or training shoes that have worked well for you. Currently using old running shoes and think it might be time for an upgrade!',
      author: {
        name: 'GearHead',
        avatar: 'https://i.pravatar.cc/150?img=33',
        isVerified: false
      },
      timestamp: '2023-05-09T08:15:00Z',
      upvotes: 37,
      downvotes: 4,
      commentCount: 42,
      tags: ['Equipment', 'Question']
    }
  ],
  isJoined: true
};

// Format relative time like Reddit
const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  
  // Convert to minutes, hours, days
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    // Format as MM/DD/YYYY
    return date.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  }
};

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [refreshing, setRefreshing] = useState(false);
  const [showRules, setShowRules] = useState(false);
  
  // In a real app, we'd fetch club data based on the ID
  const clubData = mockClubData;
  
  // Header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 60],
    extrapolate: 'clamp'
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });
  
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp'
  });
  
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  const handleTabChange = (tab: 'posts' | 'about') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };
  
  const handleSortChange = (sort: 'hot' | 'new' | 'top') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(sort);
  };
  
  const handleJoinToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // This would update the joined status in a real app
  };
  
  const handlePostPress = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${id}/post/${postId}`);
  };
  
  const handleCreatePost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/club/${id}/create-post`);
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  
  const handleVote = (postId: string, isUpvote: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // This would update the vote count in a real app
  };
  
  const handleToggleRules = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowRules(!showRules);
  };
  
  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity 
      style={[styles.postCard, item.isStickied && styles.stickiedPost]}
      onPress={() => handlePostPress(item.id)}
      activeOpacity={0.8}
    >
      {/* Post Header */}
      <View style={styles.postHeader}>
        {item.isStickied && (
          <View style={styles.stickiedBadge}>
            <Ionicons name="pin" size={12} color="#FFFFFF" />
            <Text style={styles.stickiedText}>Stickied post</Text>
          </View>
        )}
        <View style={styles.postMeta}>
          <Image source={{ uri: item.author.avatar }} style={styles.authorAvatar} />
          <Text style={styles.postAuthor}>
            {item.author.name}
            {item.author.isVerified && 
              <Ionicons name="checkmark-circle" size={14} color="#0A84FF" />
            }
          </Text>
          <Text style={styles.postTime}>{formatRelativeTime(item.timestamp)}</Text>
        </View>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* Post Content */}
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>
      
      {/* Post Image (if exists) */}
      {item.images && item.images.length > 0 && (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      {/* Video indicator if post has video */}
      {item.videoUrl && (
        <View style={styles.videoIndicator}>
          <Ionicons name="play-circle" size={40} color="#FFFFFF" />
        </View>
      )}
      
      {/* Post Footer with Actions */}
      <View style={styles.postFooter}>
        <View style={styles.voteContainer}>
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => handleVote(item.id, true)}
          >
            <Ionicons 
              name={item.isUpvoted ? "arrow-up-circle" : "arrow-up-circle-outline"} 
              size={20} 
              color={item.isUpvoted ? "#FF6B3D" : "#FFFFFF"} 
            />
          </TouchableOpacity>
          <Text style={styles.voteCount}>{item.upvotes - item.downvotes}</Text>
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => handleVote(item.id, false)}
          >
            <Ionicons 
              name={item.isDownvoted ? "arrow-down-circle" : "arrow-down-circle-outline"} 
              size={20} 
              color={item.isDownvoted ? "#9575CD" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.commentButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
          <Text style={styles.commentCount}>{item.commentCount} comments</Text>
        </View>
        
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header with Banner */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image 
          source={{ uri: clubData.bannerImage }} 
          style={[styles.bannerImage, { opacity: headerOpacity }]} 
        />
        <Animated.View style={[styles.headerOverlay, { opacity: headerOpacity }]} />
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
        
        {/* Animated Title for Scrolled State */}
        <Animated.View style={[styles.headerTitleContainer, { opacity: titleOpacity }]}>
          <Image source={{ uri: clubData.icon }} style={styles.headerIcon} />
          <Text style={styles.headerTitle} numberOfLines={1}>
            r/{clubData.name}
          </Text>
        </Animated.View>
      </Animated.View>
      
      {/* Club Info Section */}
      <View style={styles.clubInfoSection}>
        <View style={styles.clubHeader}>
          <Image source={{ uri: clubData.icon }} style={styles.clubIcon} />
          <View style={styles.clubDetails}>
            <Text style={styles.clubName}>r/{clubData.name}</Text>
            <Text style={styles.clubStats}>
              {clubData.members.toLocaleString()} members • {clubData.onlineNow} online
            </Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              clubData.isJoined && styles.joinedButton
            ]}
            onPress={handleJoinToggle}
          >
            <Text style={[
              styles.joinButtonText, 
              clubData.isJoined && styles.joinedButtonText
            ]}>
              {clubData.isJoined ? 'Joined' : 'Join'}
            </Text>
            {clubData.isJoined && (
              <Ionicons name="checkmark" size={16} color="#0A84FF" />
            )}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.clubDescription} numberOfLines={3}>
          {clubData.description}
        </Text>
        
        {/* Tags Row */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScrollContent}
        >
          {clubData.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => handleTabChange('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
            Posts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => handleTabChange('about')}
        >
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            About
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Post Sorting (Only visible in posts tab) */}
      {activeTab === 'posts' && (
        <View style={styles.sortContainer}>
          <TouchableOpacity 
            style={[styles.sortOption, sortBy === 'hot' && styles.activeSortOption]}
            onPress={() => handleSortChange('hot')}
          >
            <Ionicons 
              name="flame" 
              size={16} 
              color={sortBy === 'hot' ? "#FF6B3D" : "#A0A0A0"} 
            />
            <Text style={[
              styles.sortText, 
              sortBy === 'hot' && styles.activeSortText
            ]}>Hot</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortOption, sortBy === 'new' && styles.activeSortOption]}
            onPress={() => handleSortChange('new')}
          >
            <Ionicons 
              name="time" 
              size={16} 
              color={sortBy === 'new' ? "#0A84FF" : "#A0A0A0"} 
            />
            <Text style={[
              styles.sortText, 
              sortBy === 'new' && styles.activeSortText
            ]}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortOption, sortBy === 'top' && styles.activeSortOption]}
            onPress={() => handleSortChange('top')}
          >
            <Ionicons 
              name="trending-up" 
              size={16} 
              color={sortBy === 'top' ? "#30D158" : "#A0A0A0"} 
            />
            <Text style={[
              styles.sortText, 
              sortBy === 'top' && styles.activeSortText
            ]}>Top</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Content based on active tab */}
      {activeTab === 'posts' ? (
        <FlatList
          data={clubData.posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0A84FF"
              colors={["#0A84FF"]}
            />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      ) : (
        <ScrollView 
          style={styles.aboutContainer}
          contentContainerStyle={styles.aboutContent}
          showsVerticalScrollIndicator={false}
        >
          {/* About section */}
          <View style={styles.aboutSection}>
            <Text style={styles.aboutSectionTitle}>About Community</Text>
            <Text style={styles.aboutDescription}>{clubData.description}</Text>
            
            <View style={styles.aboutStats}>
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatValue}>{clubData.members.toLocaleString()}</Text>
                <Text style={styles.aboutStatLabel}>Members</Text>
              </View>
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatValue}>{clubData.onlineNow}</Text>
                <Text style={styles.aboutStatLabel}>Online</Text>
              </View>
              <View style={styles.aboutStat}>
                <Text style={styles.aboutStatValue}>
                  {new Date(clubData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.aboutStatLabel}>Created</Text>
              </View>
            </View>
          </View>
          
          {/* Rules section */}
          <TouchableOpacity 
            style={[
              styles.rulesHeader, 
              {
                marginBottom: showRules ? 0 : 16,
                borderBottomLeftRadius: showRules ? 0 : 12,
                borderBottomRightRadius: showRules ? 0 : 12,
              }
            ]} 
            onPress={handleToggleRules}
          >
            <Text style={styles.aboutSectionTitle}>Club Rules</Text>
            <Ionicons 
              name={showRules ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          {showRules && (
            <View style={styles.rulesContainer}>
              {clubData.rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Text style={styles.ruleNumber}>{index + 1}</Text>
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Moderators section */}
          <View style={styles.aboutSection}>
            <Text style={styles.aboutSectionTitle}>Moderators</Text>
            {clubData.moderators.map((mod, index) => (
              <View key={index} style={styles.moderatorItem}>
                <Image source={{ uri: mod.avatar }} style={styles.moderatorAvatar} />
                <View style={styles.moderatorInfo}>
                  <Text style={styles.moderatorName}>{mod.name}</Text>
                  {mod.isOwner && (
                    <View style={styles.ownerBadge}>
                      <Text style={styles.ownerBadgeText}>Owner</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
      
      {/* Create Post Button (only in posts tab) */}
      {activeTab === 'posts' && (
        <TouchableOpacity 
          style={styles.createPostButton}
          onPress={handleCreatePost}
        >
          <BlurView intensity={60} tint="dark" style={styles.createPostBlur}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'relative',
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 8 : 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 10,
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    position: 'absolute',
    bottom: 10,
    left: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  clubInfoSection: {
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#0A84FF',
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  clubStats: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  joinButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0A84FF',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinedButtonText: {
    color: '#0A84FF',
    marginRight: 4,
  },
  clubDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsScrollContent: {
    paddingVertical: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A0A0A0',
  },
  activeTabText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#1C1C1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeSortOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 4,
  },
  activeSortText: {
    color: '#FFFFFF',
  },
  postsContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  postCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  stickiedPost: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B3D',
  },
  postHeader: {
    padding: 12,
    paddingBottom: 6,
  },
  stickiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stickiedText: {
    fontSize: 12,
    color: '#FF6B3D',
    marginLeft: 4,
    fontWeight: '500',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  postAuthor: {
    fontSize: 13,
    color: '#FFFFFF',
    marginRight: 8,
  },
  postTime: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    marginRight: 6,
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 8,
  },
  videoIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  voteButton: {
    padding: 6,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 4,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    flex: 1,
  },
  commentCount: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 6,
  },
  shareButton: {
    padding: 6,
  },
  aboutContainer: {
    flex: 1,
  },
  aboutContent: {
    padding: 16,
    paddingBottom: 24,
  },
  aboutSection: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    marginBottom: 16,
  },
  aboutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutStat: {
    alignItems: 'center',
  },
  aboutStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aboutStatLabel: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  rulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  rulesContainer: {
    backgroundColor: '#1C1C1E',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#2C2C2E',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  ruleNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    color: '#0A84FF',
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  moderatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moderatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  moderatorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moderatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ownerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  ownerBadgeText: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '600',
  },
  createPostButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  createPostBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
  },
}); 