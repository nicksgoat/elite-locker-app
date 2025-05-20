import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Design system imports
import { WorkoutCard } from '@/components/design-system/cards';
import { CategoryTabBar } from '@/components/design-system/navigation';
import { Text } from '@/components/design-system/primitives';

// Data imports
import { mockWorkouts } from '@/data/mockData';

// Define subcategories
const subcategories = {
  strength: [
    { id: 'powerlifting', label: 'Powerlifting' },
    { id: 'olympic', label: 'Olympic Lifting' },
    { id: 'functional', label: 'Functional Strength' },
    { id: 'calisthenics', label: 'Calisthenics' },
  ],
  hypertrophy: [
    { id: 'bodybuilding', label: 'Bodybuilding' },
    { id: 'volume', label: 'Volume Training' },
    { id: 'isolation', label: 'Isolation Work' },
  ],
  cardio: [
    { id: 'running', label: 'Running' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'swimming', label: 'Swimming' },
    { id: 'rowing', label: 'Rowing' },
  ],
  hiit: [
    { id: 'tabata', label: 'Tabata' },
    { id: 'amrap', label: 'AMRAP' },
    { id: 'emom', label: 'EMOM' },
    { id: 'circuit', label: 'Circuit Training' },
  ],
  mobility: [
    { id: 'stretching', label: 'Stretching' },
    { id: 'yoga', label: 'Yoga' },
    { id: 'recovery', label: 'Recovery' },
  ],
  sports: [
    { id: 'basketball', label: 'Basketball' },
    { id: 'soccer', label: 'Soccer' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'golf', label: 'Golf' },
  ],
  upper: [
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
  ],
  lower: [
    { id: 'quads', label: 'Quads' },
    { id: 'hamstrings', label: 'Hamstrings' },
    { id: 'glutes', label: 'Glutes' },
    { id: 'calves', label: 'Calves' },
  ],
  core: [
    { id: 'abs', label: 'Abs' },
    { id: 'obliques', label: 'Obliques' },
    { id: 'lowerback', label: 'Lower Back' },
  ],
  programs: [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ],
  featured: [
    { id: 'trending', label: 'Trending' },
    { id: 'new', label: 'New' },
    { id: 'popular', label: 'Popular' },
  ],
};

// Category colors
const categoryColors = {
  strength: '#0A84FF',
  hypertrophy: '#FF2D55',
  cardio: '#30D158',
  hiit: '#FF9F0A',
  mobility: '#5856D6',
  sports: '#64D2FF',
  upper: '#BF5AF2',
  lower: '#FF3B30',
  core: '#FFD60A',
  programs: '#5E5CE6',
  featured: '#0A84FF',
};

// Category icons
const categoryIcons = {
  strength: 'barbell-outline',
  hypertrophy: 'fitness-outline',
  cardio: 'heart-outline',
  hiit: 'timer-outline',
  mobility: 'body-outline',
  sports: 'basketball-outline',
  upper: 'body-outline',
  lower: 'body-outline',
  core: 'body-outline',
  programs: 'calendar-outline',
  featured: 'star-outline',
};

// Category titles
const categoryTitles = {
  strength: 'Strength Training',
  hypertrophy: 'Hypertrophy',
  cardio: 'Cardio',
  hiit: 'HIIT',
  mobility: 'Mobility',
  sports: 'Sports',
  upper: 'Upper Body',
  lower: 'Lower Body',
  core: 'Core',
  programs: 'Programs',
  featured: 'Featured',
};

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = id || 'featured';
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  // const { colors, spacing } = useTheme();

  // Get category color and title
  const categoryColor = categoryColors[categoryId as keyof typeof categoryColors] || '#0A84FF';
  const categoryTitle = categoryTitles[categoryId as keyof typeof categoryTitles] || 'Category';
  const categoryIcon = categoryIcons[categoryId as keyof typeof categoryIcons] || 'star-outline';

  // Get subcategories for this category
  const categorySubcategories = subcategories[categoryId as keyof typeof subcategories] || [];

  // Add "All" as the first subcategory
  const allSubcategories = [
    { id: 'all', label: 'All' },
    ...categorySubcategories,
  ];

  // Header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 60],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  // Navigation handlers
  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}` as any);
  };

  const handleProgramPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/detail/${id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={[categoryColor, 'rgba(0,0,0,0.8)']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
            <View style={styles.categoryIconContainer}>
              <Ionicons name={categoryIcon as any} size={32} color="#FFFFFF" />
            </View>
            <Text variant="h1" color="inverse" style={styles.headerTitle}>{categoryTitle}</Text>
            <Text variant="body" color="inverse" style={styles.headerSubtitle}>Find the perfect workout</Text>
          </Animated.View>
        </LinearGradient>

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Subcategory tabs */}
      <CategoryTabBar
        tabs={allSubcategories}
        activeTab={activeSubcategory}
        onTabChange={setActiveSubcategory}
        style={styles.subcategoryTabs}
      />

      {/* Main content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          {/* Featured workout */}
          <View style={styles.featuredContainer}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Featured {categoryTitle} Workout</Text>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => handleWorkoutPress(mockWorkouts[0].id)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500' }}
                style={styles.featuredImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.featuredGradient}
              >
                <View style={styles.featuredContent}>
                  <Text variant="bodySemiBold" color="inverse" style={styles.featuredTitle}>{mockWorkouts[0].title}</Text>
                  <Text variant="bodySmall" color="inverse" style={styles.featuredSubtitle}>
                    {mockWorkouts[0].exercises.length} exercises • {mockWorkouts[0].duration} min
                  </Text>
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Workouts grid */}
          <View style={styles.section}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Popular {categoryTitle} Workouts</Text>
            <FlatList
              data={mockWorkouts.slice(0, 6)}
              renderItem={({ item }) => (
                <WorkoutCard
                  workout={{
                    id: item.id,
                    title: item.title,
                    exerciseCount: item.exercises.length,
                    duration: item.duration,
                  }}
                  variant="default"
                  onPress={() => handleWorkoutPress(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.workoutsGrid}
            />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
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
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryTabs: {
    marginTop: 200,
    zIndex: 5,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 260,
    paddingBottom: 100,
  },
  featuredContainer: {
    marginBottom: 32,
  },
  featuredCard: {
    marginHorizontal: 16,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    marginBottom: 4,
  },
  featuredSubtitle: {
    opacity: 0.8,
    marginTop: 4,
  },
  playButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  workoutsGrid: {
    paddingHorizontal: 8,
  },
});
