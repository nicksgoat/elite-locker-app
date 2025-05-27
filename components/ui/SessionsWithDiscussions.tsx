import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  date: string;
  duration: number;
  type: 'virtual' | 'in_person';
  location?: string;
  instructor: string;
  attendees: number;
  capacity: number;
  description: string;
}

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
  category?: string;
}

interface SessionItem {
  id: string;
  type: 'event' | 'discussion';
  data: Event | Post;
  timestamp: string;
}

interface SessionsWithDiscussionsProps {
  clubId?: string;
}

// Mock data
const eventsData: Event[] = [
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
  },
  {
    id: 'e3',
    title: 'Recovery & Mobility Session',
    date: '2023-05-20T09:00:00',
    duration: 45,
    type: 'virtual',
    instructor: 'Coach Mike',
    attendees: 18,
    capacity: 40,
    description: 'Focus on recovery techniques and mobility work to improve performance and reduce injury risk.'
  },
];

const discussionPosts: Post[] = [
  {
    id: 'd1',
    title: 'Best warmup routine for speed training?',
    content: 'What\'s everyone\'s go-to warmup before speed sessions? I\'ve been doing dynamic stretches but wondering if there\'s something better.',
    author: {
      name: 'Alex Rodriguez',
      avatar: 'https://i.pravatar.cc/150?img=12',
      isVerified: false,
    },
    timestamp: '2023-05-14T10:30:00',
    upvotes: 15,
    downvotes: 2,
    commentCount: 8,
    category: 'Training Tips',
    tags: ['warmup', 'speed', 'preparation'],
  },
  {
    id: 'd2',
    title: 'Speed improvements after 6 weeks',
    content: 'Just wanted to share my progress! Started with a 5.8s 40-yard dash and now I\'m at 5.4s. The program really works! 🏃‍♂️⚡',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isVerified: false,
    },
    timestamp: '2023-05-13T15:45:00',
    upvotes: 42,
    downvotes: 0,
    commentCount: 15,
    category: 'Progress',
    tags: ['progress', 'results', 'improvement'],
    isStickied: true,
  },
  {
    id: 'd3',
    title: 'Nutrition for speed athletes',
    content: 'Does anyone have recommendations for pre-workout nutrition specifically for speed training? Looking for something that gives sustained energy without causing stomach issues.',
    author: {
      name: 'Mike Chen',
      avatar: 'https://i.pravatar.cc/150?img=33',
      isVerified: false,
    },
    timestamp: '2023-05-12T08:20:00',
    upvotes: 28,
    downvotes: 1,
    commentCount: 12,
    category: 'Nutrition',
    tags: ['nutrition', 'pre-workout', 'diet'],
  },
];

