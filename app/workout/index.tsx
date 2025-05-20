import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';
import IMessagePageWrapper from '../../components/layout/iMessagePageWrapper';
import FloatingWorkoutTracker from '../../components/ui/FloatingWorkoutTracker';
import WorkoutEmptyState from '../../components/ui/WorkoutEmptyState';
import VoiceWorkoutCreator from '../../components/ui/VoiceWorkoutCreator';
import { useWorkout } from '../../contexts/WorkoutContext';

// Mock workout history data
const workoutHistory = [
  {
    id: '1',
    name: 'Full Body Strength',
    date: '2023-05-01T09:30:00',
    duration: 45, // in minutes
    exercises: ['Squat', 'Bench Press', 'Deadlift', 'Pull-ups'],
    totalVolume: 12350, // in lbs
    categories: ['strength'],
  },
  {
    id: '2',
    name: 'Morning Run',
    date: '2023-05-03T07:15:00',
    duration: 32,
    exercises: ['Treadmill Run'],
    distance: 5.2, // in km
    categories: ['cardio'],
  },
  {
    id: '3',
    name: 'Upper Body',
    date: '2023-05-04T16:45:00',
    duration: 55,
    exercises: ['Bench Press', 'Shoulder Press', 'Lat Pulldown', 'Bicep Curls'],
    totalVolume: 6520,
    categories: ['strength'],
  },
  {
    id: '4',
    name: 'HIIT Session',
    date: '2023-05-06T18:00:00',
    duration: 25,
    exercises: ['Burpees', 'Mountain Climbers', 'Jump Squats', 'Kettlebell Swings'],
    categories: ['hiit', 'cardio'],
  },
];

// Mock workout templates
const workoutTemplates = [
  {
    id: 't1',
    name: 'Push-Pull-Legs',
    level: 'Intermediate',
    description: 'A 3-day split focusing on pushing, pulling, and leg movements',
    exercises: 12,
    duration: '60-75 min',
    creator: 'Elite Locker',
    category: 'strength',
  },
  {
    id: 't2',
    name: '5x5 Strength',
    level: 'Beginner',
    description: 'Simple but effective strength program with compound movements',
    exercises: 5,
    duration: '45-60 min',
    creator: 'Elite Locker',
    category: 'strength',
  },
  {
    id: 't3',
    name: 'HIIT Circuit',
    level: 'Advanced',
    description: 'High-intensity interval training for maximum calorie burn',
    exercises: 8,
    duration: '30 min',
    creator: 'Elite Locker',
    category: 'hiit',
  },
];

// Mock template exercises
const templateExercises: Record<string, any[]> = {
  't1': [
    {
      id: 'e1-t1',
      name: 'Bench Press',
      sets: 4,
      targetReps: '8-10',
      restTime: 90,
    },
    {
      id: 'e2-t1',
      name: 'Shoulder Press',
      sets: 3,
      targetReps: '10-12',
      restTime: 60,
    },
    {
      id: 'e3-t1',
      name: 'Tricep Extension',
      sets: 3,
      targetReps: '12-15',
      restTime: 45,
    }
  ],
  't2': [
    {
      id: 'e1-t2',
      name: 'Squat',
      sets: 5,
      targetReps: '5',
      restTime: 120,
    },
    {
      id: 'e2-t2',
      name: 'Deadlift',
      sets: 5,
      targetReps: '5',
      restTime: 120,
    },
    {
      id: 'e3-t2',
      name: 'Bench Press',
      sets: 5,
      targetReps: '5',
      restTime: 120,
    }
  ],
  't3': [
    {
      id: 'e1-t3',
      name: 'Burpees',
      sets: 4,
      targetReps: '30s',
      restTime: 15,
    },
    {
      id: 'e2-t3',
      name: 'Mountain Climbers',
      sets: 4,
      targetReps: '30s',
      restTime: 15,
    },
    {
      id: 'e3-t3',
      name: 'Jump Squats',
      sets: 4,
      targetReps: '30s',
      restTime: 15,
    }
  ]
};

// Helper functions for workout history
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

// Components for templates and history
interface WorkoutItemProps {
  workout: any;
  onPress: () => void;
}

