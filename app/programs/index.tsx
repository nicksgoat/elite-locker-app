import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Types for our programs
interface ProgramPhase {
  name: string;
  weeks: number;
  deload: boolean;
}

interface Program {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  phases_config: ProgramPhase[];
  is_public: boolean;
  club_id?: string;
  thumbnail?: string;
  goal?: string;
  level?: string;
  status?: 'active' | 'completed' | 'not_started';
  progress?: number; // 0-100
  currentWeek?: number;
  nextWorkoutDate?: string;
}

// Mock data for programs
const mockPrograms: Program[] = [
  {
    id: 'p1',
    title: 'ELITE Power Building',
    description: 'Complete 8-week program focusing on strength and hypertrophy with built-in progression.',
    duration_weeks: 8,
    phases_config: [
      { name: 'Hypertrophy', weeks: 3, deload: false },
      { name: 'Deload', weeks: 1, deload: true },
      { name: 'Strength', weeks: 3, deload: false },
      { name: 'Peak', weeks: 1, deload: false }
    ],
    is_public: true,
    thumbnail: 'https://www.si.com/.image/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/MTk5MTMzNzI1MDQzMjA1OTA1/devon-allen.jpg',
    goal: 'Strength',
    level: 'Intermediate',
    status: 'active',
    progress: 35,
    currentWeek: 3,
    nextWorkoutDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
  },
  {
    id: 'p2',
    title: '12-Week Transformation',
    description: 'Progressive overload program designed for body composition changes with nutrition guidance.',
    duration_weeks: 12,
    phases_config: [
      { name: 'Foundation', weeks: 4, deload: false },
      { name: 'Deload', weeks: 1, deload: true },
      { name: 'Hypertrophy', weeks: 4, deload: false },
      { name: 'Deload', weeks: 1, deload: true },
      { name: 'Definition', weeks: 2, deload: false }
    ],
    is_public: true,
    thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
    goal: 'Hypertrophy',
    level: 'Beginner',
    status: 'completed',
    progress: 100,
    currentWeek: 12
  },
  {
    id: 'p3',
    title: 'Athletic Performance',
    description: 'Focus on explosiveness, agility and sport-specific conditioning.',
    duration_weeks: 6,
    phases_config: [
      { name: 'Base Building', weeks: 2, deload: false },
      { name: 'Power Phase', weeks: 2, deload: false },
      { name: 'Performance', weeks: 1, deload: false },
      { name: 'Taper', weeks: 1, deload: true }
    ],
    is_public: true,
    club_id: 'c1',
    thumbnail: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5',
    goal: 'Performance',
    level: 'Advanced',
    status: 'active',
    progress: 65,
    currentWeek: 4,
    nextWorkoutDate: new Date(Date.now() + 172800000).toISOString() // Day after tomorrow
  },
  {
    id: 'p4',
    title: 'Powerlifting Prep',
    description: 'Competition-focused program with progressive loading for squat, bench, and deadlift.',
    duration_weeks: 10,
    phases_config: [
      { name: 'Volume', weeks: 4, deload: false },
      { name: 'Deload', weeks: 1, deload: true },
      { name: 'Intensity', weeks: 3, deload: false },
      { name: 'Peak', weeks: 1, deload: false },
      { name: 'Taper', weeks: 1, deload: true }
    ],
    is_public: true,
    thumbnail: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba',
    goal: 'Strength',
    level: 'Advanced',
    status: 'not_started'
  },
  {
    id: 'p5',
    title: 'Endurance Builder',
    description: 'Improve cardiovascular fitness and muscular endurance with progressive workouts.',
    duration_weeks: 6,
    phases_config: [
      { name: 'Base', weeks: 2, deload: false },
      { name: 'Build', weeks: 3, deload: false },
      { name: 'Peak', weeks: 1, deload: false }
    ],
    is_public: true,
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
    goal: 'Endurance',
    level: 'Intermediate',
    status: 'active',
    progress: 15,
    currentWeek: 1,
    nextWorkoutDate: new Date().toISOString() // Today
  }
];

// Filter options
const goals = ['All', 'Strength', 'Hypertrophy', 'Performance', 'Endurance'];
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const durations = ['All', '4-6 weeks', '8-10 weeks', '12+ weeks'];

