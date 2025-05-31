import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useWorkout } from '@/contexts/WorkoutContext';

interface TemplateWeightInputProps {
  exerciseName: string;
  percentage: number;
  onWeightChange: (weight: string) => void;
  value: string;
  placeholder?: string;
}

export default function TemplateWeightInput({
  exerciseName,
  percentage,
  onWeightChange,
  value,
  placeholder = '--'
}: TemplateWeightInputProps) {
  const { calculateTemplateWeight, getTrainingMax, updateTrainingMax } = useWorkout();
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [trainingMaxInput, setTrainingMaxInput] = useState('');
  const [customWeight, setCustomWeight] = useState<string>('');

  const trainingMax = getTrainingMax(exerciseName);
  const calculatedWeight = trainingMax ? calculateTemplateWeight(exerciseName, percentage) : null;
  
  // Use custom weight if set, otherwise use calculated weight
  const displayWeight = customWeight || (calculatedWeight ? calculatedWeight.toString() : '');

  useEffect(() => {
    if (calculatedWeight && !customWeight) {
      onWeightChange(calculatedWeight.toString());
    }
  }, [calculatedWeight, customWeight, onWeightChange]);

  const handleEditTrainingMax = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTrainingMaxInput(trainingMax ? trainingMax.toString() : '');
    setIsEditingMax(true);
  };

  const handleSaveTrainingMax = async () => {
    const newMax = parseFloat(trainingMaxInput);
    if (isNaN(newMax) || newMax <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid training max.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateTrainingMax(exerciseName, newMax);
    setIsEditingMax(false);
  };

  const handleCancelEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditingMax(false);
    setTrainingMaxInput('');
  };

  const handleCustomWeightChange = (weight: string) => {
    setCustomWeight(weight);
    onWeightChange(weight);
  };

  const handleUseCalculated = () => {
    if (calculatedWeight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCustomWeight('');
      onWeightChange(calculatedWeight.toString());
    }
  };

  return (
    <View style={styles.container}>
      {/* Exercise Header with Percentage */}
      <View style={styles.header}>
        <Text style={styles.exerciseName} numberOfLines={1}>
          {exerciseName}
        </Text>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>
      </View>

      {/* Training Max Section */}
      <BlurView intensity={30} tint="dark" style={styles.trainingMaxSection}>
        <View style={styles.trainingMaxHeader}>
          <Text style={styles.trainingMaxLabel}>Training Max</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditTrainingMax}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={14} color="#0A84FF" />
          </TouchableOpacity>
        </View>

        {isEditingMax ? (
          <View style={styles.editingContainer}>
            <TextInput
              style={styles.trainingMaxInput}
              value={trainingMaxInput}
              onChangeText={setTrainingMaxInput}
              placeholder="Enter training max"
              placeholderTextColor="#666666"
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveTrainingMax}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.trainingMaxValue}>
            {trainingMax ? `${trainingMax} lbs` : 'Not set'}
          </Text>
        )}
      </BlurView>

      {/* Weight Input Section */}
      <View style={styles.weightSection}>
        <View style={styles.weightInputContainer}>
          <TextInput
            style={styles.weightInput}
            value={displayWeight}
            onChangeText={handleCustomWeightChange}
            placeholder={placeholder}
            placeholderTextColor="#666666"
            keyboardType="numeric"
            selectTextOnFocus
          />
          <Text style={styles.weightUnit}>lbs</Text>
        </View>

        {calculatedWeight && customWeight && customWeight !== calculatedWeight.toString() && (
          <TouchableOpacity
            style={styles.useCalculatedButton}
            onPress={handleUseCalculated}
            activeOpacity={0.7}
          >
            <Text style={styles.useCalculatedText}>
              Use calculated: {calculatedWeight} lbs
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Calculation Display */}
      {trainingMax && calculatedWeight && (
        <View style={styles.calculationDisplay}>
          <Text style={styles.calculationText}>
            {trainingMax} × {percentage}% = {calculatedWeight} lbs
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  percentageBadge: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trainingMaxSection: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  trainingMaxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trainingMaxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  editButton: {
    padding: 4,
  },
  trainingMaxValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editingContainer: {
    gap: 8,
  },
  trainingMaxInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weightSection: {
    marginBottom: 8,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  weightInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: 12,
    textAlign: 'center',
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  useCalculatedButton: {
    marginTop: 8,
    alignItems: 'center',
    padding: 8,
  },
  useCalculatedText: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '500',
  },
  calculationDisplay: {
    alignItems: 'center',
  },
  calculationText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});
