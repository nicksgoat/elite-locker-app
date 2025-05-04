import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  Platform,
  Image
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
    goal: 'Strength',
    level: 'Intermediate'
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
    level: 'Beginner'
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
    level: 'Advanced'
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
    level: 'Advanced'
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

  // Filter programs based on selected filters
  const filteredPrograms = programs.filter(program => {
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

    return matchesGoal && matchesLevel && matchesDuration;
  });

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

  const renderProgramCard = ({ item }: { item: Program }) => (
    <TouchableOpacity
      style={styles.programCard}
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
        </View>
      </View>
    </TouchableOpacity>
  );

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

        {/* Filter Section */}
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

        {/* Programs Grid */}
        <FlatList
          data={filteredPrograms}
          renderItem={renderProgramCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.programsGrid}
          numColumns={2}
        />
      </ScrollView>
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
    height: 100,
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
}); 