import ClubPostMessageBubble from '../../components/ui/ClubPostMessageBubble';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
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
import ClubEditModal from '../../components/club/ClubEditModal';
import { SessionCard } from '../../components/design-system/cards';
import DateHeader from '../../components/ui/DateHeader';
import WorkoutPicker from '../../components/ui/WorkoutPicker';
import { useProfile } from '../../contexts/ProfileContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Import ClubTabs for the Feed tab
import ClubTabs from '../../components/ui/ClubTabs';
import SessionsWithDiscussions from '../../components/ui/SessionsWithDiscussions';
import Leaderboards from '../../components/ui/Leaderboards';
// import SessionsTab from '@/components/ui/SessionsTab'; // Temporarily commented for build fix

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
  isLiked?: boolean;
  likeCount?: number;
  authorId?: string;
  clubId?: string;
  createdAt?: Date;
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
  imageUrl?: string; // For backward compatibility
  tags: string[];
  rules: string[];
  moderators: {
    name: string;
    avatar: string;
    isOwner?: boolean;
  }[];
  posts: Post[];
  isJoined: boolean;
  sessions: Session[]; // Sessions array
  memberCount?: number; // For backward compatibility
  postCount?: number; // For backward compatibility
  price?: number; // For monetization
  isSubscribed?: boolean; // For monetization
  feedItems?: any[]; // For club feed items from ClubTabs
  events?: any[]; // For events from ClubTabs
  leaderboards?: any[]; // For leaderboards from ClubTabs
}

