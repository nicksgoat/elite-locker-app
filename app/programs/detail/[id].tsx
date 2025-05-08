import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

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
    // Navigate to workout detail using standard workout detail route
    router.push(`/workout/detail/${workoutId}`); 
  };

  if (!program) {
    return (
      <IMessagePageWrapper title="Loading...">
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading program...</Text>
          </View>
      </IMessagePageWrapper>
    );
  }

  return (
    <IMessagePageWrapper title={program.title} subtitle={`${program.duration_weeks} Weeks`}>
        {/* Program Content ScrollView */}
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
            {/* Banner Image */}
            <View style={styles.bannerContainer}>
                 <ExpoImage 
                    source={{ uri: program.thumbnail }} 
                    style={styles.bannerImage}
                    contentFit="cover"
                />
                 <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.bannerGradient}
                />
                <View style={styles.bannerOverlay}>
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
                        <ExpoImage 
                        source={{ uri: program.created_by.avatar }}
                        style={styles.creatorAvatar}
                        contentFit="cover"
                        />
                        <Text style={styles.creatorName}>By {program.created_by.name}</Text>
                    </View>
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

             {/* Placeholder for bottom spacing, adjust as needed */}
             <View style={{ height: 80 }} />

        </ScrollView>

        {/* Subscribe Button (Floating or fixed at bottom) */}
        {/* Example: Fixed at bottom using BlurView */}
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
        
        {/* TODO: Add Subscription Modal */}

    </IMessagePageWrapper>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
     // Remove paddingBottom here, handle spacing with last element or container padding
  },
  bannerContainer: {
    height: height * 0.25, // Adjust height
    width: '100%',
    position: 'relative',
    marginBottom: 16, // Space below banner
  },
   bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12, // Add rounding if desired
    overflow: 'hidden',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  bannerOverlay: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
  },
  programMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  programBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 6,
    marginBottom: 6,
  },
  programBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  creatorName: {
    fontSize: 13,
    color: '#E5E5EA',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E5E5EA',
  },
  phasesContainer: {
    paddingLeft: 16,
    paddingRight: 4, // Allow last card edge to show
    paddingVertical: 4,
  },
  phaseCard: {
    width: 160,
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    minHeight: 80, // Ensure minimum height
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
    borderRadius: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.2)', // Orange for deload
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  deloadText: {
    color: '#FF9500',
    fontSize: 11,
    fontWeight: '500',
  },
  workoutCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1, // Allow text to wrap
    marginRight: 8,
  },
  workoutMeta: {
    fontSize: 13,
    color: '#A0A0A0',
  },
  exercisesList: {
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: 10,
  },
  exerciseItem: {
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 14,
    color: '#E5E5EA',
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  moreExercises: {
    fontSize: 12,
    color: '#0A84FF',
    marginTop: 4,
  },
  viewWorkoutButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewWorkoutText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '500',
  },
  // Subscribe Button Area
  subscribeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Adjust for safe area/navbar
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)', // Match iMessage compose line
  },
  subscribeBlur: {
     // BlurView takes care of background
  },
  subscribeButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 