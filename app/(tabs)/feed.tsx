import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import MessageFeedLayout from '../../components/layout/MessageFeedLayout';
import WorkoutMessageBubble from '../../components/ui/WorkoutMessageBubble';
import ClubPostMessageBubble from '../../components/ui/ClubPostMessageBubble';
import ChatBubble from '../../components/ui/ChatBubble';
import DateHeader from '../../components/ui/DateHeader';

// Define types for our data
interface Workout {
  id: string;
  title: string;
  date: string;
  duration: string;
  exercises: number;
  completedExercises: number;
  volume?: number;
  personalRecords?: number;
  isUserWorkout: boolean;
  userName?: string;
  userAvatar?: string;
  timestamp: number;
}

interface ClubPost {
  id: string;
  clubId: string;
  clubName: string;
  userName: string;
  userAvatar?: string;
  date: string;
  content: string;
  attachedWorkout?: {
    title: string;
    exercises: number;
    duration: string;
  };
  likes: number;
  comments: number;
  mediaUrl?: string;
  timestamp: number;
}

type FeedItem = {
  type: 'workout' | 'post';
  data: Workout | ClubPost;
  timestamp: number;
};

// Mock data for user's workouts
const userWorkoutsData: Workout[] = [
  {
    id: '1',
    title: 'Upper Body',
    date: 'Today',
    duration: '45 min',
    exercises: 7,
    completedExercises: 7,
    volume: 12500,
    personalRecords: 2,
    isUserWorkout: true,
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: '2',
    title: 'Leg Day',
    date: 'Yesterday',
    duration: '50 min',
    exercises: 6,
    completedExercises: 6,
    volume: 15200,
    personalRecords: 1,
    isUserWorkout: true,
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
  {
    id: '3',
    title: 'Core Focus',
    date: '2 days ago',
    duration: '30 min',
    exercises: 5,
    completedExercises: 5,
    volume: 2800,
    personalRecords: 0,
    isUserWorkout: true,
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
  },
];

// Mock data for club posts with attached workouts
const clubPostsData: ClubPost[] = [
  {
    id: 'p1',
    clubId: '1',
    clubName: 'Elite Speed Academy',
    userName: 'Coach Mike',
    userAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    date: '1 hour ago',
    content: "Just finished coaching a great speed session! Here's the workout we did - try it out and let me know your times.",
    attachedWorkout: {
      title: 'Sprint Circuit Training',
      exercises: 6,
      duration: '35 min',
    },
    likes: 24,
    comments: 5,
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
  },
  {
    id: 'p2',
    clubId: '2',
    clubName: 'Power Lifters United',
    userName: 'Jane Smith',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    date: '3 hours ago',
    content: "Hit a new PR on deadlifts today! 💪 Here's my full workout session if anyone wants to try it.",
    attachedWorkout: {
      title: 'Heavy Pull Day',
      exercises: 5,
      duration: '65 min',
    },
    likes: 47,
    comments: 12,
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
  },
  {
    id: 'p3',
    clubId: '4',
    clubName: 'Yoga Warriors',
    userName: 'Sarah Zen',
    userAvatar: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    date: '5 hours ago',
    content: "Morning flow to start the day with positive energy. This is a great routine for beginners looking to improve flexibility.",
    likes: 31,
    comments: 8,
    mediaUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
  },
  {
    id: 'p4',
    clubId: '5',
    clubName: 'CrossFit Champions',
    userName: 'Alex Fitness',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    date: 'Yesterday',
    content: "Today's WOD was intense! Who else completed it? Share your times below.",
    attachedWorkout: {
      title: 'AMRAP Challenge',
      exercises: 4,
      duration: '20 min',
    },
    likes: 18,
    comments: 22,
    timestamp: Date.now() - 1000 * 60 * 60 * 26, // Yesterday
  },
];

// Mock data from clubs and friends
const friendWorkoutsData: Workout[] = [
  {
    id: 'fw1',
    title: 'HIIT Cardio',
    date: '4 hours ago',
    duration: '28 min',
    exercises: 8,
    completedExercises: 8,
    volume: 0,
    personalRecords: 0,
    isUserWorkout: false,
    userName: 'Mark Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
  },
  {
    id: 'fw2',
    title: 'Chest & Back',
    date: 'Yesterday',
    duration: '52 min',
    exercises: 8,
    completedExercises: 7,
    volume: 11800,
    personalRecords: 1,
    isUserWorkout: false,
    userName: 'Emily Parker',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    timestamp: Date.now() - 1000 * 60 * 60 * 27, // Yesterday
  },
];

// Message Feed Screen
export default function MessageFeedScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    // Simulate a fetch
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Combine and sort all feed items chronologically
  const combinedFeedItems: FeedItem[] = [
    ...userWorkoutsData.map(workout => ({
      type: 'workout' as const,
      data: workout,
      timestamp: workout.timestamp,
    })),
    ...clubPostsData.map(post => ({
      type: 'post' as const,
      data: post,
      timestamp: post.timestamp,
    })),
    ...friendWorkoutsData.map(workout => ({
      type: 'workout' as const,
      data: workout,
      timestamp: workout.timestamp,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Group items by date
  const groupItemsByDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayItems: FeedItem[] = [];
    const yesterdayItems: FeedItem[] = [];
    const olderItems: FeedItem[] = [];
    
    combinedFeedItems.forEach(item => {
      const itemDate = new Date(item.timestamp);
      if (itemDate.toDateString() === today.toDateString()) {
        todayItems.push(item);
      } else if (itemDate.toDateString() === yesterday.toDateString()) {
        yesterdayItems.push(item);
      } else {
        olderItems.push(item);
      }
    });
    
    const sections: any[] = [];
    
    if (todayItems.length > 0) {
      sections.push({ title: 'Today', data: todayItems });
    }
    if (yesterdayItems.length > 0) {
      sections.push({ title: 'Yesterday', data: yesterdayItems });
    }
    if (olderItems.length > 0) {
      sections.push({ title: 'Earlier', data: olderItems });
    }
    
    return sections;
  };

  // Render a feed item based on its type
  const renderFeedItem = ({ item }: { item: FeedItem }) => {
    if (item.type === 'workout') {
      const workout = item.data as Workout;
      return (
        <WorkoutMessageBubble
          id={workout.id}
          title={workout.title}
          date={workout.date}
          duration={workout.duration}
          exercises={workout.exercises}
          completedExercises={workout.completedExercises}
          volume={workout.volume}
          personalRecords={workout.personalRecords}
          isUserWorkout={workout.isUserWorkout}
          userName={workout.userName}
          userAvatar={workout.userAvatar}
        />
      );
    } else {
      const post = item.data as ClubPost;
      return (
        <ClubPostMessageBubble
          id={post.id}
          clubId={post.clubId}
          clubName={post.clubName}
          userName={post.userName}
          userAvatar={post.userAvatar}
          date={post.date}
          content={post.content}
          attachedWorkout={post.attachedWorkout}
          likes={post.likes}
          comments={post.comments}
          mediaUrl={post.mediaUrl}
        />
      );
    }
  };

  // Empty state component
  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#666" />
      <Text style={styles.emptyTitle}>No items to show</Text>
      <Text style={styles.emptySubtitle}>Your feed is empty</Text>
    </View>
  ), []);

  // Build a flat list with section headers
  const buildListWithSections = () => {
    const sections = groupItemsByDate();
    const listItems: React.ReactNode[] = [];

    sections.forEach((section, sectionIndex) => {
      // Add section header
      listItems.push(
        <DateHeader key={`header-${section.title}`} date={section.title} />
      );

      // Add section items
      section.data.forEach((item: FeedItem, itemIndex: number) => {
        listItems.push(
          <View key={`${item.type}-${item.data.id}`}>
            {renderFeedItem({ item })}
          </View>
        );
      });
    });

    return listItems;
  };

  return (
    <MessageFeedLayout 
      title="Messages"
      subtitle="Elite Locker"
      showComposeArea={true}
      showHeader={false}
    >
      <FlatList
        data={buildListWithSections()}
        renderItem={({ item }) => item as React.ReactElement}
        keyExtractor={(_, index) => `item-${index}`}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
          />
        }
        contentContainerStyle={[
          styles.feedContainer,
          combinedFeedItems.length === 0 && styles.emptyFeedContainer
        ]}
        showsVerticalScrollIndicator={false}
      />
    </MessageFeedLayout>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  feedContainer: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  emptyFeedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  }
}); 