const WorkoutHistoryItem: React.FC<WorkoutItemProps> = ({ workout, onPress }) => {
  return (
    <TouchableOpacity style={styles.historyItem} onPress={onPress}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
        <View style={styles.durationContainer}>
          <Ionicons name="time-outline" size={14} color="#8E8E93" />
          <Text style={styles.durationText}>{workout.duration} min</Text>
        </View>
      </View>

      <Text style={styles.historyName}>{workout.name}</Text>

      <View style={styles.exerciseList}>
        <Text style={styles.exerciseText} numberOfLines={1}>
          {workout.exercises.join(' • ')}
        </Text>
      </View>

      <View style={styles.categoriesContainer}>
        {workout.categories.map((category: string) => (
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
    </TouchableOpacity>
  );
};

interface TemplateItemProps {
  template: any;
  onPress: () => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onPress }) => {
  return (
    <TouchableOpacity style={styles.templateItem} onPress={onPress}>
      <View style={styles.templateHeader}>
        <Text style={styles.templateName}>{template.name}</Text>
        <View style={styles.exerciseCountContainer}>
          <Ionicons name="barbell-outline" size={14} color="#8E8E93" />
          <Text style={styles.exerciseCountText}>
            {template.exercises.length} exercises
          </Text>
        </View>
      </View>

      <View style={styles.exerciseList}>
        <Text style={styles.exerciseText} numberOfLines={1}>
          {template.exercises.map((e: any) => e.name).join(' • ')}
        </Text>
      </View>

      <View style={styles.templateFooter}>
        <View
          style={[
            styles.categoryPill,
            { backgroundColor: `${getCategoryColor(template.category)}20` },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              { color: getCategoryColor(template.category) },
            ]}
          >
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Define workout and exercise types for the AI creator (same as in WorkoutEmptyState)
interface AIExercise {
  id?: string;
  name: string;
  sets: number;
  targetReps: string;
  restTime?: number;
  category?: string;
  equipment?: string;
}

interface AIWorkout {
  name: string;
  exercises: AIExercise[];
  date: string;
  duration: number;
  categories: string[];
}

export default function WorkoutScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('history');
  const { startWorkout, isWorkoutActive, isWorkoutMinimized } = useWorkout();
  const [showAICreator, setShowAICreator] = useState(false);

  // Use effect to handle navigation based on workout state
  useEffect(() => {
    if (isWorkoutActive && !isWorkoutMinimized) {
      // If workout is active and not minimized, redirect to active workout screen
      router.replace('/workout/active');
    }
  }, [isWorkoutActive, isWorkoutMinimized, router]);

  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Start a new custom blank workout
    startWorkout();
    // Navigate to the active workout screen
    router.push('/workout/active');
  };

  const handleSelectWorkout = (workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${workoutId}`);
  };

  const handleSelectTemplate = (templateId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get the exercises for this template
    const exercises = templateExercises[templateId] || [];

    // Start a workout with these exercises
    if (exercises.length > 0) {
      startWorkout(exercises);
      // Navigate to the active workout screen
      router.push('/workout/active');
    } else {
      // If no exercises found, just navigate to template details
      router.push(`/workout/template/${templateId}`);
    }
  };

  const handleStartLogWorkout = () => {
    router.push('/workout/log');
  };

  // Handle showing the AI workout creator
  const handleShowAICreator = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAICreator(true);
  };

  // Handle the created workout from the AI
  const handleWorkoutCreated = (workout: AIWorkout) => {
    // Convert the workout format to the format expected by startWorkout
    const workoutExercises = workout.exercises.map((exercise: AIExercise) => ({
      id: exercise.id || `e${new Date().getTime() + Math.random()}`,
      name: exercise.name,
      sets: exercise.sets,
      targetReps: exercise.targetReps,
      restTime: exercise.restTime || 60,
      category: exercise.category,
      equipment: exercise.equipment,
      completed: false
    }));

    // Start the workout with the exercises created by AI
    startWorkout(workoutExercises);
    // Navigate to the active workout screen
    router.push('/workout/active');
  };

  // If workout is active but navigation hasn't happened yet, show loading or nothing
  if (isWorkoutActive && !isWorkoutMinimized) {
    return null; // Just return null while the useEffect handles navigation
  }

  // Show the empty state if no workout is active
  if (!isWorkoutActive) {
    return (
      <IMessagePageWrapper title="Workouts" showHeader={false}>
        <WorkoutEmptyState />
      </IMessagePageWrapper>
    );
  }

  // Otherwise show the regular workout history/templates screen with the floating tracker
  return (
    <IMessagePageWrapper title="Workouts" showHeader={false}>
      <View style={styles.contentContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'history' && styles.activeTabButtonText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'templates' && styles.activeTabButton]}
            onPress={() => setActiveTab('templates')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'templates' && styles.activeTabButtonText,
              ]}
            >
              Templates
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'history' ? (
          <FlatList
            data={workoutHistory}
            renderItem={({ item }) => (
              <WorkoutHistoryItem
                workout={item}
                onPress={() => handleSelectWorkout(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={workoutTemplates}
            renderItem={({ item }) => (
              <TemplateItem
                template={item}
                onPress={() => handleSelectTemplate(item.id)}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.startButton, styles.primaryButton]}
            onPress={handleStartWorkout}
            activeOpacity={0.8}
          >
            <View style={styles.startButtonInner}>
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Quick Start</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startButton, styles.secondaryButton]}
            onPress={handleStartLogWorkout}
            activeOpacity={0.8}
          >
            <View style={styles.startButtonInner}>
              <Ionicons name="barbell-outline" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Log Workout</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.startButton, styles.aiButton]}
            onPress={handleShowAICreator}
            activeOpacity={0.8}
          >
            <View style={styles.startButtonInner}>
              <Ionicons name="mic-outline" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>AI Workout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Show floating tracker if workout is active and minimized */}
        <FloatingWorkoutTracker />
        
        {/* AI Workout Creator Modal */}
        <Modal
          visible={showAICreator}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAICreator(false)}
        >
          <VoiceWorkoutCreator
            onClose={() => setShowAICreator(false)}
            onWorkoutCreated={handleWorkoutCreated}
          />
        </Modal>
      </View>
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(60, 60, 67, 0.12)',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for the FAB
  },
  historyItem: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  historyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseList: {
    marginBottom: 12,
  },
  exerciseText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  templateItem: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  exerciseCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCountText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  templateFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#0A84FF',
    shadowColor: '#0A84FF',
  },
  secondaryButton: {
    backgroundColor: '#30D158',
    shadowColor: '#30D158',
  },
  aiButton: {
    backgroundColor: '#FF2D55',
    shadowColor: '#FF2D55',
  },
  startButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});