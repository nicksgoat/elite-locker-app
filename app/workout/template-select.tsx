import { useWorkout } from '@/contexts/WorkoutContext';
import { fetchData } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: TemplateExercise[];
  category: string;
}

interface TemplateExercise {
  id: string;
  exercise: {
    id: string;
    name: string;
  };
  percentage: number;
  sets: number;
  reps: string;
  rest_time: number;
}

export default function TemplateSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startTemplateWorkout } = useWorkout();

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      // Fetch templates from database
      const templatesData = await fetchData('workout_templates', {
        select: `
          *,
          exercises:workout_template_exercises(
            *,
            exercise:exercises(*)
          )
        `,
        limit: 20
      });

      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to mock data
      setTemplates([
        {
          id: 'template_1',
          title: 'Push Day - Strength',
          description: 'Chest, shoulders, and triceps focused strength training',
          duration: 60,
          difficulty: 'Intermediate',
          category: 'Strength',
          exercises: [
            {
              id: '1',
              exercise: { id: '1', name: 'Bench Press' },
              percentage: 85,
              sets: 4,
              reps: '5',
              rest_time: 180
            },
            {
              id: '2',
              exercise: { id: '2', name: 'Overhead Press' },
              percentage: 80,
              sets: 3,
              reps: '6-8',
              rest_time: 150
            },
            {
              id: '3',
              exercise: { id: '3', name: 'Dips' },
              percentage: 75,
              sets: 3,
              reps: '8-10',
              rest_time: 120
            }
          ]
        },
        {
          id: 'template_2',
          title: 'Pull Day - Hypertrophy',
          description: 'Back and biceps focused muscle building',
          duration: 50,
          difficulty: 'Intermediate',
          category: 'Hypertrophy',
          exercises: [
            {
              id: '4',
              exercise: { id: '4', name: 'Pull-ups' },
              percentage: 70,
              sets: 4,
              reps: '8-12',
              rest_time: 90
            },
            {
              id: '5',
              exercise: { id: '5', name: 'Barbell Rows' },
              percentage: 75,
              sets: 4,
              reps: '8-10',
              rest_time: 120
            }
          ]
        },
        {
          id: 'template_3',
          title: 'Leg Day - Power',
          description: 'Lower body strength and power development',
          duration: 75,
          difficulty: 'Advanced',
          category: 'Strength',
          exercises: [
            {
              id: '6',
              exercise: { id: '6', name: 'Squat' },
              percentage: 90,
              sets: 5,
              reps: '3',
              rest_time: 240
            },
            {
              id: '7',
              exercise: { id: '7', name: 'Deadlift' },
              percentage: 85,
              sets: 3,
              reps: '5',
              rest_time: 300
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(templateId);
  };

  const handleStartWorkout = async () => {
    if (!selectedTemplate) {
      Alert.alert('Select Template', 'Please select a workout template to continue.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await startTemplateWorkout(selectedTemplate);
      router.push('/workout/active');
    } catch (error: any) {
      console.error('Error starting template workout:', error);

      // Check if error is about missing training maxes
      if (error.message && error.message.startsWith('MISSING_TRAINING_MAXES:')) {
        const missingExercises = error.message.split(':')[1].split(',');

        console.log('Missing exercises detected:', missingExercises);
        console.log('Navigating to training max setup...');

        // For now, show an alert to confirm the flow is working
        Alert.alert(
          'Training Maxes Required',
          `You need to set training maxes for: ${missingExercises.join(', ')}. This will navigate to the setup screen.`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Set Training Maxes',
              onPress: () => {
                // Navigate to training max setup with the missing exercises
                router.push({
                  pathname: '/workout/training-max-setup',
                  params: {
                    exercises: missingExercises.join(','),
                    templateId: selectedTemplate,
                    returnTo: 'template'
                  }
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to start workout. Please try again.');
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#32D74B';
      case 'Intermediate': return '#FF9500';
      case 'Advanced': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderTemplate = (template: WorkoutTemplate) => (
    <TouchableOpacity
      key={template.id}
      style={[
        styles.templateCard,
        selectedTemplate === template.id && styles.selectedTemplate
      ]}
      onPress={() => handleSelectTemplate(template.id)}
      activeOpacity={0.8}
    >
      <BlurView intensity={30} tint="dark" style={styles.templateBlur}>
        <View style={styles.templateContent}>
          <View style={styles.templateHeader}>
            <View style={styles.templateInfo}>
              <Text style={styles.templateTitle}>{template.title}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
            </View>

            <View style={styles.templateMeta}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(template.difficulty) }]}>
                <Text style={styles.difficultyText}>{template.difficulty}</Text>
              </View>
              <Text style={styles.durationText}>{template.duration} min</Text>
            </View>
          </View>

          <View style={styles.exercisesList}>
            <Text style={styles.exercisesTitle}>Exercises ({template.exercises.length})</Text>
            {template.exercises.slice(0, 3).map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} × {exercise.reps} @ {exercise.percentage}%
                </Text>
              </View>
            ))}
            {template.exercises.length > 3 && (
              <Text style={styles.moreExercises}>
                +{template.exercises.length - 3} more exercises
              </Text>
            )}
          </View>

          {selectedTemplate === template.id && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color="#0A84FF" />
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Select Template',
          headerShown: false,
        }}
      />

      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Select Template</Text>
            <Text style={styles.subtitle}>
              Choose a percentage-based workout template
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading templates...</Text>
            </View>
          ) : (
            <View style={styles.templatesContainer}>
              {templates.map(renderTemplate)}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.startButton,
              !selectedTemplate && styles.startButtonDisabled
            ]}
            onPress={handleStartWorkout}
            disabled={!selectedTemplate}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.startButtonText,
              !selectedTemplate && styles.startButtonTextDisabled
            ]}>
              Start Template Workout
            </Text>
            <Ionicons
              name="calculator-outline"
              size={20}
              color={selectedTemplate ? "#FFFFFF" : "#666666"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  templatesContainer: {
    paddingBottom: 20,
  },
  templateCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedTemplate: {
    borderWidth: 2,
    borderColor: '#0A84FF',
  },
  templateBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateContent: {
    padding: 20,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  templateInfo: {
    flex: 1,
    marginRight: 12,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  templateMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  exercisesList: {
    marginBottom: 12,
  },
  exercisesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 14,
    color: '#AEAEB2',
    flex: 1,
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '500',
  },
  moreExercises: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#1C1C1E',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  startButtonTextDisabled: {
    color: '#666666',
  },
});
