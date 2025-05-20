import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Design system imports
import { useTheme } from '@/components/design-system/ThemeProvider';
import { CategoryCard, WorkoutCard } from '@/components/design-system/cards';
import { CategoryTabBar } from '@/components/design-system/navigation';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

// Data imports
import { mockExercises, mockPrograms, mockWorkouts } from '@/data/mockData';

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

export default function TrainingSpotifyScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('featured');
  
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

  const handleCreateWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/workout/create' as any);
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

  // Render workout card
  const renderWorkoutCard = ({ item }: { item: typeof mockWorkouts[0] }) => (
    <WorkoutCard
      workout={{
        id: item.id,
        title: item.title,
        exerciseCount: item.exercises.length,
        duration: item.duration,
        date: new Date(item.date).toLocaleDateString(),
      }}
      variant="default"
      onPress={() => handleWorkoutPress(item.id)}
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
            <Text style={styles.headerTitle}>Training</Text>
            
            {/* Search bar */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={() => router.push('/training/search' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color="#999" />
              <Text style={styles.searchBarText}>What do you want to train today?</Text>
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
              onPress={handleCreateWorkout}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Log Workout</Text>
            </TouchableOpacity>
          </View>

          {/* Categories grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
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
            <Text style={styles.sectionTitle}>Recently Trained</Text>
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
                    exerciseCount: workout.exercises.length,
                    duration: workout.duration,
                    date: new Date(workout.date).toLocaleDateString(),
                  }}
                  variant="default"
                  onPress={() => handleWorkoutPress(workout.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Popular workouts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Workouts</Text>
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
                    exerciseCount: workout.exercises.length,
                    duration: workout.duration,
                  }}
                  variant="default"
                  onPress={() => handleWorkoutPress(workout.id)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: '#999',
    marginLeft: 8,
    fontSize: 16,
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
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoriesGrid: {
    paddingHorizontal: 10,
  },
  horizontalScrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
});
