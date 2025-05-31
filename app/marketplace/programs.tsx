/**
 * Elite Locker - Marketplace Programs Screen
 * Spotify-style browsing for training programs with categories and filtering
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

import ProgramCard from '../../components/cards/ProgramCard';
import { categoryService } from '../../services/categoryService';
import { programService } from '../../services/programService';

const { width: screenWidth } = Dimensions.get('window');

const filterOptions = [
  { id: 'all', title: 'All Programs', color: '#0A84FF' },
  { id: 'strength', title: 'Strength', color: '#FF2D55' },
  { id: 'muscle-building', title: 'Muscle Building', color: '#30D158' },
  { id: 'fat-loss', title: 'Fat Loss', color: '#FF9F0A' },
  { id: 'athletic', title: 'Athletic', color: '#5856D6' },
  { id: 'beginner', title: 'Beginner', color: '#64D2FF' },
];

const durationFilters = [
  { id: 'all', title: 'Any Duration' },
  { id: '4-weeks', title: '4 Weeks' },
  { id: '8-weeks', title: '8 Weeks' },
  { id: '12-weeks', title: '12 Weeks' },
  { id: '16-weeks', title: '16+ Weeks' },
];

const sortOptions = [
  { id: 'popular', title: 'Popular' },
  { id: 'newest', title: 'Newest' },
  { id: 'rating', title: 'Top Rated' },
  { id: 'price', title: 'Price' },
];

export default function MarketplaceProgramsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [programs, setPrograms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');

  const loadPrograms = async () => {
    try {
      const [programsData, categoriesData] = await Promise.all([
        programService.getPrograms().catch(() => []),
        categoryService.getCategories().catch(() => []),
      ]);

      const programsArray = Array.isArray(programsData) ? programsData : [];
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];

      // Transform programs for display
      const transformedPrograms = programsArray.map(program => ({
        ...program,
        type: 'program',
        imageUrl: program.image_url || '',
        duration: program.duration || '8 weeks',
        difficulty: program.difficulty || 'Intermediate',
        rating: program.rating || 4.5,
        price: program.price || 0,
        workoutCount: program.workout_count || 24,
      }));

      setPrograms(transformedPrograms);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
  }, []);

  const handleProgramPress = useCallback((program: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/detail/${program.id}` as any);
  }, [router]);

  const handleFilterPress = useCallback((filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
  }, []);

  const handleDurationPress = useCallback((durationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDuration(durationId);
  }, []);

  const handleSortPress = useCallback((sortId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSort(sortId);
  }, []);

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const filteredPrograms = programs.filter(program => {
    if (selectedFilter === 'all') return true;
    return program.category?.toLowerCase().includes(selectedFilter.toLowerCase()) ||
           program.tags?.some((tag: string) => tag.toLowerCase().includes(selectedFilter.toLowerCase()));
  });

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

  const renderDurationChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.durationChip,
        selectedDuration === item.id && styles.durationChipActive
      ]}
      onPress={() => handleDurationPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.durationChipText,
        selectedDuration === item.id && styles.durationChipTextActive
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

  const renderProgram = ({ item }: { item: any }) => (
    <ProgramCard
      id={item.id}
      title={item.title || item.name}
      description={item.description}
      duration={item.duration}
      difficulty={item.difficulty}
      imageUrl={item.imageUrl}
      rating={item.rating}
      price={item.price}
      workoutCount={item.workoutCount}
      onPress={() => handleProgramPress(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Extended background image that bleeds down */}
        <View style={styles.extendedBackground}>
          <ImageBackground
            source={require('../../assets/images/marketplace/programs.jpg')}
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
            source={require('../../assets/images/marketplace/programs.jpg')}
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
                <Text style={styles.headerTitle}>Programs</Text>
                <Text style={styles.headerSubtitle}>Loading programs...</Text>
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
          source={require('../../assets/images/marketplace/programs.jpg')}
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
          source={require('../../assets/images/marketplace/programs.jpg')}
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
              <Text style={styles.headerTitle}>Programs</Text>
              <Text style={styles.headerSubtitle}>{filteredPrograms.length} programs available</Text>
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

          {/* Duration Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <FlatList
              data={durationFilters}
              renderItem={renderDurationChip}
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

          {/* Programs List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'All Programs' : filterOptions.find(f => f.id === selectedFilter)?.title}
            </Text>
            <FlatList
              data={filteredPrograms}
              renderItem={renderProgram}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.programsList}
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
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  durationChipActive: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  durationChipTextActive: {
    color: '#30D158',
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
  programsList: {
    paddingHorizontal: 16,
  },
});
