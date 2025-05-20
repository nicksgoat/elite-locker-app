import { Text } from '@/components/design-system/primitives';
import { useTheme } from '@/components/design-system/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data for exercises
const mockExercises = [
  {
    id: 'e1',
    name: 'Barbell Bench Press',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'The barbell bench press is a classic exercise that targets the chest, shoulders, and triceps. It is one of the most effective exercises for building upper body strength and muscle mass.',
    instructions: [
      'Lie on a flat bench with your feet flat on the floor.',
      'Grip the barbell with hands slightly wider than shoulder-width apart.',
      'Unrack the barbell and lower it to your mid-chest.',
      'Press the barbell back up to the starting position.',
      'Repeat for the desired number of repetitions.'
    ],
    tips: [
      'Keep your wrists straight and elbows at a 45-degree angle.',
      'Maintain a slight arch in your lower back.',
      'Keep your feet flat on the floor for stability.',
      'Breathe out as you push the weight up.'
    ],
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
    video: 'https://example.com/bench-press-video.mp4',
    variations: [
      { name: 'Incline Bench Press', id: 'e2' },
      { name: 'Decline Bench Press', id: 'e3' },
      { name: 'Close-Grip Bench Press', id: 'e4' }
    ]
  },
  {
    id: 'e2',
    name: 'Incline Bench Press',
    muscleGroups: ['Upper Chest', 'Shoulders', 'Triceps'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'The incline bench press targets the upper chest and front deltoids more than the flat bench press. It is an excellent exercise for developing the upper chest muscles.',
    instructions: [
      'Set an adjustable bench to an incline of 30-45 degrees.',
      'Lie on the bench with your feet flat on the floor.',
      'Grip the barbell with hands slightly wider than shoulder-width apart.',
      'Unrack the barbell and lower it to your upper chest.',
      'Press the barbell back up to the starting position.',
      'Repeat for the desired number of repetitions.'
    ],
    tips: [
      'Use a spotter for safety, especially with heavy weights.',
      'Keep your elbows at a 45-degree angle to your body.',
      'Don\'t arch your back excessively.',
      'Focus on the upper chest contraction.'
    ],
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61',
    video: 'https://example.com/incline-bench-press-video.mp4',
    variations: [
      { name: 'Barbell Bench Press', id: 'e1' },
      { name: 'Decline Bench Press', id: 'e3' },
      { name: 'Dumbbell Incline Press', id: 'e5' }
    ]
  }
];

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Find the exercise by ID
  const exercise = mockExercises.find(ex => ex.id === id);

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAddToWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Logic to add exercise to workout
  };

  if (!exercise) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text variant="h2" color="inverse">Exercise not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Exercise Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: exercise.image }}
            style={styles.exerciseImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageGradient}
          />
        </View>

        {/* Exercise Title and Info */}
        <View style={styles.infoContainer}>
          <Text variant="h1" color="inverse" style={styles.exerciseName}>{exercise.name}</Text>

          <View style={styles.tagsContainer}>
            {exercise.muscleGroups.map((muscle, index) => (
              <View key={index} style={styles.tagPill}>
                <Text variant="bodySmall" color="inverse">{muscle}</Text>
              </View>
            ))}
            <View style={[styles.tagPill, { backgroundColor: '#0A84FF20' }]}>
              <Text variant="bodySmall" color="inverse" style={{ color: '#0A84FF' }}>{exercise.difficulty}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Description</Text>
            <Text variant="body" color="inverse" style={styles.description}>{exercise.description}</Text>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Instructions</Text>
            {exercise.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text variant="bodySmall" color="inverse">{index + 1}</Text>
                </View>
                <Text variant="body" color="inverse" style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text variant="h3" color="inverse" style={styles.sectionTitle}>Tips</Text>
            {exercise.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="bulb-outline" size={20} color="#FFD60A" />
                <Text variant="body" color="inverse" style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Variations */}
          {exercise.variations && exercise.variations.length > 0 && (
            <View style={styles.section}>
              <Text variant="h3" color="inverse" style={styles.sectionTitle}>Variations</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.variationsContainer}
              >
                {exercise.variations.map((variation) => (
                  <TouchableOpacity
                    key={variation.id}
                    style={styles.variationCard}
                    onPress={() => router.push(`/exercise/detail/${variation.id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Text variant="bodySemiBold" color="inverse" style={styles.variationName}>{variation.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Add to Workout Button */}
      <View style={styles.buttonContainer}>
        <BlurView intensity={80} tint="dark" style={styles.buttonBlur}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToWorkout}
            activeOpacity={0.8}
          >
            <Text variant="bodySemiBold" color="inverse" style={{ color: '#FFFFFF' }}>Add to Workout</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.4,
    width: '100%',
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  exerciseName: {
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    lineHeight: 22,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 22,
  },
  variationsContainer: {
    paddingRight: 16,
  },
  variationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150,
  },
  variationName: {
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  buttonBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
