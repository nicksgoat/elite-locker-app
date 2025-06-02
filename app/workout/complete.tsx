import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    Share,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import TrainingMaxNotification from '../../components/workout/TrainingMaxNotification';
import { Club, useSocial } from '../../contexts/SocialContext';
import { TrainingMaxUpdate, useWorkout } from '../../contexts/WorkoutContext';

const { width: screenWidth } = Dimensions.get('window');

interface WorkoutSummary {
  id: string;
  name: string;
  duration: number;
  exercises: WorkoutExercise[];
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  personalRecords: string[];
  calories?: number;
  heartRate?: {
    avg: number;
    max: number;
  };
}

interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
  isPersonalRecord?: boolean;
}

interface SocialSettings {
  shareToClubs: string[];
  shareToSocial: boolean;
  includeStats: boolean;
  includePhoto: boolean;
  visibility: 'public' | 'friends' | 'private';
  message: string;
}

export default function WorkoutCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workoutId, clubId, autoShare } = useLocalSearchParams();
  const { clubs, shareToClub, shareWorkout, shareToSocialMedia } = useSocial();
  const { workoutSummary: contextWorkoutSummary } = useWorkout();

  // Try to get enhanced workout context if available
  let enhancedWorkoutSummary = null;
  let enhancedContext = null;
  try {
    const { useEnhancedWorkout } = require('../../contexts/EnhancedWorkoutContext');
    enhancedContext = useEnhancedWorkout();
    enhancedWorkoutSummary = enhancedContext?.lastWorkoutSummary;

    // Debug logging
    console.log('🔍 Workout Complete Debug:', {
      contextWorkoutSummary: !!contextWorkoutSummary,
      enhancedWorkoutSummary: !!enhancedWorkoutSummary,
      enhancedContext: !!enhancedContext,
      workoutId,
      clubId,
      autoShare
    });
  } catch (error) {
    console.log('Enhanced workout context not available:', error);
  }

  // Refs
  const shareCardRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  // State
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary | null>(null);
  const [socialSettings, setSocialSettings] = useState<SocialSettings>({
    shareToClubs: clubId ? [clubId as string] : [],
    shareToSocial: autoShare === 'true',
    includeStats: true,
    includePhoto: false,
    visibility: 'public',
    message: ''
  });
  const [isSharing, setIsSharing] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showTrainingMaxNotification, setShowTrainingMaxNotification] = useState(false);
  const [trainingMaxUpdates, setTrainingMaxUpdates] = useState<TrainingMaxUpdate[]>([]);

  // Enhanced animation state
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'celebrating' | 'sharing' | 'complete'>('entering');
  const [workoutStats, setWorkoutStats] = useState({
    duration: 0,
    totalVolume: 0,
    totalSets: 0,
    exercises: 0,
    calories: 0,
    heartRate: 0,
    personalRecords: [] as string[]
  });

  // Enhanced animation values
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeWorkoutCompletion();
  }, []);

  const initializeWorkoutCompletion = async () => {
    // Start entrance animations
    setAnimationPhase('entering');

    Animated.parallel([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Try to get real workout data from contexts, fallback to mock data
    let calculatedStats = {
      duration: 45, // minutes
      totalVolume: 12500, // lbs
      totalSets: 16,
      exercises: 5,
      calories: 380,
      heartRate: 142,
      personalRecords: ['Bench Press', 'Squat'] // Example PRs
    };

    // Use enhanced context data if available
    if (enhancedContext?.elapsedTime) {
      calculatedStats.duration = Math.floor(enhancedContext.elapsedTime / 60);
    }
    if (enhancedContext?.totalVolume) {
      calculatedStats.totalVolume = enhancedContext.totalVolume;
    }
    if (enhancedContext?.completedSets) {
      calculatedStats.totalSets = enhancedContext.completedSets;
    }
    if (enhancedContext?.personalRecords) {
      calculatedStats.personalRecords = enhancedContext.personalRecords > 0 ? ['New PR!'] : [];
    }

    // Use regular context data if enhanced not available
    if (!enhancedContext && contextWorkoutSummary) {
      if (contextWorkoutSummary.duration) {
        calculatedStats.duration = contextWorkoutSummary.duration;
      }
      if (contextWorkoutSummary.totalVolume) {
        calculatedStats.totalVolume = contextWorkoutSummary.totalVolume;
      }
      if (contextWorkoutSummary.exercises?.length) {
        calculatedStats.exercises = contextWorkoutSummary.exercises.length;
      }
    }

    console.log('📊 Calculated Stats:', calculatedStats);

    setWorkoutStats(calculatedStats);

    // Check for training max updates from context
    const mockTrainingMaxUpdates: TrainingMaxUpdate[] = [
      {
        exerciseId: '1',
        exerciseName: 'Bench Press',
        previousMax: 175,
        newMax: 185,
        improvement: 10,
        performance: {
          weight: 185,
          reps: 1,
          estimated1RM: 185
        }
      }
    ];

    // Use training max updates from enhanced context first, then regular context, then mock
    const trainingMaxes = enhancedWorkoutSummary?.trainingMaxUpdates ||
                         contextWorkoutSummary?.trainingMaxUpdates ||
                         mockTrainingMaxUpdates;

    if (trainingMaxes.length > 0) {
      setTrainingMaxUpdates(trainingMaxes);
      setShowTrainingMaxNotification(true);

      // Log training max achievements
      trainingMaxes.forEach((update: any) => {
        console.log(`🎉 Training Max Achievement! ${update.exerciseName}: ${update.newMax} lbs (+${update.improvement} lbs)`);
      });
    }

    // Get workout name from context or use default
    let workoutName = 'Awesome Workout';
    if (enhancedContext?.activeWorkout?.name) {
      workoutName = enhancedContext.activeWorkout.name;
    } else if (contextWorkoutSummary?.title) {
      workoutName = contextWorkoutSummary.title;
    }

    // Enhanced workout summary with proper exercise data
    setWorkoutSummary({
      id: workoutId as string || Date.now().toString(),
      name: workoutName,
      duration: calculatedStats.duration,
      exercises: [
        {
          id: '1',
          name: 'Bench Press',
          sets: 4,
          reps: 32,
          weight: 185,
          volume: 5920,
          isPersonalRecord: true
        },
        {
          id: '2',
          name: 'Incline Dumbbell Press',
          sets: 3,
          reps: 30,
          weight: 70,
          volume: 2100
        },
        {
          id: '3',
          name: 'Tricep Dips',
          sets: 3,
          reps: 36,
          weight: 25,
          volume: 900
        },
        {
          id: '4',
          name: 'Close-Grip Bench Press',
          sets: 3,
          reps: 24,
          weight: 135,
          volume: 3240
        },
        {
          id: '5',
          name: 'Tricep Pushdowns',
          sets: 3,
          reps: 30,
          weight: 80,
          volume: 2400
        }
      ],
      totalSets: calculatedStats.totalSets,
      totalReps: 152,
      totalVolume: calculatedStats.totalVolume,
      personalRecords: calculatedStats.personalRecords,
      calories: calculatedStats.calories,
      heartRate: {
        avg: calculatedStats.heartRate,
        max: 168
      }
    });

    // Start celebration phase after data loads
    setTimeout(() => {
      if (calculatedStats.personalRecords.length > 0) {
        setAnimationPhase('celebrating');
        triggerCelebrationAnimation();
      }
    }, 1000);

    // Handle auto-share for social workouts
    if (autoShare && clubId) {
      setTimeout(() => {
        setAnimationPhase('sharing');
        handleAutoShare();
      }, 2500);
    }
  };

  const triggerCelebrationAnimation = () => {
    // Celebration haptics
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Scale pulse animation for PRs
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  };

  const handleAutoShare = async () => {
    if (!clubId) return;

    try {
      setIsSharing(true);

      // Simulate sharing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSharing(false);
      setShowShareSuccess(true);
      setAnimationPhase('complete');

      // Success haptics
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Auto-hide success message
      setTimeout(() => {
        setShowShareSuccess(false);
      }, 3000);

    } catch (error) {
      setIsSharing(false);
      Alert.alert('Share Failed', 'Could not share workout automatically. You can share manually below.');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatWeight = (weight: number) => {
    return `${weight.toLocaleString()} lbs`;
  };

  const handleClubToggle = (clubId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSocialSettings(prev => ({
      ...prev,
      shareToClubs: prev.shareToClubs.includes(clubId)
        ? prev.shareToClubs.filter(id => id !== clubId)
        : [...prev.shareToClubs, clubId]
    }));
  };

  const handleSocialToggle = (key: keyof SocialSettings, value: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSocialSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const captureAndShare = async (platform: 'instagram' | 'story' | 'general') => {
    if (!shareCardRef.current || !workoutSummary) return;

    try {
      setIsSharing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Capture the enhanced workout card
      const uri = await captureRef(shareCardRef.current, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      // Create deep link URL for the workout
      const workoutId = workoutSummary.id || Date.now().toString();
      const deepLinkUrl = generateDeepLink(workoutId);

      // Enhanced share message with emojis and formatting
      const prText = workoutStats.personalRecords.length > 0 ? '\n🏆 NEW PERSONAL RECORD! 🏆' : '';
      const shareMessage = `${socialSettings.message}${socialSettings.message ? '\n\n' : ''}💪 Just crushed: ${workoutSummary.name}${prText}

⏱️ Duration: ${formatDuration(workoutStats.duration)}
🔥 Volume: ${formatWeight(workoutStats.totalVolume)}
📊 ${workoutStats.exercises} exercises × ${workoutStats.totalSets} sets
${workoutStats.calories > 0 ? `⚡ ${workoutStats.calories} calories burned` : ''}

🔗 Track your workouts: ${deepLinkUrl}

#EliteLocker #WorkoutComplete #FitnessJourney`;

      if (platform === 'general') {
        await Share.share({
          title: `${workoutSummary.name} - Elite Locker Workout`,
          message: shareMessage,
          url: uri,
        });
      } else {
        // Use social context for platform-specific sharing with enhanced data
        await shareToSocialMedia(platform, {
          ...workoutSummary,
          message: shareMessage,
          imageUri: uri,
          deepLinkUrl,
          workoutStats,
          hashtags: ['EliteLocker', 'WorkoutComplete', 'FitnessJourney', 'PersonalRecord'],
          metadata: {
            appName: 'Elite Locker',
            appUrl: 'https://elitelocker.app',
            workoutId,
            completedAt: new Date().toISOString(),
            personalRecords: workoutStats.personalRecords
          }
        });
      }

      // Show success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Optional: Track sharing analytics
      console.log(`Workout shared to ${platform}:`, {
        workoutId,
        platform,
        hasPersonalRecords: workoutStats.personalRecords.length > 0,
        shareUrl: deepLinkUrl
      });

    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      Alert.alert('Sharing Error', `Failed to share to ${platform}. Please try again.`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareToClubs = async () => {
    if (socialSettings.shareToClubs.length === 0) {
      Alert.alert('No Clubs Selected', 'Please select at least one club to share to.');
      return;
    }

    if (!workoutSummary) return;

    try {
      setIsSharing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Use social context to share to clubs
      await shareWorkout(workoutSummary, {
        shareToClubs: socialSettings.shareToClubs,
        message: socialSettings.message,
        visibility: socialSettings.visibility,
        includeStats: socialSettings.includeStats
      });

      Alert.alert(
        'Shared Successfully!',
        `Your workout has been shared to ${socialSettings.shareToClubs.length} club${socialSettings.shareToClubs.length > 1 ? 's' : ''}.`,
        [
          {
            text: 'View in Social',
            onPress: () => router.push('/social')
          },
          {
            text: 'Done',
            onPress: () => router.push('/(tabs)/training')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share to clubs');
    } finally {
      setIsSharing(false);
    }
  };

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/training');
  };

  const generateDeepLink = (workoutId: string): string => {
    // Generate deep link for paywalled workout detail view using username and workout name
    const username = 'devonallen'; // In production, get from user context/auth
    const workoutName = workoutSummary?.name || 'UpperHypertrophy';

    // Clean up workout name for URL (remove spaces, special chars, make URL friendly)
    const cleanWorkoutName = workoutName
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^-+|-+$/g, '');

    return `https://elitelocker.app/@${username}/${cleanWorkoutName}`;
  };

  if (!workoutSummary) {
    return (
      <View style={styles.container}>
        {/* Blur Background Overlay */}
        <BlurView intensity={20} tint="dark" style={styles.blurBackground} />

        {/* Dismiss Area */}
        <TouchableOpacity
          style={styles.dismissArea}
          onPress={handleFinish}
          activeOpacity={1}
        />

        {/* Modal Container */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeInAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideUpAnim }
              ]
            }
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerHandle} />
              <Text style={styles.headerTitle}>Workout Complete! 🎉</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleFinish}
              >
                <Ionicons name="close-circle" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.loadingContainer}>
              <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
                <Ionicons name="fitness" size={48} color="#0A84FF" />
                <Text style={styles.loadingText}>Processing your workout...</Text>
                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={handleFinish}
                  activeOpacity={0.8}
                >
                  <Text style={styles.finishButtonText}>Continue</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Blur Background Overlay */}
      <BlurView intensity={20} tint="dark" style={styles.blurBackground} />

      {/* Dismiss Area */}
      <TouchableOpacity
        style={styles.dismissArea}
        onPress={handleFinish}
        activeOpacity={1}
      />

      {/* Training Max Notification */}
      <TrainingMaxNotification
        updates={trainingMaxUpdates}
        visible={showTrainingMaxNotification}
        onDismiss={() => setShowTrainingMaxNotification(false)}
        onViewDetails={(exerciseId) => {
          setShowTrainingMaxNotification(false);
          router.push(`/exercises/detail/${exerciseId}` as any);
        }}
      />

      {/* Modal Container */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: fadeInAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideUpAnim }
            ]
          }
        ]}
      >
        <BlurView intensity={40} tint="dark" style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerHandle} />
            <Text style={styles.headerTitle}>Workout Complete! 🎉</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleFinish}
            >
              <Ionicons name="close-circle" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Success Overlay */}
          {showShareSuccess && (
            <Animated.View style={[styles.successOverlay, { opacity: fadeAnim }]}>
              <BlurView intensity={20} style={styles.successBlur}>
                <View style={styles.successContent}>
                  <Ionicons name="checkmark-circle" size={48} color="#30D158" />
                  <Text style={styles.successText}>Shared to clubs!</Text>
                </View>
              </BlurView>
            </Animated.View>
          )}

          <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
        {/* Enhanced Celebration */}
        <Animated.View
          style={[
            styles.celebrationSection,
            {
              opacity: celebrationAnim,
              transform: [{
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }]
            }
          ]}
        >
          <View style={styles.celebrationContent}>
            <Ionicons name="trophy" size={64} color="#FF9F0A" />
            <Text style={styles.celebrationTitle}>Outstanding Work!</Text>
            <Text style={styles.celebrationSubtitle}>You absolutely crushed that workout</Text>
            {workoutSummary.personalRecords.length > 0 && (
              <Animated.View
                style={[
                  styles.prBadge,
                  {
                    transform: [{
                      scale: celebrationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1.1]
                      })
                    }]
                  }
                ]}
              >
                <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                <Text style={styles.prText}>New Personal Record! 🔥</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Enhanced Workout Summary Card for Social Sharing */}
        <Animated.View
          style={[
            styles.shareCardContainer,
            {
              opacity: fadeInAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}
        >
          <View ref={shareCardRef} style={styles.enhancedShareCard}>
            {/* Background Gradient Effect */}
            <View style={styles.cardGradientBackground}>
              <View style={styles.gradientOverlay} />

              {/* Header Section */}
              <View style={styles.enhancedCardHeader}>
                <View style={styles.logoSection}>
                  <View style={styles.eliteLogo}>
                    <Text style={styles.logoText}>ELITE</Text>
                    <Text style={styles.logoSubtext}>LOCKER</Text>
                  </View>
                </View>

                <View style={styles.userSection}>
                  <View style={styles.enhancedUserAvatar}>
                    <View style={styles.avatarInner}>
                      <Ionicons name="person" size={24} color="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.enhancedUserName}>Nick McKenzie</Text>
                    <Text style={styles.enhancedUserHandle}>@nickmckenzie</Text>
                  </View>
                </View>
              </View>

              {/* Workout Title with Emphasis */}
              <View style={styles.titleSection}>
                <Text style={styles.enhancedWorkoutTitle}>{workoutStats.personalRecords.length > 0 ? '🏆 ' : '💪 '}{workoutSummary?.name || 'Epic Workout'}</Text>
                {workoutStats.personalRecords.length > 0 && (
                  <View style={styles.prBanner}>
                    <Text style={styles.prBannerText}>NEW PERSONAL RECORD!</Text>
                  </View>
                )}
              </View>

              {/* Enhanced Stats Display */}
              <View style={styles.enhancedStatsSection}>
                <View style={styles.mainStatsRow}>
                  <View style={styles.primaryStat}>
                    <Ionicons name="time" size={28} color="#0A84FF" />
                    <Text style={styles.primaryStatValue}>{formatDuration(workoutStats.duration)}</Text>
                    <Text style={styles.primaryStatLabel}>Duration</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.primaryStat}>
                    <Ionicons name="barbell" size={28} color="#FF2D55" />
                    <Text style={styles.primaryStatValue}>{formatWeight(workoutStats.totalVolume)}</Text>
                    <Text style={styles.primaryStatLabel}>Total Volume</Text>
                  </View>
                </View>

                <View style={styles.secondaryStatsRow}>
                  <View style={styles.secondaryStat}>
                    <Ionicons name="fitness" size={20} color="#30D158" />
                    <Text style={styles.secondaryStatValue}>{workoutStats.exercises}</Text>
                    <Text style={styles.secondaryStatLabel}>Exercises</Text>
                  </View>

                  <View style={styles.secondaryStat}>
                    <Ionicons name="repeat" size={20} color="#5856D6" />
                    <Text style={styles.secondaryStatValue}>{workoutStats.totalSets}</Text>
                    <Text style={styles.secondaryStatLabel}>Sets</Text>
                  </View>

                  <View style={styles.secondaryStat}>
                    <Ionicons name="flame" size={20} color="#FF9F0A" />
                    <Text style={styles.secondaryStatValue}>{workoutStats.calories}</Text>
                    <Text style={styles.secondaryStatLabel}>Calories</Text>
                  </View>

                  <View style={styles.secondaryStat}>
                    <Ionicons name="heart" size={20} color="#FF3B30" />
                    <Text style={styles.secondaryStatValue}>{workoutStats.heartRate}</Text>
                    <Text style={styles.secondaryStatLabel}>BPM</Text>
                  </View>
                </View>
              </View>

              {/* Featured Exercises with PRs */}
              {workoutSummary && (
                <View style={styles.exerciseHighlights}>
                  <Text style={styles.exerciseHighlightsTitle}>Workout Highlights</Text>
                  <View style={styles.exercisesList}>
                    {workoutSummary.exercises.slice(0, 3).map((exercise, index) => (
                      <View key={exercise.id} style={styles.exerciseHighlight}>
                        <View style={styles.exerciseIndex}>
                          <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                        </View>
                        <View style={styles.exerciseDetails}>
                          <Text style={styles.exerciseHighlightName}>
                            {exercise.name}
                            {exercise.isPersonalRecord && <Text style={styles.prIndicatorSmall}> 🏆</Text>}
                          </Text>
                          <Text style={styles.exerciseHighlightStats}>
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight > 0 && ` @ ${exercise.weight}lbs`}
                          </Text>
                        </View>
                      </View>
                    ))}
                    {workoutSummary.exercises.length > 3 && (
                      <View style={styles.moreExercises}>
                        <Text style={styles.moreExercisesText}>
                          +{workoutSummary.exercises.length - 3} more exercises
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Call-to-Action Footer */}
              <View style={styles.ctaFooter}>
                <View style={styles.ctaContent}>
                  <Text style={styles.ctaTitle}>Track Your Workouts</Text>
                  <Text style={styles.ctaSubtitle}>Join Elite Locker & build your fitness journey</Text>
                </View>
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code-outline" size={32} color="#FFFFFF" />
                </View>
              </View>

              {/* Deep Link URL (will be replaced with actual QR in production) */}
              <View style={styles.linkSection}>
                <Text style={styles.linkText}>elitelocker.app/@devonallen/{workoutSummary?.name?.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') || 'UpperHypertrophy'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Social Sharing Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Your Achievement</Text>

          {/* Enhanced Share Message */}
          <View style={styles.messageContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Share your thoughts about this workout..."
              placeholderTextColor="#8E8E93"
              value={socialSettings.message}
              onChangeText={(text) => handleSocialToggle('message', text)}
              multiline
              maxLength={280}
            />
            <Text style={styles.characterCount}>
              {socialSettings.message.length}/280
            </Text>
          </View>

          {/* Enhanced Club Sharing */}
          <View style={styles.clubSection}>
            <Text style={styles.subsectionTitle}>Share to Clubs</Text>
            <View style={styles.clubsList}>
              {clubs.filter((club: Club) => club.isJoined).map((club: Club) => (
                <TouchableOpacity
                  key={club.id}
                  style={[
                    styles.clubItem,
                    socialSettings.shareToClubs.includes(club.id) && styles.clubItemSelected
                  ]}
                  onPress={() => handleClubToggle(club.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.clubIcon, { backgroundColor: club.color }]}>
                    <Ionicons name={club.icon as any} size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubMembers}>
                      {club.memberCount.toLocaleString()} members
                      {club.isOwner && <Text style={styles.ownerBadge}> • Owner</Text>}
                    </Text>
                  </View>
                  <View style={[
                    styles.clubCheckbox,
                    socialSettings.shareToClubs.includes(club.id) && styles.clubCheckboxSelected
                  ]}>
                    {socialSettings.shareToClubs.includes(club.id) && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {clubs.filter((club: Club) => club.isJoined).length === 0 && (
                <View style={styles.noClubsContainer}>
                  <Ionicons name="people-outline" size={32} color="#8E8E93" />
                  <Text style={styles.noClubsText}>No clubs joined yet</Text>
                  <TouchableOpacity
                    style={styles.browseClubsButton}
                    onPress={() => router.push('/clubs')}
                  >
                    <Text style={styles.browseClubsText}>Browse Clubs</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Enhanced Social Media Options */}
          <View style={styles.socialSection}>
            <Text style={styles.subsectionTitle}>Social Media</Text>

            <View style={styles.socialGrid}>
              <TouchableOpacity
                style={styles.socialOption}
                onPress={() => captureAndShare('instagram')}
                activeOpacity={0.8}
              >
                <View style={[styles.socialIcon, { backgroundColor: '#E4405F' }]}>
                  <Ionicons name="logo-instagram" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialOption}
                onPress={() => captureAndShare('story')}
                activeOpacity={0.8}
              >
                <View style={[styles.socialIcon, { backgroundColor: '#FFFC00' }]}>
                  <Ionicons name="camera" size={24} color="#000000" />
                </View>
                <Text style={styles.socialText}>Story</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialOption}
                onPress={() => captureAndShare('general')}
                activeOpacity={0.8}
              >
                <View style={[styles.socialIcon, { backgroundColor: '#8E8E93' }]}>
                  <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.socialText}>More</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Enhanced Settings */}
          <View style={styles.settingsSection}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Include detailed stats</Text>
                <Text style={styles.settingDescription}>Show volume, reps, and PRs</Text>
              </View>
              <Switch
                value={socialSettings.includeStats}
                onValueChange={(value) => handleSocialToggle('includeStats', value)}
                trackColor={{ false: '#767577', true: '#0A84FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Enhanced Action Buttons */}
        <View style={styles.actionSection}>
          {socialSettings.shareToClubs.length > 0 && (
            <TouchableOpacity
              style={[
                styles.shareButton,
                isSharing && styles.shareButtonDisabled
              ]}
              onPress={handleShareToClubs}
              disabled={isSharing}
              activeOpacity={0.8}
            >
              {isSharing ? (
                <Text style={styles.shareButtonText}>Sharing...</Text>
              ) : (
                <>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.shareButtonText}>
                    Share to {socialSettings.shareToClubs.length} Club{socialSettings.shareToClubs.length !== 1 ? 's' : ''}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <Text style={styles.finishButtonText}>Finish Workout</Text>
          </TouchableOpacity>
        </View>
          </ScrollView>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -18,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollContent: {
    flex: 1,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  doneText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },

  // Celebration
  celebrationSection: {
    padding: 32,
    alignItems: 'center',
  },
  celebrationContent: {
    alignItems: 'center',
  },
  celebrationTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  celebrationSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9F0A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  prText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Share Card
  shareCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  enhancedShareCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardGradientBackground: {
    position: 'relative',
    backgroundColor: '#1C1C1E',
    padding: 24,
    minHeight: 600,
    borderRadius: 16,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
  },
  enhancedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  logoSection: {
    flex: 1,
  },
  eliteLogo: {
    backgroundColor: '#0A84FF',
    padding: 8,
    borderRadius: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  logoSubtext: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  userSection: {
    flex: 1,
  },
  enhancedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flexDirection: 'column',
  },
  enhancedUserName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  enhancedUserHandle: {
    color: '#8E8E93',
    fontSize: 12,
  },
  titleSection: {
    marginBottom: 20,
  },
  enhancedWorkoutTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  prBanner: {
    backgroundColor: '#FF9F0A',
    padding: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  prBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  enhancedStatsSection: {
    marginBottom: 20,
  },
  mainStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  primaryStatLabel: {
    color: '#8E8E93',
    fontSize: 10,
    textAlign: 'center',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  secondaryStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  secondaryStatLabel: {
    color: '#8E8E93',
    fontSize: 10,
    textAlign: 'center',
  },
  exerciseHighlights: {
    marginBottom: 20,
  },
  exerciseHighlightsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  exercisesList: {
    flexDirection: 'row',
    gap: 12,
  },
  exerciseHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIndex: {
    width: 24,
    alignItems: 'center',
  },
  exerciseIndexText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseHighlightName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  prIndicatorSmall: {
    fontSize: 12,
  },
  exerciseHighlightStats: {
    color: '#8E8E93',
    fontSize: 12,
  },
  moreExercises: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 4,
  },
  moreExercisesText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ctaFooter: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  ctaContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ctaSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
  },
  qrPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  linkSection: {
    marginTop: 20,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  subsectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  // Message
  messageContainer: {
    marginBottom: 20,
  },
  messageInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  characterCount: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'right',
  },

  // Clubs
  clubSection: {
    marginBottom: 20,
  },
  clubsList: {
    gap: 8,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clubItemSelected: {
    borderColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  clubIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  clubMembers: {
    color: '#8E8E93',
    fontSize: 12,
  },
  ownerBadge: {
    color: '#FF9F0A',
    fontSize: 12,
    fontWeight: '600',
  },
  clubCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubCheckboxSelected: {
    borderColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },

  // Social Media
  socialSection: {
    marginBottom: 20,
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  socialOption: {
    alignItems: 'center',
    flex: 1,
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },

  // Settings
  settingsSection: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'column',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  settingDescription: {
    color: '#8E8E93',
    fontSize: 12,
  },

  // Action Buttons
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Success Overlay
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  successContent: {
    alignItems: 'center',
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },

  // No Clubs
  noClubsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noClubsText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  browseClubsButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
  },
  browseClubsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
