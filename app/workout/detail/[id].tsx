import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';

// Mock data for workout history
const workoutHistory = [
  {
    id: '1',
    name: 'Full Body Strength',
    date: '2023-05-01T09:30:00',
    duration: 45, // in minutes
    exercises: [
      {
        name: 'Squat',
        sets: [
          { weight: 225, reps: 8 },
          { weight: 225, reps: 8 },
          { weight: 245, reps: 6 },
          { weight: 245, reps: 6 },
        ],
      },
      {
        name: 'Bench Press',
        sets: [
          { weight: 185, reps: 8 },
          { weight: 185, reps: 8 },
          { weight: 205, reps: 6 },
          { weight: 205, reps: 5 },
        ],
      },
      {
        name: 'Deadlift',
        sets: [
          { weight: 275, reps: 6 },
          { weight: 275, reps: 6 },
          { weight: 295, reps: 4 },
        ],
      },
      {
        name: 'Pull-ups',
        sets: [
          { weight: 0, reps: 12 },
          { weight: 0, reps: 10 },
          { weight: 0, reps: 8 },
        ],
      },
    ],
    totalVolume: 12350, // in lbs
    categories: ['strength'],
    notes: 'Felt strong today, focused on form with squats.',
  },
  {
    id: '2',
    name: 'Morning Run',
    date: '2023-05-03T07:15:00',
    duration: 32,
    exercises: [
      {
        name: 'Treadmill Run',
        cardioDetails: {
          distance: 5.2, // in km
          avgPace: '6:10', // min/km
          avgHeartRate: 158, // bpm
          caloriesBurned: 420,
        },
      },
    ],
    distance: 5.2, // in km
    categories: ['cardio'],
    notes: 'Great morning run. Weather was cool and perfect for running.',
  },
  {
    id: '3',
    name: 'Upper Body',
    date: '2023-05-04T16:45:00',
    duration: 55,
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { weight: 185, reps: 8 },
          { weight: 185, reps: 7 },
          { weight: 185, reps: 7 },
        ],
      },
      {
        name: 'Shoulder Press',
        sets: [
          { weight: 135, reps: 10 },
          { weight: 135, reps: 9 },
          { weight: 135, reps: 8 },
        ],
      },
      {
        name: 'Lat Pulldown',
        sets: [
          { weight: 160, reps: 12 },
          { weight: 160, reps: 12 },
          { weight: 170, reps: 10 },
        ],
      },
      {
        name: 'Bicep Curls',
        sets: [
          { weight: 35, reps: 12 },
          { weight: 35, reps: 12 },
          { weight: 40, reps: 10 },
        ],
      },
    ],
    totalVolume: 6520,
    categories: ['strength'],
    notes: 'Shoulders felt a bit tight. Need to work on mobility.',
  },
  {
    id: '4',
    name: 'HIIT Session',
    date: '2023-05-06T18:00:00',
    duration: 25,
    exercises: [
      {
        name: 'Circuit',
        hiitDetails: {
          rounds: 5,
          workInterval: 40, // seconds
          restInterval: 20, // seconds
          exercises: [
            'Burpees',
            'Mountain Climbers',
            'Jump Squats',
            'Kettlebell Swings',
          ],
          caloriesBurned: 320,
          avgHeartRate: 172, // bpm
          maxHeartRate: 186, // bpm
        },
      },
    ],
    categories: ['hiit', 'cardio'],
    notes: 'Pushed the pace on the last two rounds. Really challenging today!',
  },
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const workout = workoutHistory.find((w) => w.id === id);
  
  if (!workout) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <BlurView intensity={30} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Details</Text>
          <View style={{ width: 24 }} />
        </BlurView>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Workout not found</Text>
          <TouchableOpacity 
            style={styles.returnButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.returnButtonText}>Return to Workouts</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get category color
  const getCategoryColor = (category) => {
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
  
  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Implement share functionality here
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BlurView intensity={30} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </BlurView>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{formatDate(workout.date)}</Text>
            <Text style={styles.timeText}>{formatTime(workout.date)}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={20} color="#0A84FF" />
            <Text style={styles.statValue}>{workout.duration} min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          
          {workout.totalVolume && (
            <View style={styles.statCard}>
              <Ionicons name="barbell-outline" size={20} color="#0A84FF" />
              <Text style={styles.statValue}>{workout.totalVolume} lbs</Text>
              <Text style={styles.statLabel}>Volume</Text>
            </View>
          )}
          
          {workout.distance && (
            <View style={styles.statCard}>
              <Ionicons name="trail-sign-outline" size={20} color="#0A84FF" />
              <Text style={styles.statValue}>{workout.distance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          )}
          
          <View style={styles.statCard}>
            <Ionicons name="fitness-outline" size={20} color="#0A84FF" />
            <Text style={styles.statValue}>{workout.exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
        </View>
        
        <View style={styles.categoriesContainer}>
          {workout.categories.map((category) => (
            <View
              key={category}
              style={[
                styles.categoryPill,
                { backgroundColor: `${getCategoryColor(category)}20` },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(category) },
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Exercises</Text>
        
        {workout.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            
            {exercise.sets && (
              <View style={styles.setsContainer}>
                <View style={styles.setHeader}>
                  <Text style={styles.setHeaderText}>Set</Text>
                  <Text style={styles.setHeaderText}>Weight</Text>
                  <Text style={styles.setHeaderText}>Reps</Text>
                </View>
                
                {exercise.sets.map((set, setIndex) => (
                  <View key={setIndex} style={styles.setRow}>
                    <Text style={styles.setText}>{setIndex + 1}</Text>
                    <Text style={styles.setText}>{set.weight} lbs</Text>
                    <Text style={styles.setText}>{set.reps}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {exercise.cardioDetails && (
              <View style={styles.cardioContainer}>
                <View style={styles.cardioRow}>
                  <View style={styles.cardioItem}>
                    <Text style={styles.cardioLabel}>Distance</Text>
                    <Text style={styles.cardioValue}>{exercise.cardioDetails.distance} km</Text>
                  </View>
                  <View style={styles.cardioItem}>
                    <Text style={styles.cardioLabel}>Pace</Text>
                    <Text style={styles.cardioValue}>{exercise.cardioDetails.avgPace} /km</Text>
                  </View>
                </View>
                <View style={styles.cardioRow}>
                  <View style={styles.cardioItem}>
                    <Text style={styles.cardioLabel}>Heart Rate</Text>
                    <Text style={styles.cardioValue}>{exercise.cardioDetails.avgHeartRate} bpm</Text>
                  </View>
                  <View style={styles.cardioItem}>
                    <Text style={styles.cardioLabel}>Calories</Text>
                    <Text style={styles.cardioValue}>{exercise.cardioDetails.caloriesBurned} kcal</Text>
                  </View>
                </View>
              </View>
            )}
            
            {exercise.hiitDetails && (
              <View style={styles.hiitContainer}>
                <View style={styles.hiitInfo}>
                  <View style={styles.hiitDetail}>
                    <Text style={styles.hiitLabel}>Rounds</Text>
                    <Text style={styles.hiitValue}>{exercise.hiitDetails.rounds}</Text>
                  </View>
                  <View style={styles.hiitDetail}>
                    <Text style={styles.hiitLabel}>Work</Text>
                    <Text style={styles.hiitValue}>{exercise.hiitDetails.workInterval}s</Text>
                  </View>
                  <View style={styles.hiitDetail}>
                    <Text style={styles.hiitLabel}>Rest</Text>
                    <Text style={styles.hiitValue}>{exercise.hiitDetails.restInterval}s</Text>
                  </View>
                </View>
                
                <Text style={styles.hiitExercisesTitle}>Exercises</Text>
                <View style={styles.hiitExercises}>
                  {exercise.hiitDetails.exercises.map((ex, exIndex) => (
                    <View key={exIndex} style={styles.hiitExerciseItem}>
                      <View style={styles.hiitExerciseNumber}>
                        <Text style={styles.hiitExerciseNumberText}>{exIndex + 1}</Text>
                      </View>
                      <Text style={styles.hiitExerciseName}>{ex}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.hiitStats}>
                  <View style={styles.hiitStatItem}>
                    <Text style={styles.hiitStatLabel}>Avg HR</Text>
                    <Text style={styles.hiitStatValue}>{exercise.hiitDetails.avgHeartRate} bpm</Text>
                  </View>
                  <View style={styles.hiitStatItem}>
                    <Text style={styles.hiitStatLabel}>Max HR</Text>
                    <Text style={styles.hiitStatValue}>{exercise.hiitDetails.maxHeartRate} bpm</Text>
                  </View>
                  <View style={styles.hiitStatItem}>
                    <Text style={styles.hiitStatLabel}>Calories</Text>
                    <Text style={styles.hiitStatValue}>{exercise.hiitDetails.caloriesBurned} kcal</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        ))}
        
        {workout.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{workout.notes}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  returnButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  returnButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  workoutHeader: {
    marginBottom: 16,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  setsContainer: {
    marginTop: 8,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.1)',
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.05)',
  },
  setText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  cardioContainer: {
    marginTop: 8,
  },
  cardioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardioItem: {
    flex: 1,
    alignItems: 'center',
  },
  cardioLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  cardioValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hiitContainer: {
    marginTop: 8,
  },
  hiitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hiitDetail: {
    alignItems: 'center',
  },
  hiitLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  hiitValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hiitExercisesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  hiitExercises: {
    marginBottom: 16,
  },
  hiitExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hiitExerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hiitExerciseNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hiitExerciseName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  hiitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  hiitStatItem: {
    alignItems: 'center',
  },
  hiitStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  hiitStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notesCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
}); 