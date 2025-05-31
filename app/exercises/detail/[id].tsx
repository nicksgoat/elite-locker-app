import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Import enhanced types and services
import exerciseService from '../../../services/exerciseService';
import trainingMaxService from '../../../services/trainingMaxService';
import { Exercise, ExerciseTag } from '../../../types/workout';

// Import layout component
import SpotifyBleedingLayout from '../../../components/design-system/layouts/SpotifyBleedingLayout';

// Mock data for initial development (would normally come from API/database)
const mockExercises: Record<string, Exercise> = {
  'e1': {
    id: 'e1',
    name: 'Barbell Squat',
    description: 'A compound lower body exercise that targets the quadriceps, hamstrings, and glutes. Stand with feet shoulder-width apart, barbell across upper back, push hips back and bend knees to lower body until thighs are parallel to the ground, then drive through heels to return to starting position.',
    videoUrl: 'https://example.com/squat.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
    measurementConfig: { allowed: ['weight_reps', 'rpe'], default: 'weight_reps' },
    tags: ['strength_training', 'compound', 'legs', 'barbell'],
    isFavorite: true,
    createdBy: 'system',
  },
  'e2': {
    id: 'e2',
    name: 'Bench Press',
    description: 'A compound upper body exercise that targets the chest, shoulders, and triceps. Lie flat on a bench, grip the barbell with hands slightly wider than shoulder-width apart, lower the bar to chest level, then press upward to full arm extension.',
    videoUrl: null,
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop',
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

const ExerciseTagComponent = ({ tag }: { tag: ExerciseTag | string }) => {
  // Handle both new ExerciseTag objects and legacy string tags
  const tagInfo = typeof tag === 'string'
    ? availableTags[tag] || { label: tag, color: '#8E8E93' }
    : { label: tag.label, color: tag.colorHex };

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
  const [isLoading, setIsLoading] = useState(true);
  const [trainingMax, setTrainingMax] = useState<any>(null);

  const loadExercise = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // Load exercise details with enhanced service
      const exerciseData = await exerciseService.getExerciseWithDetails(id as string);
      if (exerciseData) {
        setExercise(exerciseData);
        setIsFavorite(exerciseData.isFavorite || false);

        // Load training max for this exercise
        try {
          const maxData = await trainingMaxService.getExerciseTrainingMax(
            exerciseData.id,
            exerciseData.measurementConfig.default as any
          );
          setTrainingMax(maxData);
        } catch (error) {
          console.log('No training max found for this exercise');
        }
      }
    } catch (error) {
      console.error('Error loading exercise:', error);
      // Fallback to mock data
      if (id && mockExercises[id as string]) {
        setExercise(mockExercises[id as string]);
        setIsFavorite(mockExercises[id as string].isFavorite || false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadExercise();
  }, [loadExercise]);

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
    // Navigate to enhanced workout logger with this exercise pre-selected
    router.push({
      pathname: '/workout/enhanced-log',
      params: { preSelectedExerciseId: exercise?.id }
    } as any);
  };

  const handleVideoPress = useCallback(() => {
    if (exercise?.videoUrl) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Open video player modal or navigate to video screen
      console.log('Playing video:', exercise.videoUrl);
    }
  }, [exercise?.videoUrl]);

  // Training Max Manager Handlers
  const handleLeaderboardPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (exercise) {
      router.push({
        pathname: '/exercises/leaderboard/[id]',
        params: { id: exercise.id, exerciseName: exercise.name }
      } as any);
    }
  }, [exercise, router]);

  const handlePercentagePress = useCallback((percentage: number, weight: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Copy weight to clipboard or show in workout logger
    console.log(`${percentage}% = ${weight} lbs`);
    // TODO: Add to clipboard or suggest for workout
  }, []);

  const handleUpdateMax = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (exercise) {
      router.push({
        pathname: '/exercises/training-max/update/[id]',
        params: {
          id: exercise.id,
          exerciseName: exercise.name,
          currentMax: trainingMax?.maxValue || 0,
          measurementType: exercise.measurementConfig.default
        }
      } as any);
    }
  }, [exercise, trainingMax, router]);

  const handleViewHistory = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (exercise) {
      router.push({
        pathname: '/exercises/training-max/history/[id]',
        params: { id: exercise.id, exerciseName: exercise.name }
      } as any);
    }
  }, [exercise, router]);

  const handleSetFirstMax = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (exercise) {
      router.push({
        pathname: '/exercises/training-max/set/[id]',
        params: {
          id: exercise.id,
          exerciseName: exercise.name,
          measurementType: exercise.measurementConfig.default
        }
      } as any);
    }
  }, [exercise, router]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  // Use a fallback header image (using workouts image temporarily)
  const headerImage = require('../../../assets/images/marketplace/workouts.jpg');

  if (isLoading || !exercise) {
    return (
      <SpotifyBleedingLayout
        categoryImage={headerImage}
        title="Loading..."
        subtitle="Please wait"
        onBackPress={handleBackPress}
        isLoading={true}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading exercise...</Text>
        </View>
      </SpotifyBleedingLayout>
    );
  }

  return (
    <SpotifyBleedingLayout
      categoryImage={headerImage}
      title={exercise.name}
      subtitle={exercise.category?.name || 'Exercise'}
      onBackPress={handleBackPress}
      customHeaderContent={
        <View style={styles.headerActions}>
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
      }
    >
        {/* Exercise Media Section */}
        <View style={styles.mediaContainer}>
          {exercise.videoUrl || exercise.thumbnailUrl ? (
            <View style={styles.mediaContent}>
              {exercise.videoUrl ? (
                <TouchableOpacity
                  style={styles.videoContainer}
                  onPress={handleVideoPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.videoPlaceholder}>
                    <Ionicons name="play-circle" size={64} color="#FFFFFF" />
                    <Text style={styles.videoText}>Tap to play video</Text>
                  </View>
                </TouchableOpacity>
              ) : exercise.thumbnailUrl ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: exercise.thumbnailUrl }}
                    style={styles.exerciseImage}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={styles.exerciseIconContainer}>
                <Ionicons
                  name="barbell-outline"
                  size={48}
                  color="#8E8E93"
                />
                <Text style={styles.placeholderText}>No media available</Text>
              </View>
            </View>
          )}
        </View>

        {/* Exercise Tags */}
        <View style={styles.contentContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            <View style={styles.tagsContainer}>
              {(exercise.tags || []).map((tag, index) => (
                <ExerciseTagComponent key={index} tag={tag} />
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

          {/* Training Max Manager Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Training Max</Text>
              <TouchableOpacity
                style={styles.leaderboardButton}
                onPress={handleLeaderboardPress}
                activeOpacity={0.7}
              >
                <Ionicons name="trophy-outline" size={20} color="#FF9F0A" />
                <Text style={styles.leaderboardText}>Leaderboard</Text>
              </TouchableOpacity>
            </View>

            {trainingMax ? (
              <View style={styles.trainingMaxContainer}>
                <View style={styles.currentMaxSection}>
                  <View style={styles.trainingMaxValue}>
                    <Text style={styles.trainingMaxNumber}>{trainingMax.maxValue}</Text>
                    <Text style={styles.trainingMaxUnit}>
                      {trainingMax.measurementType === 'weight_reps' ? 'lbs' : 'reps'}
                    </Text>
                  </View>
                  <Text style={styles.trainingMaxDate}>
                    Set on {new Date(trainingMax.dateAchieved).toLocaleDateString()}
                  </Text>
                  {trainingMax.notes && (
                    <Text style={styles.trainingMaxNotes}>{trainingMax.notes}</Text>
                  )}
                </View>

                {/* Percentage Calculator */}
                <View style={styles.percentageSection}>
                  <Text style={styles.percentageTitle}>Percentage Calculator</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.percentageScroll}
                  >
                    <View style={styles.percentageContainer}>
                      {trainingMaxService.calculateCommonPercentages(trainingMax.maxValue).map((calc, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.percentagePill}
                          onPress={() => handlePercentagePress(calc.percentage, calc.weight)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.percentagePercent}>{calc.percentage}%</Text>
                          <Text style={styles.percentageWeight}>{calc.weight} lbs</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Action Buttons */}
                <View style={styles.trainingMaxActions}>
                  <TouchableOpacity
                    style={styles.updateMaxButton}
                    onPress={handleUpdateMax}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                    <Text style={styles.updateMaxText}>Update Max</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.historyButton}
                    onPress={handleViewHistory}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="time-outline" size={16} color="#8E8E93" />
                    <Text style={styles.historyText}>History</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.noMaxContainer}>
                <Ionicons name="trending-up-outline" size={48} color="#8E8E93" />
                <Text style={styles.noMaxTitle}>No Training Max Set</Text>
                <Text style={styles.noMaxSubtitle}>
                  Set your training max to track progress and calculate percentages
                </Text>
                <TouchableOpacity
                  style={styles.setMaxButton}
                  onPress={handleSetFirstMax}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#0A84FF', '#007AFF']}
                    style={styles.setMaxGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.setMaxText}>Set Training Max</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Category Section */}
          {exercise.category && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={[styles.categoryPill, { backgroundColor: `${exercise.category.colorHex}20` }]}>
                <Ionicons name={exercise.category.iconName as any || 'fitness-outline'} size={16} color={exercise.category.colorHex} />
                <Text style={[styles.categoryText, { color: exercise.category.colorHex }]}>
                  {exercise.category.name}
                </Text>
              </View>
            </View>
          )}

          {/* Add to Workout Button */}
          <View style={styles.actionContainer}>
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
          </View>
        </View>
    </SpotifyBleedingLayout>
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
    paddingVertical: 64,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mediaContent: {
    width: '100%',
    aspectRatio: 16 / 9, // 16:9 aspect ratio for videos/images
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1E',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  exerciseIconContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 159, 10, 0.2)',
  },
  leaderboardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9F0A',
    marginLeft: 4,
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
  trainingMaxContainer: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 12,
    padding: 16,
  },
  currentMaxSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trainingMaxValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  trainingMaxNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trainingMaxUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 4,
  },
  trainingMaxDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  trainingMaxNotes: {
    fontSize: 14,
    color: '#EBEBF5',
    opacity: 0.8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  percentageSection: {
    marginBottom: 20,
  },
  percentageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  percentageScroll: {
    marginHorizontal: -16,
  },
  percentageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  percentagePill: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  percentagePercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
    marginBottom: 2,
  },
  percentageWeight: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  trainingMaxActions: {
    flexDirection: 'row',
    gap: 12,
  },
  updateMaxButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  updateMaxText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  historyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 6,
  },
  noMaxContainer: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noMaxTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  noMaxSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  setMaxButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  setMaxGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  setMaxText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
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