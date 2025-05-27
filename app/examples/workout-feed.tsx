import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import WorkoutFeedCard from '../../components/cards/WorkoutFeedCard';

// Mock data for the workout feed example
const mockWorkoutData = {
  id: 'workout1',
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
    },
    {
      id: 'ex4',
      name: 'Seated Leg Curl',
      sets: [
        { id: 1, weight: 75, reps: 11, completed: true },
        { id: 2, weight: 75, reps: 7, completed: true },
        { id: 3, weight: 70, reps: 8, completed: true },
      ]
    }
  ],
  superSets: [
    {
      id: 'ss1',
      setCount: 3,
      exercises: [
        {
          id: 'ss1-ex1',
          name: 'Hyperextension',
          sets: []
        },
        {
          id: 'ss1-ex2',
          name: 'Machine Adduction',
          sets: []
        }
      ]
    }
  ]
};

export default function WorkoutFeedExample() {
  const handleWorkoutPress = (workoutId: string) => {
    console.log(`Workout pressed: ${workoutId}`);
  };

  const handleLike = (workoutId: string) => {
    console.log(`Liked workout: ${workoutId}`);
  };

  const handleComment = (workoutId: string) => {
    console.log(`Comment on workout: ${workoutId}`);
  };

  const handleMoreOptions = (workoutId: string) => {
    console.log(`More options for workout: ${workoutId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen
        options={{
          title: 'Workout Feed Example',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <WorkoutFeedCard
          workoutItem={mockWorkoutData}
          onPress={handleWorkoutPress}
          onLike={handleLike}
          onComment={handleComment}
          onMoreOptions={handleMoreOptions}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
});
