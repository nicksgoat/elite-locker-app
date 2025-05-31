import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import the design system ExerciseCard
import { ExerciseCard } from '@/components/design-system/cards';
import { Exercise, ExerciseTag } from '../../types/workout';

// Types for filtering
interface ExerciseTagFilter {
  id: string;
  name: string;
  label: string;
  special?: boolean;
}

// Mock data for initial development
const mockExercises: Exercise[] = [
  {
    id: 'e1',
    name: 'Barbell Squat',
    description: 'Compound lower body exercise targeting quads, glutes, and hamstrings',
    videoUrl: 'https://example.com/squat.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['weight_reps', 'rpe'], default: 'weight_reps' },
    tags: ['strength_training', 'compound', 'legs', 'barbell'],
    isFavorite: true,
    createdBy: 'system',
  },
  {
    id: 'e2',
    name: 'Bench Press',
    description: 'Upper body compound movement for chest, shoulders, and triceps',
    videoUrl: 'https://example.com/bench.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['weight_reps', 'rpe'], default: 'weight_reps' },
    tags: ['strength_training', 'compound', 'chest', 'barbell'],
    isFavorite: false,
    createdBy: 'system',
  },
  {
    id: 'e3',
    name: 'Deadlift',
    description: 'Full body pulling exercise for posterior chain development',
    videoUrl: 'https://example.com/deadlift.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['weight_reps', 'rpe'], default: 'weight_reps' },
    tags: ['strength_training', 'compound', 'back', 'barbell'],
    isFavorite: true,
    createdBy: 'system',
  },
  {
    id: 'e4',
    name: 'Route Running Drill',
    description: 'Football-specific agility training for wide receivers',
    videoUrl: 'https://example.com/route.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['time_based', 'distance'], default: 'time_based' },
    tags: ['football', 'agility', 'speed', 'route_running'],
    isFavorite: false,
    createdBy: 'system',
  },
  {
    id: 'e5',
    name: 'Box Jump',
    description: 'Explosive lower body plyometric exercise',
    videoUrl: 'https://example.com/boxjump.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['reps', 'height'], default: 'reps' },
    tags: ['plyometrics', 'explosive', 'legs', 'equipment'],
    isFavorite: false,
    createdBy: 'system',
  },
  {
    id: 'e6',
    name: 'Pull-Up',
    description: 'Upper body pulling movement for back and biceps',
    videoUrl: 'https://example.com/pullup.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['reps', 'weight_reps'], default: 'reps' },
    tags: ['strength_training', 'bodyweight', 'back', 'pull'],
    isFavorite: true,
    createdBy: 'system',
  },
];

// Available tags for filtering
const availableTags: ExerciseTag[] = [
  { id: 't1', name: 'strength_training', label: 'Strength' },
  { id: 't2', name: 'football', label: 'Football' },
  { id: 't3', name: 'barbell', label: 'Barbell' },
  { id: 't4', name: 'bodyweight', label: 'Bodyweight' },
  { id: 't5', name: 'plyometrics', label: 'Plyometrics' },
  { id: 't6', name: 'route_running', label: 'Routes' },
  { id: 't7', name: 'legs', label: 'Legs' },
  { id: 't8', name: 'chest', label: 'Chest' },
  { id: 't9', name: 'back', label: 'Back' },
  { id: 't10', name: 'favorites', label: 'Favorites', special: true },
];

interface TagPillProps {
  tag: ExerciseTagFilter;
  selected: boolean;
  onPress: (tag: ExerciseTagFilter) => void;
}

const TagPill: React.FC<TagPillProps> = ({ tag, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.tagPill,
        selected && styles.tagPillSelected,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(tag);
      }}
      activeOpacity={0.7}
    >
      {selected && (
        <Ionicons
          name="checkmark"
          size={12}
          color="#FFFFFF"
          style={styles.tagCheckmark}
        />
      )}
      <Text style={[
        styles.tagText,
        selected && styles.tagTextSelected,
        tag.special && !selected && { color: '#FF9F0A' }
      ]}>
        {tag.label}
      </Text>
    </TouchableOpacity>
  );
};

// We're now using the design system ExerciseCard component

