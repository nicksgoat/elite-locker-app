import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import enhanced types
import { Exercise } from '../../types/workout';

// Export exercise types for reuse
export interface ExerciseWithSets extends Exercise {
  completed?: boolean;
}

// Filter interface for the modal
interface FilterTag {
  id: string;
  name: string;
  label: string;
  special?: boolean;
}

// Mock exercise data with consistent structure
export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    sets: 4,
    targetReps: '5-8',
    restTime: 90,
    category: 'Chest',
    equipment: 'Barbell',
    isFavorite: true,
  },
  {
    id: 'incline-press',
    name: 'Incline Dumbbell Press',
    sets: 3,
    targetReps: '8-12',
    restTime: 60,
    category: 'Chest',
    equipment: 'Dumbbell',
    isFavorite: false,
  },
  {
    id: 'chest-fly',
    name: 'Cable Chest Fly',
    sets: 3,
    targetReps: '12-15',
    restTime: 45,
    category: 'Chest',
    equipment: 'Cable',
    isFavorite: false,
  },
  {
    id: 'push-up',
    name: 'Push-up',
    sets: 3,
    targetReps: '15-20',
    restTime: 45,
    category: 'Chest',
    equipment: 'Bodyweight',
    isFavorite: false,
  },
  {
    id: 'chest-dip',
    name: 'Chest Dip',
    sets: 3,
    targetReps: '8-12',
    restTime: 60,
    category: 'Chest',
    equipment: 'Bodyweight',
    isFavorite: false,
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    sets: 4,
    targetReps: '8-12',
    restTime: 60,
    category: 'Back',
    equipment: 'Bodyweight',
    isFavorite: true,
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    sets: 4,
    targetReps: '8-12',
    restTime: 60,
    category: 'Back',
    equipment: 'Barbell',
    isFavorite: false,
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    sets: 3,
    targetReps: '10-12',
    restTime: 60,
    category: 'Back',
    equipment: 'Cable',
    isFavorite: false,
  },
  {
    id: 'seated-row',
    name: 'Seated Cable Row',
    sets: 3,
    targetReps: '10-12',
    restTime: 60,
    category: 'Back',
    equipment: 'Cable',
    isFavorite: false,
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    sets: 4,
    targetReps: '5-8',
    restTime: 120,
    category: 'Back',
    equipment: 'Barbell',
    isFavorite: true,
  },
  {
    id: 'squat',
    name: 'Barbell Squat',
    sets: 5,
    targetReps: '5-8',
    restTime: 120,
    category: 'Legs',
    equipment: 'Barbell',
    isFavorite: true,
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    sets: 4,
    targetReps: '8-12',
    restTime: 90,
    category: 'Legs',
    equipment: 'Machine',
    isFavorite: false,
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    sets: 3,
    targetReps: '12-15',
    restTime: 60,
    category: 'Legs',
    equipment: 'Machine',
    isFavorite: false,
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    sets: 3,
    targetReps: '12-15',
    restTime: 60,
    category: 'Legs',
    equipment: 'Machine',
    isFavorite: false,
  },
  {
    id: 'calf-raise',
    name: 'Standing Calf Raise',
    sets: 3,
    targetReps: '15-20',
    restTime: 45,
    category: 'Legs',
    equipment: 'Machine',
    isFavorite: false,
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    sets: 4,
    targetReps: '6-10',
    restTime: 90,
    category: 'Shoulders',
    equipment: 'Barbell',
    isFavorite: false,
  },
  {
    id: 'lateral-raise',
    name: 'Lateral Raise',
    sets: 3,
    targetReps: '12-15',
    restTime: 45,
    category: 'Shoulders',
    equipment: 'Dumbbell',
    isFavorite: false,
  },
  {
    id: 'front-raise',
    name: 'Front Raise',
    sets: 3,
    targetReps: '12-15',
    restTime: 45,
    category: 'Shoulders',
    equipment: 'Dumbbell',
    isFavorite: false,
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    sets: 3,
    targetReps: '12-15',
    restTime: 45,
    category: 'Shoulders',
    equipment: 'Cable',
    isFavorite: false,
  },
  {
    id: 'bicep-curl',
    name: 'Dumbbell Bicep Curl',
    sets: 3,
    targetReps: '10-12',
    restTime: 45,
    category: 'Arms',
    equipment: 'Dumbbell',
    isFavorite: true,
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    sets: 3,
    targetReps: '10-12',
    restTime: 45,
    category: 'Arms',
    equipment: 'Cable',
    isFavorite: false,
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    sets: 3,
    targetReps: '10-12',
    restTime: 45,
    category: 'Arms',
    equipment: 'Dumbbell',
    isFavorite: false,
  },
  {
    id: 'plank',
    name: 'Plank',
    sets: 3,
    targetReps: '30-60s',
    restTime: 45,
    category: 'Core',
    equipment: 'Bodyweight',
    isFavorite: false,
  },
  {
    id: 'crunch',
    name: 'Crunch',
    sets: 3,
    targetReps: '15-20',
    restTime: 30,
    category: 'Core',
    equipment: 'Bodyweight',
    isFavorite: false,
  },
  {
    id: 'russian-twist',
    name: 'Russian Twist',
    sets: 3,
    targetReps: '12-15/side',
    restTime: 45,
    category: 'Core',
    equipment: 'Bodyweight',
    isFavorite: false,
  },
];

