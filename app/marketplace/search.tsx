/**
 * Elite Locker - Marketplace Search Screen
 *
 * A comprehensive search interface for finding workouts, programs, clubs, and creators
 * following Spotify's search design patterns.
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Import design system components
import ClubCard from '../../components/cards/ClubCard';
import ProgramCard from '../../components/cards/ProgramCard';
import { WorkoutCard } from '../../components/design-system/cards';
import { useTheme } from '../../components/design-system/ThemeProvider';
import IMessagePageWrapper from '../../components/layout/iMessagePageWrapper';
import { clubService } from '../../services/clubService';
import { exerciseService } from '../../services/exerciseService';
import { programService } from '../../services/programService';
import { workoutService } from '../../services/workoutService';

// Search categories
const searchCategories = [
  { id: 'all', title: 'All', color: '#0A84FF', icon: 'search-outline' },
  { id: 'workouts', title: 'Workouts', color: '#FF2D55', icon: 'fitness-outline' },
  { id: 'programs', title: 'Programs', color: '#30D158', icon: 'calendar-outline' },
  { id: 'clubs', title: 'Clubs', color: '#FF9F0A', icon: 'people-outline' },
  { id: 'creators', title: 'Creators', color: '#5856D6', icon: 'star-outline' },
  { id: 'exercises', title: 'Exercises', color: '#64D2FF', icon: 'barbell-outline' },
];

export default function MarketplaceSearchScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'Push workout',
    'Beginner program',
    'Elite club',
    'Strength training',
  ]);

  // Perform search
  const performSearch = async (query: string, category: string = 'all') => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = [];

      if (category === 'all' || category === 'workouts') {
        const workouts = await workoutService.getWorkoutHistory({ limit: 20 });
        const filteredWorkouts = workouts
          .filter(workout =>
            workout.title.toLowerCase().includes(query.toLowerCase()) ||
            workout.description?.toLowerCase().includes(query.toLowerCase())
          )
          .map(workout => ({ ...workout, type: 'workout' }));
        results.push(...filteredWorkouts);
      }

      if (category === 'all' || category === 'programs') {
        const programs = await programService.getPrograms();
        const filteredPrograms = programs
          .filter(program =>
            program.title.toLowerCase().includes(query.toLowerCase()) ||
            program.description?.toLowerCase().includes(query.toLowerCase())
          )
          .map(program => ({ ...program, type: 'program' }));
        results.push(...filteredPrograms);
      }

      if (category === 'all' || category === 'clubs') {
        const clubs = await clubService.getClubs({ limit: 20 });
        const filteredClubs = clubs
          .filter(club =>
            club.name.toLowerCase().includes(query.toLowerCase()) ||
            club.description?.toLowerCase().includes(query.toLowerCase())
          )
          .map(club => ({ ...club, type: 'club' }));
        results.push(...filteredClubs);
      }

      if (category === 'all' || category === 'exercises') {
        const exercises = await exerciseService.getExercises({ search: query, limit: 15 });
        const filteredExercises = exercises.map(exercise => ({ ...exercise, type: 'exercise' }));
        results.push(...filteredExercises);
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery, activeCategory);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeCategory]);

  // Navigation handlers
  const handleItemPress = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (item.type) {
      case 'workout':
        router.push(`/workout/detail/${item.id}` as any);
        break;
      case 'program':
        router.push(`/programs/detail/${item.id}` as any);
        break;
      case 'club':
        router.push(`/club/${item.id}` as any);
        break;
      case 'creator':
        router.push(`/profile/${item.id}` as any);
        break;
    }
  };

  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
  };

  const handleCategoryPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(categoryId);
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'workout':
        return (
          <WorkoutCard
            workout={{
              id: item.id,
              title: item.title,
              exerciseCount: item.exercises?.length || 0,
              duration: item.duration,
              thumbnailUrl: item.thumbnail_url,
            }}
            variant="compact"
            onPress={() => handleItemPress(item)}
          />
        );
      case 'program':
        return (
          <ProgramCard
            title={item.title}
            description={item.description}
            authorName={item.author_name || 'Unknown'}
            imageUrl={item.thumbnail_url}
            duration={item.duration}
            workoutCount={item.workouts?.length || 0}
            level={item.level}
            price={item.price}
            onPress={() => handleItemPress(item)}
          />
        );
      case 'club':
        return (
          <ClubCard
            id={item.id}
            name={item.name}
            description={item.description}
            ownerName={item.owner_name || 'Unknown'}
            profileImageUrl={item.profile_image_url}
            memberCount={item.member_count}
            price={item.price}
            onPress={() => handleItemPress(item)}
          />
        );
      default:
        return (
          <TouchableOpacity
            style={styles.searchResultItem}
            onPress={() => handleItemPress(item)}
          >
            <Text style={styles.searchResultTitle}>{item.title || item.name}</Text>
            <Text style={styles.searchResultType}>{item.type}</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <IMessagePageWrapper
      title="Search Marketplace"
      subtitle="Find workouts, programs, clubs, and more"
      showHeader={false}
    >
      {/* Header with search bar */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.searchContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search marketplace..."
                  placeholderTextColor="#666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </BlurView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Search categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={searchCategories}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  activeCategory === item.id && styles.categoryChipActive
                ]}
                onPress={() => handleCategoryPress(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={activeCategory === item.id ? '#FFFFFF' : '#999'}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    activeCategory === item.id && styles.categoryChipTextActive
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Search results or recent searches */}
        {searchQuery ? (
          <View style={styles.resultsContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0A84FF" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.resultsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No results found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your search or browse categories
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.recentContainer}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => handleRecentSearchPress(search)}
              >
                <Ionicons name="time-outline" size={20} color="#999" />
                <Text style={styles.recentText}>{search}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </IMessagePageWrapper>
  );
}

// Styles for the search screen
const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBlur: {
    paddingTop: 60,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingTop: 120,
    backgroundColor: '#000000',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#0A84FF',
  },
  categoryChipText: {
    color: '#999',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  searchResultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  searchResultTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultType: {
    color: '#999',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#999',
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  recentContainer: {
    paddingHorizontal: 16,
  },
  recentTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  recentText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
});
