import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

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

interface LeaderboardEntry {
  rank: number;
  name: string;
  value: string | number;
  avatar: string;
}

interface LeaderboardCategory {
  category: string;
  timeFrame: string;
  leaders: LeaderboardEntry[];
}

// Mock data for Feed tab
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
];

// Mock events data
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
  {
    id: 'e4',
    title: 'Sprint Mechanics Workshop',
    date: '2023-05-25T16:00:00',
    duration: 120,
    type: 'in_person',
    location: 'City Sports Field',
    instructor: 'Coach Mike',
    attendees: 8,
    capacity: 15,
    description: 'Detailed breakdown of sprint mechanics with video analysis and personalized feedback.'
  },
];

// Mock leaderboard data
const leaderboardData: LeaderboardCategory[] = [
  {
    category: 'Most Workouts Completed',
    timeFrame: 'This Month',
    leaders: [
      { rank: 1, name: 'Sarah Johnson', value: 28, avatar: 'https://i.pravatar.cc/150?img=5' },
      { rank: 2, name: 'Jason Miller', value: 24, avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2' },
      { rank: 3, name: 'Emma Davis', value: 22, avatar: 'https://i.pravatar.cc/150?img=23' },
      { rank: 4, name: 'Michael Brown', value: 21, avatar: 'https://i.pravatar.cc/150?img=68' },
      { rank: 5, name: 'Olivia Wilson', value: 19, avatar: 'https://i.pravatar.cc/150?img=47' },
    ]
  },
  {
    category: 'Highest Speed Recorded',
    timeFrame: 'All Time',
    leaders: [
      { rank: 1, name: 'Jason Miller', value: '24.8 mph', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2' },
      { rank: 2, name: 'Michael Brown', value: '24.2 mph', avatar: 'https://i.pravatar.cc/150?img=68' },
      { rank: 3, name: 'Emma Davis', value: '23.9 mph', avatar: 'https://i.pravatar.cc/150?img=23' },
      { rank: 4, name: 'Sarah Johnson', value: '23.5 mph', avatar: 'https://i.pravatar.cc/150?img=5' },
      { rank: 5, name: 'Olivia Wilson', value: '22.7 mph', avatar: 'https://i.pravatar.cc/150?img=47' },
    ]
  },
  {
    category: 'Most Consistent',
    timeFrame: 'This Quarter',
    leaders: [
      { rank: 1, name: 'Emma Davis', value: '95%', avatar: 'https://i.pravatar.cc/150?img=23' },
      { rank: 2, name: 'Sarah Johnson', value: '92%', avatar: 'https://i.pravatar.cc/150?img=5' },
      { rank: 3, name: 'Olivia Wilson', value: '88%', avatar: 'https://i.pravatar.cc/150?img=47' },
      { rank: 4, name: 'Jason Miller', value: '85%', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2' },
      { rank: 5, name: 'Michael Brown', value: '82%', avatar: 'https://i.pravatar.cc/150?img=68' },
    ]
  }
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

// Feed Item component
const FeedItem: React.FC<{ item: FeedItem }> = ({ item }) => {
  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Liked", `You liked this post from ${item.user.name}`);
  };
  
  const handleComment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Comments", `Viewing comments for post ${item.id}`);
  };
  
  const handleOpenPost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.type === 'workout_log') {
      Alert.alert("Workout Log", `Viewing workout log ${item.content.workout_name}`);
    } else if (item.type === 'announcement') {
      Alert.alert("Announcement", `Viewing announcement: ${item.content.title}`);
    } else if (item.type === 'new_content') {
      Alert.alert("Content", `Viewing content: ${item.content.title}`);
    }
  };
  
  const handleViewProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Profile", `Viewing ${item.user.name}'s profile`);
  };
  
  return (
    <TouchableOpacity 
      style={styles.feedItem} 
      activeOpacity={0.9}
      onPress={handleOpenPost}
    >
      <View style={styles.feedHeader}>
        <TouchableOpacity onPress={handleViewProfile}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        </TouchableOpacity>
        <View style={styles.feedHeaderText}>
          <View style={styles.nameContainer}>
            <TouchableOpacity onPress={handleViewProfile}>
              <Text style={styles.userName}>{item.user.name}</Text>
            </TouchableOpacity>
            {item.user.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#0A84FF" style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.timestamp}>{formatDate(item.content.date)}</Text>
        </View>
      </View>
      
      {item.type === 'workout_log' && (
        <View style={styles.workoutLogContent}>
          <View style={styles.workoutLogHeader}>
            <Ionicons name="fitness" size={18} color="#0A84FF" />
            <Text style={styles.workoutLogTitle}>Completed a workout</Text>
          </View>
          <View style={styles.workoutCard}>
            <Text style={styles.workoutName}>{item.content.workout_name}</Text>
            <View style={styles.workoutStats}>
              <View style={styles.workoutStat}>
                <Ionicons name="time-outline" size={14} color="#8E8E93" />
                <Text style={styles.workoutStatText}>{item.content.duration}</Text>
              </View>
              {item.content.stats?.map((stat, index) => (
                <View key={index} style={styles.workoutStat}>
                  <Text style={styles.workoutStatText}>• {stat}</Text>
                </View>
              ))}
            </View>
            <View style={styles.completionBar}>
              <View 
                style={[
                  styles.completionFill, 
                  { width: item.content.completion ? `${item.content.completion}%` : '0%' }
                ]} 
              />
            </View>
          </View>
        </View>
      )}
      
      {item.type === 'announcement' && (
        <View style={styles.announcementContent}>
          <Text style={styles.announcementTitle}>{item.content.title}</Text>
          <Text style={styles.announcementMessage}>{item.content.message}</Text>
        </View>
      )}
      
      {item.type === 'new_content' && (
        <View style={styles.contentPreview}>
          <View style={styles.contentType}>
            <Ionicons name="play-circle" size={18} color="#0A84FF" />
            <Text style={styles.contentTypeText}>New {item.content.type}</Text>
          </View>
          <Text style={styles.contentTitle}>{item.content.title}</Text>
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: item.content.thumbnail }} style={styles.thumbnail} />
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.content.duration}</Text>
            </View>
          </View>
          <Text style={styles.contentDescription} numberOfLines={2}>
            {item.content.description}
          </Text>
        </View>
      )}
      
      <View style={styles.feedActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons name="heart-outline" size={20} color="#8E8E93" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <Ionicons name="chatbubble-outline" size={18} color="#8E8E93" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Alert.alert("Share", "Share this post with your friends");
        }}>
          <Ionicons name="share-outline" size={18} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
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
    // Navigate to event detail page
    router.push(`/events/detail/${event.id}`);
  };
  
  const handleViewInstructor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Instructor", `Viewing ${event.instructor}'s profile`);
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
          Instructor: <Text 
            style={styles.instructorName} 
            onPress={handleViewInstructor}
          >
            {event.instructor}
          </Text>
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

