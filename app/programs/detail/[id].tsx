import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Types for our program
interface ProgramPhase {
  name: string;
  weeks: number;
  deload: boolean;
}

interface ProgramWorkout {
  id: string;
  title: string;
  week: number;
  day: number;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    rest: number;
  }[];
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
  workouts: ProgramWorkout[];
  created_by: {
    id: string;
    name: string;
    avatar?: string;
  };
}

// Mock data for programs
const mockPrograms: { [key: string]: Program } = {
  'p1': {
    id: 'p1',
    title: 'ELITE Power Building',
    description: 'Complete 8-week program focusing on strength and hypertrophy with built-in progression and auto-calculated loads based on your training maxes.',
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
    level: 'Intermediate',
    created_by: {
      id: 'c1',
      name: 'Elite Coaching Staff',
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d'
    },
    workouts: [
      {
        id: 'w1',
        title: 'Day 1: Upper Hypertrophy',
        week: 1,
        day: 1,
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-10 @70%', rest: 90 },
          { name: 'Bent-Over Row', sets: 4, reps: '10-12 @65%', rest: 90 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Lat Pulldown', sets: 3, reps: '12-15', rest: 60 },
          { name: 'Lateral Raises', sets: 3, reps: '15-20', rest: 45 },
          { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', rest: 45 }
        ]
      },
      {
        id: 'w2',
        title: 'Day 2: Lower Hypertrophy',
        week: 1,
        day: 2,
        exercises: [
          { name: 'Back Squat', sets: 4, reps: '8-10 @70%', rest: 120 },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-10 @65%', rest: 90 },
          { name: 'Leg Press', sets: 3, reps: '10-12', rest: 90 },
          { name: 'Leg Curl', sets: 3, reps: '12-15', rest: 60 },
          { name: 'Standing Calf Raise', sets: 4, reps: '15-20', rest: 45 }
        ]
      }
    ]
  },
  'p2': {
    id: 'p2',
    title: '12-Week Transformation',
    description: 'Progressive overload program designed for body composition changes with nutrition guidance and auto-adjusting intensity.',
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
    created_by: {
      id: 'c2',
      name: 'Transform Fitness',
      avatar: 'https://images.unsplash.com/photo-1549351512-c5e12b11e283'
    },
    workouts: [
      {
        id: 'w1',
        title: 'Foundation: Full Body A',
        week: 1,
        day: 1,
        exercises: [
          { name: 'Goblet Squat', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Dumbbell Row', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: 60 },
          { name: 'Dumbbell Romanian Deadlift', sets: 3, reps: '10-12', rest: 60 }
        ]
      }
    ]
  }
};

export default function ProgramDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const programId = Array.isArray(id) ? id[0] : id;
  const [program, setProgram] = useState<Program | null>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call to get the program details
    if (programId && mockPrograms[programId]) {
      setProgram(mockPrograms[programId]);
    }
  }, [programId]);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSubscribePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSubscriptionModal(true);
  };

  const handlePhasePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActivePhaseIndex(index);
  };

  const handleWorkoutPress = (workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to workout detail preview
    router.push({
      pathname: '/programs/workout',
      params: { programId, workoutId }
    });
  };

  if (!program) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading program...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header Image with Overlay */}
      <View style={styles.headerImageContainer}>
        <Image 
          source={{ uri: program.thumbnail }} 
          style={styles.headerImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.5, 1]}
          style={styles.headerGradient}
        />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Program Title and Meta */}
        <View style={styles.programHeaderContainer}>
          <Text style={styles.programTitle}>{program.title}</Text>
          
          <View style={styles.programMetaContainer}>
            <View style={styles.programBadge}>
              <Text style={styles.programBadgeText}>{program.duration_weeks} weeks</Text>
            </View>
            {program.goal && (
              <View style={[styles.programBadge, {backgroundColor: '#333333'}]}>
                <Text style={styles.programBadgeText}>{program.goal}</Text>
              </View>
            )}
            {program.level && (
              <View style={[styles.programBadge, {backgroundColor: '#2c2c2e'}]}>
                <Text style={styles.programBadgeText}>{program.level}</Text>
              </View>
            )}
          </View>

          <View style={styles.creatorContainer}>
            <Image 
              source={{ uri: program.created_by.avatar }}
              style={styles.creatorAvatar}
            />
            <Text style={styles.creatorName}>By {program.created_by.name}</Text>
          </View>
        </View>

        {/* Program Description */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{program.description}</Text>
        </View>

        {/* Program Phases */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Program Structure</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.phasesContainer}
          >
            {program.phases_config.map((phase, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.phaseCard,
                  activePhaseIndex === index && styles.phaseCardActive
                ]}
                onPress={() => handlePhasePress(index)}
                activeOpacity={0.7}
              >
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseName}>{phase.name}</Text>
                  <Text style={styles.phaseWeeks}>{phase.weeks} {phase.weeks === 1 ? 'week' : 'weeks'}</Text>
                </View>
                {phase.deload && (
                  <View style={styles.deloadBadge}>
                    <Text style={styles.deloadText}>Deload</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sample Workouts */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sample Workouts</Text>
          {program.workouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => handleWorkoutPress(workout.id)}
              activeOpacity={0.7}
            >
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <Text style={styles.workoutMeta}>Week {workout.week} · Day {workout.day}</Text>
              </View>
              
              <View style={styles.exercisesList}>
                {workout.exercises.slice(0, 3).map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} sets • {exercise.reps}
                    </Text>
                  </View>
                ))}
                {workout.exercises.length > 3 && (
                  <Text style={styles.moreExercises}>
                    +{workout.exercises.length - 3} more exercises
                  </Text>
                )}
              </View>
              
              <View style={styles.viewWorkoutButton}>
                <Text style={styles.viewWorkoutText}>Preview Workout</Text>
                <Ionicons name="chevron-forward" size={16} color="#0A84FF" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Subscribe Button */}
      <View style={styles.subscribeContainer}>
        <BlurView intensity={80} tint="dark" style={styles.subscribeBlur}>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribePress}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeText}>Subscribe to Program</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerImageContainer: {
    height: height * 0.3,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 20,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  programHeaderContainer: {
    padding: 16,
    paddingTop: 20,
  },
  programTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  programMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  programBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    marginRight: 8,
    marginBottom: 8,
  },
  programBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  creatorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  creatorName: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  sectionContainer: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#A0A0A0',
  },
  phasesContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  phaseCard: {
    width: 150,
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  phaseCardActive: {
    borderColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  phaseHeader: {
    marginBottom: 8,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  phaseWeeks: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  deloadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FF9500',
    alignSelf: 'flex-start',
  },
  deloadText: {
    fontSize: 12,
    color: '#000000',
    fontWeight: '600',
  },
  workoutCard: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    overflow: 'hidden',
  },
  workoutHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  exercisesList: {
    padding: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  moreExercises: {
    fontSize: 12,
    color: '#0A84FF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  viewWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  viewWorkoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
    marginRight: 4,
  },
  subscribeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  subscribeBlur: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  subscribeButton: {
    backgroundColor: '#0A84FF',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 