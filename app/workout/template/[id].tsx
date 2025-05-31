import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useWorkout } from '../../../contexts/WorkoutContext';

// Mock template exercises data
const templateExercises: Record<string, any[]> = {
  'workout_123': [
    { id: 'e1', name: 'Hurdle Mobility Warm-up', category: 'Mobility', sets: 3, reps: '10 each leg' },
    { id: 'e2', name: 'Hurdle Step-Overs', category: 'Technique', sets: 4, reps: '8 each leg' },
    { id: 'e3', name: 'Sprint Intervals', category: 'Speed', sets: 6, reps: '60m' },
    { id: 'e4', name: 'Hurdle Drills', category: 'Technique', sets: 5, reps: '5 hurdles' },
    { id: 'e5', name: 'Plyometric Bounds', category: 'Power', sets: 3, reps: '10 bounds' },
    { id: 'e6', name: 'Cool-down Stretching', category: 'Recovery', sets: 1, reps: '15 minutes' },
  ],
  'workout_own_2': [
    { id: 'e7', name: 'Dynamic Warm-up', category: 'Warm-up', sets: 1, reps: '10 minutes' },
    { id: 'e8', name: 'Route Running Drills', category: 'Technique', sets: 8, reps: '5 routes each' },
    { id: 'e9', name: 'Catching Drills', category: 'Skill', sets: 6, reps: '10 catches' },
    { id: 'e10', name: 'Agility Ladder', category: 'Agility', sets: 4, reps: '20 yards' },
    { id: 'e11', name: 'Cone Drills', category: 'Agility', sets: 5, reps: '3 patterns' },
  ],
  't1': [
    { id: 'e12', name: 'Barbell Squat', category: 'Legs', sets: 3, reps: 10 },
    { id: 'e13', name: 'Bench Press', category: 'Chest', sets: 3, reps: 10 },
    { id: 'e14', name: 'Deadlift', category: 'Back', sets: 3, reps: 8 },
    { id: 'e15', name: 'Pull-ups', category: 'Back', sets: 3, reps: 8 },
    { id: 'e16', name: 'Overhead Press', category: 'Shoulders', sets: 3, reps: 10 },
  ],
  't2': [
    { id: 'e17', name: 'Burpees', category: 'Full Body', sets: 5, reps: "45 sec" },
    { id: 'e18', name: 'Mountain Climbers', category: 'Core', sets: 5, reps: "45 sec" },
    { id: 'e19', name: 'Jump Squats', category: 'Legs', sets: 5, reps: "45 sec" },
    { id: 'e20', name: 'Kettlebell Swings', category: 'Full Body', sets: 5, reps: "45 sec" },
  ],
  't3': [
    { id: 'e21', name: 'Cat-Cow Stretch', category: 'Mobility', sets: 1, reps: "10 cycles" },
    { id: 'e22', name: 'World\'s Greatest Stretch', category: 'Mobility', sets: 1, reps: "5 each side" },
    { id: 'e23', name: 'Hip 90/90 Stretch', category: 'Mobility', sets: 1, reps: "60 sec each side" },
  ],
};

