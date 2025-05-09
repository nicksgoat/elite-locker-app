import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import IMessagePageWrapper from '../../components/layout/iMessagePageWrapper';

// Mock workout history data
const workoutHistory = [
  {
    id: '1',
    name: 'Full Body Strength',
    date: '2023-05-01T09:30:00',
    duration: 45, // in minutes
    exercises: 8,
    completedExercises: 8,
    totalVolume: 12350, // in lbs
    categories: ['strength'],
  },
  {
    id: '2',
    name: 'Morning Run',
    date: '2023-05-03T07:15:00',
    duration: 32,
    exercises: 1,
    completedExercises: 1,
    distance: 5.2, // in km
    categories: ['cardio'],
  },
  {
    id: '3',
    name: 'Upper Body',
    date: '2023-05-04T16:45:00',
    duration: 55,
    exercises: 6,
    completedExercises: 6,
    totalVolume: 6520,
    categories: ['strength'],
  },
  {
    id: '4',
    name: 'HIIT Session',
    date: '2023-05-06T18:00:00',
    duration: 25,
    exercises: 4,
    completedExercises: 4,
    categories: ['hiit', 'cardio'],
  },
  {
    id: '5',
    name: 'Leg Day',
    date: '2023-05-08T17:30:00',
    duration: 65,
    exercises: 7,
    completedExercises: 7,
    totalVolume: 15240,
    categories: ['strength'],
    personalRecords: 2,
  },
  {
    id: '6',
    name: 'Core Focus',
    date: '2023-05-10T06:45:00',
    duration: 30,
    exercises: 5,
    completedExercises: 5,
    totalVolume: 2800,
    categories: ['strength'],
  },
];

// Helper functions for workout history
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 7) {
      return `${diff} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }
};

// Function to get color for workout category
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'strength':
      return '#0A84FF';
    case 'cardio':
      return '#FF2D55';
    case 'hiit':
      return '#FF9500';
    default:
      return '#8E8E93';
  }
};

// Get workout icon color based on workout name
const getWorkoutIconColor = (name: string) => {
  if (name.toLowerCase().includes('leg') ||
      name.toLowerCase().includes('glute') ||
      name.toLowerCase().includes('hamstring')) {
    return '#FF3B30'; // Red
  } else if (name.toLowerCase().includes('pull') ||
      name.toLowerCase().includes('back') ||
      name.toLowerCase().includes('upper')) {
    return '#007AFF'; // Blue
  } else if (name.toLowerCase().includes('push') ||
      name.toLowerCase().includes('chest')) {
    return '#5856D6'; // Purple
  } else if (name.toLowerCase().includes('cycle') ||
      name.toLowerCase().includes('cardio') ||
      name.toLowerCase().includes('run') ||
      name.toLowerCase().includes('core') ||
      name.toLowerCase().includes('hiit')) {
    return '#FF9500'; // Orange
  }
  return '#FF3B30'; // Default red
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
  } else {
    return `${mins} min`;
  }
};

interface WorkoutHistoryItemProps {
  workout: any;
  onPress: () => void;
}

const WorkoutHistoryItem: React.FC<WorkoutHistoryItemProps> = ({ workout, onPress }) => {
  const formattedDate = formatDate(workout.date);
  const formatVolume = (vol?: number) => {
    if (!vol) return '0';
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}k`;
    }
    return vol.toString();
  };

  return (
    <TouchableOpacity 
      style={styles.darkCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Card header with workout name and PR badge */}
        <View style={styles.darkCardHeader}>
          <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor(workout.name) }]} />
          <Text style={styles.darkCardTitle}>{workout.name}</Text>
          
          {workout.personalRecords > 0 && (
            <View style={styles.darkPrBadge}>
              <Text style={styles.darkPrText}>{workout.personalRecords} PR</Text>
            </View>
          )}
        </View>
        
        {/* Date below title */}
        <Text style={styles.darkDateText}>{formattedDate}</Text>
        
        {/* Stats row - horizontal layout */}
        <View style={styles.darkStatsRow}>
          <View style={styles.darkStatItem}>
            <Ionicons name="time-outline" size={16} color="#A2A2A2" />
            <Text style={styles.darkStatValue}>{formatDuration(workout.duration)}</Text>
          </View>
          
          <View style={styles.darkStatItem}>
            <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
            <Text style={styles.darkStatValue}>
              {workout.completedExercises}/{workout.exercises}
            </Text>
          </View>
          
          {workout.totalVolume && (
            <View style={styles.darkStatItem}>
              <Ionicons name="trending-up-outline" size={16} color="#A2A2A2" />
              <Text style={styles.darkStatValue}>
                {formatVolume(workout.totalVolume)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

function WorkoutHistoryScreen() {
  const router = useRouter();

  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}` as any);
  };

  return (
    <IMessagePageWrapper title="Workout History" subtitle="Your completed workouts">
      <FlatList
        data={workoutHistory}
        renderItem={({ item }) => (
          <WorkoutHistoryItem
            workout={item}
            onPress={() => handleWorkoutPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  // Dark card styles
  darkCard: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  cardContent: {
    padding: 12,
  },
  darkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  darkCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  darkDateText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  darkStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  darkStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  darkStatValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  darkPrBadge: {
    backgroundColor: '#8B5500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  darkPrText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WorkoutHistoryScreen; 