// Available filter tags
const availableTags: FilterTag[] = [
  { id: 't1', name: 'recent', label: 'Recent', special: true },
  { id: 't2', name: 'favorites', label: 'Favorites', special: true },
  { id: 't3', name: 'chest', label: 'Chest' },
  { id: 't4', name: 'back', label: 'Back' },
  { id: 't5', name: 'legs', label: 'Legs' },
  { id: 't6', name: 'shoulders', label: 'Shoulders' },
  { id: 't7', name: 'arms', label: 'Arms' },
  { id: 't8', name: 'core', label: 'Core' },
  { id: 't9', name: 'barbell', label: 'Barbell' },
  { id: 't10', name: 'dumbbell', label: 'Dumbbell' },
  { id: 't11', name: 'bodyweight', label: 'Bodyweight' },
  { id: 't12', name: 'cable', label: 'Cable' },
  { id: 't13', name: 'machine', label: 'Machine' },
];

// Recently used exercises (would be persisted in real app)
const RECENT_EXERCISES: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    sets: 4,
    targetReps: '5-8',
    restTime: 90,
    category: 'Chest',
    equipment: 'Barbell',
    isFavorite: true,
  },
  {
    id: 'squat',
    name: 'Barbell Squat',
    sets: 5,
    targetReps: '5-8',
    restTime: 120,
    category: 'Legs',
    equipment: 'Barbell',
    isFavorite: true,
  },
  {
    id: 'pull-up',
    name: 'Pull-up',
    sets: 4,
    targetReps: '8-12',
    restTime: 60,
    category: 'Back',
    equipment: 'Bodyweight',
    isFavorite: true,
  },
];

const { width, height } = Dimensions.get('window');

// Tag pill component for filters
const TagPill = ({ tag, selected, onPress }: {
  tag: FilterTag;
  selected: boolean;
  onPress: (tag: FilterTag) => void;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.tagPill,
        selected && styles.selectedTagPill,
        tag.special && styles.specialTagPill,
        selected && tag.special && styles.selectedSpecialTagPill,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(tag);
      }}
      activeOpacity={0.7}
    >
      {tag.special && (
        <Ionicons
          name={tag.name === 'recent' ? 'time-outline' : 'star'}
          size={14}
          color={selected ? '#FFFFFF' : tag.name === 'recent' ? '#64D2FF' : '#FF9F0A'}
          style={styles.tagIcon}
        />
      )}
      <Text style={[
        styles.tagText,
        selected && styles.selectedTagText,
        tag.special && !selected && styles.specialTagText,
        tag.name === 'recent' && !selected && { color: '#64D2FF' },
      ]}>
        {tag.label}
      </Text>
    </TouchableOpacity>
  );
};

// Exercise row component
const ExerciseRow = ({ exercise, onPress }: {
  exercise: Exercise;
  onPress: (exercise: Exercise) => void;
}) => {
  return (
    <TouchableOpacity
      style={styles.exerciseRow}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress(exercise);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.exerciseIconContainer}>
        <Ionicons
          name={
            exercise.category === 'Chest' ? 'fitness-outline' :
            exercise.category === 'Back' ? 'body-outline' :
            exercise.category === 'Legs' ? 'footsteps-outline' :
            exercise.category === 'Shoulders' ? 'barbell-outline' :
            exercise.category === 'Arms' ? 'barbell-outline' :
            exercise.category === 'Core' ? 'ellipse-outline' :
            'fitness'
          }
          size={20}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.exerciseMeta}>
          <Text style={styles.exerciseMetaText}>
            {exercise.sets} sets • {exercise.targetReps} reps • {exercise.restTime}s rest
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons
          name={exercise.isFavorite ? 'star' : 'star-outline'}
          size={22}
          color={exercise.isFavorite ? '#FF9F0A' : '#8E8E93'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Section header component
const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

export interface ExerciseLibraryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseWithSets) => void;
  title?: string;
  initialTag?: string;
}

/**
 * A reusable modal for selecting exercises from the exercise library.
 * Used across the app for workout creation, template creation, etc.
 */
