import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocial } from '../../contexts/SocialContext';
import { useWorkout } from '../../contexts/WorkoutContext';

const { width: screenWidth } = Dimensions.get('window');

interface QuickWorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: Array<{
    name: string;
    sets: number;
    targetReps: string;
    restTime: number;
  }>;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  color: string;
  icon: string;
}

export default function QuickStartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startWorkout } = useWorkout();
  const { clubs } = useSocial();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [shareToClub, setShareToClub] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Quick workout templates
  const templates: QuickWorkoutTemplate[] = [
    {
      id: '1',
      name: 'Upper Body Power',
      description: 'Chest, shoulders, and arms focused strength training',
      exercises: [
        { name: 'Bench Press', sets: 4, targetReps: '6-8', restTime: 90 },
        { name: 'Overhead Press', sets: 3, targetReps: '8-10', restTime: 90 },
        { name: 'Pull-ups', sets: 3, targetReps: '8-12', restTime: 90 },
        { name: 'Dips', sets: 3, targetReps: '10-12', restTime: 60 }
      ],
      duration: 45,
      difficulty: 'Intermediate',
      color: '#0A84FF',
      icon: 'barbell-outline'
    },
    {
      id: '2',
      name: 'Lower Body Blast',
      description: 'Legs and glutes strength and power development',
      exercises: [
        { name: 'Squats', sets: 4, targetReps: '8-10', restTime: 120 },
        { name: 'Romanian Deadlift', sets: 3, targetReps: '10-12', restTime: 90 },
        { name: 'Bulgarian Split Squats', sets: 3, targetReps: '8-10', restTime: 90 },
        { name: 'Glute Bridges', sets: 3, targetReps: '12-15', restTime: 60 }
      ],
      duration: 50,
      difficulty: 'Intermediate',
      color: '#FF2D55',
      icon: 'fitness-outline'
    },
    {
      id: '3',
      name: 'Quick Core',
      description: 'Fast and effective core strengthening routine',
      exercises: [
        { name: 'Plank', sets: 3, targetReps: '30-60s', restTime: 45 },
        { name: 'Russian Twists', sets: 3, targetReps: '20', restTime: 45 },
        { name: 'Dead Bug', sets: 3, targetReps: '10 each', restTime: 45 },
        { name: 'Mountain Climbers', sets: 3, targetReps: '20', restTime: 45 }
      ],
      duration: 20,
      difficulty: 'Beginner',
      color: '#30D158',
      icon: 'body-outline'
    },
    {
      id: '4',
      name: 'Full Body HIIT',
      description: 'High intensity circuit for total body conditioning',
      exercises: [
        { name: 'Burpees', sets: 4, targetReps: '10', restTime: 60 },
        { name: 'Jump Squats', sets: 4, targetReps: '15', restTime: 60 },
        { name: 'Push-up to T', sets: 4, targetReps: '8', restTime: 60 },
        { name: 'High Knees', sets: 4, targetReps: '30s', restTime: 60 }
      ],
      duration: 25,
      difficulty: 'Advanced',
      color: '#FF9F0A',
      icon: 'flash-outline'
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStartWorkout = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Convert template to workout format
    const workoutExercises = template.exercises.map((exercise, index) => ({
      id: `ex${index + 1}`,
      name: exercise.name,
      sets: exercise.sets,
      targetReps: exercise.targetReps,
      restTime: exercise.restTime,
      completed: false
    }));

    // Start the workout
    startWorkout(workoutExercises);

    // Navigate to active workout with proper route
    router.replace('/workout/active');
  };

  const handleCustomWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to workout logging screen
    router.push('/workout/log');
  };

  const renderTemplate = (template: QuickWorkoutTemplate) => (
    <TouchableOpacity
      key={template.id}
      style={[
        styles.templateCard,
        selectedTemplate === template.id && styles.selectedTemplate
      ]}
      onPress={() => setSelectedTemplate(template.id)}
      onLongPress={() => handleStartWorkout(template.id)}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} style={styles.templateBlur}>
        <View style={styles.templateContent}>
          <View style={styles.templateHeader}>
            <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
              <Ionicons name={template.icon as any} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDuration}>
                {template.duration} min • {template.difficulty}
              </Text>
            </View>
          </View>

          <Text style={styles.templateDescription}>{template.description}</Text>

          <View style={styles.exercisePreview}>
            {template.exercises.slice(0, 3).map((exercise, index) => (
              <Text key={`exercise-${template.id}-${index}-${exercise.name}`} style={styles.exerciseText}>
                • {exercise.name} ({exercise.sets} sets)
              </Text>
            ))}
            {template.exercises.length > 3 && (
              <Text style={styles.exerciseText}>
                + {template.exercises.length - 3} more exercises
              </Text>
            )}
          </View>

          <View style={styles.templateActions}>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: template.color }]}
              onPress={() => handleStartWorkout(template.id)}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Quick Start</Text>
          <Text style={styles.headerSubtitle}>Choose a workout and begin</Text>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Action */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.customWorkoutButton}
              onPress={handleCustomWorkout}
              activeOpacity={0.8}
            >
              <BlurView intensity={40} style={styles.customWorkoutBlur}>
                <View style={styles.customWorkoutContent}>
                  <View style={styles.customWorkoutIcon}>
                    <Ionicons name="create-outline" size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.customWorkoutText}>
                    <Text style={styles.customWorkoutTitle}>Create Custom Workout</Text>
                    <Text style={styles.customWorkoutSubtitle}>Build your own routine from scratch</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Templates</Text>
            <Text style={styles.sectionSubtitle}>
              Long press any template to start immediately
            </Text>

            <View style={styles.templatesGrid}>
              {templates.map(renderTemplate)}
            </View>
          </View>

          {/* Social Features */}
          {clubs.filter(c => c.isJoined).length > 0 && (
            <View style={styles.section}>
              <View style={styles.socialSection}>
                <BlurView intensity={20} style={styles.socialBlur}>
                  <View style={styles.socialContent}>
                    <Ionicons name="people-circle" size={48} color="#30D158" />
                    <Text style={styles.socialTitle}>Workout with Your Community</Text>
                    <Text style={styles.socialSubtitle}>
                      Your workouts will be automatically shared with your clubs when completed
                    </Text>
                    <View style={styles.clubList}>
                      {clubs.filter(c => c.isJoined).slice(0, 3).map((club, index) => (
                        <View key={club.id} style={styles.clubItem}>
                          <Text style={styles.clubName}>{club.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </BlurView>
              </View>
            </View>
          )}

          {/* Test Paywall Feature */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.testPaywallButton}
              onPress={() => {
                console.log('Test button pressed, navigating to:', '/user/devonallen/UpperHypertrophy');
                router.push('/user/devonallen/UpperHypertrophy');
              }}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.testPaywallBlur}>
                <View style={styles.testPaywallContent}>
                  <Ionicons name="lock-closed" size={24} color="#FF9F0A" />
                  <View style={styles.testPaywallText}>
                    <Text style={styles.testPaywallTitle}>Test Social Share Link</Text>
                    <Text style={styles.testPaywallSubtitle}>Experience /user/devonallen/UpperHypertrophy</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 16,
  },

  // Custom Workout Button
  customWorkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  customWorkoutBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  customWorkoutIcon: {
    marginRight: 16,
  },
  customWorkoutText: {
    flex: 1,
  },
  customWorkoutTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  customWorkoutSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },

  // Templates
  templatesGrid: {
    gap: 16,
  },
  templateCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedTemplate: {
    transform: [{ scale: 0.98 }],
  },
  templateBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateContent: {
    padding: 20,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  templateDuration: {
    color: '#8E8E93',
    fontSize: 14,
  },
  templateDescription: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  exercisePreview: {
    marginBottom: 16,
  },
  exerciseText: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Social Section
  socialSection: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  socialBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialContent: {
    padding: 24,
    alignItems: 'center',
  },
  socialTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  socialSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  clubList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  clubItem: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  clubName: {
    color: '#30D158',
    fontSize: 12,
    fontWeight: '500',
  },

  // Test Paywall Feature
  testPaywallButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  testPaywallBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testPaywallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  testPaywallText: {
    flex: 1,
  },
  testPaywallTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  testPaywallSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },
});