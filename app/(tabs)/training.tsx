import { Text } from '@/components/design-system/primitives';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';

// Design system imports
// import { useTheme } from '@/components/design-system/ThemeProvider';
import { CategoryCard, WorkoutCard } from '@/components/design-system/cards';
import { WorkoutCardData } from '@/components/design-system/cards/WorkoutCard';
import { CategoryTabBar } from '@/components/design-system/navigation';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';
import TrainingOptionsModal from '@/components/ui/TrainingOptionsModal';
import VoiceWorkoutCreator from '@/components/ui/VoiceWorkoutCreator';
import { useWorkout } from '@/contexts/WorkoutContext';

// Data imports
import { mockPrograms, mockWorkouts } from '@/data/mockData';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Define workout categories
const workoutCategories = [
  { id: 'featured', label: 'Featured' },
  { id: 'strength', label: 'Strength' },
  { id: 'hypertrophy', label: 'Hypertrophy' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'hiit', label: 'HIIT' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'sports', label: 'Sports' },
  { id: 'bodyparts', label: 'Body Parts' },
];

// Define category cards
const categoryCards = [
  { id: 'strength', title: 'Strength Training', color: '#0A84FF', icon: 'barbell-outline' },
  { id: 'hypertrophy', title: 'Hypertrophy', color: '#FF2D55', icon: 'fitness-outline' },
  { id: 'cardio', title: 'Cardio', color: '#30D158', icon: 'heart-outline' },
  { id: 'hiit', title: 'HIIT', color: '#FF9F0A', icon: 'timer-outline' },
  { id: 'mobility', title: 'Mobility', color: '#5856D6', icon: 'body-outline' },
  { id: 'sports', title: 'Sports', color: '#64D2FF', icon: 'basketball-outline' },
  { id: 'upper', title: 'Upper Body', color: '#BF5AF2', icon: 'body-outline' },
  { id: 'lower', title: 'Lower Body', color: '#FF3B30', icon: 'body-outline' },
  { id: 'core', title: 'Core', color: '#FFD60A', icon: 'body-outline' },
  { id: 'programs', title: 'Programs', color: '#5E5CE6', icon: 'calendar-outline' },
];

// Define workout and exercise types for TypeScript
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
  date?: string;
  duration?: number;
  notes?: string;
}

export default function TrainingScreen() {
  const router = useRouter();
  // const { colors, spacing } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('featured');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const { startWorkout } = useWorkout();

  // Debug logging for modal state
  useEffect(() => {
    console.log('Options Modal State:', showOptionsModal);
    console.log('AI Creator Modal State:', showAICreator);
  }, [showOptionsModal, showAICreator]);

  // Navigation handlers
  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}` as any);
  };

  const handleProgramPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/detail/${id}` as any);
  };

  const handleCategoryPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/training/category/${id}` as any);
  };

  const handleExercisePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/exercise/detail/${id}` as any);
  };

  const handleCreateWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/workout/create' as any);
  };

  // Show options modal
  const handleShowOptions = () => {
    console.log('Training Options button pressed');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowOptionsModal(true);
  };

  // Show AI workout creator
  const handleShowAICreator = () => {
    console.log('AI Workout Creator selected from options menu');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowOptionsModal(false);
    // Small delay to let the options modal close
    setTimeout(() => {
      setShowAICreator(true);
    }, 300);
  };

  // Direct access to AI Workout Creator for testing
  const handleDirectAICreator = () => {
    console.log('Directly opening AI Creator');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAICreator(true);
  };

  // Handle the created workout from the AI
  const handleWorkoutCreated = (workout: AIWorkout) => {
    console.log('Workout created by AI:', workout);
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
  };

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  // Render category card
  const renderCategoryCard = ({ item }: { item: typeof categoryCards[0] }) => (
    <CategoryCard
      id={item.id}
      title={item.title}
      color={item.color}
      icon={item.icon as any}
      onPress={handleCategoryPress}
    />
  );

  return (
    <IMessagePageWrapper
      title="Training"
      subtitle="Discover workouts and programs"
      showHeader={false}
    >
      {/* Header with search bar */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text variant="h1" color="inverse" style={styles.headerTitle}>Training</Text>

            {/* Search bar */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => router.push('/training/search' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color="#999" />
              <Text variant="body" color="secondary" style={styles.searchBarText}>What do you want to train today?</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      {/* Category tabs */}
      <CategoryTabBar
        tabs={workoutCategories}
        activeTab={activeCategory}
        onTabChange={setActiveCategory}
        style={styles.categoryTabs}
      />

      {/* Main content */}
      <Animated.ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleShowOptions}
              activeOpacity={0.8}
            >
              <Ionicons name="menu" size={22} color="#FFFFFF" />
              <Text variant="bodySemiBold" color="inverse" style={styles.quickActionText}>Training Options</Text>
            </TouchableOpacity>
            
            {/* Temporary direct access to AI Creator for testing */}
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: 'rgba(255, 45, 85, 0.2)' }]}
              onPress={handleDirectAICreator}
              activeOpacity={0.8}
            >
              <Ionicons name="flash-outline" size={22} color="#FF2D55" />
              <Text variant="bodySemiBold" color="inverse" style={styles.quickActionText}>AI Workout</Text>
            </TouchableOpacity>
          </View>

          {/* Categories grid */}
          <View style={styles.section}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Browse Categories</Text>
            <FlatList
              data={categoryCards}
              renderItem={renderCategoryCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesGrid}
            />
          </View>

          {/* Recently played */}
          <View style={styles.section}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Recently Trained</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              decelerationRate="fast"
            >
              {mockWorkouts.slice(0, 5).map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={{
                    id: workout.id,
                    title: workout.title,
                    exercises: workout.exercises.length,
                    duration: workout.duration ? Math.floor(workout.duration * 60) : 0, // Convert to seconds
                  }}
                  variant="default"
                  onPress={() => handleWorkoutPress(workout.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Popular workouts */}
          <View style={styles.section}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Popular Workouts</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              decelerationRate="fast"
            >
              {mockWorkouts.slice(0, 5).map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={{
                    id: workout.id,
                    title: workout.title,
                    exercises: workout.exercises.length,
                    duration: workout.duration ? Math.floor(workout.duration * 60) : 0, // Convert to seconds
                  }}
                  variant="default"
                  onPress={() => handleWorkoutPress(workout.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Programs section */}
          <View style={styles.section}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Featured Programs</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              decelerationRate="fast"
            >
              {mockPrograms.slice(0, 5).map(program => (
                <WorkoutCard
                  key={program.id}
                  workout={{
                    id: program.id,
                    title: program.title,
                    exercises: program.totalWorkouts || 4, // Use totalWorkouts property if available, or fallback to 4
                    duration: program.duration ? program.duration * 7 * 24 * 60 * 60 : 0, // weeks to seconds
                  }}
                  variant="default"
                  onPress={() => handleProgramPress(program.id)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Training Options Modal */}
      <TrainingOptionsModal
        visible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        onSelectAIWorkout={handleShowAICreator}
      />

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
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  headerBlur: {
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchBarText: {
    marginLeft: 8,
  },
  categoryTabs: {
    marginTop: 120,
    zIndex: 5,
  },
  contentContainer: {
    paddingTop: 180,
    paddingBottom: 100,
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  quickActionText: {
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoriesGrid: {
    paddingHorizontal: 8,
  },
  horizontalScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
});
