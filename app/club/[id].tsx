import ClubPostMessageBubble from '@/components/ui/ClubPostMessageBubble';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
// Import the new SessionCard from design system
import { SessionCard } from '@/components/design-system/cards';
import DateHeader from '@/components/ui/DateHeader';
import WorkoutPicker from '@/components/ui/WorkoutPicker';
import { useProfile } from '@/contexts/ProfileContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  mediaUrl?: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  attachedWorkout?: {
    id: string;
    title: string;
    exercises: number;
    duration: string;
    thumbnailUrl: string;
    sets: number;
  };
}

// --- Add Session Interface ---
interface Session {
  id: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string format
  location: string; // Could be "Online" or a physical address
  attendeeCount: number;
  host: {
    name: string;
    avatar?: string;
  };
  isAttending?: boolean; // For the current user
  isOnline: boolean;
  meetingUrl?: string; // If online
}
// --- End Session Interface ---

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
  sessions: Session[]; // Add sessions array
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
      tags: ['Form Check', 'Sprint'],
      attachedWorkout: {
        id: '1',
        title: 'Heavy Pull Day',
        exercises: 5,
        duration: '65 min',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
        sets: 36
      },
      mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
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
  isJoined: true,
  // --- Add Mock Sessions ---
  sessions: [
    {
      id: 's1',
      title: 'Live Q&A: Sprint Mechanics Breakdown',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // In 2 days
      location: 'Online',
      attendeeCount: 45,
      host: { name: 'Coach Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
      isAttending: false,
      isOnline: true,
      meetingUrl: 'https://zoom.us/j/1234567890'
    },
    {
      id: 's2',
      title: 'Group Agility Drills',
      description: 'Meet at the track for cone drills and reaction time practice.',
      dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // In 5 days
      location: 'Central Park Track',
      attendeeCount: 18,
      host: { name: 'Sarah Performance', avatar: 'https://i.pravatar.cc/150?img=5' },
      isAttending: true,
      isOnline: false,
    },
     {
      id: 's3',
      title: 'Form Check Friday (Online)',
      description: 'Submit your sprint videos for live feedback from the coaches.',
      dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // In 1 week
      location: 'Online',
      attendeeCount: 62,
      host: { name: 'Coach Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
      isAttending: false,
      isOnline: true,
    }
  ]
  // --- End Mock Sessions ---
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

const { width, height } = Dimensions.get('window');

// Define constants outside component
const HEADER_MAX_HEIGHT = height * 0.35;
const COMPACT_TITLE_CONTENT_HEIGHT = 44;
const TAB_BAR_HEIGHT = 56;
const CLUB_ICON_SIZE = 80;
// HEADER_MIN_HEIGHT and HEADER_SCROLL_DISTANCE will be calculated dynamically using insets

// --- Workout Preview Component (Defined Outside) ---
interface WorkoutPreviewProps {
  workout: any;
  onRemove: () => void;
}

const WorkoutPreview: React.FC<WorkoutPreviewProps> = ({ workout, onRemove }) => {
  if (!workout) return null;
  return (
    <View style={styles.previewContainer}>
      <BlurView intensity={30} tint="dark" style={styles.previewBlur}>
        <Ionicons name="barbell" size={20} color="#34C759" style={{ marginRight: 8 }} />
        <Text style={styles.previewText} numberOfLines={1}>Attached: {workout.title}</Text>
        <TouchableOpacity onPress={onRemove} style={styles.previewRemoveButton}>
          <Ionicons name="close-circle" size={18} color="#8E8E93" />
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentProfile } = useProfile();
  const clubData = mockClubData;

  // Calculate dynamic header heights (ensure this is before usage in animations)
  const HEADER_MIN_HEIGHT = useMemo(() => insets.top + COMPACT_TITLE_CONTENT_HEIGHT, [insets.top]);
  const HEADER_SCROLL_DISTANCE = useMemo(() => HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT, [HEADER_MIN_HEIGHT]);

  // Animated values
  const scrollY = useRef(new Animated.Value(0)).current;
  const postMenuScaleAnim = useRef(new Animated.Value(0)).current;
  const postMenuOpacityAnim = useRef(new Animated.Value(0)).current;
  const postBackdropOpacityAnim = useRef(new Animated.Value(0)).current;
  const postPlusButtonRotateAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const flatListRef = useRef<FlatList>(null); // Ensure FlatList specific ref is defined
  const scrollRef = useRef<ScrollView>(null); // For the main ScrollView

  // --- Re-add Missing States ---
  const [activeTab, setActiveTab] = useState<'posts' | 'sessions' | 'about'>('posts');
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [refreshing, setRefreshing] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isJoined, setIsJoined] = useState(clubData.isJoined);
  const [sessions, setSessions] = useState<Session[]>(clubData.sessions);
  const [commentText, setCommentText] = useState('');
  const [postMenuVisible, setPostMenuVisible] = useState(false);
  // --- These were missing: ---
  type ComposeAttachmentMode = 'none' | 'selectingWorkout' | 'workoutSelected';
  const [composeAttachmentMode, setComposeAttachmentMode] = useState<ComposeAttachmentMode>('none');
  const [attachedWorkoutPreview, setAttachedWorkoutPreview] = useState<any>(null);
  // --- End Re-add Missing States ---

  // --- Animations (use the dynamic HEADER_SCROLL_DISTANCE) ---
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerElementsOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // This will animate the tab bar from its initial position below the full header
  // to its sticky position just below the new compact title bar area.
  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE], // Correct: moves up by the scrolled distance
    extrapolate: 'clamp',
  });

  // --- Handlers ---
  const handleTabChange = useCallback((tab: 'posts' | 'sessions' | 'about') => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const handleJoinToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsJoined(!isJoined);
  };
  const handlePostPress = (postId: string) => { router.push(`/club/${id}/post/${postId}`); };
  const handleSessionPress = (sessionId: string) => { router.push(`/events/detail/${sessionId}`); };
  const handleCreatePost = () => { alert('Navigate to Create Post screen'); };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);
  const handleVote = (postId: string, isUpvote: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const handleToggleRules = () => { setShowRules(!showRules); };
  const handleBack = () => { router.back(); };

  // --- Re-add Missing Post Creation Menu Handlers & Types ---
  interface CreatePostOption {
      id: string;
      icon: keyof typeof Ionicons.glyphMap;
      label: string;
      color: string;
      action: () => void;
  }

  const togglePostMenu = useCallback(() => {
      const isShowing = !postMenuVisible;
      Haptics.impactAsync(isShowing ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
      const animations = [
        Animated.spring(postMenuScaleAnim, { toValue: isShowing ? 1 : 0, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(postMenuOpacityAnim, { toValue: isShowing ? 1 : 0, duration: 200, useNativeDriver: true }),
        Animated.timing(postBackdropOpacityAnim, { toValue: isShowing ? 1 : 0, duration: 200, useNativeDriver: true }),
        Animated.spring(postPlusButtonRotateAnim, { toValue: isShowing ? 1 : 0, tension: 50, friction: 5, useNativeDriver: true })
      ];
      if (isShowing) {
          setPostMenuVisible(true);
          Animated.parallel(animations).start();
      } else {
          Animated.parallel(animations).start(() => setPostMenuVisible(false));
      }
  }, [postMenuVisible]);

  const createPostOptions: CreatePostOption[] = useMemo(() => [
    {
      id: 'text',
      icon: 'text',
      label: 'Text Post',
      color: '#0A84FF',
      action: () => setComposeAttachmentMode('none'),
    },
    {
      id: 'workout',
      icon: 'barbell',
      label: 'Attach Workout',
      color: '#34C759',
      action: () => setComposeAttachmentMode('selectingWorkout'),
    },
  ], []);

  const handlePostOptionPress = useCallback((optionAction: () => void) => {
    togglePostMenu();
    setTimeout(() => { optionAction(); }, 250);
  }, [togglePostMenu]);

  const handleWorkoutSelect = useCallback((workout: any) => {
       setAttachedWorkoutPreview(workout);
       setComposeAttachmentMode('workoutSelected');
   }, []);

  // --- Re-add Data Grouping for Posts ---
  const groupPostsByDate = (posts: Post[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sections: { title: string; data: any[] }[] = [];
    const todayItems: any[] = [], yesterdayItems: any[] = [], olderItems: any[] = [];

    posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).forEach(post => {
      const itemDate = new Date(post.timestamp);
      const item = { type: 'post', data: post };
      if (itemDate.toDateString() === today.toDateString()) todayItems.push(item);
      else if (itemDate.toDateString() === yesterday.toDateString()) yesterdayItems.push(item);
      else olderItems.push(item);
    });

    if (todayItems.length > 0) sections.push({ title: 'Today', data: todayItems });
    if (yesterdayItems.length > 0) sections.push({ title: 'Yesterday', data: yesterdayItems });
    if (olderItems.length > 0) sections.push({ title: 'Earlier', data: olderItems });

    const flattenedData: any[] = [];
    sections.forEach(section => {
      flattenedData.push({ type: 'header', title: section.title });
      flattenedData.push(...section.data);
    });
    return flattenedData;
  };
  const groupedPostData = useMemo(() => groupPostsByDate(clubData.posts), [clubData.posts]);
  // --- End Data Grouping ---

  // --- Renderers ---
  const renderClubPostItem = ({ item }: { item: any }) => {
     if (item.type === 'header') {
         return <DateHeader date={item.title} />;
     }
     if (item.type === 'post') {
         const post = item.data as Post;
         return (
            <TouchableOpacity onPress={() => handlePostPress(post.id)} activeOpacity={0.9}>
                <ClubPostMessageBubble
                    id={post.id}
                    clubId={clubData.id}
                    clubName={clubData.name}
                    userName={post.author.name}
                    userAvatar={post.author.avatar}
                    date={formatRelativeTime(post.timestamp)}
                    content={post.content}
                    likes={post.upvotes}
                    comments={post.commentCount}
                    mediaUrl={post.images ? post.images[0] : post.videoUrl}
                />
            </TouchableOpacity>
         );
     }
     return null;
  };

  const renderAboutContent = () => (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.aboutContentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.aboutSection}>
        <Text style={styles.aboutSectionTitle}>Description</Text>
        <Text style={styles.aboutText}>{clubData.description}</Text>
        <View style={styles.tagsContainer}>
          {clubData.tags.map((tag, index) => (
            <View key={index} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
          ))}
        </View>
        <Text style={styles.creationDate}>Created {formatRelativeTime(clubData.createdAt)}</Text>
      </View>

      <View style={styles.rulesSection}>
        <TouchableOpacity style={styles.rulesTitleRow} onPress={handleToggleRules}>
          <Text style={styles.aboutSectionTitle}>Rules</Text>
          <Ionicons name={showRules ? "chevron-up" : "chevron-down"} size={20} color="#8E8E93" />
        </TouchableOpacity>
        {showRules && (
          <View style={styles.rulesList}>
            {clubData.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>{index + 1}.</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.moderatorsSection}>
        <Text style={styles.aboutSectionTitle}>Moderators</Text>
        {clubData.moderators.map((mod, index) => (
          <View key={index} style={styles.moderatorItem}>
            <Image source={{ uri: mod.avatar }} style={styles.moderatorAvatar} contentFit="cover"/>
            <View style={styles.moderatorInfo}>
              <Text style={styles.moderatorName}>{mod.name}</Text>
              {mod.isOwner && <View style={styles.ownerBadge}><Text style={styles.ownerBadgeText}>Owner</Text></View>}
            </View>
            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="mail-outline" size={20} color="#0A84FF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // --- Main Return ---
  return (
    <KeyboardAvoidingView style={styles.screenContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <StatusBar style="light" />

        <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
          <Animated.View style={[styles.headerBackground, { opacity: headerElementsOpacity }]}>
            <Image source={{ uri: clubData.bannerImage }} style={styles.headerImage} contentFit="cover"/>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)', '#000']} style={styles.gradient}/>
          </Animated.View>

          <Animated.View style={[styles.headerContent, { opacity: headerElementsOpacity }]}>
            <View style={styles.clubInfoContainer}>
              <Image source={{ uri: clubData.icon }} style={styles.clubIcon} contentFit="cover" />
              <Text style={styles.clubName}>{clubData.name}</Text>
              <Text style={styles.memberInfo}>{clubData.members.toLocaleString()} members • {clubData.onlineNow} online</Text>
              <TouchableOpacity style={[styles.headerJoinButton, isJoined && styles.joinedButton]} onPress={handleJoinToggle}>
                <Text style={styles.headerJoinButtonText}>{isJoined ? 'Joined' : 'Join'}</Text>
                {isJoined && <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{marginLeft: 4}}/>}
              </TouchableOpacity>
            </View>
          </Animated.View>

           {/* Compact Header - now respects HEADER_MIN_HEIGHT for its own height */}
           <Animated.View style={[
             styles.compactHeader,
             {
               opacity: compactTitleOpacity,
               height: HEADER_MIN_HEIGHT, // Dynamic height for the compact title bar area
               paddingTop: insets.top // Safe area taken by padding
            }
            ]}>
               <TouchableOpacity style={styles.compactBackButton} onPress={handleBack}>
                   <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
               </TouchableOpacity>
              <Text style={styles.compactTitle} numberOfLines={1}>{clubData.name}</Text>
               <TouchableOpacity style={styles.compactActionButton}>
                   <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
               </TouchableOpacity>
           </Animated.View>
        </Animated.View>

        {/* Tab Bar (Sticky) - Animates to sit below the compactHeader */}
        <Animated.View style={[
          styles.tabBarContainer,
          {
            top: HEADER_MAX_HEIGHT, // Correct initial position: below fully expanded header
            transform: [{ translateY: tabBarTranslateY }] // Animates upwards with scroll
          }
        ]}>
           <BlurView intensity={80} tint="dark" style={styles.tabBarBlur}>
              <TouchableOpacity style={[styles.tab, activeTab === 'posts' && styles.activeTab]} onPress={() => handleTabChange('posts')} activeOpacity={0.7}>
                 <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeTab === 'sessions' && styles.activeTab]} onPress={() => handleTabChange('sessions')} activeOpacity={0.7}>
                  <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>Sessions</Text>
              </TouchableOpacity>
               <TouchableOpacity style={[styles.tab, activeTab === 'about' && styles.activeTab]} onPress={() => handleTabChange('about')} activeOpacity={0.7}>
                  <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>About</Text>
              </TouchableOpacity>
           </BlurView>
        </Animated.View>

        {/* Main Content ScrollView */}
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.scrollViewStyle}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{
              paddingTop: HEADER_MAX_HEIGHT + TAB_BAR_HEIGHT, // Spacer for initial full header + tab bar
              paddingBottom: insets.bottom + (activeTab === 'posts' ? 70 : 20), // Adjust for compose bar
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
              progressViewOffset={HEADER_MAX_HEIGHT + TAB_BAR_HEIGHT}
            />
          }
        >
           {/* Conditional Rendering of Tab Content */}
           {activeTab === 'posts' && (
               <FlatList // Use FlatList for Posts tab content
                  data={groupedPostData}
                  renderItem={renderClubPostItem}
                  keyExtractor={(item, index) => item.type === 'header' ? `header-${item.title}` : `post-${item.data.id}`}
                  scrollEnabled={false} // IMPORTANT: Disable internal scrolling
                  ListHeaderComponent={null} // Remove inner ListHeaderComponent spacer
                  contentContainerStyle={styles.postsListContainer} // Padding specific to post list
                  ListEmptyComponent={() => ( <View style={styles.emptyListContainer}><Text style={styles.emptyListText}>No posts yet.</Text></View> )}
               />
           )}
           {activeTab === 'sessions' && (
               // Keep ScrollView + map approach for Sessions
               <View style={styles.listPadding}>
                  {sessions.length > 0 ? (
                      sessions.map(session => (
                          <SessionCard
                            key={session.id}
                            session={{
                              id: session.id,
                              title: session.title,
                              description: session.description,
                              dateTime: session.dateTime,
                              location: session.location,
                              attendeeCount: session.attendeeCount,
                              host: session.host,
                              isAttending: session.isAttending,
                              isOnline: session.isOnline,
                              meetingUrl: session.meetingUrl
                            }}
                            onPress={handleSessionPress}
                            onRsvp={(id, attending) => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                              Alert.alert('RSVP Clicked', `RSVP for ${session.title}`);
                            }}
                          />
                      ))
                  ) : (
                       <View style={styles.emptyListContainer}><Text style={styles.emptyListText}>No upcoming sessions.</Text></View>
                  )}
               </View>
           )}
          {activeTab === 'about' && (
               // Keep ScrollView + map approach for About
               <View style={styles.listPadding}>
                   {renderAboutContent()}
               </View>
          )}
        </Animated.ScrollView>

        {/* Re-Add Compose Bar / Picker / Menu Area (Conditional) */}
        {activeTab === 'posts' && (
            <View style={styles.composeAreaWrapper}>
                {/* Post Creation Menu (Absolute within wrapper) */}
                {postMenuVisible && (
                  <>
                      <Animated.View style={[styles.menuBackdrop, { opacity: postBackdropOpacityAnim }]}>
                          <TouchableOpacity style={styles.backdropPressable} onPress={togglePostMenu} />
                      </Animated.View>
                      <Animated.View style={[
                          styles.postMenu,
                          {
                              opacity: postMenuOpacityAnim,
                              transform: [{ scale: postMenuScaleAnim }],
                              bottom: 80 + insets.bottom // Dynamic position
                          }
                      ]}>
                         <BlurView intensity={70} tint="dark" style={styles.postMenuBlur}>
                              {createPostOptions.map((option) => (
                              <TouchableOpacity
                                  key={option.id}
                                  style={styles.postMenuOption}
                                  onPress={() => handlePostOptionPress(option.action)}
                                  activeOpacity={0.7}
                              >
                                  <View style={[styles.postOptionIconContainer, { backgroundColor: option.color }]}>
                                  <Ionicons name={option.icon} size={26} color="#FFFFFF" />
                                  </View>
                                  <Text style={styles.postOptionLabel}>{option.label}</Text>
                              </TouchableOpacity>
                              ))}
                          </BlurView>
                      </Animated.View>
                  </>
                )}

                {/* Compose Bar */}
                <View style={styles.composeContainer}>
                   <BlurView intensity={80} tint="dark" style={styles.composeBlur}>
                      {/* Workout Preview */}
                      {composeAttachmentMode === 'workoutSelected' && attachedWorkoutPreview && (
                          <WorkoutPreview
                             workout={attachedWorkoutPreview}
                             onRemove={() => {
                                 setAttachedWorkoutPreview(null);
                                 setComposeAttachmentMode('none');
                             }}
                          />
                      )}
                      {/* Input Row */}
                      <View style={styles.composeInputRow}>
                          {/* Animated Plus Button */}
                           <Animated.View style={{transform: [{ rotate: postPlusButtonRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg']}) }]}}>
                             <TouchableOpacity style={styles.composePlusButton} onPress={togglePostMenu} >
                                  <Ionicons name="add-circle" size={28} color="#0A84FF" />
                             </TouchableOpacity>
                          </Animated.View>
                          {/* TextInput */}
                           <View style={styles.composeInputContainer}>
                              <TextInput
                                  style={styles.composeTextInput}
                                  placeholder={attachedWorkoutPreview ? "Add a message..." : "New post in club..."}
                                  placeholderTextColor="#8E8E93"
                                  value={commentText}
                                  onChangeText={setCommentText}
                                  multiline
                              />
                          </View>
                           {/* Action Button */}
                           <TouchableOpacity style={styles.composeActionButton}>
                               <Ionicons name={(commentText || attachedWorkoutPreview) ? "arrow-up-circle" : "camera"} size={28} color="#0A84FF" />
                           </TouchableOpacity>
                      </View>
                   </BlurView>
                   {/* Bottom Inset Padding */}
                   <View style={{ height: insets.bottom }} />
                </View>

                {/* Workout Picker */}
                {composeAttachmentMode === 'selectingWorkout' && (
                    <WorkoutPicker
                        onSelect={handleWorkoutSelect}
                        onClose={() => setComposeAttachmentMode('none')}
                    />
                )}
            </View>
        )}

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
   screenContainer: {
     flex: 1,
     backgroundColor: '#000000',
   },
   safeAreaContainer: { // Added SafeArea container inside KAV
       flex: 1,
   },
   loadingContainer: { /* ... */ },
   loadingText: { /* ... */ },
  // Header Styles (Similar to ProfileScreen)
   headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    backgroundColor: '#000', // Collapsed header (compact title bar) background
  },
   headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
   headerImage: { width: '100%', height: '100%' },
   gradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
   headerContent: {
    position: 'absolute',
    bottom: 0, // Aligns to the bottom of its parent (the Animated.View with headerHeight)
    left: 0,
    right: 0,
    // Remove dynamic height: height: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
    // Content will be pushed up by paddingBottom, and clipped by parent's animated height.
    // It should only be visible in the expanded state due to opacity animation.
    paddingBottom: TAB_BAR_HEIGHT + 15, // Pushes content up from the very bottom of the expanded header
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    // Opacity is animated via headerElementsOpacity
  },
   clubInfoContainer: { alignItems: 'center' },
   clubIcon: {
    width: CLUB_ICON_SIZE,
    height: CLUB_ICON_SIZE,
    borderRadius: CLUB_ICON_SIZE / 2,
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 10,
  },
   clubName: {
    fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 4, textAlign: 'center',
  },
   memberInfo: {
    fontSize: 15, color: '#AAA', marginBottom: 16,
  },
   headerJoinButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0A84FF', paddingVertical: 10, paddingHorizontal: 25,
    borderRadius: 20, minWidth: 120,
  },
   joinedButton: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
   headerJoinButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },

  // Compact Header Styles
   compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // height is set dynamically to HEADER_MIN_HEIGHT in the component
    // paddingTop is set dynamically to insets.top in the component
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
   compactBackButton: { padding: 8 },
   compactTitle: {
    color: '#FFF', fontSize: 17, fontWeight: '600', textAlign: 'center', flex: 1, marginHorizontal: 5
  },
   compactActionButton: { padding: 8 },

  // Tab Bar Styles
   tabBarContainer: {
    position: 'absolute',
    // top: HEADER_MAX_HEIGHT, // Initial position now set inline with animation
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    zIndex: 5,
  },
   tabBarBlur: {
    width: '100%', height: '100%',
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
   tab: {
    flex: 1,
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
    color: '#8E8E93',
  },
   activeTabText: {
    color: '#FFFFFF',
  },

  // ScrollView/List Styles
  scrollViewStyle: {
      flex: 1,
      backgroundColor: '#000',
  },
   postsListContainer: { // Specific padding for the nested FlatList content
       paddingHorizontal: 0, // Let bubbles manage horizontal space
       paddingTop: 16,
       paddingBottom: 16, // Add some padding at the bottom of the list
   },
    emptyListContainer: {
        flex: 1,
        minHeight: 200, // Ensure empty state is visible
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyListText: {
        color: '#8E8E93',
        textAlign: 'center',
        fontSize: 15,
    },
  // Post item styles (if needed, ClubPostMessageBubble might handle it)
  // Session Card styles (already defined)
  // About Tab styles (already defined)

  // --- Styles for About Tab Content ---
   aboutContentContainer: {
       paddingHorizontal: 16,
       paddingBottom: 50 // Add appropriate padding
   },
  aboutSection: {
    marginBottom: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  aboutSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: '#E5E5EA',
    lineHeight: 22,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
      fontSize: 13,
      color: '#FFFFFF',
  },
  creationDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
  },
  rulesSection: {
    marginBottom: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  rulesTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rulesList: {
    marginTop: 8,
    paddingBottom: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  ruleNumber: {
    fontSize: 14,
    color: '#8E8E93',
    width: 20,
  },
  ruleText: {
    flex: 1,
    fontSize: 15,
    color: '#E5E5EA',
    lineHeight: 21,
  },
  moderatorsSection: {
     marginBottom: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  moderatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  moderatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  moderatorInfo: {
    flex: 1,
  },
  moderatorName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ownerBadge: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  ownerBadgeText: {
    fontSize: 11,
    color: '#FF453A',
    fontWeight: '600',
  },
  messageButton: {
    padding: 8,
  },
  // --- End About Tab Styles ---
  listPadding: { // Re-add this for Sessions/About tabs
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 50,
  },
  // --- Compose Bar Styles ---
  composeContainer: {
      borderTopWidth: 0.5,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
      backgroundColor: 'transparent',
  },
  composeAreaWrapper: { // New wrapper style
      // Takes space at the bottom, KAV pushes it up
      position: 'absolute', // Optional: if needed to overlay slightly
      bottom: 0,
      left: 0,
      right: 0,
  },
   menuBackdrop: {
    position: 'absolute',
    // Make backdrop cover the KAV area, not just composeAreaWrapper
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker backdrop
    zIndex: 15,
  },
  postMenu: {
    position: 'absolute',
    // bottom calculated dynamically inline now
    left: 16,
    right: 16,
    zIndex: 20,
    // Removed maxWidth, alignSelf - relies on left/right pinning
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  previewContainer: {
      paddingHorizontal: 12,
      paddingBottom: 8,
      paddingTop: 5, // Add padding above preview
  },
  previewBlur: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  previewText: {
      flex: 1,
      color: '#FFF',
      fontSize: 14,
      marginLeft: 8,
  },
  previewRemoveButton: {
      paddingLeft: 8,
  },
  composeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 5, // paddingTop handled by preview container or BlurView padding
  },
  composePlusButton: {
      paddingRight: 8,
      marginBottom: 5, // Align baseline with input
  },
  composeInputContainer: {
      flex: 1,
      backgroundColor: 'rgba(58, 58, 60, 0.8)',
      borderRadius: 20,
      minHeight: 36,
      maxHeight: 120,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'ios' ? 8 : 4, // Adjust padding per platform
      justifyContent: 'center',
  },
  composeTextInput: {
      color: '#FFFFFF',
      fontSize: 16,
      paddingTop: 0, // Reset default padding
      paddingBottom: 0,
  },
  composeActionButton: {
      paddingLeft: 8,
      marginBottom: 5, // Align baseline with input
  },
  postMenuBlur: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  postMenuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  postOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postOptionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  composeBlur: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  backdropPressable: { // Added missing style
    flex: 1,
    width: '100%',
    height: '100%',
  },
});