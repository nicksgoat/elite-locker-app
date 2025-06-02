import { useWorkout } from '@/contexts/WorkoutContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ExerciseMax {
  name: string;
  weight: string;
  isValid: boolean;
}

export default function TrainingMaxSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { exercises, templateId, returnTo } = useLocalSearchParams();
  const { updateTrainingMax, continueTemplateWorkout } = useWorkout();

  const [exerciseMaxes, setExerciseMaxes] = useState<ExerciseMax[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    if (exercises && typeof exercises === 'string') {
      const exerciseList = exercises.split(',');
      setExerciseMaxes(exerciseList.map(name => ({
        name: name.trim(),
        weight: '',
        isValid: false
      })));
    }
  }, [exercises]);

  const handleWeightChange = (index: number, weight: string) => {
    setExerciseMaxes(prev => prev.map((ex, i) =>
      i === index
        ? {
            ...ex,
            weight,
            isValid: weight.trim() !== '' && !isNaN(parseFloat(weight)) && parseFloat(weight) > 0
          }
        : ex
    ));
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exerciseMaxes.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSubmit = async () => {
    // Validate all weights are entered
    const invalidExercises = exerciseMaxes.filter(ex => !ex.isValid);
    if (invalidExercises.length > 0) {
      Alert.alert(
        'Missing Training Maxes',
        'Please enter valid weights for all exercises.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Update all training maxes
      for (const exercise of exerciseMaxes) {
        await updateTrainingMax(exercise.name, parseFloat(exercise.weight));
      }

      // Navigate based on return context
      if (returnTo === 'template') {
        // Continue the template workout now that maxes are set
        try {
          await continueTemplateWorkout();
          router.replace('/workout/active');
        } catch (error) {
          console.error('Error continuing template workout:', error);
          Alert.alert('Error', 'Failed to start workout. Please try again.');
        }
      } else {
        // Go back to previous screen
        router.back();
      }

    } catch (error) {
      console.error('Error setting training maxes:', error);
      Alert.alert('Error', 'Failed to save training maxes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allValid = exerciseMaxes.length > 0 && exerciseMaxes.every(ex => ex.isValid);

  // Helper function to get quick weight options based on exercise
  const getQuickWeightOptions = (exerciseName: string): number[] => {
    const name = exerciseName.toLowerCase();

    if (name.includes('bench press') || name.includes('bench')) {
      return [135, 185, 225, 275, 315];
    } else if (name.includes('squat')) {
      return [185, 225, 275, 315, 405];
    } else if (name.includes('deadlift')) {
      return [225, 275, 315, 405, 495];
    } else if (name.includes('overhead press') || name.includes('press')) {
      return [95, 115, 135, 155, 185];
    } else if (name.includes('row')) {
      return [135, 155, 185, 205, 225];
    } else {
      // Default options for other exercises
      return [95, 135, 185, 225, 275];
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Set Training Maxes',
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
            <Text style={styles.title}>Set Training Maxes</Text>
            <Text style={styles.subtitle}>
              Enter your 1-rep max for each exercise
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <BlurView intensity={30} tint="dark" style={styles.infoBlur}>
              <View style={styles.infoContent}>
                <Ionicons name="information-circle" size={24} color="#0A84FF" />
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>What's a Training Max?</Text>
                  <Text style={styles.infoDescription}>
                    Your training max is typically 90% of your true 1-rep max. It's used to calculate working weights for percentage-based programs.
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>

          <View style={styles.exercisesContainer}>
            {exerciseMaxes.map((exercise, index) => (
              <View key={exercise.name} style={styles.exerciseCard}>
                <BlurView intensity={30} tint="dark" style={styles.exerciseBlur}>
                  <View style={styles.exerciseContent}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <View style={[
                        styles.statusIndicator,
                        exercise.isValid && styles.statusIndicatorValid
                      ]}>
                        <Ionicons
                          name={exercise.isValid ? "checkmark-circle" : "ellipse-outline"}
                          size={20}
                          color={exercise.isValid ? "#32D74B" : "#8E8E93"}
                        />
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <TextInput
                        style={[
                          styles.weightInput,
                          exercise.isValid && styles.weightInputValid
                        ]}
                        value={exercise.weight}
                        onChangeText={(weight) => handleWeightChange(index, weight)}
                        placeholder="Enter weight"
                        placeholderTextColor="#666666"
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                      <Text style={styles.weightUnit}>lbs</Text>
                    </View>

                    {/* Quick Weight Suggestions */}
                    <View style={styles.quickWeightContainer}>
                      <Text style={styles.quickWeightLabel}>Quick Select:</Text>
                      <View style={styles.quickWeightButtons}>
                        {getQuickWeightOptions(exercise.name).map(weight => (
                          <TouchableOpacity
                            key={weight}
                            style={styles.quickWeightButton}
                            onPress={() => handleWeightChange(index, weight.toString())}
                          >
                            <Text style={styles.quickWeightButtonText}>{weight}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <Text style={styles.exerciseHint}>
                      Enter your current 1-rep max or training max
                    </Text>
                  </View>
                </BlurView>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !allValid && styles.submitButtonDisabled,
              isSubmitting && styles.submitButtonSubmitting
            ]}
            onPress={handleSubmit}
            disabled={!allValid || isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.submitButtonText,
              !allValid && styles.submitButtonTextDisabled
            ]}>
              {isSubmitting ? 'Saving...' : 'Save & Start Workout'}
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={allValid && !isSubmitting ? "#FFFFFF" : "#666666"}
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
  infoCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoBlur: {
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  exercisesContainer: {
    paddingBottom: 20,
  },
  exerciseCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exerciseBlur: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseContent: {
    padding: 20,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  statusIndicator: {
    marginLeft: 12,
  },
  statusIndicatorValid: {
    // Additional styles for valid state if needed
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  weightInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  weightInputValid: {
    color: '#32D74B',
  },
  weightUnit: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 8,
  },
  exerciseHint: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  quickWeightContainer: {
    marginVertical: 12,
  },
  quickWeightLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    textAlign: 'center',
  },
  quickWeightButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickWeightButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  quickWeightButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A84FF',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#1C1C1E',
  },
  submitButtonSubmitting: {
    backgroundColor: '#1C1C1E',
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  submitButtonTextDisabled: {
    color: '#666666',
  },
});
