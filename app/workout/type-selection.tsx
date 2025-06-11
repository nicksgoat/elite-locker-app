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
    View,
    Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkout } from '../../contexts/WorkoutContext';
import { templateService, WorkoutTemplate } from '../../services/templateService';
import VoiceWorkoutCreator from '../../components/ui/VoiceWorkoutCreator';

const { width: screenWidth } = Dimensions.get('window');

// Workout type options
interface WorkoutTypeOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  action: () => void;
}

// AI Workout interface
interface AIWorkout {
  name: string;
  exercises: Array<{
    id?: string;
    name: string;
    sets: number;
    targetReps: string;
    restTime?: number;
    category?: string;
    equipment?: string;
  }>;
  date: string;
  duration: number;
  categories: string[];
}

export default function WorkoutTypeSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startWorkout } = useWorkout();
  
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [recentTemplates, setRecentTemplates] = useState<WorkoutTemplate[]>([]);
  const [showAICreator, setShowAICreator] = useState(false);
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTemplates();
    startFadeAnimation();
  }, []);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const [allTemplates, recent] = await Promise.all([
        templateService.getTemplates(),
        templateService.getRecentTemplates(3)
      ]);
      setTemplates(allTemplates);
      setRecentTemplates(recent);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartFromTemplate = (template: WorkoutTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Update template usage
    templateService.updateTemplateUsage(template.id);
    
    // Convert template to workout exercises
    const workoutExercises = templateService.convertTemplateToWorkout(template);
    
    // Start the workout
    startWorkout(workoutExercises);
    
    // Navigate to active workout
    router.replace('/workout/active');
  };

  const handleRepeatWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement repeat workout functionality
    Alert.alert('Coming Soon', 'Repeat workout functionality will be available soon.');
  };

  const handleQuickStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/workout/log');
  };

  const handleShowAICreator = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAICreator(true);
  };

  const handleAIWorkoutCreated = (workout: AIWorkout) => {
    // Convert the workout format to the format expected by startWorkout
    const workoutExercises = workout.exercises.map((exercise) => ({
      id: exercise.id || `e${new Date().getTime() + Math.random()}`,
      name: exercise.name,
      sets: exercise.sets,
      targetReps: exercise.targetReps,
      restTime: exercise.restTime || 60,
      category: exercise.category,
      equipment: exercise.equipment,
      completed: false
    }));

    // Start the workout with the exercises created by AI
    startWorkout(workoutExercises);
    setShowAICreator(false);
    
    // Navigate to active workout
    router.replace('/workout/active');
  };

  const workoutTypeOptions: WorkoutTypeOption[] = [
    {
      id: 'from_template',
      title: 'From Template',
      subtitle: 'Use percentage-based training programs',
      icon: 'list-outline',
      color: '#0A84FF',
      action: () => {
        // Show template selection below
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    {
      id: 'repeat_workout',
      title: 'Repeat Workout',
      subtitle: 'Copy exact weights from previous session',
      icon: 'repeat-outline',
      color: '#30D158',
      action: handleRepeatWorkout
    },
    {
      id: 'quick_start',
      title: 'Quick Start',
      subtitle: 'Start from scratch with manual entry',
      icon: 'flash-outline',
      color: '#FF9F0A',
      action: handleQuickStart
    },
    {
      id: 'ai_creator',
      title: 'Use AI',
      subtitle: 'Describe your workout with voice or text',
      icon: 'sparkles',
      color: '#FF2D55',
      action: handleShowAICreator
    }
  ];

  const renderWorkoutTypeOption = (option: WorkoutTypeOption) => (
    <TouchableOpacity
      key={option.id}
      style={styles.typeOptionCard}
      onPress={option.action}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} style={styles.typeOptionBlur}>
        <View style={styles.typeOptionContent}>
          <View style={[styles.typeOptionIcon, { backgroundColor: option.color }]}>
            <Ionicons name={option.icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.typeOptionText}>
            <Text style={styles.typeOptionTitle}>{option.title}</Text>
            <Text style={styles.typeOptionSubtitle}>{option.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderTemplate = (template: WorkoutTemplate) => (
    <TouchableOpacity
      key={template.id}
      style={styles.templateCard}
      onPress={() => handleStartFromTemplate(template)}
      activeOpacity={0.8}
    >
      <BlurView intensity={20} style={styles.templateBlur}>
        <View style={styles.templateContent}>
          <View style={styles.templateHeader}>
            <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
              <Ionicons name={template.icon as any} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDuration}>
                {template.duration} min • {template.difficulty}
              </Text>
            </View>
          </View>
          <Text style={styles.templateDescription} numberOfLines={2}>
            {template.description}
          </Text>
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
          <Text style={styles.headerTitle}>Start Workout</Text>
          <Text style={styles.headerSubtitle}>Choose how you want to begin</Text>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Workout Type Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Types</Text>
            <View style={styles.typeOptionsGrid}>
              {workoutTypeOptions.map(renderWorkoutTypeOption)}
            </View>
          </View>

          {/* Recent Templates */}
          {recentTemplates.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Templates</Text>
              <View style={styles.templatesGrid}>
                {recentTemplates.map(renderTemplate)}
              </View>
            </View>
          )}

          {/* All Templates */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Templates</Text>
              <TouchableOpacity onPress={() => router.push('/workout/template')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.templatesGrid}>
              {templates.slice(0, 4).map(renderTemplate)}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* AI Workout Creator Modal */}
      {showAICreator && (
        <VoiceWorkoutCreator
          onClose={() => setShowAICreator(false)}
          onWorkoutCreated={handleAIWorkoutCreated}
        />
      )}
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
    marginBottom: 16,
  },
  seeAllText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Workout Type Options
  typeOptionsGrid: {
    gap: 12,
  },
  typeOptionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  typeOptionBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  typeOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeOptionText: {
    flex: 1,
  },
  typeOptionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeOptionSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
  },

  // Templates
  templatesGrid: {
    gap: 12,
  },
  templateCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  templateBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateContent: {
    padding: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  templateDuration: {
    color: '#8E8E93',
    fontSize: 12,
  },
  templateDescription: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 18,
  },
});
