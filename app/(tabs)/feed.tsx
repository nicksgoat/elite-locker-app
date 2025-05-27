import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    View
} from 'react-native';
import MessageFeedLayout from '../../components/layout/MessageFeedLayout';
// Import design system components
import WorkoutFeedCard from '../../components/cards/WorkoutFeedCard';
import { WorkoutMessageBubble } from '../../components/design-system/feedback';
import { Text } from '../../components/design-system/primitives';
import ClubPostMessageBubble from '../../components/ui/ClubPostMessageBubble';
import DateHeader from '../../components/ui/DateHeader';

// Import design system tokens
const { colors, spacing } = require('../../components/design-system/tokens');

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

// Extended workout type for the new feed card
interface WorkoutFeedItem {
  id: string;
  userName: string;
  userAvatarUrl?: string;
  workoutName: string;
  caloriesBurned?: number;
  totalVolume?: number;
  duration?: number; // in seconds
  prsAchieved?: number;
  timestamp: string; // e.g., "4 hours ago"
  location?: string; // e.g., "Canada"
  workoutId?: string;
  exercises?: {
    id: string;
    name: string;
    sets: {
      id: number;
      weight: string | number;
      reps: string | number;
      completed?: boolean;
      isPersonalRecord?: boolean;
    }[];
    superSetId?: string;
  }[];
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
  type: 'workout' | 'post' | 'workout-feed';
  data: Workout | ClubPost | WorkoutFeedItem;
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
    mediaUrl: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
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

// Mock data for the new workout feed items
const workoutFeedItems: WorkoutFeedItem[] = [
  {
    id: 'wf1',
    userName: 'paige',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=paige',
    workoutName: 'Hamstrings + Glutes',
    caloriesBurned: 225,
    totalVolume: 21405,
    duration: 60 * 60 + 15, // 1:00:15 in seconds
    prsAchieved: 1,
    timestamp: '15 hours ago',
    location: 'Canada',
    workoutId: 'workout-detail-1',
    exercises: [
      {
        id: 'ex1',
        name: 'Smith Machine Hip Thrust',
        sets: [
          { id: 1, weight: 220, reps: 12, completed: true },
          { id: 2, weight: 220, reps: 10, completed: true },
        ]
      },
      {
        id: 'ex2',
        name: 'Smith Machine KAS Glute Bridge',
        sets: [
          { id: 1, weight: 220, reps: 5, completed: true },
        ]
      },
      {
        id: 'ex3',
        name: 'Dumbbell Romanian Deadlift',
        sets: [
          { id: 1, weight: 60, reps: 13, completed: true },
          { id: 2, weight: 70, reps: 12, completed: true },
          { id: 3, weight: 70, reps: 12, completed: true },
        ]
      }
    ]
  },
  {
    id: 'wf2',
    userName: 'Alex Fitness',
    userAvatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    workoutName: 'Upper Body Power',
    caloriesBurned: 320,
    totalVolume: 18750,
    duration: 45 * 60, // 45:00 in seconds
    prsAchieved: 2,
    timestamp: '2 days ago',
    location: 'New York',
    workoutId: 'workout-detail-2',
    exercises: [
      {
        id: 'ex1',
        name: 'Bench Press',
        sets: [
          { id: 1, weight: 185, reps: 8, completed: true },
          { id: 2, weight: 205, reps: 6, completed: true, isPersonalRecord: true },
          { id: 3, weight: 205, reps: 5, completed: true },
        ]
      },
      {
        id: 'ex2',
        name: 'Pull-ups',
        sets: [
          { id: 1, weight: 'BW', reps: 12, completed: true },
          { id: 2, weight: 'BW+25', reps: 8, completed: true, isPersonalRecord: true },
          { id: 3, weight: 'BW+25', reps: 6, completed: true },
        ]
      }
    ]
  }
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
    // Add the new workout feed items
    ...workoutFeedItems.map(workout => ({
      type: 'workout-feed' as const,
      data: workout,
      // Convert the timestamp string to a number for sorting
      timestamp: Date.now() - (workout.timestamp.includes('hours')
        ? parseInt(workout.timestamp) * 60 * 60 * 1000
        : parseInt(workout.timestamp) * 24 * 60 * 60 * 1000),
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
    } else if (item.type === 'workout-feed') {
      const workoutFeed = item.data as WorkoutFeedItem;
      return (
        <WorkoutFeedCard
          workoutItem={workoutFeed}
          onPress={(id) => router.push(`/workout/detail/${id}`)}
          onLike={(id) => console.log(`Liked workout: ${id}`)}
          onComment={(id) => console.log(`Comment on workout: ${id}`)}
          onMoreOptions={(id) => console.log(`More options for workout: ${id}`)}
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
      <Text variant="h3" color="primary" style={{ marginTop: 16, marginBottom: 8 }}>
        No items to show
      </Text>
      <Text variant="bodySmall" color="secondary" style={{ textAlign: 'center' }}>
        Your feed is empty
      </Text>
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
    paddingHorizontal: spacing.spacing.md,
    paddingBottom: spacing.spacing.xl,
  },
  emptyFeedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.spacing.xl,
    marginTop: 60,
  }
});