export default function ExerciseLibraryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<ExerciseTagFilter[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [availableTagsData, setAvailableTagsData] = useState<ExerciseTagFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = new Animated.Value(0);

  // Load exercises and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load exercises with enhanced details
        const exercisesData = await exerciseService.getExercisesWithDetails();
        setExercises(exercisesData);

        // Load exercise tags for filtering
        const tagsData = await exerciseService.getExerciseTags();
        const tagFilters: ExerciseTagFilter[] = tagsData.map(tag => ({
          id: tag.id,
          name: tag.name,
          label: tag.label,
        }));

        // Add special "Favorites" filter
        tagFilters.push({ id: 'favorites', name: 'favorites', label: 'Favorites', special: true });

        setAvailableTagsData(tagFilters);
      } catch (error) {
        console.error('Error loading exercise data:', error);
        // Fallback to mock data
        setExercises(mockExercises);
        setAvailableTagsData(availableTags);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter exercises based on search query and selected tags
  useEffect(() => {
    let filtered = exercises;

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        (ex.description && ex.description.toLowerCase().includes(query)) ||
        (ex.notes && ex.notes.toLowerCase().includes(query)) ||
        (ex.tags && ex.tags.some(tag =>
          typeof tag === 'string'
            ? tag.toLowerCase().includes(query)
            : tag.label.toLowerCase().includes(query)
        ))
      );
    }

    if (selectedTags.length > 0) {
      // Special case for "Favorites" tag
      const hasFavoritesTag = selectedTags.some(tag => tag.name === 'favorites');

      // Filter for regular tags
      const regularTags = selectedTags.filter(tag => tag.name !== 'favorites').map(tag => tag.name);

      if (regularTags.length > 0) {
        filtered = filtered.filter(ex =>
          ex.tags && regularTags.some(tagName =>
            ex.tags.some(tag =>
              typeof tag === 'string' ? tag === tagName : tag.name === tagName
            )
          )
        );
      }

      // Apply favorites filter if selected
      if (hasFavoritesTag) {
        filtered = filtered.filter(ex => ex.isFavorite);
      }
    }

    setFilteredExercises(filtered);
  }, [searchQuery, selectedTags, exercises]);

  const handleTagPress = (tag: ExerciseTagFilter) => {
    setSelectedTags(prevTags => {
      const isSelected = prevTags.some(t => t.id === tag.id);
      if (isSelected) {
        return prevTags.filter(t => t.id !== tag.id);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleToggleFavorite = async (exerciseId: string, isFavorite: boolean) => {
    try {
      await exerciseService.toggleFavoriteExercise(exerciseId);
      // Update local state
      setExercises(prev => prev.map(ex =>
        ex.id === exerciseId ? { ...ex, isFavorite } : ex
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleOpenExercise = (exercise: Exercise) => {
    router.push({
      pathname: '/exercises/detail/[id]',
      params: { id: exercise.id }
    });
  };

  const handleCreateExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/exercises/create' as any);
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 60],
    extrapolate: 'clamp',
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <BlurView intensity={30} tint="dark" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Exercise Library</Text>

            <Animated.View style={[styles.searchContainer, { opacity: searchOpacity }]}>
              <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Ionicons name="close-circle" size={16} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </BlurView>
      </Animated.View>

      <View style={styles.tagsContainerWrapper}>
        <BlurView intensity={20} tint="dark" style={styles.tagsBlur}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {availableTagsData.map(tag => (
              <TagPill
                key={tag.id}
                tag={tag}
                selected={selectedTags.some(t => t.id === tag.id)}
                onPress={handleTagPress}
              />
            ))}
          </ScrollView>
        </BlurView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      ) : filteredExercises.length > 0 ? (
        <Animated.FlatList
          data={filteredExercises}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={{
                id: item.id,
                name: item.name,
                category: item.category?.name || (Array.isArray(item.tags) && item.tags.length > 0
                  ? (typeof item.tags[0] === 'string' ? item.tags[0] : item.tags[0].label)
                  : 'Exercise'),
                tags: Array.isArray(item.tags)
                  ? item.tags.map(tag => typeof tag === 'string' ? tag : tag.label)
                  : [],
                isFavorite: item.isFavorite || false,
                description: item.description || item.notes || '',
                thumbnailUrl: item.thumbnailUrl
              }}
              onPress={(exercise) => handleOpenExercise(item)}
              onFavoriteToggle={(id, isFavorite) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleToggleFavorite(id, isFavorite);
              }}
            />
          )}
          contentContainerStyle={styles.exerciseList}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="fitness" size={64} color="#636366" />
          <Text style={styles.emptyStateText}>No exercises found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCreateExercise}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FF2D55', '#FF375F']}
          style={styles.gradientButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
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
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  tagsContainerWrapper: {
    marginTop: 120,
    zIndex: 5,
  },
  tagsBlur: {
    paddingVertical: 10,
  },
  tagsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagPillSelected: {
    backgroundColor: '#0A84FF',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  tagCheckmark: {
    marginRight: 4,
  },
  exerciseList: {
    paddingHorizontal: 12,
    paddingTop: 70,
    paddingBottom: 20,
  },
  // ExerciseCard styles removed as we're using the design system component
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});