import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Design system imports
import { Text } from '@/components/design-system/primitives';
// import { useTheme } from '@/components/design-system/ThemeProvider';
import { BlurView } from 'expo-blur';

// Data imports
import { mockExercises, mockPrograms, mockWorkouts } from '@/data/mockData';

export default function TrainingSearchScreen() {
  const router = useRouter();
  // const { colors, spacing } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Strength training',
    'Upper body',
    'HIIT workout',
  ]);

  // Filter data based on search query
  const filteredWorkouts = mockWorkouts.filter(workout =>
    workout.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPrograms = mockPrograms.filter(program =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExercises = mockExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation handlers
  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}` as any);
  };

  const handleProgramPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/detail/${id}` as any);
  };

  const handleExercisePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/exercise/detail/${id}` as any);
  };

  const handleCategoryPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/training/category/${id}` as any);
  };

  // Handle search submission
  const handleSearch = () => {
    if (searchQuery.trim() === '') return;

    // Add to recent searches if not already there
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
    }
  };

  // Handle recent search press
  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <View style={styles.container}>
      {/* Header with search bar */}
      <View style={styles.header}>
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Search bar */}
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="What do you want to train today?"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                autoFocus={true}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BlurView>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery.length === 0 ? (
          // Show recent searches when no query
          <View style={styles.recentSearchesContainer}>
            <View style={styles.recentSearchesHeader}>
              <Text variant="h3" color="inverse" style={styles.recentSearchesTitle}>Recent Searches</Text>
              {recentSearches.length > 0 && (
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text variant="bodySmall" color="link" style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentSearches.length > 0 ? (
              recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentSearchItem}
                  onPress={() => handleRecentSearchPress(search)}
                >
                  <Ionicons name="time-outline" size={20} color="#999" />
                  <Text variant="body" color="inverse" style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text variant="body" color="secondary" style={styles.emptyText}>No recent searches</Text>
            )}
          </View>
        ) : (
          // Show search results
          <View style={styles.searchResults}>
            {/* Workouts section */}
            {filteredWorkouts.length > 0 && (
              <View style={styles.searchSection}>
                <Text variant="h3" color="inverse" style={styles.searchSectionTitle}>Workouts</Text>
                {filteredWorkouts.map(workout => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.searchResultItem}
                    onPress={() => handleWorkoutPress(workout.id)}
                  >
                    <View style={[styles.searchItemIcon, { backgroundColor: '#0A84FF' }]}>
                      <Ionicons name="barbell-outline" size={16} color="#fff" />
                    </View>
                    <View style={styles.searchItemContent}>
                      <Text variant="bodySemiBold" color="inverse" style={styles.searchItemTitle}>{workout.title}</Text>
                      <Text variant="bodySmall" color="secondary" style={styles.searchItemSubtitle}>{workout.exercises.length} exercises</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Programs section */}
            {filteredPrograms.length > 0 && (
              <View style={styles.searchSection}>
                <Text variant="h3" color="inverse" style={styles.searchSectionTitle}>Programs</Text>
                {filteredPrograms.map(program => (
                  <TouchableOpacity
                    key={program.id}
                    style={styles.searchResultItem}
                    onPress={() => handleProgramPress(program.id)}
                  >
                    <View style={[styles.searchItemIcon, { backgroundColor: '#BF5AF2' }]}>
                      <Ionicons name="calendar-outline" size={16} color="#fff" />
                    </View>
                    <View style={styles.searchItemContent}>
                      <Text variant="bodySemiBold" color="inverse" style={styles.searchItemTitle}>{program.title}</Text>
                      <Text variant="bodySmall" color="secondary" style={styles.searchItemSubtitle}>{program.duration} weeks • {program.level}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Exercises section */}
            {filteredExercises.length > 0 && (
              <View style={styles.searchSection}>
                <Text variant="h3" color="inverse" style={styles.searchSectionTitle}>Exercises</Text>
                {filteredExercises.map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.searchResultItem}
                    onPress={() => handleExercisePress(exercise.id)}
                  >
                    <View style={[styles.searchItemIcon, { backgroundColor: '#30D158' }]}>
                      <Ionicons name="fitness-outline" size={16} color="#fff" />
                    </View>
                    <View style={styles.searchItemContent}>
                      <Text variant="bodySemiBold" color="inverse" style={styles.searchItemTitle}>{exercise.name}</Text>
                      <Text variant="bodySmall" color="secondary" style={styles.searchItemSubtitle}>
                        {exercise.muscleGroups?.join(', ') || 'Exercise'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {filteredWorkouts.length === 0 && filteredPrograms.length === 0 && filteredExercises.length === 0 && (
              <View style={styles.emptySearchResults}>
                <Ionicons name="search-outline" size={48} color="#999" />
                <Text variant="h3" color="inverse" style={styles.emptySearchTitle}>No results found</Text>
                <Text variant="body" color="secondary" style={styles.emptySearchSubtitle}>Try searching for something else</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
    zIndex: 10,
  },
  headerBlur: {
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  searchBarContainer: {
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
    height: '100%',
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  recentSearchesContainer: {
    paddingHorizontal: 16,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentSearchesTitle: {},
  clearText: {},
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  recentSearchText: {
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
  },
  searchResults: {
    paddingHorizontal: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchSectionTitle: {
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchItemContent: {
    flex: 1,
  },
  searchItemTitle: {},
  searchItemSubtitle: {
    marginTop: 4,
  },
  emptySearchResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptySearchTitle: {
    marginTop: 16,
  },
  emptySearchSubtitle: {
    marginTop: 8,
  },
});
