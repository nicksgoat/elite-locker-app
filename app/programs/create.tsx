import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import components
import DaySelector from '@/components/ui/DaySelector';
import GlobalHeader from '@/components/ui/GlobalHeader';
import WeekSelector from '@/components/ui/WeekSelector';

// Types
interface ProgramExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  percentage?: number;
  note?: string;
}

interface ProgramWorkout {
  id: string;
  title: string;
  week: number;
  day: number;
  exercises: ProgramExercise[];
  notes?: string;
}

interface ProgramPhase {
  name: string;
  weeks: number;
  deload: boolean;
}

interface ProgramFormData {
  title: string;
  description: string;
  duration_weeks: number;
  phases_config: ProgramPhase[];
  is_public: boolean;
  thumbnail?: string;
  goal?: string;
  level?: string;
  workouts: ProgramWorkout[];
}

// Goals and levels options
const GOALS = ['Strength', 'Hypertrophy', 'Performance', 'Endurance', 'Weight Loss'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreateProgramScreen() {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<ProgramWorkout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const saveButtonScale = useSharedValue(1);

  // Form data
  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    description: '',
    duration_weeks: 4,
    phases_config: [{ name: 'Base Phase', weeks: 4, deload: false }],
    is_public: true,
    goal: 'Strength',
    level: 'Intermediate',
    workouts: [],
  });

  // Handle back press
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Check if there are unsaved changes
    if (formData.title || formData.workouts.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  // Handle week selection
  const handleWeekPress = (week: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWeek(week);
    // Reset day selection when changing weeks
    setSelectedDay(1);
    // Find workout for this week/day
    findCurrentWorkout(week, 1);
  };

  // Handle day selection
  const handleDayPress = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDay(day);
    // Find workout for this week/day
    findCurrentWorkout(selectedWeek, day);
  };

  // Find current workout
  const findCurrentWorkout = (week: number, day: number) => {
    const workout = formData.workouts.find(w => w.week === week && w.day === day);
    setCurrentWorkout(workout || null);
  };

  // Update form data
  const updateFormData = (field: keyof ProgramFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add or update workout
  const addOrUpdateWorkout = (workout: ProgramWorkout) => {
    const existingIndex = formData.workouts.findIndex(
      w => w.week === workout.week && w.day === workout.day
    );

    if (existingIndex >= 0) {
      // Update existing workout
      const updatedWorkouts = [...formData.workouts];
      updatedWorkouts[existingIndex] = workout;
      updateFormData('workouts', updatedWorkouts);
    } else {
      // Add new workout
      updateFormData('workouts', [...formData.workouts, workout]);
    }

    // Update current workout
    setCurrentWorkout(workout);
  };

  // Create a new workout for current week/day
  const createNewWorkout = () => {
    const newWorkout: ProgramWorkout = {
      id: `w_${Date.now()}`,
      title: `Week ${selectedWeek} Day ${selectedDay}`,
      week: selectedWeek,
      day: selectedDay,
      exercises: [],
    };

    addOrUpdateWorkout(newWorkout);
    return newWorkout;
  };

  // Add exercise to workout
  const addExerciseToWorkout = (exercise: ProgramExercise) => {
    let workout = currentWorkout;

    if (!workout) {
      workout = createNewWorkout();
    }

    const updatedWorkout = {
      ...workout,
      exercises: [...workout.exercises, exercise]
    };

    addOrUpdateWorkout(updatedWorkout);
    setIsAddingExercise(false);
  };

  // Remove exercise from workout
  const removeExerciseFromWorkout = (exerciseId: string) => {
    if (!currentWorkout) return;

    const updatedExercises = currentWorkout.exercises.filter(e => e.id !== exerciseId);
    const updatedWorkout = {
      ...currentWorkout,
      exercises: updatedExercises
    };

    addOrUpdateWorkout(updatedWorkout);
  };

  // Update workout title
  const updateWorkoutTitle = (title: string) => {
    if (!currentWorkout) return;

    const updatedWorkout = {
      ...currentWorkout,
      title
    };

    addOrUpdateWorkout(updatedWorkout);
  };

  // Add phase
  const addPhase = (name: string, weeks: number, deload: boolean) => {
    const updatedPhases = [...formData.phases_config, { name, weeks, deload }];
    updateFormData('phases_config', updatedPhases);

    // Update total weeks
    const totalWeeks = updatedPhases.reduce((sum, phase) => sum + phase.weeks, 0);
    updateFormData('duration_weeks', totalWeeks);

    setIsAddingPhase(false);
  };

  // Remove phase
  const removePhase = (index: number) => {
    const updatedPhases = formData.phases_config.filter((_, i) => i !== index);
    updateFormData('phases_config', updatedPhases);

    // Update total weeks
    const totalWeeks = updatedPhases.reduce((sum, phase) => sum + phase.weeks, 0);
    updateFormData('duration_weeks', totalWeeks);
  };

  // Pick thumbnail image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateFormData('thumbnail', result.assets[0].uri);
    }
  };

  // Save program
  const saveProgram = () => {
    // Validate form data
    if (!formData.title) {
      Alert.alert('Missing Title', 'Please enter a title for your program');
      return;
    }

    if (formData.workouts.length === 0) {
      Alert.alert('No Workouts', 'Please add at least one workout to your program');
      return;
    }

    // Animate save button
    saveButtonScale.value = withSpring(0.9, { damping: 2 }, () => {
      saveButtonScale.value = withSpring(1);
    });

    // In a real app, this would save to a database or context
    // For now, just show a success message
    Alert.alert(
      'Program Created',
      `"${formData.title}" has been created successfully`,
      [{ text: 'OK', onPress: () => router.replace('/programs') }]
    );
  };

  // Initialize current workout when component mounts
  useEffect(() => {
    findCurrentWorkout(selectedWeek, selectedDay);
  }, []);

  // Animated styles
  const saveButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: saveButtonScale.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader
        title="Create Program"
        showBackButton
        onBackPress={handleBackPress}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Program Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROGRAM DETAILS</Text>

            {/* Thumbnail */}
            <TouchableOpacity
              style={styles.thumbnailContainer}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {formData.thumbnail ? (
                <Image
                  source={{ uri: formData.thumbnail }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#FFFFFF" />
                  <Text style={styles.thumbnailText}>Add Cover Image</Text>
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.thumbnailGradient}
              />
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => updateFormData('title', text)}
                placeholder="Program Title"
                placeholderTextColor="#666666"
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Describe your program..."
                placeholderTextColor="#666666"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Goal and Level */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Goal</Text>
                <View style={styles.pickerContainer}>
                  {GOALS.map((goal) => (
                    <TouchableOpacity
                      key={goal}
                      style={[
                        styles.pickerItem,
                        formData.goal === goal && styles.pickerItemSelected,
                      ]}
                      onPress={() => updateFormData('goal', goal)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          formData.goal === goal && styles.pickerItemTextSelected,
                        ]}
                      >
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Level</Text>
                <View style={styles.pickerContainer}>
                  {LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.pickerItem,
                        formData.level === level && styles.pickerItemSelected,
                      ]}
                      onPress={() => updateFormData('level', level)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          formData.level === level && styles.pickerItemTextSelected,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Visibility */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Visibility</Text>
              <View style={styles.visibilityContainer}>
                <TouchableOpacity
                  style={[
                    styles.visibilityOption,
                    formData.is_public && styles.visibilityOptionSelected,
                  ]}
                  onPress={() => updateFormData('is_public', true)}
                >
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={formData.is_public ? '#0A84FF' : '#FFFFFF'}
                  />
                  <Text
                    style={[
                      styles.visibilityText,
                      formData.is_public && styles.visibilityTextSelected,
                    ]}
                  >
                    Public
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.visibilityOption,
                    !formData.is_public && styles.visibilityOptionSelected,
                  ]}
                  onPress={() => updateFormData('is_public', false)}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={!formData.is_public ? '#0A84FF' : '#FFFFFF'}
                  />
                  <Text
                    style={[
                      styles.visibilityText,
                      !formData.is_public && styles.visibilityTextSelected,
                    ]}
                  >
                    Private
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Program Phases */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PROGRAM PHASES</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setIsAddingPhase(true)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {formData.phases_config.length > 0 ? (
              <View style={styles.phasesList}>
                {formData.phases_config.map((phase, index) => (
                  <View key={index} style={styles.phaseItem}>
                    <BlurView intensity={30} tint="dark" style={styles.phaseItemBlur}>
                      <View style={styles.phaseItemContent}>
                        <View style={styles.phaseItemInfo}>
                          <Text style={styles.phaseItemName}>{phase.name}</Text>
                          <Text style={styles.phaseItemWeeks}>{phase.weeks} {phase.weeks === 1 ? 'week' : 'weeks'}</Text>
                          {phase.deload && (
                            <View style={styles.deloadBadge}>
                              <Text style={styles.deloadBadgeText}>Deload</Text>
                            </View>
                          )}
                        </View>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removePhase(index)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No phases added yet</Text>
                <Text style={styles.emptyStateSubtext}>Add phases to structure your program</Text>
              </View>
            )}
          </View>

          {/* Workout Builder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WORKOUT BUILDER</Text>

            {/* Week selector */}
            <WeekSelector
              totalWeeks={formData.duration_weeks}
              selectedWeek={selectedWeek}
              onWeekPress={handleWeekPress}
            />

            {/* Day selector */}
            <DaySelector
              selectedDay={selectedDay}
              onDayPress={handleDayPress}
            />

            {/* Current workout */}
            <View style={styles.workoutContainer}>
              <View style={styles.workoutHeader}>
                <TextInput
                  style={styles.workoutTitle}
                  value={currentWorkout?.title || `Week ${selectedWeek} Day ${selectedDay}`}
                  onChangeText={updateWorkoutTitle}
                  placeholder="Workout Title"
                  placeholderTextColor="#666666"
                />
                <TouchableOpacity
                  style={styles.addExerciseButton}
                  onPress={() => setIsAddingExercise(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#0A84FF" />
                  <Text style={styles.addExerciseText}>Add Exercise</Text>
                </TouchableOpacity>
              </View>

              {currentWorkout && currentWorkout.exercises.length > 0 ? (
                <View style={styles.exercisesList}>
                  {currentWorkout.exercises.map((exercise, index) => (
                    <View key={exercise.id} style={styles.exerciseItem}>
                      <BlurView intensity={30} tint="dark" style={styles.exerciseItemBlur}>
                        <View style={styles.exerciseItemContent}>
                          <View style={styles.exerciseItemInfo}>
                            <Text style={styles.exerciseItemName}>{exercise.name}</Text>
                            <Text style={styles.exerciseItemDetails}>
                              {exercise.sets} sets × {exercise.reps} • {exercise.rest}s rest
                            </Text>
                            {exercise.percentage && (
                              <Text style={styles.exerciseItemPercentage}>
                                {exercise.percentage}% of 1RM
                              </Text>
                            )}
                            {exercise.note && (
                              <Text style={styles.exerciseItemNote}>{exercise.note}</Text>
                            )}
                          </View>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeExerciseFromWorkout(exercise.id)}
                          >
                            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                          </TouchableOpacity>
                        </View>
                      </BlurView>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No exercises added yet</Text>
                  <Text style={styles.emptyStateSubtext}>Add exercises to build your workout</Text>
                </View>
              )}
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <Animated.View style={[styles.saveButtonWrapper, saveButtonAnimatedStyle]}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProgram}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Create Program</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Phase Modal */}
      {isAddingPhase && (
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Program Phase</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsAddingPhase(false)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phase Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Hypertrophy, Strength, etc."
                    placeholderTextColor="#666666"
                    onChangeText={(text) => {}}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Duration (weeks)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Number of weeks"
                    placeholderTextColor="#666666"
                    keyboardType="number-pad"
                    onChangeText={(text) => {}}
                  />
                </View>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => {}}
                  >
                    <Ionicons
                      name="checkbox-outline"
                      size={24}
                      color="#0A84FF"
                    />
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>This is a deload phase</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalAddButton}
                  onPress={() => addPhase('New Phase', 2, false)}
                >
                  <Text style={styles.modalAddButtonText}>Add Phase</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      )}

      {/* Add Exercise Modal */}
      {isAddingExercise && (
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Exercise</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsAddingExercise(false)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search exercises..."
                  placeholderTextColor="#666666"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <ScrollView style={styles.exerciseSearchResults}>
                {/* Mock exercise results */}
                {['Barbell Squat', 'Bench Press', 'Deadlift', 'Pull-up', 'Overhead Press'].map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.exerciseSearchItem}
                    onPress={() => addExerciseToWorkout({
                      id: `ex_${Date.now()}`,
                      name,
                      sets: 3,
                      reps: '8-12',
                      rest: 90,
                    })}
                  >
                    <Text style={styles.exerciseSearchItemName}>{name}</Text>
                    <Ionicons name="add-circle-outline" size={20} color="#0A84FF" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </BlurView>
        </View>
      )}
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#1C1C1E',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 14,
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderColor: '#0A84FF',
  },
  pickerItemText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  pickerItemTextSelected: {
    color: '#0A84FF',
    fontWeight: '500',
  },
  visibilityContainer: {
    flexDirection: 'row',
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  visibilityOptionSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderColor: '#0A84FF',
  },
  visibilityText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  visibilityTextSelected: {
    color: '#0A84FF',
    fontWeight: '500',
  },
  // Phase styles
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phasesList: {
    marginBottom: 16,
  },
  phaseItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  phaseItemBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  phaseItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  phaseItemInfo: {
    flex: 1,
  },
  phaseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  phaseItemWeeks: {
    fontSize: 14,
    color: '#AEAEB2',
  },
  deloadBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  deloadBadgeText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Workout builder styles
  workoutContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    padding: 0,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addExerciseText: {
    color: '#0A84FF',
    fontSize: 14,
    marginLeft: 4,
  },
  exercisesList: {
    marginBottom: 16,
  },
  exerciseItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exerciseItemBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseItemInfo: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseItemDetails: {
    fontSize: 14,
    color: '#AEAEB2',
    marginBottom: 2,
  },
  exerciseItemPercentage: {
    fontSize: 14,
    color: '#0A84FF',
    marginBottom: 2,
  },
  exerciseItemNote: {
    fontSize: 14,
    color: '#AEAEB2',
    fontStyle: 'italic',
  },
  // Empty state
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#AEAEB2',
    textAlign: 'center',
  },
  // Save button
  saveButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonWrapper: {
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalAddButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
    fontSize: 16,
  },
  exerciseSearchResults: {
    maxHeight: 300,
  },
  exerciseSearchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseSearchItemName: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
