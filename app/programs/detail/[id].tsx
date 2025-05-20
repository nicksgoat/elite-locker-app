import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

// Import custom components
import ProgramCreatorCard from '@/components/ui/ProgramCreatorCard';
import ProgramScheduleView from '@/components/ui/ProgramScheduleView';

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
    thumbnail: 'https://www.si.com/.image/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/MTk5MTMzNzI1MDQzMjA1OTA1/devon-allen.jpg',
    goal: 'Strength',
    level: 'Intermediate',
    created_by: {
      id: 'c1',
      name: 'Devon Allen',
      avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg'
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
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100%

  // Animation values
  const scrollY = useSharedValue(0);
  const bookmarkScale = useSharedValue(1);
  const startButtonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);

  useEffect(() => {
    // In a real app, this would be an API call to get the program details
    if (programId && mockPrograms[programId]) {
      setProgram(mockPrograms[programId]);
    }
  }, [programId]);

  // Scroll handler for animations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;

      // Fade header based on scroll position
      if (event.contentOffset.y > 50) {
        headerOpacity.value = interpolate(
          event.contentOffset.y,
          [50, 100],
          [1, 0.3],
          Extrapolate.CLAMP
        );
      } else {
        headerOpacity.value = 1;
      }
    },
  });

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    };
  });

  const bookmarkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bookmarkScale.value }],
    };
  });

  const startButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: startButtonScale.value }],
    };
  });

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBookmarkPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate bookmark button
    bookmarkScale.value = withSpring(1.2, { damping: 2 }, () => {
      bookmarkScale.value = withSpring(1);
    });

    setIsBookmarked(!isBookmarked);
  };

  const handleStartPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate start button
    startButtonScale.value = withSpring(0.95, { damping: 10 }, () => {
      startButtonScale.value = withSpring(1, {}, () => {
        // After animation completes, show subscription modal
        runOnJS(setShowSubscriptionModal)(true);
      });
    });
  };

  const handleSharePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!program) return;

    try {
      const result = await Share.share({
        message: `Check out this awesome program: ${program.title}. ${program.description.substring(0, 100)}... Download Elite Locker to start this program!`,
        url: `https://elitelocker.app/programs/${programId}`,
        title: program.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log(`Shared via ${result.activityType}`);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong sharing this program');
    }
  };

  const handleSubscribe = () => {
    // In a real app, this would call an API to subscribe to the program
    setSubscribed(true);
    setShowSubscriptionModal(false);
    setProgress(0);

    // Show success message
    Alert.alert(
      'Subscribed!',
      'You have successfully subscribed to this program. You can now start tracking your progress.',
      [
        { text: 'OK' },
        {
          text: 'Start First Workout',
          onPress: () => {
            // Navigate to the first workout in the program
            if (program && program.workouts && program.workouts.length > 0) {
              router.push(`/programs/workout/${program.workouts[0].id}`);
            }
          }
        }
      ]
    );
  };

  const handleMarkComplete = (weekNum: number, dayNum: number) => {
    // In a real app, this would update the progress in the database
    // For now, we'll just update the local progress state
    const totalDays = program?.workouts.length || 1;
    const newProgress = Math.min(100, Math.round(((weekNum * 7 + dayNum) / totalDays) * 100));
    setProgress(newProgress);
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
      {/* Header with back button and bookmark */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleSharePress}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Animated.View style={bookmarkAnimatedStyle}>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={handleBookmarkPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Content ScrollView */}
      <Animated.ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: program.thumbnail }}
            style={styles.bannerImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.bannerGradient}
          />
        </View>

        {/* Program Title and Badges */}
        <View style={styles.titleContainer}>
          <Text style={styles.newBadge}>NEW</Text>
          <Text style={styles.programTitle}>{program.title}</Text>

          <View style={styles.badgesContainer}>
            <View style={styles.badgeItem}>
              <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
              <Text style={styles.badgeText}>{program.duration_weeks} Day</Text>
            </View>

            {program.goal && (
              <View style={styles.badgeItem}>
                <Ionicons name="fitness-outline" size={18} color="#FFFFFF" />
                <Text style={styles.badgeText}>{program.goal}</Text>
              </View>
            )}

            {program.level && (
              <View style={styles.badgeItem}>
                <Ionicons name="stats-chart-outline" size={18} color="#FFFFFF" />
                <Text style={styles.badgeText}>{program.level}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar (only shown if subscribed) */}
        {subscribed && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>YOUR PROGRESS</Text>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {/* Overview Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <Text style={styles.description}>{program.description}</Text>
        </View>

        {/* Creator Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>CREATED BY</Text>
          <ProgramCreatorCard
            creatorId={program.created_by.id}
            name={program.created_by.name}
            avatar={program.created_by.avatar}
            category="Track & Field, American Football"
          />
        </View>

        {/* Schedule Section */}
        <ProgramScheduleView
          totalWeeks={program.duration_weeks}
          workouts={program.workouts.map(workout => ({
            id: workout.id,
            title: workout.title,
            week: workout.week,
            day: workout.day,
            type: 'Workout',
            image: program.thumbnail // Using program thumbnail as placeholder
          }))}
          onWorkoutComplete={subscribed ? handleMarkComplete : undefined}
          isSubscribed={subscribed}
        />

        {/* Placeholder for bottom spacing */}
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Start/Continue Button (Fixed at bottom) */}
      <View style={styles.startButtonContainer}>
        <BlurView intensity={80} tint="dark" style={styles.startButtonBlur}>
          <Animated.View style={startButtonAnimatedStyle}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartPress}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>
                {subscribed ? "Continue Program" : "Start Program"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>
      </View>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Subscribe to Program</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowSubscriptionModal(false)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Subscribe to this program to track your progress and get access to all workouts.
              </Text>

              <View style={styles.subscriptionOptions}>
                <TouchableOpacity
                  style={styles.subscriptionOption}
                  onPress={handleSubscribe}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Free Subscription</Text>
                    <Text style={styles.optionDescription}>
                      Access to all workouts and progress tracking
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#0A84FF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.subscriptionOption}
                  onPress={handleSubscribe}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Premium Subscription</Text>
                    <Text style={styles.optionDescription}>
                      Additional features, coaching tips, and exclusive content
                    </Text>
                    <Text style={styles.optionPrice}>$9.99/month</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#0A84FF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      )}
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
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bannerContainer: {
    height: height * 0.5, // Taller banner for the new design
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginTop: -60, // Overlap with the banner
    marginBottom: 24,
  },
  newBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  // Progress tracking
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0A84FF',
    borderRadius: 3,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#E5E5EA',
  },
  // Start Button Area
  startButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 100,
  },
  startButtonBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Subscription Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#E5E5EA',
    marginBottom: 20,
  },
  subscriptionOptions: {
    marginBottom: 20,
  },
  subscriptionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionContent: {
    flex: 1,
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#AEAEB2',
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
    marginTop: 4,
  },
  subscribeButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});