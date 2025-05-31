/**
 * Elite Locker - Marketplace Workouts Screen
 * Spotify-style browsing for workouts with categories and filtering
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WorkoutCard } from '../../components/design-system/cards';
import { categoryService } from '../../services/categoryService';
import { workoutService } from '../../services/workoutService';

const { width: screenWidth } = Dimensions.get('window');

// Interface for filter options (includes database categories + "All" option)
interface FilterOption {
  id: string;
  title: string;
  color: string;
  slug?: string;
}

const sortOptions = [
  { id: 'popular', title: 'Popular' },
  { id: 'newest', title: 'Newest' },
  { id: 'rating', title: 'Top Rated' },
  { id: 'duration', title: 'Duration' },
];

export default function MarketplaceWorkoutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [workouts, setWorkouts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');

  const loadWorkouts = async (categoryId?: string) => {
    try {
      // Load categories first
      const categoriesData = await categoryService.getCategories().catch(() => []);
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];

      // Build filter options from database categories
      const dynamicFilterOptions: FilterOption[] = [
        { id: 'all', title: 'All Workouts', color: '#0A84FF' },
        ...categoriesArray.map(category => ({
          id: category.id,
          title: category.name,
          color: category.color_hex,
          slug: category.slug,
        }))
      ];

      // Load workouts based on selected category
      let workoutsData: any[] = [];
      if (categoryId && categoryId !== 'all') {
        // Load workouts for specific category
        workoutsData = await categoryService.getWorkoutsByCategory(categoryId, 50).catch(() => []);
      } else {
        // Load all marketplace workouts (public templates and paid workouts)
        workoutsData = await workoutService.getMarketplaceWorkouts({ limit: 50 }).catch(() => []);
      }

      const workoutsArray = Array.isArray(workoutsData) ? workoutsData : [];

      // Transform workouts for display
      const transformedWorkouts = workoutsArray.map(workout => ({
        ...workout,
        type: 'workout',
        imageUrl: workout.image_url || workout.thumbnail_url || '',
        duration: workout.duration || '30 min',
        difficulty: workout.difficulty || workout.level || 'Intermediate',
        rating: workout.rating || 4.5,
        price: workout.price || 0,
      }));

      setWorkouts(transformedWorkouts);
      setCategories(categoriesArray);
      setFilterOptions(dynamicFilterOptions);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWorkouts(selectedFilter);
    setRefreshing(false);
  }, [selectedFilter]);

  const handleWorkoutPress = useCallback((workout: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${workout.id}` as any);
  }, [router]);

  const handleFilterPress = useCallback(async (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
    setIsLoading(true);
    await loadWorkouts(filterId);
  }, []);

  const handleSortPress = useCallback((sortId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSort(sortId);
  }, []);

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  // Since we're loading workouts by category, we don't need client-side filtering
  const filteredWorkouts = workouts;

  const renderFilterChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === item.id && { backgroundColor: item.color }
      ]}
      onPress={() => handleFilterPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.filterChipText,
        selectedFilter === item.id && styles.filterChipTextActive
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderSortOption = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        selectedSort === item.id && styles.sortOptionActive
      ]}
      onPress={() => handleSortPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.sortOptionText,
        selectedSort === item.id && styles.sortOptionTextActive
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderWorkout = ({ item }: { item: any }) => (
    <WorkoutCard
      id={item.id}
      title={item.title || item.name}
      description={item.description}
      duration={item.duration}
      difficulty={item.difficulty}
      imageUrl={item.imageUrl}
      rating={item.rating}
      price={item.price}
      onPress={() => handleWorkoutPress(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Spotify-style Header with Background Image */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/marketplace/workouts.jpg')}
            style={styles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
              style={styles.headerGradient}
            >
              <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Workouts</Text>
                <Text style={styles.headerSubtitle}>Loading workouts...</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Extended background image that bleeds down */}
      <View style={styles.extendedBackground}>
        <ImageBackground
          source={require('../../assets/images/marketplace/workouts.jpg')}
          style={styles.extendedBackgroundImage}
          imageStyle={{ resizeMode: 'cover' }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.4, 0.7, 1]}
          style={styles.extendedGradient}
        />
      </View>

      {/* Spotify-style Header with Background Image */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../../assets/images/marketplace/workouts.jpg')}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
            style={styles.headerGradient}
          >
            <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Workouts</Text>
              <Text style={styles.headerSubtitle}>{filteredWorkouts.length} workouts available</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
          {/* Filter Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={filterOptions}
              renderItem={renderFilterChip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort by</Text>
            <FlatList
              data={sortOptions}
              renderItem={renderSortOption}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortList}
            />
          </View>

          {/* Workouts Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {filterOptions.find(f => f.id === selectedFilter)?.title || 'All Workouts'}
            </Text>
            <FlatList
              data={filteredWorkouts}
              renderItem={renderWorkout}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.workoutsGrid}
              columnWrapperStyle={styles.workoutsRow}
            />
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  extendedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 800, // Extends much further down to create strong bleeding effect
  },
  extendedBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7, // Make it clearly visible
  },
  extendedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 2, // Above the extended background
  },
  headerBackground: {
    height: 200,
    width: '100%',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sortList: {
    paddingHorizontal: 16,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sortOptionTextActive: {
    color: '#0A84FF',
  },
  workoutsGrid: {
    paddingHorizontal: 16,
  },
  workoutsRow: {
    justifyContent: 'space-between',
  },
});