const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Event Item component
const EventItem: React.FC<{ event: Event }> = ({ event }) => {
  const isVirtual = event.type === 'virtual';
  const attendancePercentage = (event.attendees / event.capacity) * 100;
  const router = useRouter();
  
  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/events/detail/${event.id}`);
  };
  
  const handleEventPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/events/detail/${event.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={styles.eventItem} 
      activeOpacity={0.9}
      onPress={handleEventPress}
    >
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDateDay}>
          {new Date(event.date).getDate()}
        </Text>
        <Text style={styles.eventDateMonth}>
          {new Date(event.date).toLocaleString('default', { month: 'short' })}
        </Text>
      </View>
      <View style={styles.eventDetails}>
        <View style={styles.eventTitleRow}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={[
            styles.eventTypeBadge, 
            { backgroundColor: isVirtual ? '#0A84FF20' : '#30D15820' }
          ]}>
            <Text style={[
              styles.eventTypeText, 
              { color: isVirtual ? '#0A84FF' : '#30D158' }
            ]}>
              {isVirtual ? 'Virtual' : 'In Person'}
            </Text>
          </View>
        </View>
        <Text style={styles.eventTime}>
          {formatEventDate(event.date)} • {event.duration} min
        </Text>
        <Text style={styles.eventInstructor}>
          Instructor: <Text style={styles.instructorName}>{event.instructor}</Text>
        </Text>
        <View style={styles.eventAttendance}>
          <View style={styles.attendanceBar}>
            <View 
              style={[
                styles.attendanceFill, 
                { width: `${attendancePercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.attendanceText}>
            {event.attendees}/{event.capacity} spots filled
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegister}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Discussion Post component
const DiscussionPost: React.FC<{ post: Post; clubId?: string }> = ({ post, clubId = '1' }) => {
  const [isUpvoted, setIsUpvoted] = useState(post.isUpvoted || false);
  const [isDownvoted, setIsDownvoted] = useState(post.isDownvoted || false);
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const router = useRouter();

  const handleUpvote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isUpvoted) {
      setIsUpvoted(false);
      setUpvotes(prev => prev - 1);
    } else {
      setIsUpvoted(true);
      setUpvotes(prev => prev + 1);
      if (isDownvoted) {
        setIsDownvoted(false);
        setDownvotes(prev => prev - 1);
      }
    }
  };

  const handleDownvote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isDownvoted) {
      setIsDownvoted(false);
      setDownvotes(prev => prev - 1);
    } else {
      setIsDownvoted(true);
      setDownvotes(prev => prev + 1);
      if (isUpvoted) {
        setIsUpvoted(false);
        setUpvotes(prev => prev - 1);
      }
    }
  };

  const handlePostPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${clubId}/post/${post.id}`);
  };

  return (
    <TouchableOpacity 
      style={[styles.discussionPost, post.isStickied && styles.stickyPost]} 
      onPress={handlePostPress}
      activeOpacity={0.9}
    >
      <BlurView intensity={20} tint="dark" style={styles.discussionBlur}>
        <View style={styles.discussionContent}>
          {post.isStickied && (
            <View style={styles.stickyBadge}>
              <Ionicons name="pin" size={12} color="#FF9500" />
              <Text style={styles.stickyText}>Pinned</Text>
            </View>
          )}
          
          <View style={styles.discussionHeader}>
            <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
            <View style={styles.authorInfo}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                {post.author.isVerified && (
                  <Ionicons name="checkmark-circle" size={14} color="#0A84FF" />
                )}
              </View>
              <Text style={styles.postTime}>{formatRelativeTime(post.timestamp)}</Text>
            </View>
            {post.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{post.category}</Text>
              </View>
            )}
          </View>

          <Text style={styles.discussionTitle}>{post.title}</Text>
          <Text style={styles.discussionContentText}>{post.content}</Text>

          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.discussionActions}>
            <TouchableOpacity 
              style={styles.voteButton} 
              onPress={handleUpvote}
            >
              <Ionicons 
                name={isUpvoted ? "arrow-up" : "arrow-up-outline"} 
                size={18} 
                color={isUpvoted ? "#30D158" : "#8E8E93"} 
              />
              <Text style={[styles.voteText, isUpvoted && { color: "#30D158" }]}>
                {upvotes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.voteButton} 
              onPress={handleDownvote}
            >
              <Ionicons 
                name={isDownvoted ? "arrow-down" : "arrow-down-outline"} 
                size={18} 
                color={isDownvoted ? "#FF453A" : "#8E8E93"} 
              />
              <Text style={[styles.voteText, isDownvoted && { color: "#FF453A" }]}>
                {downvotes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.commentButton}>
              <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
              <Text style={styles.commentText}>{post.commentCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

export default function SessionsWithDiscussions({ clubId }: SessionsWithDiscussionsProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'discussions'>('events');
  const router = useRouter();

  const handleTabChange = (tab: 'events' | 'discussions') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleCreateEvent = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/events/create');
  };

  const handleCreateDiscussion = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/club/${clubId}/create-post`);
  };

  const renderTabHeader = () => (
    <View style={styles.tabHeader}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => handleTabChange('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discussions' && styles.activeTab]}
          onPress={() => handleTabChange('discussions')}
        >
          <Text style={[styles.tabText, activeTab === 'discussions' && styles.activeTabText]}>
            Discussions
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.createButton}
        onPress={activeTab === 'events' ? handleCreateEvent : handleCreateDiscussion}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'events') {
      return (
        <FlatList
          data={eventsData}
          renderItem={({ item }) => <EventItem event={item} />}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      );
    } else {
      return (
        <FlatList
          data={discussionPosts}
          renderItem={({ item }) => <DiscussionPost post={item} clubId={clubId} />}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderTabHeader()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.1)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    borderRadius: 20,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  activeTab: {
    backgroundColor: '#0A84FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#0A84FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Event styles
  eventItem: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginTop: 12,
    flexDirection: 'row',
  },
  eventDateBadge: {
    width: 50,
    height: 60,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDateDay: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventDateMonth: {
    fontSize: 14,
    color: '#8E8E93',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 6,
  },
  eventInstructor: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  instructorName: {
    color: '#0A84FF',
    fontWeight: '500',
  },
  eventAttendance: {
    marginBottom: 12,
  },
  attendanceBar: {
    height: 4,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  attendanceFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 2,
  },
  attendanceText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  registerButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Discussion styles
  discussionPost: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    marginBottom: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  stickyPost: {
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  discussionBlur: {
    overflow: 'hidden',
  },
  discussionContent: {
    padding: 16,
  },
  stickyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  stickyText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '500',
    marginLeft: 4,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
  },
  postTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '500',
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  discussionContentText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  discussionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  voteText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  commentText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  shareButton: {
    marginLeft: 'auto',
  },
}); 