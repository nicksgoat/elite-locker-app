/**
 * Elite Locker - Set Training Max Screen
 * Allows users to set or update their training max for an exercise
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import SpotifyBleedingLayout from '../../../../components/design-system/layouts/SpotifyBleedingLayout';
import trainingMaxService from '../../../../services/trainingMaxService';

// Fallback header image
const headerImage = require('../../../../assets/images/marketplace/workouts.jpg');

export default function SetTrainingMaxScreen() {
  const router = useRouter();
  const { id, exerciseName, currentMax, measurementType } = useLocalSearchParams<{
    id: string;
    exerciseName: string;
    currentMax: string;
    measurementType: string;
  }>();

  const [maxValue, setMaxValue] = useState(currentMax || '');
  const [maxReps, setMaxReps] = useState('1');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleSaveMax = useCallback(async () => {
    if (!maxValue || parseFloat(maxValue) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid training max value.');
      return;
    }

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await trainingMaxService.setTrainingMax({
        exerciseId: id,
        measurementType: measurementType as any,
        maxValue: parseFloat(maxValue),
        maxReps: parseInt(maxReps) || 1,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Success!',
        'Your training max has been saved.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving training max:', error);
      Alert.alert('Error', 'Failed to save training max. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id, measurementType, maxValue, maxReps, notes, router]);

  const handleCalculateFromReps = useCallback(() => {
    if (!maxValue || !maxReps) return;

    const weight = parseFloat(maxValue);
    const reps = parseInt(maxReps);

    if (weight > 0 && reps > 1) {
      // Epley formula: 1RM = weight × (1 + reps/30)
      const oneRM = weight * (1 + reps / 30);
      setMaxValue(Math.round(oneRM).toString());
      setMaxReps('1');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [maxValue, maxReps]);

  const isWeightBased = measurementType === 'weight_reps';
  const unit = isWeightBased ? 'lbs' : 'reps';
  const isUpdate = currentMax && parseFloat(currentMax) > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SpotifyBleedingLayout
          categoryImage={headerImage}
          title={isUpdate ? 'Update Training Max' : 'Set Training Max'}
          subtitle={exerciseName || 'Exercise'}
          onBackPress={handleBackPress}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Current Max Display */}
            {isUpdate && (
              <View style={styles.currentMaxContainer}>
                <Text style={styles.currentMaxLabel}>Current Max</Text>
                <Text style={styles.currentMaxValue}>
                  {currentMax} {unit}
                </Text>
              </View>
            )}

            {/* Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {isWeightBased ? 'Weight' : 'Reps'} ({unit})
              </Text>
              <TextInput
                style={styles.maxInput}
                value={maxValue}
                onChangeText={setMaxValue}
                placeholder={`Enter ${isWeightBased ? 'weight' : 'reps'}`}
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                returnKeyType="next"
              />

              {isWeightBased && (
                <>
                  <Text style={styles.inputLabel}>Reps Performed</Text>
                  <TextInput
                    style={styles.repsInput}
                    value={maxReps}
                    onChangeText={setMaxReps}
                    placeholder="1"
                    placeholderTextColor="#8E8E93"
                    keyboardType="numeric"
                    returnKeyType="next"
                  />

                  {parseInt(maxReps) > 1 && (
                    <TouchableOpacity
                      style={styles.calculateButton}
                      onPress={handleCalculateFromReps}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="calculator-outline" size={16} color="#0A84FF" />
                      <Text style={styles.calculateText}>
                        Calculate 1RM ({Math.round(parseFloat(maxValue || '0') * (1 + parseInt(maxReps) / 30))} lbs)
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes about this max..."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={3}
                returnKeyType="done"
              />
            </View>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>Tips</Text>
              <View style={styles.tipItem}>
                <Ionicons name="bulb-outline" size={16} color="#FF9F0A" />
                <Text style={styles.tipText}>
                  Use 90-95% of your true 1RM for training calculations
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="fitness-outline" size={16} color="#FF9F0A" />
                <Text style={styles.tipText}>
                  Test your max when you're well-rested and warmed up
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="trending-up-outline" size={16} color="#FF9F0A" />
                <Text style={styles.tipText}>
                  Update regularly as you get stronger
                </Text>
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.saveButton, (!maxValue || isLoading) && styles.saveButtonDisabled]}
                onPress={handleSaveMax}
                disabled={!maxValue || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={(!maxValue || isLoading) ? ['#8E8E93', '#8E8E93'] : ['#0A84FF', '#007AFF']}
                  style={styles.saveGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLoading ? (
                    <Text style={styles.saveText}>Saving...</Text>
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      <Text style={styles.saveText}>
                        {isUpdate ? 'Update Max' : 'Set Max'}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SpotifyBleedingLayout>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  currentMaxContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  currentMaxLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  currentMaxValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
  },
  maxInput: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  repsInput: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  calculateText: {
    fontSize: 14,
    color: '#0A84FF',
    marginLeft: 6,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tipsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#EBEBF5',
    opacity: 0.8,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});
