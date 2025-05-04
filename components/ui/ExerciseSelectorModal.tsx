import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types
export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  targetReps?: string;
  restTime?: number;
  category?: string;
  equipment?: string;
  isFavorite?: boolean;
}

interface ExerciseTag {
  id: string;
  name: string;
  label: string;
  special?: boolean;
}

interface ExerciseSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

// Mock data (in a real app this would come from a context or API)
const mockExercises: Exercise[] = [
  {
    id: 'e1',
    name: 'Barbell Bench Press',
    sets: 4,
    targetReps: '8-10',
    restTime: 90,
    category: 'Chest',
    equipment: 'Barbell',
    isFavorite: true,
  },
  {
    id: 'e2',
    name: 'Incline Dumbbell Press',
    sets: 3,
    targetReps: '10-12',
    restTime: 60,
    category: 'Chest',
    equipment: 'Dumbbell',
    isFavorite: false,
  },
  {
    id: 'e3',
    name: 'Squat',
    sets: 5,
    targetReps: '5',
    restTime: 120,
    category: 'Legs',
    equipment: 'Barbell',
    isFavorite: true,
  },
  {
    id: 'e4',
    name: 'Deadlift',
    sets: 3,
    targetReps: '5',
    restTime: 180,
    category: 'Back',
    equipment: 'Barbell',
    isFavorite: false,
  },
  {
    id: 'e5',
    name: 'Pull-Up',
    sets: 4,
    targetReps: '8-12',
    restTime: 90,
    category: 'Back',
    equipment: 'Bodyweight',
    isFavorite: true,
  },
  {
    id: 'e6',
    name: 'Leg Press',
    sets: 4,
    targetReps: '10-12',
    restTime: 90,
    category: 'Legs',
    equipment: 'Machine',
    isFavorite: false,
  },
  {
    id: 'e7',
    name: 'Lateral Raise',
    sets: 3,
    targetReps: '12-15',
    restTime: 60,
    category: 'Shoulders',
    equipment: 'Dumbbell',
    isFavorite: false,
  },
  {
    id: 'e8',
    name: 'Tricep Pushdown',
    sets: 3,
    targetReps: '12-15',
    restTime: 60,
    category: 'Arms',
    equipment: 'Cable',
    isFavorite: false,
  },
  {
    id: 'e9',
    name: 'Bicep Curl',
    sets: 3,
    targetReps: '12-15',
    restTime: 60,
    category: 'Arms',
    equipment: 'Dumbbell',
    isFavorite: false,
  },
  {
    id: 'e10',
    name: 'Romanian Deadlift',
    sets: 3,
    targetReps: '10-12',
    restTime: 90,
    category: 'Legs',
    equipment: 'Barbell',
    isFavorite: false,
  },
];

// Available filters
const availableTags: ExerciseTag[] = [
  { id: 't1', name: 'recent', label: 'Recent', special: true },
  { id: 't2', name: 'favorites', label: 'Favorites', special: true },
  { id: 't3', name: 'chest', label: 'Chest' },
  { id: 't4', name: 'back', label: 'Back' },
  { id: 't5', name: 'legs', label: 'Legs' },
  { id: 't6', name: 'shoulders', label: 'Shoulders' },
  { id: 't7', name: 'arms', label: 'Arms' },
  { id: 't8', name: 'barbell', label: 'Barbell' },
  { id: 't9', name: 'dumbbell', label: 'Dumbbell' },
  { id: 't10', name: 'bodyweight', label: 'Bodyweight' },
];