// Mock data for the Sulek Lifting Club
const mockSulekClubData: ClubData = {
  id: 'sulek-lifting',
  name: 'NFL Speed Academy',
  description: 'Professional speed and agility training for athletes looking to improve their performance. Share your training videos, ask questions, and connect with other speed-focused athletes.',
  members: 1234,
  onlineNow: 42,
  createdAt: '2021-06-15T00:00:00Z',
  bannerImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  icon: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
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
      name: 'Devon Allen',
      avatar: 'devon_allen/profile.jpg',
      isOwner: true
    },
    {
      name: 'Coach Devon Allen',
      avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg'
    }
  ],
  posts: [
    {
      id: 'sp1',
      title: 'Welcome to NFL Speed Academy!',
      content: 'Welcome to our community! This is the place to discuss all things related to speed development, share your progress, and get feedback from coaches and peers.',
      author: {
        name: 'Coach Devon Allen',
        avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
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
      id: 'sp2',
      title: 'Form Check: My 40-yard dash technique',
      content: 'I\'ve been working on my start position and first 10 yards. Would appreciate some feedback on my form!',
      author: {
        name: 'SpeedSeeker23',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        isVerified: false
      },
      timestamp: '2023-05-12T08:45:00Z',
      upvotes: 32,
      downvotes: 0,
      commentCount: 15,
      images: ['https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
      isUpvoted: false
    }
  ],
  isJoined: true,
  sessions: [
    {
      id: 'ss1',
      title: 'Live Q&A: Speed Training Techniques',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Online',
      attendeeCount: 52,
      host: { name: 'Coach Devon Allen', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg' },
      isAttending: false,
      isOnline: true,
      meetingUrl: 'https://zoom.us/j/9876543210'
    }
  ],
  memberCount: 1234,
  postCount: 2,
  imageUrl: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
  price: 9.99,
  isSubscribed: true
};

// Mock data for the default club
const mockDefaultClubData: ClubData = {
  id: '1',
  name: 'EliteSpeed Academy',
  description: 'Professional speed and agility training for athletes looking to improve their performance. Share your training videos, ask questions, and connect with other speed-focused athletes.',
  members: 1234,
  onlineNow: 42,
  createdAt: '2021-06-15T00:00:00Z',
  bannerImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
  icon: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
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
      name: 'Coach Devon Allen',
      avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
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
        name: 'Coach Devon Allen',
        avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg',
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
        avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2',
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
        thumbnailUrl: 'https://www.si.com/.image/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/MTk5MTMzNzI1MDQzMjA1OTA1/devon-allen.jpg',
        sets: 36
      },
      mediaUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
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
      host: { name: 'Coach Devon Allen', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg' },
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
      host: { name: 'Coach Devon Allen', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg' },
      isAttending: false,
      isOnline: true,
    }
  ],
  // --- End Mock Sessions ---
  memberCount: 1234, // Same as members for consistency
  postCount: 5, // Number of posts in the club
  imageUrl: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg', // Same as icon for backward compatibility
  price: 9.99, // Monthly subscription price
  isSubscribed: false, // Whether the current user is subscribed

  // Import feed items from ClubTabs
  feedItems: [
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
    }
  ],

  // Import events from ClubTabs
  events: [
    {
      id: 'e1',
      title: 'HIIT Speed Workout',
      date: '2023-05-15T18:00:00',
      duration: 60,
      type: 'virtual',
      instructor: 'Coach Mike',
      attendees: 24,
      capacity: 30,
      description: 'High-intensity interval training focused on explosive speed and power development.'
    },
    {
      id: 'e2',
      title: 'Acceleration Fundamentals',
      date: '2023-05-18T17:30:00',
      duration: 90,
      type: 'in_person',
      location: 'Elite Training Center',
      instructor: 'Coach Sara',
      attendees: 12,
      capacity: 20,
      description: 'Master the basics of acceleration with drills and technique work to improve your starting speed.'
    }
  ],

  // Import leaderboards from ClubTabs
  leaderboards: [
    {
      category: 'Most Workouts Completed',
      timeFrame: 'This Month',
      leaders: [
        { rank: 1, name: 'Sarah Johnson', value: 28, avatar: 'https://i.pravatar.cc/150?img=5' },
        { rank: 2, name: 'Jason Miller', value: 24, avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2' },
        { rank: 3, name: 'Emma Davis', value: 22, avatar: 'https://i.pravatar.cc/150?img=23' }
      ]
    }
  ]
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
const HEADER_MAX_HEIGHT = height * 0.4; // Increased from 0.35 to 0.4 to give more space
const COMPACT_TITLE_CONTENT_HEIGHT = 44;
const TAB_BAR_HEIGHT = 56;
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
  const { currentProfile, currentProfileClubs } = useProfile();

  // Check if this club is on the user's profile (which means they own it)
  // Special handling for 'sulek-lifting' club which appears on the profile page
  const isClubOnUserProfile = id === 'sulek-lifting' || currentProfileClubs.some(club => club.id === id);

  // Select the appropriate mock data based on the club ID
  const mockClubData = id === 'sulek-lifting' ? mockSulekClubData : mockDefaultClubData;

  // Create a copy of the club data to modify
  const clubData = { ...mockClubData };

  // If this club is on the user's profile, make the current user the owner
  if (isClubOnUserProfile && currentProfile) {
    // Check if the current user is already in the moderators list
    const currentUserModIndex = clubData.moderators.findIndex(mod => mod.name === currentProfile.name);

    if (currentUserModIndex >= 0) {
      // User is already a moderator, make them the owner
      clubData.moderators = clubData.moderators.map((mod, index) => ({
        ...mod,
        isOwner: index === currentUserModIndex
      }));
    } else {
      // User is not a moderator, add them as the owner
      clubData.moderators = [
        {
          name: currentProfile.name,
          avatar: currentProfile.avatarUrl,
          isOwner: true
        },
        ...clubData.moderators.map(mod => ({
          ...mod,
          isOwner: false
        }))
      ];
    }
  }

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
  const [activeTab, setActiveTab] = useState<'feed' | 'sessions' | 'about'>('feed');
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
  // --- Club Edit Modal State ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedClubData, setEditedClubData] = useState<ClubData>(clubData);

  // --- Enhanced session management ---
  const [sessionFilters, setSessionFilters] = useState({
    timeFilter: 'upcoming' as 'all' | 'upcoming' | 'live' | 'past',
    categoryFilter: 'all' as 'all' | 'workout' | 'workshop' | 'competition' | 'social',
    hostFilter: 'all' as 'all' | 'me' | 'others'
  });

  const [showCreateSession, setShowCreateSession] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    dateTime: new Date(),
    location: '',
    isOnline: true,
    maxAttendees: 20,
    price: 0,
    isPaid: false
  });

  // Enhanced session filtering
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Filter by time
    const now = new Date();
    switch (sessionFilters.timeFilter) {
      case 'upcoming':
        filtered = filtered.filter(session => new Date(session.dateTime) > now);
        break;
      case 'live':
        filtered = filtered.filter(session => {
          const sessionDate = new Date(session.dateTime);
          const diffMs = Math.abs(sessionDate.getTime() - now.getTime());
          const diffMinutes = Math.floor(diffMs / 1000 / 60);
          return diffMinutes < 30;
        });
        break;
      case 'past':
        filtered = filtered.filter(session => new Date(session.dateTime) < now);
        break;
    }

    // Filter by host (if user is a moderator/owner)
    if (sessionFilters.hostFilter !== 'all' && currentProfile) {
      switch (sessionFilters.hostFilter) {
        case 'me':
          filtered = filtered.filter(session => session.host.name === currentProfile.name);
          break;
        case 'others':
          filtered = filtered.filter(session => session.host.name !== currentProfile.name);
          break;
      }
    }

    return filtered;
  }, [sessions, sessionFilters, currentProfile]);

  // Update editedClubData when component mounts or id changes
  // Using JSON.stringify to create a stable dependency
  useEffect(() => {
    setEditedClubData(clubData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, JSON.stringify(clubData.moderators)]);
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
  const handleTabChange = useCallback((tab: 'feed' | 'sessions' | 'about') => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const handleJoinToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsJoined(!isJoined);
  };

  // Handle opening the edit modal
  const handleEditClub = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditModalVisible(true);
  };

  // Handle saving club edits
  const handleSaveClubEdits = async (updatedClub: Partial<any>) => {
    try {
      // In a real app, this would call an API to update the club
      console.log('Saving club changes:', updatedClub);

      // Preserve the moderators from the current club data
      const updatedClubWithModerators = {
        ...updatedClub,
        moderators: clubData.moderators // Keep the original moderators
      };

      // Update the local state with the changes
      setEditedClubData(prevData => ({
        ...prevData,
        ...updatedClubWithModerators
      }));

      // Show success message
      Alert.alert('Success', 'Club details updated successfully');

      return Promise.resolve();
    } catch (error) {
      console.error('Error saving club:', error);
      Alert.alert('Error', 'Failed to update club details. Please try again.');
      return Promise.reject(error);
    }
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

    // Update the post's vote count
    const updatedPosts = clubData.posts.map(post => {
      if (post.id === postId) {
        if (isUpvote) {
          const isUpvoted = !post.isUpvoted;
          const upvotes = isUpvoted ? post.upvotes + 1 : post.upvotes - 1;
          return { ...post, isUpvoted, upvotes };
        } else {
          const isDownvoted = !post.isDownvoted;
          const downvotes = isDownvoted ? post.downvotes + 1 : post.downvotes - 1;
          return { ...post, isDownvoted, downvotes };
        }
      }
      return post;
    });

    // In a real app, this would update the state and make an API call
    console.log('Updated post votes', updatedPosts);
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
        <Text style={styles.aboutText}>{editedClubData.description}</Text>
        <View style={styles.tagsContainer}>
          {editedClubData.tags.map((tag, index) => (
            <View key={index} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
          ))}
        </View>
        <Text style={styles.creationDate}>Created {formatRelativeTime(editedClubData.createdAt)}</Text>
      </View>

      <View style={styles.rulesSection}>
        <TouchableOpacity style={styles.rulesTitleRow} onPress={handleToggleRules}>
          <Text style={styles.aboutSectionTitle}>Rules</Text>
          <Ionicons name={showRules ? "chevron-up" : "chevron-down"} size={20} color="#8E8E93" />
        </TouchableOpacity>
        {showRules && (
          <View style={styles.rulesList}>
            {editedClubData.rules.map((rule, index) => (
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
        {editedClubData.moderators.map((mod, index) => (
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

      {/* Add Leaderboards Section */}
      <View style={styles.leaderboardsSection}>
        <Leaderboards />
      </View>
    </ScrollView>
  );

  const handleCreateSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCreateSession(true);
  };

  const handleSaveSession = () => {
    const sessionToAdd: Session = {
      id: `session-${Date.now()}`,
      title: newSession.title,
      description: newSession.description,
      dateTime: newSession.dateTime.toISOString(),
      location: newSession.isOnline ? 'Online' : newSession.location,
      attendeeCount: 1, // Host is automatically attending
      host: {
        name: currentProfile?.name || 'You',
        avatar: currentProfile?.avatarUrl
      },
      isAttending: true,
      isOnline: newSession.isOnline,
      meetingUrl: newSession.isOnline ? 'https://zoom.us/j/generated' : undefined
    };

    setSessions(prev => [...prev, sessionToAdd]);
    setShowCreateSession(false);
    setNewSession({
      title: '',
      description: '',
      dateTime: new Date(),
      location: '',
      isOnline: true,
      maxAttendees: 20,
      price: 0,
      isPaid: false
    });

    Alert.alert('Success', 'Session created successfully!');
  };

  const tabs = [
    { 
      key: 'feed', 
      title: 'Feed', 
      icon: 'pulse' as keyof typeof Ionicons.glyphMap
    },
    { 
      key: 'sessions', 
      title: 'Sessions', 
      icon: 'calendar' as keyof typeof Ionicons.glyphMap
    },
    { 
      key: 'about', 
      title: 'About', 
      icon: 'information-circle' as keyof typeof Ionicons.glyphMap
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <ClubTabs clubId={clubData.id} />;
      case 'sessions':
        return <SessionsWithDiscussions clubId={clubData.id} />;
      case 'about':
        return renderAboutContent();
      default:
        return <ClubTabs clubId={clubData.id} />;
    }
  };

  // --- Main Return ---
  return (
    <KeyboardAvoidingView style={styles.screenContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={styles.safeAreaContainer}>
        <StatusBar style="light" />

        <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
          <Animated.View style={[styles.headerBackground, { opacity: headerElementsOpacity }]}>
            <Image source={{ uri: editedClubData.bannerImage }} style={styles.headerImage} contentFit="cover"/>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)', '#000']} style={styles.gradient}/>
          </Animated.View>

          <Animated.View style={[styles.headerContent, { opacity: headerElementsOpacity }]}>
            <View style={styles.clubInfoContainer}>
              <Text style={styles.clubName}>{editedClubData.name}</Text>
              <Text style={styles.memberInfo}>{editedClubData.members.toLocaleString()} members • {editedClubData.onlineNow} online</Text>

              <View style={styles.headerButtonsContainer}>
                {/* Edit button - shown if user is a moderator, owner, or if the club is on their profile */}
                {(clubData.moderators.some(mod => mod.name === currentProfile?.name || (mod.isOwner && currentProfile?.name === mod.name)) || isClubOnUserProfile) && (
                  <TouchableOpacity
                    style={styles.headerEditButton}
                    onPress={handleEditClub}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}

                {/* Join/Leave button */}
                <TouchableOpacity
                  style={[styles.headerJoinButton, isJoined && styles.joinedButton]}
                  onPress={handleJoinToggle}
                  activeOpacity={0.7}
                >
                  <Text style={styles.headerJoinButtonText}>{isJoined ? 'Joined' : 'Join'}</Text>
                  {isJoined && <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{marginLeft: 4}}/>}
                </TouchableOpacity>
              </View>
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
              <Text style={styles.compactTitle} numberOfLines={1}>{editedClubData.name}</Text>
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
              <TouchableOpacity style={[styles.tab, activeTab === 'feed' && styles.activeTab]} onPress={() => handleTabChange('feed')} activeOpacity={0.7}>
                 <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>Feed</Text>
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
              paddingBottom: insets.bottom + (activeTab === 'sessions' ? 70 : 20), // Adjust for compose bar
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
           {renderTabContent()}
        </Animated.ScrollView>

        {/* Re-Add Compose Bar / Picker / Menu Area (Conditional) */}
        {activeTab === 'sessions' && (
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

      {/* Club Edit Modal */}
      <ClubEditModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        clubData={{
          id: editedClubData.id,
          name: editedClubData.name,
          description: editedClubData.description,
          bannerImage: editedClubData.bannerImage,
          icon: editedClubData.icon,
          tags: editedClubData.tags,
          rules: editedClubData.rules,
          price: editedClubData.price,
          isPremium: editedClubData.price !== undefined && editedClubData.price > 0,
          // Don't pass moderators to avoid circular updates
        }}
        onSave={handleSaveClubEdits}
      />
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
    // Content will be pushed up by paddingBottom, and clipped by parent's animated height.
    // It should only be visible in the expanded state due to opacity animation.
    paddingBottom: TAB_BAR_HEIGHT + 15, // Pushes content up from the very bottom of the expanded header
    paddingTop: 60, // Added more padding at the top to move content lower
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    // Opacity is animated via headerElementsOpacity
  },
   clubInfoContainer: {
    alignItems: 'center',
    marginTop: 40, // Added margin to move content lower
  },
   // Removed clubIcon style as we're not using it anymore
   clubName: {
    fontSize: 28, // Increased font size for better visibility
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8, // Increased margin for better spacing
    textAlign: 'center',
  },
   memberInfo: {
    fontSize: 16, // Increased font size slightly
    color: '#AAA',
    marginBottom: 20, // Increased margin for better spacing
  },
   headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
   headerEditButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  feedTabContainer: {
      flex: 1,
      paddingTop: 0, // ClubTabs has its own padding
  },
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
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createDiscussionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#0A84FF',
    borderRadius: 12,
  },
  createDiscussionText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  discussionCategories: {
    padding: 12,
  },
  categoriesScroll: {
    padding: 8,
  },
  categoryChip: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#0A84FF',
    borderRadius: 12,
    marginRight: 8,
  },
  categoryChipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyDiscussions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyDiscussionsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyDiscussionsSubtitle: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
  },
  startDiscussionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#0A84FF',
    borderRadius: 12,
  },
  startDiscussionButtonText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionsContainer: {
    padding: 12,
  },
  sessionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  createSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#30D158',
    borderRadius: 12,
  },
  createSessionText: {
    color: '#30D158',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  sessionItemContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sessionDate: {
    fontSize: 13,
    color: '#8E8E93',
  },
  sessionLocation: {
    fontSize: 13,
    color: '#8E8E93',
  },
  sessionAttendees: {
    fontSize: 13,
    color: '#8E8E93',
  },
  sessionRSVPButton: {
    padding: 8,
  },
  sessionRSVPText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySubtext: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
  },
  leaderboardsSection: {
    marginBottom: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
});