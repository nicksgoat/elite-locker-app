import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Design system imports
import { useTheme } from '@/components/design-system/ThemeProvider';
import Card from '@/components/design-system/primitives/Card';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

// Data imports
import { mockExercises, mockPrograms, mockWorkouts } from '@/data/mockData';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

export default function TrainingScreen() {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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

  const handleCreateWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/workout/create' as any);
  };

  const handleCreateProgram = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/programs/create' as any);
  };

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

  const searchBarTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  // If search is active, show search results
  if (isSearchFocused || searchQuery.length > 0) {
    return (
      <IMessagePageWrapper
        title="Search"
        subtitle="Find workouts, programs, and exercises"
        showHeader={false}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color={colors.icon.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workouts, programs, exercises..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              onBlur={() => {
                if (searchQuery.length === 0) {
                  setIsSearchFocused(false);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setIsSearchFocused(false);
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.icon.secondary} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.searchResults}>
            {/* Workouts section */}
            {filteredWorkouts.length > 0 && (
              <View style={styles.searchSection}>
                <Text style={styles.searchSectionTitle}>Workouts</Text>
                {filteredWorkouts.map(workout => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.searchResultItem}
                    onPress={() => handleWorkoutPress(workout.id)}
                  >
                    <View style={[styles.searchItemIcon, { backgroundColor: colors.palette.blue500 }]}>
                      <Ionicons name="barbell-outline" size={16} color="#fff" />
                    </View>
                    <View style={styles.searchItemContent}>
                      <Text style={styles.searchItemTitle}>{workout.title}</Text>
                      <Text style={styles.searchItemSubtitle}>{workout.exercises.length} exercises</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Programs section */}
            {filteredPrograms.length > 0 && (
              <View style={styles.searchSection}>
                <Text style={styles.searchSectionTitle}>Programs</Text>
                {filteredPrograms.map(program => (
                  <TouchableOpacity
                    key={program.id}
                    style={styles.searchResultItem}
                    onPress={() => handleProgramPress(program.id)}
                  >
                    <View style={[styles.searchItemIcon, { backgroundColor: colors.palette.purple500 }]}>
                      <Ionicons name="calendar-outline" size={16} color="#fff" />
                    </View>
                    <View style={styles.searchItemContent}>
                      <Text style={styles.searchItemTitle}>{program.title}</Text>
                      <Text style={styles.searchItemSubtitle}>{program.duration} weeks • {program.level}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Exercises section */}
            {filteredExercises.length > 0 && (
              <View style={styles.searchSection}>
                <Text style={styles.searchSectionTitle}>Exercises</Text>
                {filteredExercises.map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.searchResultItem}
                    onPress={() => handleExercisePress(exercise.id)}
                  >
                    <View style={[styles.searchItemIcon, { backgroundColor: colors.palette.green500 }]}>
                      <Ionicons name="fitness-outline" size={16} color="#fff" />
                    </View>
                    <View style={styles.searchItemContent}>
                      <Text style={styles.searchItemTitle}>{exercise.name}</Text>
                      <Text style={styles.searchItemSubtitle}>
                        {exercise.muscleGroups?.join(', ') || 'Exercise'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {filteredWorkouts.length === 0 && filteredPrograms.length === 0 && filteredExercises.length === 0 && (
              <View style={styles.emptySearchResults}>
                <Ionicons name="search-outline" size={48} color={colors.icon.secondary} />
                <Text style={styles.emptySearchTitle}>No results found</Text>
                <Text style={styles.emptySearchSubtitle}>Try searching for something else</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </IMessagePageWrapper>
    );
  }

  // Main screen
  return (
    <IMessagePageWrapper
      title="Training"
      subtitle="Workouts, programs, and exercises"
      showHeader={false}
    >
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.View style={[styles.headerContent, { opacity: headerOpacity }]}>
          <Text style={styles.headerTitle}>Training</Text>
          <Text style={styles.headerSubtitle}>Workouts, programs, and exercises</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.searchBarContainer,
            { transform: [{ translateY: searchBarTranslate }] }
          ]}
        >
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => setIsSearchFocused(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color="#999" />
            <Text style={styles.searchBarText}>Search workouts, programs, exercises...</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

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

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleCreateProgram}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={22} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Create Program</Text>
            </TouchableOpacity>
          </View>

          {/* Continue section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Training</Text>
            </View>

            <View style={styles.continueSection}>
              <ContinueCard
                title="Upper Body Strength"
                subtitle="3 exercises"
                progress={0.65}
                color="#0A84FF"
                onPress={() => handleWorkoutPress("w1")}
              />

              {mockWorkouts.length > 1 && (
                <ContinueCard
                  title={mockWorkouts[1].title}
                  subtitle={`${mockWorkouts[1].exercises.length} exercises`}
                  progress={0.35}
                  color="#FF9F0A"
                  onPress={() => handleWorkoutPress(mockWorkouts[1].id)}
                />
              )}

              {mockPrograms.length > 0 && (
                <ContinueCard
                  title={mockPrograms[0].title}
                  subtitle={`Week 2 of ${mockPrograms[0].duration}`}
                  progress={0.25}
                  color="#BF5AF2"
                  onPress={() => handleProgramPress(mockPrograms[0].id)}
                />
              )}
            </View>
          </View>

          {/* My Programs section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Programs</Text>
              <TouchableOpacity onPress={() => router.push('/programs/index' as any)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              decelerationRate="fast"
            >
              {mockPrograms.slice(0, 5).map(program => (
                <ProgramCard
                  key={program.id}
                  title={program.title}
                  weeks={program.duration}
                  level={program.level}
                  onPress={() => handleProgramPress(program.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Templates section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workout Templates</Text>
              <TouchableOpacity onPress={() => router.push('/workout/template' as any)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              decelerationRate="fast"
              snapToInterval={256} // Card width (240) + margin right (16)
              snapToAlignment="start"
            >
              <TemplateCard
                title="Push-Pull-Legs"
                exercises={12}
                id="t1"
                onPress={handleWorkoutPress}
              />
              <TemplateCard
                title="5x5 Strength"
                exercises={5}
                id="t2"
                onPress={handleWorkoutPress}
              />
              <TemplateCard
                title="HIIT Circuit"
                exercises={8}
                id="t3"
                onPress={handleWorkoutPress}
              />
            </ScrollView>
          </View>

          {/* Recent Workouts section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <TouchableOpacity onPress={() => router.push('/workout/history' as any)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              decelerationRate="fast"
            >
              {mockWorkouts.slice(0, 5).map(workout => {
                const { WorkoutCard } = require('@/components/design-system/cards');
                return (
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
                );
              })}
            </ScrollView>
          </View>

          {/* Popular Exercises section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Exercises</Text>
              <TouchableOpacity onPress={() => router.push('/exercises' as any)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.exerciseGrid}>
              {mockExercises.slice(0, 6).map(exercise => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseCard}
                  onPress={() => handleExercisePress(exercise.id)}
                >
                  <View style={styles.exerciseCardContent}>
                    <View style={[styles.exerciseIcon, { backgroundColor: getExerciseColor(exercise) }]}>
                      <Ionicons name="fitness-outline" size={20} color="#fff" />
                    </View>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseMuscleGroup}>
                      {exercise.muscleGroups?.[0] || 'Exercise'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Active Workout Bar - Fixed at bottom */}
          {mockWorkouts.length > 0 && (
            <TouchableOpacity
              style={styles.activeWorkoutBar}
              onPress={() => handleWorkoutPress(mockWorkouts[0].id)}
            >
              <LinearGradient
                colors={['rgba(10, 132, 255, 0.8)', 'rgba(10, 132, 255, 0.6)']}
                style={styles.activeWorkoutGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.activeWorkoutContent}>
                  <View style={styles.activeWorkoutInfo}>
                    <Text style={styles.activeWorkoutTitle}>Continue Workout</Text>
                    <Text style={styles.activeWorkoutSubtitle}>{mockWorkouts[0].title}</Text>
                  </View>
                  <View style={styles.activeWorkoutControls}>
                    <TouchableOpacity style={styles.activeWorkoutButton}>
                      <Ionicons name="play" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Animated.ScrollView>
    </IMessagePageWrapper>
  );
}

// Helper function to get exercise color based on muscle group
const getExerciseColor = (exercise: Exercise) => {
  const { colors } = require('@/components/design-system/tokens');

  if (!exercise.muscleGroups || exercise.muscleGroups.length === 0) {
    return colors.palette.green500;
  }

  const muscleGroup = exercise.muscleGroups[0].toLowerCase();

  if (muscleGroup.includes('chest') || muscleGroup.includes('pectoral')) {
    return colors.palette.red500;
  } else if (muscleGroup.includes('back') || muscleGroup.includes('lat')) {
    return colors.palette.blue500;
  } else if (muscleGroup.includes('leg') || muscleGroup.includes('quad') || muscleGroup.includes('hamstring')) {
    return colors.palette.purple500;
  } else if (muscleGroup.includes('shoulder') || muscleGroup.includes('delt')) {
    return colors.palette.orange500;
  } else if (muscleGroup.includes('arm') || muscleGroup.includes('bicep') || muscleGroup.includes('tricep')) {
    return colors.palette.yellow500;
  } else if (muscleGroup.includes('core') || muscleGroup.includes('ab')) {
    return colors.palette.green500;
  }

  return colors.palette.green500;
};

// Continue Card Component
interface ContinueCardProps {
  title: string;
  subtitle: string;
  progress: number;
  color: string;
  onPress: () => void;
}

const ContinueCard: React.FC<ContinueCardProps> = ({
  title,
  subtitle,
  progress,
  color,
  onPress
}) => {
  const { colors, spacing } = useTheme();

  return (
    <TouchableOpacity
      style={styles.continueCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.continueCardContent}>
        <View style={styles.continueCardRow}>
          <View style={[styles.continueCardIcon, { backgroundColor: color }]} />
          <View style={styles.continueCardTextContainer}>
            <Text style={styles.continueCardTitle}>{title}</Text>
            <Text style={styles.continueCardSubtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.continueCardProgressContainer}>
          <View style={styles.continueCardProgressBar}>
            <View
              style={[
                styles.continueCardProgressFill,
                { width: `${progress * 100}%`, backgroundColor: color }
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Program Card Component
interface ProgramCardProps {
  title: string;
  weeks: number;
  level: string;
  onPress: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ title, weeks, level, onPress }) => {
  const { colors, spacing } = useTheme();

  return (
    <Card
      variant="blur"
      blurIntensity={15}
      blurTint="dark"
      style={styles.programCard}
      onPress={onPress}
    >
      <View style={styles.programCardContent}>
        <View style={[styles.programCardIcon, { backgroundColor: colors.palette.purple500 }]}>
          <Ionicons name="calendar" size={20} color="#fff" />
        </View>
        <Text style={styles.programCardTitle}>{title}</Text>
        <View style={styles.programCardDetails}>
          <View style={styles.programCardDetail}>
            <Ionicons name="time-outline" size={16} color={colors.icon.secondary} />
            <Text style={styles.programCardDetailText}>{weeks} weeks</Text>
          </View>
          <View style={styles.programCardDetail}>
            <Ionicons name="fitness-outline" size={16} color={colors.icon.secondary} />
            <Text style={styles.programCardDetailText}>{level}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

// Template Card Component
interface TemplateCardProps {
  title: string;
  exercises: number;
  id: string;
  onPress: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ title, exercises, id, onPress }) => {
  const { colors, spacing } = useTheme();

  // Get template icon color based on workout name
  const getTemplateIconColor = () => {
    if (title.toLowerCase().includes('push-pull-legs') ||
        title.toLowerCase().includes('ppl')) {
      return colors.palette.purple500; // Purple
    } else if (title.toLowerCase().includes('strength') ||
              title.toLowerCase().includes('5x5')) {
      return colors.palette.blue500; // Blue
    } else if (title.toLowerCase().includes('hiit') ||
              title.toLowerCase().includes('circuit') ||
              title.toLowerCase().includes('cardio')) {
      return colors.palette.orange500; // Orange
    }
    return colors.palette.green500; // Green default for templates
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(id);
  };

  return (
    <Card
      variant="blur"
      blurIntensity={15}
      blurTint="dark"
      style={styles.templateCard}
      onPress={handlePress}
    >
      <View style={styles.templateCardContent}>
        {/* Card header with template name and icon */}
        <View style={styles.templateCardHeader}>
          <View style={[styles.templateCardIcon, { backgroundColor: getTemplateIconColor() }]} />
          <Text style={styles.templateCardTitle}>{title}</Text>
        </View>

        {/* Stats row with exercises */}
        <View style={styles.templateCardStatsRow}>
          <View style={styles.templateCardStatItem}>
            <Ionicons name="barbell-outline" size={16} color={colors.icon.secondary} />
            <Text style={styles.templateCardStatValue}>{exercises} exercises</Text>
          </View>

          {/* Start button - positioned at the bottom right */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    paddingTop: 200, // Match header height
    paddingBottom: 100, // Extra padding for active workout bar
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    marginTop: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarText: {
    color: '#999',
    marginLeft: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    padding: 0,
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    height: 50,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0A84FF',
  },
  horizontalScrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  continueSection: {
    paddingHorizontal: 0,
  },

  // Continue Card styles
  continueCard: {
    width: screenWidth - 32,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueCardContent: {
    padding: 16,
  },
  continueCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
  },
  continueCardTextContainer: {
    flex: 1,
  },
  continueCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  continueCardSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  continueCardProgressContainer: {
    width: '100%',
  },
  continueCardProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  continueCardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Program Card styles
  programCard: {
    width: 180,
    height: 180,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
  },
  programCardContent: {
    padding: 16,
    height: '100%',
    justifyContent: 'space-between',
  },
  programCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  programCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  programCardDetails: {
    marginTop: 'auto',
  },
  programCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  programCardDetailText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },

  // Template Card styles
  templateCard: {
    width: 240,
    height: 240,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
  },
  templateCardContent: {
    padding: 16,
    height: '100%',
  },
  templateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  templateCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  templateCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  templateCardStatsRow: {
    flex: 1,
    position: 'relative',
  },
  templateCardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateCardStatValue: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  startButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Exercise Grid styles
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  exerciseCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  exerciseMuscleGroup: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },

  // Active Workout Bar styles
  activeWorkoutBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 64,
  },
  activeWorkoutGradient: {
    width: '100%',
    height: '100%',
  },
  activeWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    height: '100%',
  },
  activeWorkoutInfo: {
    flex: 1,
  },
  activeWorkoutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  activeWorkoutSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  activeWorkoutControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeWorkoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search styles
  searchContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 16,
  },
  searchResults: {
    flex: 1,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchItemContent: {
    flex: 1,
  },
  searchItemTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  searchItemSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  emptySearchResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySearchSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
