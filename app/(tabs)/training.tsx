import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Club, useSocial } from '../../contexts/SocialContext';

const { width: screenWidth } = Dimensions.get('window');

// Enhanced types for consolidated workout tracking
interface WorkoutSession {
  id: string;
  name: string;
  startTime: Date;
  duration: number;
  exercises: WorkoutExercise[];
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  isActive: boolean;
  clubId?: string;
  shareSettings?: {
    toClub: boolean;
    toSocial: boolean;
    visibility: 'public' | 'club' | 'private';
    autoShare: boolean;
  };
  personalRecords: string[];
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

interface QuickWorkout {
  id: string;
  name: string;
  exercises: number;
  duration: number;
  icon: string;
  color: string;
  lastUsed?: Date;
  usageCount: number;
  avgVolume: number;
}

interface RecentActivity {
  id: string;
  type: 'workout' | 'program' | 'share' | 'achievement';
  title: string;
  subtitle: string;
  timestamp: Date;
  icon: string;
  color: string;
  workoutData?: any;
  socialData?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export default function TrainingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clubs, shareToClub, shareWorkout, posts } = useSocial();

  // Enhanced state management
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [quickWorkouts, setQuickWorkouts] = useState<QuickWorkout[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [workoutTimer, setWorkoutTimer] = useState(0);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Initialize data
  useEffect(() => {
    initializeData();
    startFadeAnimation();
  }, []);

  // Timer for active workout
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeWorkout) {
      interval = setInterval(() => {
        // Ensure startTime is a Date object
        const startTime = new Date(activeWorkout.startTime);
        setWorkoutTimer(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWorkout]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const initializeData = () => {
    // Enhanced recent activities with social data
    setRecentActivities([
      {
        id: '1',
        type: 'workout',
        title: 'Chest & Triceps Power',
        subtitle: 'Completed 45 min ago • Shared to Elite Club',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        icon: 'fitness-outline',
        color: '#0A84FF',
        workoutData: {
          duration: 68,
          volume: 11260,
          exercises: 4,
          personalRecords: ['Bench Press']
        },
        socialData: {
          likes: 12,
          comments: 3,
          shares: 1
        }
      },
      {
        id: '2',
        type: 'share',
        title: 'Olympic Prep Workout',
        subtitle: 'Shared to Track Elite • 2 hours ago',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: 'share-outline',
        color: '#30D158',
        socialData: {
          likes: 8,
          comments: 2,
          shares: 0
        }
      },
      {
        id: '3',
        type: 'achievement',
        title: 'Week 3 Complete',
        subtitle: 'Track Elite Program • New PR achieved!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: 'trophy-outline',
        color: '#FF9F0A'
      }
    ]);

    // Enhanced quick workouts with usage data
    setQuickWorkouts([
      {
        id: '1',
        name: 'Quick Upper Power',
        exercises: 6,
        duration: 30,
        icon: 'barbell-outline',
        color: '#0A84FF',
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        usageCount: 12,
        avgVolume: 8500
      },
      {
        id: '2',
        name: 'Lower Explosive',
        exercises: 5,
        duration: 45,
        icon: 'fitness-outline',
        color: '#FF2D55',
        lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
        usageCount: 8,
        avgVolume: 9200
      },
      {
        id: '3',
        name: 'Core + Conditioning',
        exercises: 8,
        duration: 20,
        icon: 'body-outline',
        color: '#5856D6',
        usageCount: 15,
        avgVolume: 3200
      }
    ]);
  };

  // Enhanced workout actions with social integration
  const handleStartWorkout = (workoutId?: string, clubId?: string, autoShare: boolean = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (activeWorkout) {
      Alert.alert(
        'Active Workout',
        'You have an active workout. Would you like to end it and start a new one?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End & Start New',
            onPress: () => {
              handleCompleteWorkout();
              startNewWorkout(workoutId, clubId, autoShare);
            }
          }
        ]
      );
    } else {
      startNewWorkout(workoutId, clubId, autoShare);
    }
  };

  const startNewWorkout = (workoutId?: string, clubId?: string, autoShare: boolean = false) => {
    const selectedWorkout = workoutId ? quickWorkouts.find(w => w.id === workoutId) : null;

    const newWorkout: WorkoutSession = {
      id: Date.now().toString(),
      name: selectedWorkout?.name || 'Custom Workout',
      startTime: new Date(),
      duration: 0,
      exercises: [],
      totalSets: 0,
      totalReps: 0,
      totalVolume: 0,
      isActive: true,
      clubId,
      shareSettings: {
        toClub: !!clubId,
        toSocial: autoShare,
        visibility: clubId ? 'club' : 'public',
        autoShare
      },
      personalRecords: []
    };

    setActiveWorkout(newWorkout);

    // Navigate to workout tracking
    if (workoutId) {
      router.push(`/workout/run?workoutId=${workoutId}&clubId=${clubId || ''}&autoShare=${autoShare}`);
    } else {
      router.push(`/workout/log?clubId=${clubId || ''}&autoShare=${autoShare}`);
    }
  };

  const handleCompleteWorkout = async () => {
    if (!activeWorkout) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Navigate to enhanced completion screen
    router.push(`/workout/complete?workoutId=${activeWorkout.id}&clubId=${activeWorkout.clubId || ''}&autoShare=${activeWorkout.shareSettings?.autoShare || false}`);
    setActiveWorkout(null);
  };

  const handleCreateSocialWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (clubs.filter((c: Club) => c.isJoined).length === 0) {
      Alert.alert(
        'Join a Club First',
        'To create a social workout, you need to join at least one club.',
        [
          { text: 'Browse Clubs', onPress: () => router.push('/clubs') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    Alert.alert(
      'Social Workout',
      'This workout will be automatically shared to your selected clubs and social media when completed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start & Share',
          onPress: () => {
            const defaultClub = clubs.find((c: Club) => c.isJoined)?.id;
            handleStartWorkout(undefined, defaultClub, true);
          }
        }
      ]
    );
  };

  const handleQuickShare = async (activityId: string) => {
    const activity = recentActivities.find(a => a.id === activityId);
    if (!activity || !activity.workoutData) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const joinedClubs = clubs.filter((c: Club) => c.isJoined);
    if (joinedClubs.length === 0) {
      Alert.alert('No Clubs', 'Join a club to share your workouts!');
      return;
    }

    if (joinedClubs.length === 1) {
      // Auto-share to the only joined club
      try {
        await shareToClub(activity.workoutData, joinedClubs[0].id, `Check out my ${activity.title}! 💪`);
        Alert.alert('Shared!', `Posted to ${joinedClubs[0].name}`);
      } catch (error) {
        Alert.alert('Error', 'Failed to share workout');
      }
    } else {
      // Show club selection
      router.push(`/workout/share?activityId=${activityId}`);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced render components
  const renderActiveWorkout = () => {
    if (!activeWorkout) return null;

    return (
      <Animated.View
        style={[styles.activeWorkoutContainer, { opacity: fadeAnim }]}
      >
        <BlurView intensity={20} style={styles.activeWorkoutBlur}>
          <View style={styles.activeWorkoutContent}>
            <View style={styles.activeWorkoutHeader}>
              <View style={styles.activeWorkoutInfo}>
                <Text style={styles.activeWorkoutTitle}>{activeWorkout.name}</Text>
                <Text style={styles.activeWorkoutSubtitle}>
                  {formatTimer(workoutTimer)} • {activeWorkout.exercises.length} exercises
                </Text>
              </View>
              <TouchableOpacity
                style={styles.endWorkoutButton}
                onPress={handleCompleteWorkout}
              >
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.endWorkoutText}>Complete</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.activeWorkoutStats}>
              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={16} color="#0A84FF" />
                <Text style={styles.statText}>{activeWorkout.totalSets} sets</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="fitness-outline" size={16} color="#FF2D55" />
                <Text style={styles.statText}>{activeWorkout.totalVolume.toLocaleString()} lbs</Text>
              </View>
              {activeWorkout.clubId && (
                <View style={styles.statItem}>
                  <Ionicons name="people-outline" size={16} color="#30D158" />
                  <Text style={styles.statText}>Auto-sharing</Text>
                </View>
              )}
            </View>
          </View>
        </BlurView>
      </Animated.View>
    );
  };

  const renderQuickWorkout = ({ item }: { item: QuickWorkout }) => (
    <TouchableOpacity
      style={styles.quickWorkoutCard}
      onPress={() => handleStartWorkout(item.id)}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Alert.alert(
          'Workout Options',
          `Choose how to start "${item.name}"`,
          [
            { text: 'Start Normal', onPress: () => handleStartWorkout(item.id) },
            { text: 'Start & Share to Club', onPress: () => {
              const defaultClub = clubs.find((c: Club) => c.isJoined)?.id;
              handleStartWorkout(item.id, defaultClub, true);
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }}
      activeOpacity={0.8}
    >
      <View style={[styles.quickWorkoutIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.quickWorkoutName}>{item.name}</Text>
      <Text style={styles.quickWorkoutInfo}>
        {item.exercises} exercises • {item.duration} min
      </Text>
      <View style={styles.quickWorkoutStats}>
        <Text style={styles.quickWorkoutUsage}>
          Used {item.usageCount}x • Avg {(item.avgVolume / 1000).toFixed(1)}k lbs
        </Text>
      </View>
      {item.lastUsed && (
        <Text style={styles.quickWorkoutLastUsed}>
          {Math.floor((Date.now() - item.lastUsed.getTime()) / (24 * 60 * 60 * 1000))}d ago
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderRecentActivity = ({ item }: { item: RecentActivity }) => (
    <TouchableOpacity
      style={styles.activityItem}
      onPress={() => handleQuickShare(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.activityIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
        {item.socialData && (
          <View style={styles.socialStats}>
            <Text style={styles.socialStat}>
              ❤️ {item.socialData.likes} 💬 {item.socialData.comments} 🔄 {item.socialData.shares}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="share-outline" size={16} color="#0A84FF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={styles.headerTitle}>Training</Text>
          <Text style={styles.headerSubtitle}>Track, share, and inspire</Text>
        </View>
        <TouchableOpacity
          style={styles.socialIndicator}
          onPress={() => router.push('/social')}
        >
          <Ionicons name="people-circle-outline" size={28} color="#0A84FF" />
          {posts.length > 0 && (
            <View style={styles.socialBadge}>
              <Text style={styles.socialBadgeText}>{posts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Workout */}
        {renderActiveWorkout()}

        {/* Primary Quick Start - Simple and Direct */}
        {!activeWorkout && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.primaryStartButton}
              onPress={() => router.push('/workout/quick-start')}
              activeOpacity={0.8}
            >
              <BlurView intensity={40} style={styles.primaryStartBlur}>
                <View style={styles.primaryStartContent}>
                  <View style={styles.primaryStartIcon}>
                    <Ionicons name="play-circle" size={48} color="#FFFFFF" />
                  </View>
                  <View style={styles.primaryStartText}>
                    <Text style={styles.primaryStartTitle}>Start Workout</Text>
                    <Text style={styles.primaryStartSubtitle}>Begin tracking your exercises now</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        )}

        {/* Enhanced Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Options</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, styles.templateAction]}
              onPress={() => router.push('/workout')}
              activeOpacity={0.8}
            >
              <Ionicons name="list" size={32} color="#FFFFFF" />
              <Text style={styles.quickActionTitle}>Templates</Text>
              <Text style={styles.quickActionSubtitle}>Use saved workouts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, styles.socialAction]}
              onPress={handleCreateSocialWorkout}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={32} color="#FFFFFF" />
              <Text style={styles.quickActionTitle}>Social Workout</Text>
              <Text style={styles.quickActionSubtitle}>Share as you go</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Quick Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Workouts</Text>
            <TouchableOpacity onPress={() => router.push('/workout/templates')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {quickWorkouts.map((workout) =>
              <View key={workout.id}>
                {renderQuickWorkout({ item: workout })}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Enhanced Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          <View style={styles.activityList}>
            {recentActivities.map((activity) => (
              <View key={activity.id}>
                {renderRecentActivity({ item: activity })}
              </View>
            ))}
          </View>
        </View>

        {/* Enhanced Social Integration CTA */}
        <View style={styles.section}>
          <View style={styles.socialCTA}>
            <BlurView intensity={20} style={styles.socialCTABlur}>
              <View style={styles.socialCTAContent}>
                <Ionicons name="trending-up" size={48} color="#30D158" />
                <Text style={styles.socialCTATitle}>Grow Your Community</Text>
                <Text style={styles.socialCTASubtitle}>
                  Share workouts, join clubs, and inspire others on their fitness journey
                </Text>
                <View style={styles.socialCTAButtons}>
                  <TouchableOpacity
                    style={styles.socialCTAButton}
                    onPress={() => router.push('/social')}
                  >
                    <Text style={styles.socialCTAButtonText}>Explore Social</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialCTAButtonSecondary}
                    onPress={() => router.push('/clubs')}
                  >
                    <Text style={styles.socialCTAButtonSecondaryText}>Browse Clubs</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
  },
  socialIndicator: {
    position: 'relative',
  },
  socialBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  seeAllText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Active Workout
  activeWorkoutContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeWorkoutBlur: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  activeWorkoutContent: {
    padding: 16,
  },
  activeWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeWorkoutInfo: {
    flex: 1,
  },
  activeWorkoutTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  activeWorkoutSubtitle: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },
  endWorkoutButton: {
    backgroundColor: '#30D158',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  endWorkoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeWorkoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (screenWidth - 56) / 2,
    aspectRatio: 1.2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  templateAction: {
    backgroundColor: '#0A84FF',
  },
  socialAction: {
    backgroundColor: '#30D158',
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
    textAlign: 'center',
  },

  // Quick Workouts
  horizontalList: {
    paddingLeft: 20,
  },
  quickWorkoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickWorkoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickWorkoutName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  quickWorkoutInfo: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  quickWorkoutStats: {
    marginBottom: 4,
  },
  quickWorkoutUsage: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
  },
  quickWorkoutLastUsed: {
    color: '#0A84FF',
    fontSize: 11,
    fontWeight: '500',
  },

  // Recent Activity
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activitySubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  socialStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialStat: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '500',
  },

  // Social CTA
  socialCTA: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  socialCTABlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialCTAContent: {
    padding: 24,
    alignItems: 'center',
  },
  socialCTATitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  socialCTASubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  socialCTAButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialCTAButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  socialCTAButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  socialCTAButtonSecondary: {
    backgroundColor: '#30D158',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  socialCTAButtonSecondaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Primary Quick Start
  primaryStartButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryStartBlur: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  primaryStartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  primaryStartIcon: {
    marginRight: 16,
  },
  primaryStartText: {
    flex: 1,
  },
  primaryStartTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  primaryStartSubtitle: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },
});