// Mock data for workout templates
const workoutTemplates = [
  // Current user's workouts (matching the detail screen)
  {
    id: 'workout_123',
    name: 'Olympic Hurdle Training',
    description: 'Olympic-level hurdle training session focusing on technique, speed, and agility.',
    exercises: [
      {
        name: 'Hurdle Mobility Warm-up',
        sets: 3,
        reps: '10 each leg',
        rest: 60,
        notes: 'Focus on hip flexibility and range of motion. Prepare for hurdle-specific movements.'
      },
      {
        name: 'Hurdle Step-Overs',
        sets: 4,
        reps: '8 each leg',
        rest: 90,
        notes: 'Practice proper hurdle technique with controlled movements.'
      },
      {
        name: 'Sprint Intervals',
        sets: 6,
        reps: '60m',
        rest: 180,
        notes: 'Focus on acceleration and maintaining form at high speeds.'
      },
      {
        name: 'Hurdle Drills',
        sets: 5,
        reps: '5 hurdles',
        rest: 120,
        notes: 'Work on rhythm, timing, and technique over regulation hurdles.'
      },
      {
        name: 'Plyometric Bounds',
        sets: 3,
        reps: '10 bounds',
        rest: 90,
        notes: 'Develop explosive power for hurdle clearance.'
      },
      {
        name: 'Cool-down Stretching',
        sets: 1,
        reps: '15 minutes',
        rest: 0,
        notes: 'Focus on hip flexors, hamstrings, and calves.'
      },
    ],
    duration: '90 min',
    level: 'Advanced',
    creator: 'Devon Allen',
    backgroundColor: '#FF950030',
    targetMuscles: ['Hip Flexors', 'Hamstrings', 'Glutes', 'Calves', 'Core'],
    requirements: 'Track, hurdles, starting blocks',
  },
  {
    id: 'workout_own_2',
    name: 'NFL Route Running',
    description: 'NFL-level route running and catching drills to improve precision, speed, and agility.',
    exercises: [
      {
        name: 'Dynamic Warm-up',
        sets: 1,
        reps: '10 minutes',
        rest: 0,
        notes: 'High knees, butt kicks, leg swings, and dynamic stretching.'
      },
      {
        name: 'Route Running Drills',
        sets: 8,
        reps: '5 routes each',
        rest: 60,
        notes: 'Practice slants, outs, comebacks, and go routes with precision.'
      },
      {
        name: 'Catching Drills',
        sets: 6,
        reps: '10 catches',
        rest: 45,
        notes: 'Focus on hand-eye coordination and secure catches.'
      },
      {
        name: 'Agility Ladder',
        sets: 4,
        reps: '20 yards',
        rest: 60,
        notes: 'Improve footwork and change of direction speed.'
      },
      {
        name: 'Cone Drills',
        sets: 5,
        reps: '3 patterns',
        rest: 90,
        notes: 'Sharp cuts and explosive direction changes.'
      },
    ],
    duration: '70 min',
    level: 'Advanced',
    creator: 'Devon Allen',
    backgroundColor: '#30D15830',
    targetMuscles: ['Legs', 'Core', 'Shoulders', 'Hands'],
    requirements: 'Football, cones, agility ladder',
  },
  {
    id: 't2',
    name: 'HIIT Power',
    description: 'High intensity intervals for maximum power and endurance. Burn calories while improving cardiovascular fitness.',
    exercises: [
      {
        name: 'Burpees',
        sets: 5,
        reps: '45 sec work / 15 sec rest',
        notes: 'Focus on explosive movement in the jump.'
      },
      {
        name: 'Mountain Climbers',
        sets: 5,
        reps: '45 sec work / 15 sec rest',
        notes: 'Keep hips low and maintain a fast pace.'
      },
      {
        name: 'Jump Squats',
        sets: 5,
        reps: '45 sec work / 15 sec rest',
        notes: 'Land softly and immediately drop into the next squat.'
      },
      {
        name: 'Kettlebell Swings',
        sets: 5,
        reps: '45 sec work / 15 sec rest',
        notes: 'Drive with the hips, not the arms.'
      },
      {
        name: 'Push-ups',
        sets: 5,
        reps: '45 sec work / 15 sec rest',
        notes: 'Modify on knees if needed, maintain proper form.'
      },
      {
        name: 'Plank Jacks',
        sets: 5,
        reps: '45 sec work / 15 sec rest',
        notes: 'Keep core tight and maintain plank position throughout.'
      },
      {
        name: 'Battle Ropes',
        sets: 5,
        reps: '45 sec work / 15 sec rest',
        notes: 'Alternate between different patterns for variety.'
      },
      {
        name: 'Box Jumps',
        sets: 5,
        reps: '45 sec work / 15 sec rest',
        notes: 'Step down rather than jumping down to protect your knees.'
      },
    ],
    duration: '30 min',
    level: 'Intermediate',
    creator: 'Coach Mike',
    backgroundColor: '#FF950030',
    targetMuscles: ['Full Body', 'Cardiovascular System'],
    requirements: 'Kettlebell, battle ropes, plyo box',
  },
  {
    id: 't3',
    name: 'Mobility Flow',
    description: 'Improve mobility and flexibility with this dynamic flow. Great for active recovery days or as a warm-up.',
    exercises: [
      {
        name: 'Cat-Cow Stretch',
        sets: 1,
        reps: '10 cycles',
        notes: 'Flow smoothly between positions, coordinating with breath.'
      },
      {
        name: "World's Greatest Stretch",
        sets: 1,
        reps: '5 each side',
        notes: 'Hold each position for 2-3 breaths.'
      },
      {
        name: 'Thoracic Rotations',
        sets: 1,
        reps: '8 each side',
        notes: 'Focus on rotation coming from mid-back, not lower back.'
      },
      {
        name: 'Hip 90/90 Stretch',
        sets: 1,
        reps: '60 sec each side',
        notes: 'Keep spine long and upright.'
      },
      {
        name: 'Squat to Stand',
        sets: 1,
        reps: '10 reps',
        notes: 'Touch toes in forward fold, then rise to deep squat position.'
      },
      {
        name: 'Thread the Needle',
        sets: 1,
        reps: '5 each side',
        notes: 'Focus on thoracic mobility, not just reaching.'
      },
      {
        name: 'Banded Shoulder Dislocates',
        sets: 2,
        reps: '10 reps',
        notes: 'Use appropriate band resistance, should be challenging but not painful.'
      },
      {
        name: 'Supine Spinal Twist',
        sets: 1,
        reps: '60 sec each side',
        notes: 'Keep shoulders on the ground while knees rotate.'
      },
      {
        name: 'Downward Dog to Upward Dog Flow',
        sets: 1,
        reps: '8 cycles',
        notes: 'Move with breath, downward on exhale, upward on inhale.'
      },
      {
        name: 'Active Pigeon Pose',
        sets: 1,
        reps: '60 sec each side',
        notes: 'Engage glutes on the extended leg.'
      },
    ],
    duration: '35 min',
    level: 'All Levels',
    creator: 'Movement Lab',
    backgroundColor: '#FF2D5530',
    targetMuscles: ['Hip Flexors', 'Shoulders', 'Thoracic Spine', 'Hamstrings'],
    requirements: 'Yoga mat, resistance band',
  },
];