// Tag pill component for filters
const TagPill = ({ tag, selected, onPress }: { 
  tag: ExerciseTag; 
  selected: boolean; 
  onPress: (tag: ExerciseTag) => void;
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
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ExerciseSelectorModal: React.FC<ExerciseSelectorModalProps> = ({
  visible,
  onClose,
  onSelectExercise,
}) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<ExerciseTag[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(mockExercises);
  const [recentExercises, setRecentExercises] = useState<Exercise[]>(
    mockExercises.filter((_, index) => index < 3)
  );
  
  // Animations
  const slideAnim = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  // Filter exercises based on search and tags
  useEffect(() => {
    let filtered = mockExercises;
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(query) ||
        (ex.category && ex.category.toLowerCase().includes(query)) ||
        (ex.equipment && ex.equipment.toLowerCase().includes(query))
      );
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      // Special case for favorites
      const hasFavoritesTag = selectedTags.some(tag => tag.name === 'favorites');
      if (hasFavoritesTag) {
        filtered = filtered.filter(ex => ex.isFavorite);
      }
      
      // Special case for recent - we don't filter but will show a separate section
      const hasRecentTag = selectedTags.some(tag => tag.name === 'recent');
      
      // Regular category filters
      const categoryTags = selectedTags.filter(tag => 
        !tag.special && ['chest', 'back', 'legs', 'shoulders', 'arms'].includes(tag.name)
      );
      
      if (categoryTags.length > 0) {
        filtered = filtered.filter(ex => 
          ex.category && categoryTags.some(tag => 
            ex.category?.toLowerCase() === tag.name.toLowerCase()
          )
        );
      }
      
      // Equipment filters
      const equipmentTags = selectedTags.filter(tag => 
        !tag.special && ['barbell', 'dumbbell', 'bodyweight'].includes(tag.name)
      );
      
      if (equipmentTags.length > 0) {
        filtered = filtered.filter(ex => 
          ex.equipment && equipmentTags.some(tag => 
            ex.equipment?.toLowerCase() === tag.name.toLowerCase()
          )
        );
      }
      
      // If only recent is selected, and there are no other filters, show all exercises
      if (hasRecentTag && selectedTags.length === 1 && filtered.length === 0) {
        filtered = mockExercises;
      }
    }
    
    setFilteredExercises(filtered);
  }, [searchQuery, selectedTags]);
  
  const handleTagPress = (tag: ExerciseTag) => {
    setSelectedTags(prevTags => {
      const isSelected = prevTags.some(t => t.id === tag.id);
      if (isSelected) {
        return prevTags.filter(t => t.id !== tag.id);
      } else {
        return [...prevTags, tag];
      }
    });
  };
  
  const handleExerciseSelect = (exercise: Exercise) => {
    // Add to recent exercises
    setRecentExercises(prev => {
      // Remove if already in recents
      const withoutCurrent = prev.filter(ex => ex.id !== exercise.id);
      // Add to beginning and limit to 3
      return [exercise, ...withoutCurrent].slice(0, 3);
    });
    
    // Call the parent handler
    onSelectExercise(exercise);
    onClose();
  };
  
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  // Check if we should show the Recent section
  const showRecentSection = recentExercises.length > 0 && 
    (selectedTags.length === 0 || selectedTags.some(tag => tag.name === 'recent'));
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom + 20
            }
          ]}
        >
          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            <View style={styles.handle} />
            
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Add Exercise</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#8E8E93"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && Platform.OS !== 'ios' && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Ionicons name="close-circle" size={16} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.tagsContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsScrollContent}
              >
                {availableTags.map(tag => (
                  <TagPill
                    key={tag.id}
                    tag={tag}
                    selected={selectedTags.some(t => t.id === tag.id)}
                    onPress={handleTagPress}
                  />
                ))}
              </ScrollView>
            </View>
            
            <FlatList
              data={filteredExercises}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <ExerciseRow 
                  exercise={item} 
                  onPress={handleExerciseSelect} 
                />
              )}
              ListHeaderComponent={
                showRecentSection ? (
                  <>
                    <SectionHeader title="Recent" />
                    {recentExercises.map(exercise => (
                      <ExerciseRow
                        key={`recent-${exercise.id}`}
                        exercise={exercise}
                        onPress={handleExerciseSelect}
                      />
                    ))}
                    <SectionHeader title="All Exercises" />
                  </>
                ) : null
              }
              contentContainerStyle={styles.exercisesList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="fitness" size={64} color="#8E8E93" />
                  <Text style={styles.emptyStateText}>No exercises found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Try adjusting your search or filters
                  </Text>
                </View>
              }
            />
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    borderRadius: 10,
    marginHorizontal: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsScrollContent: {
    paddingHorizontal: 16,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
  },
  selectedTagPill: {
    backgroundColor: '#0A84FF',
  },
  specialTagPill: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
  },
  selectedSpecialTagPill: {
    backgroundColor: '#0A84FF',
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
    color: '#0A84FF',
  },
  exercisesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.08)',
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseMetaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  favoriteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
});

export default ExerciseSelectorModal; 