const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({
  visible,
  onClose,
  onSelectExercise,
  title = "Select Exercise",
  initialTag = null
}) => {
  const insets = useSafeAreaInsets();
  const translateY = React.useRef(new Animated.Value(height)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [exerciseTags, setExerciseTags] = useState<ExerciseTag[]>([]);

  // Load categories and tags on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          exerciseService.getCategories(),
          exerciseService.getExerciseTags()
        ]);
        setCategories(categoriesData);
        setExerciseTags(tagsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    if (visible) {
      loadInitialData();
    }
  }, [visible]);

  // Animate modal in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: height,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }).start();
    }
  }, [visible, translateY, height]);

  // Enhanced search with real exercise service
  const searchExercises = useMemo(() => {
    const debounceTimeout = setTimeout(async () => {
      if (!visible) return;

      setIsLoading(true);
      try {
        // Determine category filter
        const categoryFilter = categories.find(cat =>
          selectedTags.some(tag => tag.toLowerCase() === cat.name.toLowerCase())
        );

        // Determine tag filters
        const tagFilters = exerciseTags.filter(tag =>
          selectedTags.includes(tag.name)
        ).map(tag => tag.id);

        // Handle special filters
        let visibility: 'all' | 'public' | 'private' = 'all';
        if (selectedTags.includes('favorites')) {
          // For favorites, we'll filter after getting results
          visibility = 'all';
        }

        const exercises = await exerciseService.searchExercises({
          query: searchQuery,
          categoryId: categoryFilter?.id,
          tagIds: tagFilters,
          visibility,
          limit: 100
        });

        // Apply special filters
        let filtered = exercises;
        if (selectedTags.includes('favorites')) {
          filtered = exercises.filter(ex => ex.isFavorite);
        } else if (selectedTags.includes('recent')) {
          // For now, use mock recent exercises
          filtered = RECENT_EXERCISES;
        }

        setFilteredExercises(filtered);
      } catch (error) {
        console.error('Error searching exercises:', error);
        // Fallback to mock data
        setFilteredExercises(EXERCISE_LIBRARY);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce search

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, selectedTags, visible, categories, exerciseTags]);

  useEffect(() => {
    searchExercises();
  }, [searchExercises]);

  // Handle tag selection
  const handleTagPress = (tag: FilterTag) => {
    setSelectedTags(prevTags => {
      // If tag is already selected, remove it
      if (prevTags.includes(tag.name)) {
        return prevTags.filter(t => t !== tag.name);
      }
      // If it's a special tag (recent, favorites), replace all tags
      if (tag.special) {
        return [tag.name];
      }
      // Otherwise add to the selected tags, removing any special tags
      return prevTags.filter(t => !availableTags.find(at => at.name === t && at.special)).concat(tag.name);
    });
  };

  // Handle exercise selection
  const handleExerciseSelect = (exercise: Exercise) => {
    // Create a copy with necessary properties for the workout
    const selectedExercise: ExerciseWithSets = {
      ...exercise,
      id: `${exercise.id}_${Date.now()}`, // Ensure unique ID
      sets: exercise.sets || 3,
      completed: false,
    };

    // TODO: In a full implementation, save to recent exercises

    onSelectExercise(selectedExercise);
    handleClose();
  };

  // Close the modal
  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSearchQuery('');
      onClose();
    });
  };

  // Group exercises by category for better organization
  const groupedExercises = () => {
    if (selectedTags.length > 0 || searchQuery) {
      // When filtering or searching, show a flat list
      return [{ title: 'Results', data: filteredExercises }];
    }

    // Group by category
    const groups: { [key: string]: Exercise[] } = {};
    EXERCISE_LIBRARY.forEach(exercise => {
      const category = exercise.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(exercise);
    });

    return Object.keys(groups).sort().map(key => ({
      title: key,
      data: groups[key]
    }));
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={40} tint="dark" style={styles.blurBackground}>
          <Animated.View
            style={[
              styles.contentContainer,
              { transform: [{ translateY }], paddingBottom: insets.bottom }
            ]}
          >
            {/* Handle for pull down to close */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises"
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
                autoCapitalize="none"
              />
            </View>

            {/* Filter Tags */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsContainer}
            >
              {availableTags.map(tag => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  selected={selectedTags.includes(tag.name)}
                  onPress={handleTagPress}
                />
              ))}
            </ScrollView>

            {/* Exercise List */}
            <FlatList
              data={filteredExercises}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ExerciseRow
                  exercise={item}
                  onPress={handleExerciseSelect}
                />
              )}
              style={styles.exerciseList}
              contentContainerStyle={styles.exerciseListContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="barbell-outline" size={64} color="#555555" />
                  <Text style={styles.emptyText}>No exercises found</Text>
                  <Text style={styles.emptySubtext}>Try a different search or filter</Text>
                </View>
              }
              ListHeaderComponent={
                searchQuery || selectedTags.length > 0 ? (
                  <SectionHeader title={`${filteredExercises.length} ${filteredExercises.length === 1 ? 'Exercise' : 'Exercises'} Found`} />
                ) : null
              }
              stickyHeaderIndices={searchQuery || selectedTags.length > 0 ? [0] : []}
            />
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  tagsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedTagPill: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  specialTagPill: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedSpecialTagPill: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  tagIcon: {
    marginRight: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  specialTagText: {
    fontWeight: '600',
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingTop: 8,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseDetails: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseMetaText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  favoriteButton: {
    padding: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});

export default ExerciseLibraryModal;