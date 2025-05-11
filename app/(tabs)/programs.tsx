import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';
import { mockPrograms, mockWorkouts } from '@/data/mockData';
import { Program, ProgramDay, ProgramWeek, ProgramWorkout } from '@/types/workout';
import { v4 as uuidv4 } from 'uuid';

export default function ProgramsScreen() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>(mockPrograms);
  
  // Program creation state
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [programTitle, setProgramTitle] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [programLevel, setProgramLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [programDuration, setProgramDuration] = useState('4'); // in weeks
  const [programWeeks, setProgramWeeks] = useState<ProgramWeek[]>([]);
  const [activeWorkoutCell, setActiveWorkoutCell] = useState<{weekIndex: number, dayIndex: number} | null>(null);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);

  // For drag and drop
  const draggedItem = useSharedValue<{
    workoutId: string;
    weekIndex: number;
    dayIndex: number;
  } | null>(null);
  const dragPosition = useSharedValue({ x: 0, y: 0 });
  const dragOffset = useSharedValue({ x: 0, y: 0 });

  const handleProgramPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/detail/${id}` as any);
  };

  const startCreatingProgram = () => {
    setIsCreatingProgram(true);
    setProgramTitle('');
    setProgramDescription('');
    setProgramLevel('intermediate');
    setProgramDuration('4');
    
    // Initialize program weeks and days
    const initialWeeks: ProgramWeek[] = Array.from({ length: 4 }, (_, weekIndex) => ({
      id: uuidv4(),
      weekNumber: weekIndex + 1,
      days: Array.from({ length: 7 }, (_, dayIndex) => ({
        id: uuidv4(),
        name: getDayName(dayIndex),
        dayOfWeek: dayIndex,
        workouts: [],
      })),
    }));
    
    setProgramWeeks(initialWeeks);
  };

  const cancelCreatingProgram = () => {
    setIsCreatingProgram(false);
    setActiveWorkoutCell(null);
    setShowWorkoutSelector(false);
  };

  const updateProgramDuration = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) {
      setProgramDuration('1');
      return;
    }
    
    if (numValue > 12) {
      setProgramDuration('12');
      return;
    }
    
    setProgramDuration(value);
    
    // Update program weeks array based on new duration
    const newDuration = parseInt(value);
    const currentWeeks = [...programWeeks];
    
    if (newDuration > currentWeeks.length) {
      // Add new weeks
      const newWeeks: ProgramWeek[] = Array.from(
        { length: newDuration - currentWeeks.length },
        (_, index) => ({
          id: uuidv4(),
          weekNumber: currentWeeks.length + index + 1,
          days: Array.from({ length: 7 }, (_, dayIndex) => ({
            id: uuidv4(),
            name: getDayName(dayIndex),
            dayOfWeek: dayIndex,
            workouts: [],
          })),
        })
      );
      setProgramWeeks([...currentWeeks, ...newWeeks]);
    } else if (newDuration < currentWeeks.length) {
      // Remove excess weeks
      setProgramWeeks(currentWeeks.slice(0, newDuration));
    }
  };

  const handleCellPress = (weekIndex: number, dayIndex: number) => {
    setActiveWorkoutCell({ weekIndex, dayIndex });
    setShowWorkoutSelector(true);
  };

  const addWorkoutToCell = (workout: any) => {
    if (!activeWorkoutCell) return;
    
    const { weekIndex, dayIndex } = activeWorkoutCell;
    const updatedWeeks = [...programWeeks];
    
    const programWorkout: ProgramWorkout = {
      id: uuidv4(),
      programId: '',
      workoutId: workout.id,
      title: workout.title,
      exercises: workout.exercises,
      supersets: workout.supersets || [],
      duration: workout.duration,
    };
    
    updatedWeeks[weekIndex].days[dayIndex].workouts.push(programWorkout);
    setProgramWeeks(updatedWeeks);
    setShowWorkoutSelector(false);
    setActiveWorkoutCell(null);
  };

  const removeWorkoutFromCell = (weekIndex: number, dayIndex: number, workoutIndex: number) => {
    const updatedWeeks = [...programWeeks];
    updatedWeeks[weekIndex].days[dayIndex].workouts.splice(workoutIndex, 1);
    setProgramWeeks(updatedWeeks);
  };

  const saveProgram = () => {
    if (!programTitle.trim()) {
      Alert.alert('Error', 'Please enter a program title');
      return;
    }

    if (parseInt(programDuration) < 1) {
      Alert.alert('Error', 'Program duration must be at least 1 week');
      return;
    }

    // Check if there's at least one workout in the program
    let hasWorkouts = false;
    for (const week of programWeeks) {
      for (const day of week.days) {
        if (day.workouts.length > 0) {
          hasWorkouts = true;
          break;
        }
      }
      if (hasWorkouts) break;
    }

    if (!hasWorkouts) {
      Alert.alert('Error', 'Please add at least one workout to your program');
      return;
    }

    // Create new program
    const newProgram: Program = {
      id: uuidv4(),
      title: programTitle,
      description: programDescription,
      level: programLevel,
      duration: parseInt(programDuration),
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: 'user1', // Replace with actual user ID in a real app
      isPaid: false,
    };

    // Add program
    setPrograms([newProgram, ...programs]);
    
    // Reset form
    setIsCreatingProgram(false);
    
    // Show success message
    Alert.alert('Success', 'Program created successfully!');
  };

  // Handle drag start
  const startDrag = (workoutId: string, weekIndex: number, dayIndex: number, x: number, y: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    draggedItem.value = { workoutId, weekIndex, dayIndex };
    dragOffset.value = { x, y };
  };

  // Handle drag end
  const endDrag = (x: number, y: number, targetWeekIndex: number, targetDayIndex: number) => {
    if (draggedItem.value) {
      const { workoutId, weekIndex, dayIndex } = draggedItem.value;
      
      // Only proceed if dropping in a different cell
      if (weekIndex !== targetWeekIndex || dayIndex !== targetDayIndex) {
        const updatedWeeks = [...programWeeks];
        
        // Find the workout in the source cell
        const workout = updatedWeeks[weekIndex].days[dayIndex].workouts.find(
          w => w.id === workoutId
        );
        
        if (workout) {
          // Remove from source
          updatedWeeks[weekIndex].days[dayIndex].workouts = updatedWeeks[weekIndex].days[dayIndex].workouts.filter(
            w => w.id !== workoutId
          );
          
          // Add to target
          updatedWeeks[targetWeekIndex].days[targetDayIndex].workouts.push(workout);
          
          // Update state
          setProgramWeeks(updatedWeeks);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    }
    
    // Reset drag state
    draggedItem.value = null;
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      // Initialize drag position
      dragPosition.value = { x: e.x, y: e.y };
    })
    .onUpdate((e) => {
      // Update position during drag
      dragPosition.value = { x: e.x, y: e.y };
    })
    .onEnd(() => {
      // Reset on end
      dragPosition.value = { x: 0, y: 0 };
    });

  // If showing workout selector
  if (showWorkoutSelector) {
    return (
      <IMessagePageWrapper
        title="Select Workout"
        subtitle="Choose a workout to add"
        showBackButton
        onBackPress={() => {
          setShowWorkoutSelector(false);
          setActiveWorkoutCell(null);
        }}
      >
        <FlatList
          data={mockWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.workoutListItem}
              onPress={() => addWorkoutToCell(item)}
            >
              <Text style={styles.workoutListItemTitle}>{item.title}</Text>
              <View style={styles.workoutListItemStats}>
                <View style={styles.workoutListItemStat}>
                  <Ionicons name="barbell-outline" size={16} color="#999" />
                  <Text style={styles.workoutListItemStatText}>{item.exercises.length} exercises</Text>
                </View>
                <View style={styles.workoutListItemStat}>
                  <Ionicons name="time-outline" size={16} color="#999" />
                  <Text style={styles.workoutListItemStatText}>
                    {Math.floor(item.duration / 60)} min
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.workoutListContent}
        />
      </IMessagePageWrapper>
    );
  }

  // If creating a program
  if (isCreatingProgram) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <IMessagePageWrapper
            title="Create Program"
            subtitle="Design your training program"
            showBackButton
            onBackPress={cancelCreatingProgram}
          >
            <ScrollView 
              style={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Program Title</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 8-Week Strength Builder"
                  placeholderTextColor="#666"
                  value={programTitle}
                  onChangeText={setProgramTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe your program..."
                  placeholderTextColor="#666"
                  value={programDescription}
                  onChangeText={setProgramDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.formLabel}>Duration (weeks)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="4"
                    placeholderTextColor="#666"
                    value={programDuration}
                    onChangeText={updateProgramDuration}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Level</Text>
                  <View style={styles.levelSelector}>
                    {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.levelOption,
                          programLevel === level && styles.levelOptionSelected,
                        ]}
                        onPress={() => setProgramLevel(level)}
                      >
                        <Text
                          style={[
                            styles.levelOptionText,
                            programLevel === level && styles.levelOptionTextSelected,
                          ]}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.programGridContainer}>
                <Text style={styles.sectionTitle}>Program Schedule</Text>
                <Text style={styles.sectionSubtitle}>
                  Tap to add workouts, drag to rearrange
                </Text>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={styles.programGrid}>
                    {/* Header Row with Day Names */}
                    <View style={styles.headerRow}>
                      <View style={styles.weekHeaderCell}>
                        <Text style={styles.headerText}>Week</Text>
                      </View>
                      {Array.from({ length: 7 }, (_, i) => (
                        <View key={`header-${i}`} style={styles.headerCell}>
                          <Text style={styles.headerText}>{getDayName(i).substring(0, 3)}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Program Weeks */}
                    {programWeeks.map((week, weekIndex) => (
                      <View key={week.id} style={styles.weekRow}>
                        {/* Week Number */}
                        <View style={styles.weekHeaderCell}>
                          <Text style={styles.weekText}>Week {week.weekNumber}</Text>
                        </View>

                        {/* Days of the Week */}
                        {week.days.map((day, dayIndex) => (
                          <GestureDetector 
                            key={day.id} 
                            gesture={panGesture}
                          >
                            <View
                              style={styles.dayCell}
                              onTouchEnd={() => {
                                if (day.workouts.length === 0) {
                                  handleCellPress(weekIndex, dayIndex);
                                }
                              }}
                            >
                              {day.workouts.length > 0 ? (
                                day.workouts.map((workout, workoutIndex) => (
                                  <TouchableOpacity
                                    key={workout.id}
                                    style={styles.workoutCell}
                                    onLongPress={(e) => {
                                      startDrag(workout.id, weekIndex, dayIndex, e.nativeEvent.locationX, e.nativeEvent.locationY);
                                    }}
                                    onPress={() => {
                                      // Show options for the workout
                                      Alert.alert(
                                        'Workout Options',
                                        'What would you like to do?',
                                        [
                                          {
                                            text: 'Remove',
                                            style: 'destructive',
                                            onPress: () => removeWorkoutFromCell(weekIndex, dayIndex, workoutIndex),
                                          },
                                          {
                                            text: 'Cancel',
                                            style: 'cancel',
                                          },
                                        ]
                                      );
                                    }}
                                  >
                                    <Text style={styles.workoutTitle}>{workout.title}</Text>
                                    <Text style={styles.workoutDetails}>
                                      {workout.exercises.length} exercises
                                    </Text>
                                  </TouchableOpacity>
                                ))
                              ) : (
                                <TouchableOpacity
                                  style={styles.emptyCell}
                                  onPress={() => handleCellPress(weekIndex, dayIndex)}
                                >
                                  <Ionicons name="add" size={20} color="#666" />
                                </TouchableOpacity>
                              )}
                            </View>
                          </GestureDetector>
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProgram}
              >
                <Text style={styles.saveButtonText}>Save Program</Text>
              </TouchableOpacity>
            </ScrollView>
          </IMessagePageWrapper>
        </GestureHandlerRootView>
      </KeyboardAvoidingView>
    );
  }

  // Main programs screen
  return (
    <IMessagePageWrapper
      title="Programs"
      subtitle="Build and follow workout programs"
      showHeader={false}
    >
      <View style={styles.mainTitleContainer}>
        <Text style={styles.mainTitle}>Programs</Text>
        <Text style={styles.mainSubtitle}>Build and follow workout programs</Text>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={startCreatingProgram}
      >
        <Ionicons name="add-circle" size={22} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Program</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Programs</Text>
      </View>

      {programs.length > 0 ? (
        <FlatList
          data={programs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.programItem}
              onPress={() => handleProgramPress(item.id)}
            >
              <View style={styles.programHeader}>
                <Text style={styles.programTitle}>{item.title}</Text>
                <View style={styles.programLevelBadge}>
                  <Text style={styles.programLevelText}>{item.level}</Text>
                </View>
              </View>
              
              {item.description && (
                <Text style={styles.programDescription}>{item.description}</Text>
              )}
              
              <View style={styles.programStats}>
                <View style={styles.programStat}>
                  <Ionicons name="calendar-outline" size={16} color="#999" />
                  <Text style={styles.programStatText}>{item.duration} weeks</Text>
                </View>
                
                {item.isPaid && (
                  <View style={styles.programStat}>
                    <Ionicons name="pricetag-outline" size={16} color="#999" />
                    <Text style={styles.programStatText}>${item.price?.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          style={styles.programList}
          contentContainerStyle={styles.programListContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#555" />
          <Text style={styles.emptyStateText}>No programs created yet</Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={startCreatingProgram}
          >
            <Text style={styles.emptyStateButtonText}>Create Your First Program</Text>
          </TouchableOpacity>
        </View>
      )}
    </IMessagePageWrapper>
  );
}

// Helper functions
const getDayName = (dayIndex: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayIndex];
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
      color: colors.dark.text.primary,
    },
    mainSubtitle: {
      ...typography.textVariants.body,
      color: colors.dark.text.secondary,
      marginTop: spacing.spacing.xs,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.dark.brand.primary,
      borderRadius: spacing.layout.borderRadius.md,
      paddingVertical: spacing.spacing.md,
      margin: spacing.spacing.lg,
      marginBottom: spacing.spacing.xl,
      borderWidth: 1,
      borderColor: colors.dark.border.primary,
    },
    createButtonText: {
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
    sectionSubtitle: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginTop: spacing.spacing.xs,
      marginBottom: spacing.spacing.md,
    },
    programList: {
      flex: 1,
    },
    programListContent: {
      paddingHorizontal: spacing.spacing.lg,
      paddingBottom: spacing.spacing.xxl,
    },
    programItem: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      padding: spacing.spacing.md,
      marginBottom: spacing.spacing.md,
    },
    programHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.spacing.xs,
    },
    programTitle: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
      flex: 1,
    },
    programLevelBadge: {
      backgroundColor: colors.dark.background.subtle,
      paddingHorizontal: spacing.spacing.sm,
      paddingVertical: spacing.spacing.xs / 2,
      borderRadius: spacing.layout.borderRadius.sm,
    },
    programLevelText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
    },
    programDescription: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginBottom: spacing.spacing.xs,
    },
    programStats: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.spacing.xs,
    },
    programStat: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.spacing.md,
    },
    programStatText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginLeft: spacing.spacing.xs,
    },
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

    // Form styles
    formGroup: {
      marginBottom: spacing.spacing.lg,
      paddingHorizontal: spacing.spacing.lg,
    },
    formRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.spacing.lg,
      marginBottom: spacing.spacing.lg,
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
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    levelSelector: {
      flexDirection: 'row',
      backgroundColor: colors.dark.background.input,
      borderRadius: spacing.layout.borderRadius.sm,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      overflow: 'hidden',
    },
    levelOption: {
      flex: 1,
      paddingVertical: spacing.spacing.sm,
      alignItems: 'center',
    },
    levelOptionSelected: {
      backgroundColor: colors.dark.brand.primary,
    },
    levelOptionText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.primary,
    },
    levelOptionTextSelected: {
      color: colors.dark.text.inverse,
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

    // Program grid styles
    programGridContainer: {
      paddingHorizontal: spacing.spacing.lg,
      marginBottom: spacing.spacing.xl,
    },
    programGrid: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      overflow: 'hidden',
      marginBottom: spacing.spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      borderBottomWidth: spacing.layout.borderWidth.thin,
      borderBottomColor: colors.dark.border.primary,
    },
    headerCell: {
      width: 85,
      paddingVertical: spacing.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: spacing.layout.borderWidth.thin,
      borderRightColor: colors.dark.border.primary,
    },
    weekHeaderCell: {
      width: 80,
      paddingVertical: spacing.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: spacing.layout.borderWidth.thin,
      borderRightColor: colors.dark.border.primary,
      backgroundColor: colors.dark.background.subtle,
    },
    headerText: {
      ...typography.textVariants.bodySmallSemiBold,
      color: colors.dark.text.secondary,
    },
    weekRow: {
      flexDirection: 'row',
      borderBottomWidth: spacing.layout.borderWidth.thin,
      borderBottomColor: colors.dark.border.primary,
    },
    weekText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
    },
    dayCell: {
      width: 85,
      height: 80,
      borderRightWidth: spacing.layout.borderWidth.thin,
      borderRightColor: colors.dark.border.primary,
      padding: spacing.spacing.xs,
    },
    emptyCell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.dark.border.secondary,
      borderRadius: spacing.layout.borderRadius.sm,
    },
    workoutCell: {
      backgroundColor: colors.dark.brand.primary + '30',
      borderRadius: spacing.layout.borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.dark.brand.primary + '50',
      padding: spacing.spacing.xs,
      marginBottom: spacing.spacing.xs,
    },
    workoutTitle: {
      ...typography.textVariants.bodySmallSemiBold,
      color: colors.dark.text.primary,
      fontSize: 10,
    },
    workoutDetails: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      fontSize: 8,
    },

    // Workout selector styles
    workoutListContent: {
      padding: spacing.spacing.lg,
    },
    workoutListItem: {
      backgroundColor: colors.dark.background.card,
      borderRadius: spacing.layout.borderRadius.md,
      borderWidth: spacing.layout.borderWidth.thin,
      borderColor: colors.dark.border.primary,
      padding: spacing.spacing.md,
      marginBottom: spacing.spacing.sm,
    },
    workoutListItemTitle: {
      ...typography.textVariants.bodySemiBold,
      color: colors.dark.text.primary,
    },
    workoutListItemStats: {
      flexDirection: 'row',
      marginTop: spacing.spacing.xs,
    },
    workoutListItemStat: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.spacing.md,
    },
    workoutListItemStatText: {
      ...typography.textVariants.bodySmall,
      color: colors.dark.text.secondary,
      marginLeft: spacing.spacing.xs,
    },
  };
})(); 