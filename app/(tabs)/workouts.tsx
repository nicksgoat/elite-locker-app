import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert,
  KeyboardAvoidingView, Platform, FlatList
} from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Exercise, WorkoutExercise, ExerciseSet, WorkoutLog } from '@/types/workout';
import { mockExercises, mockWorkouts } from '@/data/mockData';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';
import { v4 as uuidv4 } from 'uuid';

export default function WorkoutsScreen() {
  const router = useRouter();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(mockWorkouts);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);

  // New workout form state
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [isSelectingExercise, setIsSelectingExercise] = useState(false);

  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}` as any);
  };

  const handleCreateTemplate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/workout/template/create' as any);
  };

  const startLoggingWorkout = () => {
    setIsLoggingWorkout(true);
    setWorkoutTitle('');
    setWorkoutExercises([]);
  };

  const cancelLoggingWorkout = () => {
    setIsLoggingWorkout(false);
    setWorkoutTitle('');
    setWorkoutExercises([]);
    setIsSelectingExercise(false);
  };

  const openExerciseSelector = () => {
    setIsSelectingExercise(true);
  };

  const selectExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: uuidv4(),
      exerciseId: exercise.id,
      exercise,
      sets: [
        { id: uuidv4(), weight: undefined, reps: undefined, completed: false },
      ],
    };
    
    setWorkoutExercises([...workoutExercises, newExercise]);
    setIsSelectingExercise(false);
  };

  const addSetToExercise = (exerciseIndex: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets.push({
      id: uuidv4(),
      weight: undefined,
      reps: undefined,
      completed: false,
    });
    setWorkoutExercises(updatedExercises);
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setWorkoutExercises(updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises.splice(exerciseIndex, 1);
    setWorkoutExercises(updatedExercises);
  };

  const updateSetValue = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = numValue;
    setWorkoutExercises(updatedExercises);
  };

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...workoutExercises];
    const currentSet = updatedExercises[exerciseIndex].sets[setIndex];
    currentSet.completed = !currentSet.completed;
    setWorkoutExercises(updatedExercises);
  };

  const saveWorkout = () => {
    // Validate workout data
    if (!workoutTitle.trim()) {
      Alert.alert('Error', 'Please enter a workout title');
      return;
    }

    if (workoutExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    let isValid = true;
    let invalidExerciseIndex = -1;
    let invalidSetIndex = -1;

    workoutExercises.forEach((exercise, exIndex) => {
      if (!isValid) return;
      
      if (exercise.sets.length === 0) {
        isValid = false;
        invalidExerciseIndex = exIndex;
        return;
      }

      exercise.sets.forEach((set, setIndex) => {
        if (!isValid) return;
        
        if (set.weight === undefined && set.reps === undefined) {
          isValid = false;
          invalidExerciseIndex = exIndex;
          invalidSetIndex = setIndex;
        }
      });
    });

    if (!isValid) {
      if (invalidSetIndex >= 0) {
        Alert.alert('Error', `Please enter weight or reps for all sets in ${workoutExercises[invalidExerciseIndex].exercise.name}`);
      } else {
        Alert.alert('Error', `Please add at least one set to ${workoutExercises[invalidExerciseIndex].exercise.name}`);
      }
      return;
    }

    // Create new workout
    const newWorkout: WorkoutLog = {
      id: uuidv4(),
      title: workoutTitle,
      date: new Date(),
      exercises: workoutExercises,
      supersets: [],
      duration: 0, // You would calculate this in a real app
      isComplete: true,
    };

    // Add to workout logs
    setWorkoutLogs([newWorkout, ...workoutLogs]);
    
    // Reset form
    setIsLoggingWorkout(false);
    setWorkoutTitle('');
    setWorkoutExercises([]);
    
    // Show success message
    Alert.alert('Success', 'Workout logged successfully!');
  };

  const renderExerciseItem = useCallback(({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => selectExercise(item)}
    >
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseMuscleGroups}>
        {item.muscleGroups?.join(', ')}
      </Text>
    </TouchableOpacity>
  ), []);

  // If in exercise selection mode
  if (isSelectingExercise) {
    return (
      <IMessagePageWrapper
        title="Select Exercise"
        subtitle="Choose an exercise to add"
        showBackButton
        onBackPress={() => setIsSelectingExercise(false)}
      >
        <FlatList
          data={mockExercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.exerciseList}
        />
      </IMessagePageWrapper>
    );
  }

  // If in workout logging mode
  if (isLoggingWorkout) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <IMessagePageWrapper
          title="Log Workout"
          subtitle="Track your exercises and progress"
          showBackButton
          onBackPress={cancelLoggingWorkout}
        >
          <ScrollView style={styles.container}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Workout Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Upper Body Strength"
                placeholderTextColor="#666"
                value={workoutTitle}
                onChangeText={setWorkoutTitle}
              />
            </View>

            <View style={styles.exercisesContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <TouchableOpacity onPress={openExerciseSelector} style={styles.addButton}>
                  <Ionicons name="add-circle" size={24} color="#FFF" />
                  <Text style={styles.addButtonText}>Add Exercise</Text>
                </TouchableOpacity>
              </View>

              {workoutExercises.map((exercise, exerciseIndex) => (
                <Animated.View 
                  key={exercise.id} 
                  style={styles.exerciseCard}
                  entering={FadeInDown.duration(300).delay(exerciseIndex * 100)}
                  exiting={FadeOutUp.duration(300)}
                >
                  <View style={styles.exerciseCardHeader}>
                    <Text style={styles.exerciseCardTitle}>{exercise.exercise.name}</Text>
                    <TouchableOpacity onPress={() => removeExercise(exerciseIndex)}>
                      <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>

                  {/* Set header */}
                  <View style={styles.setHeader}>
                    <Text style={styles.setHeaderText}>Set</Text>
                    <Text style={styles.setHeaderText}>Weight (kg)</Text>
                    <Text style={styles.setHeaderText}>Reps</Text>
                    <Text style={styles.setHeaderText}>Done</Text>
                    <View style={{ width: 24 }} />
                  </View>

                  {/* Sets */}
                  {exercise.sets.map((set, setIndex) => (
                    <Animated.View 
                      key={set.id} 
                      style={styles.setRow}
                      entering={FadeInDown.duration(200).delay(setIndex * 50)}
                    >
                      <Text style={styles.setText}>{setIndex + 1}</Text>
                      <TextInput
                        style={styles.setInput}
                        placeholder="0"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={set.weight?.toString() || ''}
                        onChangeText={(value) => updateSetValue(exerciseIndex, setIndex, 'weight', value)}
                      />
                      <TextInput
                        style={styles.setInput}
                        placeholder="0"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={set.reps?.toString() || ''}
                        onChangeText={(value) => updateSetValue(exerciseIndex, setIndex, 'reps', value)}
                      />
                      <TouchableOpacity onPress={() => toggleSetCompleted(exerciseIndex, setIndex)}>
                        <Ionicons
                          name={set.completed ? "checkmark-circle" : "ellipse-outline"}
                          size={24}
                          color={set.completed ? "#5cb85c" : "#ccc"}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeSetFromExercise(exerciseIndex, setIndex)}>
                        <Ionicons name="remove-circle-outline" size={24} color="#ccc" />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}

                  {/* Add set button */}
                  <TouchableOpacity 
                    style={styles.addSetButton}
                    onPress={() => addSetToExercise(exerciseIndex)}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                    <Text style={styles.addSetButtonText}>Add Set</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {workoutExercises.length > 0 && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveWorkout}
              >
                <Text style={styles.saveButtonText}>Save Workout</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </IMessagePageWrapper>
      </KeyboardAvoidingView>
    );
  }

  // Main screen
  return (
    <IMessagePageWrapper
      title="Workouts"
      subtitle="Track your fitness routine"
      showHeader={false}
    >
      <View style={styles.mainTitleContainer}>
        <Text style={styles.mainTitle}>Workouts</Text>
        <Text style={styles.mainSubtitle}>Track your fitness routine</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={startLoggingWorkout}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Log Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCreateTemplate}
          activeOpacity={0.8}
        >
          <Ionicons name="create" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Create Template</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        <TouchableOpacity onPress={() => router.push('/workout/history' as any)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.recentWorkoutsContainer}
      >
        {workoutLogs.slice(0, 3).map(workout => {
          const { WorkoutCard } = require('@/components/design-system/cards');
          return (
            <WorkoutCard
              key={workout.id}
              workout={{
                id: workout.id,
                title: workout.title,
                exerciseCount: workout.exercises.length,
                duration: workout.duration,
                date: formatWorkoutDate(workout.date),
              }}
              variant="default"
              onPress={() => handleWorkoutPress(workout.id)}
            />
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Templates</Text>
        <TouchableOpacity onPress={() => router.push('/workout/template' as any)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesContainer}>
        <TemplateCard
          title="Push-Pull-Legs"
          exercises={12}
          id="t1"
          onPress={handleWorkoutPress}
        />
        <TemplateCard
          title="5x5 Strength"
          exercises={5}
          id="t2"
          onPress={handleWorkoutPress}
        />
        <TemplateCard
          title="HIIT Circuit"
          exercises={8}
          id="t3"
          onPress={handleWorkoutPress}
        />
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Workout Log</Text>
      </View>

      {workoutLogs.length > 0 ? (
        <FlatList
          data={workoutLogs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.logItem}
              onPress={() => handleWorkoutPress(item.id)}
            >
              <View style={styles.logItemHeader}>
                <Text style={styles.logItemTitle}>{item.title}</Text>
                <Text style={styles.logItemDate}>{formatWorkoutDate(item.date)}</Text>
              </View>
              <View style={styles.logItemStats}>
                <View style={styles.logItemStat}>
                  <Ionicons name="barbell-outline" size={16} color="#999" />
                  <Text style={styles.logItemStatText}>{item.exercises.length} exercises</Text>
                </View>
                <View style={styles.logItemStat}>
                  <Ionicons name="time-outline" size={16} color="#999" />
                  <Text style={styles.logItemStatText}>{formatDuration(item.duration)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          style={styles.logList}
          contentContainerStyle={styles.logListContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={48} color="#555" />
          <Text style={styles.emptyStateText}>No workouts logged yet</Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={startLoggingWorkout}
          >
            <Text style={styles.emptyStateButtonText}>Log Your First Workout</Text>
          </TouchableOpacity>
        </View>
      )}
    </IMessagePageWrapper>
  );
}

// Helper functions
const formatWorkoutDate = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
};

// Template Card Component
interface TemplateCardProps {
  title: string;
  exercises: number;
  id: string;
  onPress: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ title, exercises, id, onPress }) => {
  // Import design system tokens
  const { colors } = require('@/components/design-system/tokens');

  // Get template icon color based on workout name
  const getTemplateIconColor = () => {
    if (title.toLowerCase().includes('push-pull-legs') ||
        title.toLowerCase().includes('ppl')) {
      return colors.palette.purple500; // Purple
    } else if (title.toLowerCase().includes('strength') ||
              title.toLowerCase().includes('5x5')) {
      return colors.palette.blue500; // Blue
    } else if (title.toLowerCase().includes('hiit') ||
              title.toLowerCase().includes('circuit') ||
              title.toLowerCase().includes('cardio')) {
      return colors.palette.orange500; // Orange
    }
    return colors.palette.green500; // Green default for templates
  };

  return (
    <TouchableOpacity
      style={styles.darkCard}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Card header with template name and icon */}
        <View style={styles.darkCardHeader}>
          <View style={[styles.workoutIcon, { backgroundColor: getTemplateIconColor() }]} />
          <Text style={styles.darkCardTitle}>{title}</Text>
        </View>

        {/* Stats row with exercises and start button */}
        <View style={styles.darkStatsRow}>
          <View style={styles.darkStatItem}>
            <Ionicons name="barbell-outline" size={16} color={colors.light.icon.secondary} />
            <Text style={styles.darkStatValue}>{exercises} exercises</Text>
          </View>

          <View style={styles.darkStartContainer}>
            <Ionicons name="play-circle" size={16} color={colors.palette.blue500} />
            <Text style={styles.darkStartText}>Start</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create(() => {
  // Import design system tokens
  const { colors, typography, spacing } = require('@/components/design-system/tokens');

  return {
    container: {
      flex: 1,
    },
    mainTitleContainer: {
      paddingHorizontal: spacing.spacing.lg,
      paddingTop: spacing.spacing.md,
      paddingBottom: spacing.spacing.sm,
    },
    mainTitle: {
      ...typography.textVariants.h1,
      color: colors.light.text.primary,
    },
    mainSubtitle: {
      ...typography.textVariants.body,
      color: colors.light.text.secondary,
      marginTop: spacing.spacing.xs,
    },
    actionsContainer: {
      flexDirection: 'row',
      marginHorizontal: spacing.spacing.lg,
      marginTop: spacing.spacing.sm,
      marginBottom: spacing.spacing.xxl,
      gap: spacing.spacing.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.dark.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.md,
      paddingHorizontal: spacing.spacing.lg,
      borderWidth: 1,
      borderColor: colors.dark.border.primary,
    },
    actionButtonText: {
      ...typography.textVariants.button,
      color: colors.dark.text.inverse,
      marginLeft: spacing.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.md,
      paddingHorizontal: spacing.spacing.lg,
    },
    sectionTitle: {
      ...typography.textVariants.h3,
      color: colors.dark.text.primary,
    },
    viewAllText: {
      ...typography.textVariants.link,
      color: colors.dark.brand.primary,
    },
    recentWorkoutsContainer: {
      marginBottom: spacing.spacing.xxl,
      paddingHorizontal: spacing.spacing.lg,
    },
    templatesContainer: {
      marginBottom: spacing.spacing.xxl,
      paddingHorizontal: spacing.spacing.lg,
    },
    cardContent: {
      padding: spacing.spacing.md,
    },
    workoutIcon: {
      width: 32,
      height: 32,
      borderRadius: spacing.layout.borderRadius.sm,
      marginRight: spacing.spacing.md,
    },

    // Dark card styles
    darkCard: {
      width: 240,
      marginRight: spacing.spacing.md,
      borderRadius: spacing.layout.borderRadius.md,
      marginBottom: spacing.spacing.md,
      backgroundColor: colors.dark.background.card,
      overflow: 'hidden',
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
    },
    darkCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.spacing.xs,
    },
    darkCardTitle: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
      flex: 1,
    },
    darkDateText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginBottom: spacing.spacing.sm,
    },
    darkStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.spacing.xs,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    darkStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.spacing.lg,
      marginBottom: spacing.spacing.xs,
    },
    darkStatValue: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.primary,
      marginLeft: spacing.spacing.xs,
      fontWeight: typography.fontWeights.medium,
    },
    darkStartContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    darkStartText: {
      ...typography.textVariants.bodySmallSemiBold,
      color: colors.dark.brand.primary,
      marginLeft: spacing.spacing.xs,
    },

    // Workout log form styles
    formGroup: {
      marginBottom: spacing.spacing.lg,
      paddingHorizontal: spacing.spacing.lg,
    },
    formLabel: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
      marginBottom: spacing.spacing.xs,
    },
    textInput: {
      backgroundColor: colors.dark.background.input,
      borderRadius: spacing.layout.borderRadius.sm,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      paddingVertical: spacing.spacing.sm,
      paddingHorizontal: spacing.spacing.md,
      color: colors.dark.text.primary,
      ...typography.textVariants.body,
    },
    exercisesContainer: {
      marginBottom: spacing.spacing.xl,
    },
    exerciseCard: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      marginBottom: spacing.spacing.md,
      padding: spacing.spacing.md,
      marginHorizontal: spacing.spacing.lg,
    },
    exerciseCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.md,
    },
    exerciseCardTitle: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
    },
    setHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.sm,
      borderBottomWidth: spacing.layout.borderWidth.thin,
      borderBottomColor: colors.dark.border.primary,
      paddingBottom: spacing.spacing.xs,
    },
    setHeaderText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      flex: 1,
      textAlign: 'center',
    },
    setRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.xs,
    },
    setText: {
      ...typography.textVariants.body,
      color: colors.dark.text.primary,
      width: 30,
      textAlign: 'center',
    },
    setInput: {
      backgroundColor: colors.dark.background.input,
      borderRadius: spacing.layout.borderRadius.sm,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      padding: spacing.spacing.xs,
      width: 60,
      textAlign: 'center',
      color: colors.dark.text.primary,
      ...typography.textVariants.body,
    },
    addSetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.dark.background.subtle,
      borderRadius: spacing.layout.borderRadius.sm,
      paddingVertical: spacing.spacing.xs,
      marginTop: spacing.spacing.sm,
    },
    addSetButtonText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.primary,
      marginLeft: spacing.spacing.xs,
    },
    saveButton: {
      backgroundColor: colors.dark.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.md,
      marginHorizontal: spacing.spacing.lg,
      marginBottom: spacing.spacing.xl,
      alignItems: 'center',
    },
    saveButtonText: {
      ...typography.textVariants.button,
      color: colors.dark.text.inverse,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addButtonText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.brand.primary,
      marginLeft: spacing.spacing.xs,
    },

    // Exercise selection styles
    exerciseList: {
      padding: spacing.spacing.lg,
    },
    exerciseItem: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      padding: spacing.spacing.md,
      marginBottom: spacing.spacing.sm,
    },
    exerciseName: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
    },
    exerciseMuscleGroups: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginTop: spacing.spacing.xs,
    },

    // Log list styles
    logList: {
      flex: 1,
    },
    logListContent: {
      paddingHorizontal: spacing.spacing.lg,
      paddingBottom: spacing.spacing.xxl,
    },
    logItem: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      padding: spacing.spacing.md,
      marginBottom: spacing.spacing.md,
    },
    logItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.xs,
    },
    logItemTitle: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
    },
    logItemDate: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
    },
    logItemStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logItemStat: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.spacing.md,
    },
    logItemStatText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginLeft: spacing.spacing.xs,
    },

    // Empty state
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.spacing.xl,
    },
    emptyStateText: {
      ...typography.textVariants.body,
      color: colors.dark.text.secondary,
      marginTop: spacing.spacing.md,
      marginBottom: spacing.spacing.lg,
    },
    emptyStateButton: {
      backgroundColor: colors.dark.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.sm,
      paddingHorizontal: spacing.spacing.lg,
    },
    emptyStateButtonText: {
      ...typography.textVariants.button,
      color: colors.dark.text.inverse,
    },
  };
})();