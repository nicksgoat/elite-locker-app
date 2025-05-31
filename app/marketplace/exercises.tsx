/**
 * Elite Locker - Marketplace Exercises Screen
 * Browse and discover individual exercise movements
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import SpotifyBleedingLayout from '../../components/design-system/layouts/SpotifyBleedingLayout';
import exerciseService from '../../services/exerciseService';
import { Category, Exercise, ExerciseTag } from '../../types/workout';

const { width: screenWidth } = Dimensions.get('window');

// Fallback header image for exercises category (using workouts image temporarily)
const headerImage = require('../../assets/images/marketplace/workouts.jpg');

export default function MarketplaceExercisesScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [exerciseTags, setExerciseTags] = useState<ExerciseTag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExercises = async () => {
    try {
      setIsLoading(true);

      const [exercisesData, categoriesData, tagsData] = await Promise.all([
        exerciseService.searchExercises({
          query: searchQuery,
          categoryId: selectedCategory || undefined,
          tagIds: selectedTags,
          visibility: 'public',
          limit: 50
        }),
        exerciseService.getCategories(),
        exerciseService.getExerciseTags()
      ]);

      setExercises(exercisesData);
      setCategories(categoriesData);
      setExerciseTags(tagsData);
    } catch (error) {
      console.error('Error loading exercises:', error);
      // Fallback to empty arrays
      setExercises([]);
      setCategories([]);
      setExerciseTags([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [searchQuery, selectedCategory, selectedTags]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      loadExercises();
    }
  }, [searchQuery]);

  const handleExercisePress = useCallback((exercise: Exercise) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/exercises/detail/${exercise.id}` as any);
  }, [router]);

  const handleTagPress = useCallback((tagId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadExercises();
    } catch (error) {
      console.error('Error refreshing exercises:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleExercisePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.exerciseCardContent}>
        <View style={styles.exerciseIcon}>
          <Ionicons
            name="barbell-outline"
            size={24}
            color="#0A84FF"
          />
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          <View style={styles.exerciseTags}>
            {item.tags?.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: `${tag.colorHex}20` }]}>
                <Text style={[styles.tagText, { color: tag.colorHex }]}>
                  {tag.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.exerciseAction}>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTag = ({ item }: { item: ExerciseTag }) => (
    <TouchableOpacity
      style={[
        styles.filterTag,
        selectedTags.includes(item.id) && styles.filterTagSelected
      ]}
      onPress={() => handleTagPress(item.id)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterTagText,
        selectedTags.includes(item.id) && styles.filterTagTextSelected
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SpotifyBleedingLayout
      categoryImage={headerImage}
      title="Exercises"
      subtitle={`${exercises.length} movements available`}
      onBackPress={handleBackPress}
      isLoading={isLoading}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>
      </View>

      {/* Filter Tags */}
      {exerciseTags.length > 0 && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filter by tags</Text>
          <FlatList
            data={exerciseTags.filter(tag => tag.groupName === 'body_part')}
            renderItem={renderTag}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>
      )}

      {exercises.length > 0 ? (
        <FlatList
          data={exercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.exercisesList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="barbell-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No exercises found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </SpotifyBleedingLayout>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  filtersList: {
    paddingRight: 16,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterTagSelected: {
    backgroundColor: '#0A84FF',
  },
  filterTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  filterTagTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  exercisesList: {
    paddingHorizontal: 16,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#EBEBF5',
    opacity: 0.8,
    marginBottom: 8,
  },
  exerciseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exerciseAction: {
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
