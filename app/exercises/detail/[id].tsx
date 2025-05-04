import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

// Types for our exercise data model
interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  measurementConfig: {
    allowed: string[];
    default: string;
  };
  tags: string[];
  isFavorite: boolean;
  createdBy: string;
}

// Mock data for initial development (would normally come from API/database)
const mockExercises: Record<string, Exercise> = {
  'e1': {
    id: 'e1',
    name: 'Barbell Squat',
    description: 'A compound lower body exercise that targets the quadriceps, hamstrings, and glutes. Stand with feet shoulder-width apart, barbell across upper back, push hips back and bend knees to lower body until thighs are parallel to the ground, then drive through heels to return to starting position.',
    videoUrl: 'https://example.com/squat.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['weight_reps', 'rpe'], default: 'weight_reps' },
    tags: ['strength_training', 'compound', 'legs', 'barbell'],
    isFavorite: true,
    createdBy: 'system',
  },
  'e2': {
    id: 'e2',
    name: 'Bench Press',
    description: 'A compound upper body exercise that targets the chest, shoulders, and triceps. Lie flat on a bench, grip the barbell with hands slightly wider than shoulder-width apart, lower the bar to chest level, then press upward to full arm extension.',
    videoUrl: 'https://example.com/bench.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['weight_reps', 'rpe'], default: 'weight_reps' },
    tags: ['strength_training', 'compound', 'chest', 'barbell'],
    isFavorite: false,
    createdBy: 'system',
  },
  'e3': {
    id: 'e3',
    name: 'Deadlift',
    description: 'A compound full-body exercise that primarily targets the posterior chain. Stand with feet hip-width apart, bend at hips and knees to grip the barbell with hands shoulder-width apart, drive through heels and extend hips and knees to stand upright while keeping back flat.',
    videoUrl: 'https://example.com/deadlift.mp4',
    thumbnailUrl: null,
    measurementConfig: { allowed: ['weight_reps', 'rpe'], default: 'weight_reps' },
    tags: ['strength_training', 'compound', 'back', 'barbell'],
    isFavorite: true,
    createdBy: 'system',
  },
};

// Available tags with UI representation
interface TagInfo {
  label: string;
  color: string;
}

const availableTags: Record<string, TagInfo> = {
  'strength_training': { label: 'Strength', color: '#0A84FF' },
  'compound': { label: 'Compound', color: '#30D158' },
  'legs': { label: 'Legs', color: '#FF9F0A' },
  'barbell': { label: 'Barbell', color: '#5E5CE6' },
  'chest': { label: 'Chest', color: '#FF375F' },
  'back': { label: 'Back', color: '#BF5AF2' },
  'football': { label: 'Football', color: '#FF9F0A' },
  'agility': { label: 'Agility', color: '#64D2FF' },
  'speed': { label: 'Speed', color: '#FF2D55' },
  'route_running': { label: 'Routes', color: '#FF9F0A' },
  'plyometrics': { label: 'Plyometrics', color: '#FF2D55' },
  'explosive': { label: 'Explosive', color: '#FF3B30' },
  'equipment': { label: 'Equipment', color: '#64D2FF' },
  'bodyweight': { label: 'Bodyweight', color: '#30D158' },
  'pull': { label: 'Pull', color: '#5E5CE6' },
};

const ExerciseTag = ({ tag }: { tag: string }) => {
  const tagInfo = availableTags[tag] || { label: tag, color: '#8E8E93' };
  
  return (
    <View style={[styles.tagPill, { backgroundColor: `${tagInfo.color}20` }]}>
      <Text style={[styles.tagText, { color: tagInfo.color }]}>
        {tagInfo.label}
      </Text>
    </View>
  );
};

const MeasurementTypeIcon = ({ type }: { type: string }) => {
  const getIconDetails = () => {
    switch (type) {
      case 'weight_reps':
        return { icon: 'barbell-outline', label: 'Weight & Reps' };
      case 'reps':
        return { icon: 'repeat-outline', label: 'Reps' };
      case 'time_based':
        return { icon: 'time-outline', label: 'Time' };
      case 'distance':
        return { icon: 'map-outline', label: 'Distance' };
      case 'rpe':
        return { icon: 'speedometer-outline', label: 'RPE' };
      case 'height':
        return { icon: 'trending-up-outline', label: 'Height' };
      default:
        return { icon: 'help-circle-outline', label: type };
    }
  };

  const { icon, label } = getIconDetails();

  return (
    <View style={styles.measurementType}>
      <Ionicons name={icon as any} size={16} color="#FFFFFF" />
      <Text style={styles.measurementLabel}>{label}</Text>
    </View>
  );
};

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    // In a real app, this would be an API call to get the exercise details
    if (id && mockExercises[id]) {
      setExercise(mockExercises[id]);
      setIsFavorite(mockExercises[id].isFavorite);
    }
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite(!isFavorite);
    // In a real app, this would update the database
  };

  const handleEditExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (exercise) {
      router.push({
        pathname: '/exercises/edit/[id]',
        params: { id: exercise.id }
      } as any);
    }
  };

  const handleAddToWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would navigate to workout creation/editing with this exercise
    router.push('/workout' as any);
  };

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <BlurView intensity={30} tint="dark" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
                <Ionicons
                  name={isFavorite ? 'star' : 'star-outline'}
                  size={24}
                  color={isFavorite ? '#FF9F0A' : '#FFFFFF'}
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.editButton} onPress={handleEditExercise}>
                <Ionicons name="create-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          {/* This would be a video player in a real app */}
          <View style={styles.videoPlaceholder}>
            <Ionicons
              name={exercise.tags.includes('strength_training') ? 'barbell-outline' : 'fitness-outline'}
              size={64}
              color="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            <View style={styles.tagsContainer}>
              {exercise.tags.map((tag, index) => (
                <ExerciseTag key={index} tag={tag} />
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{exercise.description}</Text>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Measurement Types</Text>
            <View style={styles.measurementsContainer}>
              {exercise.measurementConfig.allowed.map((type, index) => (
                <MeasurementTypeIcon key={index} type={type} />
              ))}
            </View>
            <Text style={styles.defaultMeasurement}>
              Default: {availableTags[exercise.measurementConfig.default]?.label || exercise.measurementConfig.default}
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <BlurView intensity={40} tint="dark" style={styles.footerBlur}>
          <TouchableOpacity
            style={styles.addToWorkoutButton}
            onPress={handleAddToWorkout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF2D55', '#FF375F']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Add to Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  header: {
    width: '100%',
    height: 60,
  },
  headerBlur: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    height: width * 0.75, // 4:3 aspect ratio
    backgroundColor: '#1C1C1E',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
  },
  contentContainer: {
    padding: 16,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tagsScroll: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#EBEBF5',
    opacity: 0.8,
  },
  measurementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 12,
  },
  measurementType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  measurementLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  defaultMeasurement: {
    marginTop: 12,
    color: '#8E8E93',
    fontSize: 14,
  },
  footer: {
    width: '100%',
    height: 88,
  },
  footerBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addToWorkoutButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 