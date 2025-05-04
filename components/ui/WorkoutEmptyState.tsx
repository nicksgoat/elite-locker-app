import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkout } from '../../contexts/WorkoutContext';

const { width } = Dimensions.get('window');

interface TemplateProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  exercises: number;
  onPress: () => void;
}

// Template Card Component
const TemplateCard: React.FC<TemplateProps> = ({
  title,
  description,
  icon,
  color,
  exercises,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.templateCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      activeOpacity={0.7}
    >
      <BlurView intensity={20} tint="dark" style={styles.templateBlur}>
        <View style={[styles.templateIconContainer, { backgroundColor: `${color}25` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        
        <Text style={styles.templateTitle}>{title}</Text>
        <Text style={styles.templateDescription} numberOfLines={2}>{description}</Text>
        
        <View style={styles.templateFooter}>
          <Text style={styles.exerciseCount}>{exercises} exercises</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

// Quick Start Templates
const quickStartTemplates = [
  {
    id: 'qs1',
    title: 'Full Body Workout',
    description: 'A balanced workout targeting all major muscle groups',
    icon: 'body-outline',
    color: '#0A84FF',
    exercises: 8,
  },
  {
    id: 'qs2',
    title: 'Upper Body Focus',
    description: 'Build strength in chest, shoulders, back and arms',
    icon: 'barbell-outline',
    color: '#FF2D55',
    exercises: 6,
  },
  {
    id: 'qs3',
    title: 'Lower Body Power',
    description: 'Build strength and size in legs and glutes',
    icon: 'footsteps-outline',
    color: '#FF9F0A',
    exercises: 5,
  },
  {
    id: 'qs4',
    title: 'Core Crusher',
    description: 'Strengthen your core with these targeted exercises',
    icon: 'fitness-outline',
    color: '#30D158',
    exercises: 4,
  },
];

const WorkoutEmptyState: React.FC = () => {
  const router = useRouter();
  const { startWorkout } = useWorkout();
  
  // Handle starting a blank workout
  const handleStartBlankWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startWorkout([]);
  };
  
  // Handle starting a template workout
  const handleStartTemplate = (templateId: string) => {
    // In a real app, you would fetch the template exercises from a database
    // For now, we'll just start a blank workout
    
    // Find the template from our mock data
    const template = quickStartTemplates.find(t => t.id === templateId);
    
    if (template) {
      // Mock generating exercises based on the template
      const mockExercises = Array(template.exercises).fill(0).map((_, i) => ({
        id: `e${new Date().getTime() + i}`,
        name: `Exercise ${i + 1}`,
        sets: 3,
        targetReps: '8-12',
        restTime: 60,
        completed: false
      }));
      
      startWorkout(mockExercises);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Start Workout</Text>
        <Text style={styles.subtitle}>Choose a template or start from scratch</Text>
      </View>
      
      <TouchableOpacity
        style={styles.blankWorkoutButton}
        onPress={handleStartBlankWorkout}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#0A84FF', '#0066CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.blankWorkoutText}>Empty Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Quick Start</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.templatesContainer}
      >
        {quickStartTemplates.map(template => (
          <TemplateCard
            key={template.id}
            title={template.title}
            description={template.description}
            icon={template.icon}
            color={template.color}
            exercises={template.exercises}
            onPress={() => handleStartTemplate(template.id)}
          />
        ))}
      </ScrollView>
      
      <Text style={styles.sectionTitle}>Recent Workouts</Text>
      
      <View style={styles.emptyRecent}>
        <Ionicons name="time-outline" size={40} color="#8E8E93" />
        <Text style={styles.emptyText}>No recent workouts</Text>
        <Text style={styles.emptySubtext}>
          Your recent workouts will appear here
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  blankWorkoutButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  blankWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  templatesContainer: {
    paddingBottom: 8,
  },
  templateCard: {
    width: width * 0.7,
    maxWidth: 280,
    height: 160,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
  },
  templateBlur: {
    flex: 1,
    padding: 16,
  },
  templateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  templateFooter: {
    marginTop: 'auto',
  },
  exerciseCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyRecent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WorkoutEmptyState; 