export default function ProgramsScreen() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  const [selectedGoal, setSelectedGoal] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  // Animation values for tab indicator
  const tabIndicatorWidth = useSharedValue(0);
  const tabIndicatorLeft = useSharedValue(0);

  // Filter programs based on selected filters and active tab
  const filteredPrograms = programs.filter(program => {
    // Filter by goal, level, and duration
    const matchesGoal = selectedGoal === 'All' || program.goal === selectedGoal;
    const matchesLevel = selectedLevel === 'All' || program.level === selectedLevel;

    let matchesDuration = true;
    if (selectedDuration !== 'All') {
      if (selectedDuration === '4-6 weeks') {
        matchesDuration = program.duration_weeks >= 4 && program.duration_weeks <= 6;
      } else if (selectedDuration === '8-10 weeks') {
        matchesDuration = program.duration_weeks >= 8 && program.duration_weeks <= 10;
      } else if (selectedDuration === '12+ weeks') {
        matchesDuration = program.duration_weeks >= 12;
      }
    }

    // Filter by program status (active tab)
    let matchesStatus = true;
    if (activeTab === 'active') {
      matchesStatus = program.status === 'active';
    } else if (activeTab === 'completed') {
      matchesStatus = program.status === 'completed';
    }

    return matchesGoal && matchesLevel && matchesDuration && matchesStatus;
  });

  // Handle tab change
  const handleTabChange = (tab: 'all' | 'active' | 'completed') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);

    // Animate tab indicator
    const tabWidth = width / 3;
    const newLeft = tab === 'all' ? 0 : tab === 'active' ? tabWidth : tabWidth * 2;

    tabIndicatorLeft.value = withSpring(newLeft, {
      damping: 15,
      stiffness: 120,
    });
  };

  const handleFilterPress = (filter: string, type: 'goal' | 'level' | 'duration') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'goal') {
      setSelectedGoal(filter);
    } else if (type === 'level') {
      setSelectedLevel(filter);
    } else {
      setSelectedDuration(filter);
    }
  };

  const handleProgramPress = (programId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/programs/detail/[id]',
      params: { id: programId }
    });
  };

  // Handle program management
  const handleManageProgram = (programId: string, event: any) => {
    event.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to program progress page
    router.push({
      pathname: '/programs/progress/[id]',
      params: { id: programId }
    });
  };

  // Handle continue program workout
  const handleContinueProgram = (programId: string, event: any) => {
    event.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const program = programs.find(p => p.id === programId);
    if (!program) return;

    // In a real app, this would navigate to the next workout in the program
    // For now, just show an alert
    Alert.alert(
      'Continue Program',
      `Continue with the next workout in ${program.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Get the next workout in the program (using mock workout for now)
            const workoutId = 'w1'; // Mock workout ID

            // Navigate to the workout detail page first, which will then use the standard workout flow
            router.push({
              pathname: `/programs/workout/${workoutId}`,
              params: { programId }
            });
          }
        }
      ]
    );
  };

  const renderProgramCard = ({ item }: { item: Program }) => {
    // Format next workout date if available
    let nextWorkoutText = '';
    if (item.status === 'active' && item.nextWorkoutDate) {
      const date = new Date(item.nextWorkoutDate);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        nextWorkoutText = 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        nextWorkoutText = 'Tomorrow';
      } else {
        nextWorkoutText = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      }
    }

    // Determine status badge color
    const getStatusColor = () => {
      switch (item.status) {
        case 'active': return '#0A84FF';
        case 'completed': return '#34C759';
        default: return '#8E8E93';
      }
    };

    // Determine status text
    const getStatusText = () => {
      switch (item.status) {
        case 'active': return 'Active';
        case 'completed': return 'Completed';
        default: return 'Not Started';
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.programCard,
          activeTab !== 'all' && styles.programCardWide
        ]}
        onPress={() => handleProgramPress(item.id)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.programThumbnail}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradientOverlay}
        />
        <View style={styles.programCardContent}>
          <Text style={styles.programTitle}>{item.title}</Text>

          <View style={styles.programMetaContainer}>
            <View style={styles.programBadge}>
              <Text style={styles.programBadgeText}>{item.duration_weeks} weeks</Text>
            </View>

            {item.goal && (
              <View style={[styles.programBadge, {backgroundColor: '#333333'}]}>
                <Text style={styles.programBadgeText}>{item.goal}</Text>
              </View>
            )}

            {item.level && (
              <View style={[styles.programBadge, {backgroundColor: '#2c2c2e'}]}>
                <Text style={styles.programBadgeText}>{item.level}</Text>
              </View>
            )}

            {item.status && (
              <View style={[styles.programBadge, {backgroundColor: getStatusColor()}]}>
                <Text style={styles.programBadgeText}>{getStatusText()}</Text>
              </View>
            )}
          </View>

          {/* Progress bar for active programs */}
          {item.status === 'active' && item.progress !== undefined && (
            <View style={styles.programProgressContainer}>
              <View style={styles.programProgressBar}>
                <View
                  style={[
                    styles.programProgressFill,
                    { width: `${item.progress}%` }
                  ]}
                />
              </View>
              <Text style={styles.programProgressText}>
                {item.progress}% • Week {item.currentWeek}/{item.duration_weeks}
              </Text>
            </View>
          )}

          {/* Next workout indicator */}
          {item.status === 'active' && nextWorkoutText && (
            <View style={styles.nextWorkoutContainer}>
              <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
              <Text style={styles.nextWorkoutText}>Next: {nextWorkoutText}</Text>
            </View>
          )}

          {/* Action buttons for active programs in active tab */}
          {activeTab === 'active' && item.status === 'active' && (
            <View style={styles.programActions}>
              <TouchableOpacity
                style={styles.programActionButton}
                onPress={(e) => handleContinueProgram(item.id, e)}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.programActionText}>Continue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.programActionButton, styles.programManageButton]}
                onPress={(e) => handleManageProgram(item.id, e)}
              >
                <Ionicons name="settings-outline" size={16} color="#FFFFFF" />
                <Text style={styles.programActionText}>Manage</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterChip = (label: string, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        isSelected && styles.filterChipSelected
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipText,
          isSelected && styles.filterChipTextSelected
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Animated styles for tab indicator
  const tabIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabIndicatorLeft.value }],
    };
  });

  // Get active programs count
  const activeCount = programs.filter(p => p.status === 'active').length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Training Programs</Text>
          <Text style={styles.headerSubtitle}>Follow expert programs with auto-progression</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('all')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText
            ]}>
              All Programs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('active')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'active' && styles.activeTabText
            ]}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('completed')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'completed' && styles.activeTabText
            ]}>
              Completed
            </Text>
          </TouchableOpacity>

          <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
        </View>

        {/* Filter Section - Only show in All tab */}
        {activeTab === 'all' && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterSectionTitle}>Goal</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContent}
            >
              {goals.map((goal) => (
                <React.Fragment key={goal}>
                  {renderFilterChip(
                    goal,
                    selectedGoal === goal,
                    () => handleFilterPress(goal, 'goal')
                  )}
                </React.Fragment>
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Level</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContent}
            >
              {levels.map((level) => (
                <React.Fragment key={level}>
                  {renderFilterChip(
                    level,
                    selectedLevel === level,
                    () => handleFilterPress(level, 'level')
                  )}
                </React.Fragment>
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Duration</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersScrollContent}
            >
              {durations.map((duration) => (
                <React.Fragment key={duration}>
                  {renderFilterChip(
                    duration,
                    selectedDuration === duration,
                    () => handleFilterPress(duration, 'duration')
                  )}
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Empty State */}
        {filteredPrograms.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'active'
                ? 'No Active Programs'
                : activeTab === 'completed'
                  ? 'No Completed Programs'
                  : 'No Programs Found'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeTab === 'active'
                ? 'Start a program to track your progress'
                : activeTab === 'completed'
                  ? 'Complete a program to see it here'
                  : 'Try adjusting your filters'}
            </Text>
          </View>
        )}

        {/* Programs List/Grid */}
        {filteredPrograms.length > 0 && (
          <>
            {activeTab === 'all' ? (
              <View style={styles.programsGrid}>
                {filteredPrograms.reduce((rows: any[], item, index) => {
                  if (index % 2 === 0) {
                    rows.push([item]);
                  } else {
                    rows[rows.length - 1].push(item);
                  }
                  return rows;
                }, []).map((row: any[], rowIndex: number) => (
                  <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                    {row.map((item) => renderProgramCard({ item }))}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.programsGrid}>
                {filteredPrograms.map((item) => renderProgramCard({ item }))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Program Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/programs/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 8,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#1C1C1E',
    padding: 4,
    position: 'relative',
    height: 44,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  activeTabText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: (width - 32) / 3 - 8,
    height: 36,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderRadius: 6,
    zIndex: 0,
  },
  // Filters
  filtersContainer: {
    paddingHorizontal: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  filtersScrollContent: {
    paddingRight: 16,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#1C1C1E',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  filterChipSelected: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Program Cards
  programsGrid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 16,
  },
  programCard: {
    width: cardWidth,
    height: 200,
    marginBottom: 16,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  programCardWide: {
    width: width - 32,
    height: 240,
    marginHorizontal: 0,
  },
  programThumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  programCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  programMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  programBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    marginRight: 6,
    marginBottom: 4,
    backdropFilter: 'blur(10px)',
  },
  programBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Progress
  programProgressContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  programProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  programProgressFill: {
    height: '100%',
    backgroundColor: '#0A84FF',
    borderRadius: 2,
  },
  programProgressText: {
    fontSize: 12,
    color: '#AEAEB2',
  },
  // Next Workout
  nextWorkoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextWorkoutText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  // Program Actions
  programActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  programActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  programManageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  programActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  // Create Button
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});