export default function WorkoutTemplateScreen() {
  const { id } = useLocalSearchParams();
  const template = workoutTemplates.find(t => t.id === id) || workoutTemplates[0];
  const { startTemplateWorkout, startQuickWorkout } = useWorkout();

  if (!template) {
    return (
      <IMessagePageWrapper
        title="Error"
        subtitle="Template not found">
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Template not found</Text>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.back()}
          >
            <Text style={styles.returnButtonText}>Return to Workouts</Text>
          </TouchableOpacity>
        </View>
      </IMessagePageWrapper>
    );
  }

  const handleStartWorkout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Get the exercises for this template
    if (id && typeof id === 'string') {
      const templateId = id as string;

      if (templateExercises[templateId]) {
        // Start a template workout with the template ID
        await startTemplateWorkout(templateId);
        // Navigate to the active workout screen
        router.push('/workout/active');
      } else {
        // If no exercises found for this template, use quick start
        await startQuickWorkout([]);
        router.push('/workout/active');
      }
    } else {
      // If no ID was provided, use quick start
      await startQuickWorkout([]);
      router.push('/workout/active');
    }
  };

  const handleSaveTemplate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Implementation for saving the template
  };

  return (
    <IMessagePageWrapper
      title=""
      subtitle=""
      showHeader={false}
    >
      <BlurView intensity={50} tint="dark" style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#0A84FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Template</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveTemplate}
        >
          <Ionicons name="bookmark-outline" size={24} color="#0A84FF" />
        </TouchableOpacity>
      </BlurView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View
          style={[
            styles.coverImage,
            { backgroundColor: template.backgroundColor || '#0A84FF30' }
          ]}
        >
          <Text style={styles.coverImageText}>{template.name}</Text>
        </View>

        <View style={styles.templateHeader}>
          <Text style={styles.templateName}>{template.name}</Text>
          <View style={styles.templateMeta}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{template.level}</Text>
            </View>
            <Text style={styles.creatorText}>by {template.creator}</Text>
          </View>
          <Text style={styles.descriptionText}>{template.description}</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#0A84FF" />
            <Text style={styles.infoValue}>{template.duration}</Text>
            <Text style={styles.infoLabel}>Duration</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="barbell-outline" size={20} color="#0A84FF" />
            <Text style={styles.infoValue}>{template.exercises.length}</Text>
            <Text style={styles.infoLabel}>Exercises</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="fitness-outline" size={20} color="#0A84FF" />
            <Text style={styles.infoValue}>{template.targetMuscles.length}</Text>
            <Text style={styles.infoLabel}>Muscle Groups</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="construct-outline" size={20} color="#0A84FF" />
            <Text style={styles.infoValue}>Required</Text>
            <Text style={styles.infoLabel}>Equipment</Text>
          </View>
        </View>

        <View style={styles.targetMusclesContainer}>
          <Text style={styles.sectionTitle}>Target Muscles</Text>
          <View style={styles.muscleTagsContainer}>
            {template.targetMuscles.map((muscle, index) => (
              <View key={`muscle-${muscle}-${index}`} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.requirementsContainer}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsText}>{template.requirements}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Exercises</Text>

        {template.exercises.map((exercise, index) => (
          <View key={`exercise-${exercise.name}-${index}`} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNumberCircle}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} {exercise.sets > 1 ? 'sets' : 'set'} • {exercise.reps}
                </Text>
              </View>
            </View>

            {exercise.notes && (
              <View style={styles.exerciseNotes}>
                <Text style={styles.exerciseNotesText}>{exercise.notes}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Add extra space at the bottom for the floating button */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Start Workout Button */}
      <View style={styles.floatingButtonContainer}>
        <BlurView intensity={80} tint="dark" style={styles.floatingButtonBlur}>
          <TouchableOpacity
            style={styles.floatingStartWorkoutButton}
            onPress={handleStartWorkout}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.floatingStartWorkoutText}>Start Workout</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  returnButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  returnButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  coverImageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    position: 'absolute',
    top: '50%',
    left: 16,
  },
  templateHeader: {
    padding: 16,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A84FF',
  },
  creatorText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  infoItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  targetMusclesContainer: {
    marginBottom: 24,
  },
  muscleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  muscleTag: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  muscleTagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0A84FF',
  },
  requirementsContainer: {
    marginBottom: 24,
  },
  requirementsCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
  },
  requirementsText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  exerciseCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#8E8E93',
  },
  exerciseNotes: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    borderRadius: 8,
  },
  exerciseNotesText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  floatingButtonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingStartWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
  },
  floatingStartWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});