// Leaderboard Category component
const LeaderboardCategory: React.FC<{ category: LeaderboardCategory }> = ({ category }) => {
  const handleViewAllLeaderboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Leaderboard", `Viewing full ${category.category} leaderboard`);
  };
  
  const handleViewProfile = (leader: LeaderboardEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Profile", `Viewing ${leader.name}'s profile`);
  };
  
  return (
    <View style={styles.leaderboardCategory}>
      <View style={styles.leaderboardHeader}>
        <Text style={styles.leaderboardTitle}>{category.category}</Text>
        <TouchableOpacity onPress={handleViewAllLeaderboard}>
          <Text style={styles.leaderboardViewAll}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {category.leaders.map((leader) => (
        <TouchableOpacity 
          key={leader.rank} 
          style={styles.leaderItem}
          onPress={() => handleViewProfile(leader)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.leaderRank, 
            leader.rank === 1 ? styles.goldRank : 
            leader.rank === 2 ? styles.silverRank : 
            leader.rank === 3 ? styles.bronzeRank : 
            styles.leaderRank
          ]}>
            {leader.rank}
          </Text>
          <Image source={{ uri: leader.avatar }} style={styles.leaderAvatar} />
          <Text style={styles.leaderName}>{leader.name}</Text>
          <Text style={styles.leaderValue}>{leader.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function ClubTabs() {
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'leaderboards'>('feed');
  const router = useRouter();
  
  // Store the active tab in local storage to persist state
  React.useEffect(() => {
    // This would use AsyncStorage in a real app
    // For now we'll just use the state
    try {
      // AsyncStorage.setItem('clubActiveTab', activeTab);
      // The above would be used in a real app 
    } catch (e) {
      console.error('Error saving tab state');
    }
  }, [activeTab]);
  
  const handleTabChange = (tab: 'feed' | 'events' | 'leaderboards') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };
  
  const handleOpenCalendar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to calendar view
    // router.push('/club/calendar');
  };
  
  // Render the active tab content based on the selected tab
  const renderTabContent = () => {
    switch(activeTab) {
      case 'feed':
        return (
          <FlatList
            data={feedItems}
            renderItem={({ item }) => <FeedItem item={item} />}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabContent}
            style={styles.scrollContainer}
            ListHeaderComponent={
              <View style={styles.tabHeader}>
                <Text style={styles.tabTitle}>Club Feed</Text>
              </View>
            }
          />
        );
      case 'events':
        return (
          <FlatList
            data={eventsData}
            renderItem={({ item }) => <EventItem event={item} />}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabContent}
            style={styles.scrollContainer}
            ListHeaderComponent={
              <View style={styles.tabHeader}>
                <Text style={styles.tabTitle}>Upcoming Events</Text>
                <TouchableOpacity 
                  style={styles.calendarButton}
                  onPress={handleOpenCalendar}
                >
                  <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.calendarButtonText}>Calendar</Text>
                </TouchableOpacity>
              </View>
            }
          />
        );
      case 'leaderboards':
        return (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabContent}
            style={styles.scrollContainer}
          >
            <View style={styles.tabHeader}>
              <Text style={styles.tabTitle}>Leaderboards</Text>
            </View>
            {leaderboardData.map((category, index) => (
              <LeaderboardCategory key={index} category={category} />
            ))}
          </ScrollView>
        );
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.tabBarContainer}>
        <BlurView intensity={30} tint="dark" style={styles.blurView}>
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'feed' && styles.activeTab]} 
              onPress={() => handleTabChange('feed')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="newspaper" 
                size={20} 
                color={activeTab === 'feed' ? '#0A84FF' : '#8E8E93'} 
              />
              <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
                Feed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'events' && styles.activeTab]} 
              onPress={() => handleTabChange('events')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="calendar" 
                size={20} 
                color={activeTab === 'events' ? '#0A84FF' : '#8E8E93'} 
              />
              <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
                Events
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'leaderboards' && styles.activeTab]} 
              onPress={() => handleTabChange('leaderboards')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="trophy" 
                size={20} 
                color={activeTab === 'leaderboards' ? '#0A84FF' : '#8E8E93'} 
              />
              <Text style={[styles.tabText, activeTab === 'leaderboards' && styles.activeTabText]}>
                Leaderboards
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
      
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  tabBarContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 2,
  },
  blurView: {
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  scrollContainer: {
    flex: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#0A84FF',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  calendarButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  
  // Feed styles
  feedItem: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  feedHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  feedHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  workoutLogContent: {
    marginBottom: 12,
  },
  workoutLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutLogTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  workoutCard: {
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  workoutStatText: {
    fontSize: 13,
    color: '#8E8E93',
    marginLeft: 4,
  },
  completionBar: {
    height: 4,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#30D158',
    borderRadius: 2,
  },
  announcementContent: {
    marginBottom: 12,
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
  contentPreview: {
    marginBottom: 12,
  },
  contentType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentTypeText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  thumbnailContainer: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  contentDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  feedActions: {
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
  
  // Event styles
  eventItem: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  instructorName: {
    color: '#0A84FF',
    fontWeight: '500',
  },
  
  // Leaderboard styles
  leaderboardCategory: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderboardViewAll: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.1)',
  },
  leaderRank: {
    width: 24,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 12,
  },
  leaderName: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  leaderValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A84FF',
  },
  goldRank: {
    color: '#FFD700',
    fontWeight: '800',
  },
  silverRank: {
    color: '#C0C0C0',
    fontWeight: '800',
  },
  bronzeRank: {
    color: '#CD7F32',
    fontWeight: '800',
  },
}); 