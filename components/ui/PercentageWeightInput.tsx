import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useProgram } from '../../contexts/ProgramContext';

interface PercentageWeightInputProps {
  exerciseName: string;
  percentage: number;
  defaultWeight?: number;
  onWeightChange?: (weight: number) => void;
  unit?: 'kg' | 'lb';
}

export default function PercentageWeightInput({
  exerciseName,
  percentage,
  defaultWeight,
  onWeightChange,
  unit = 'lb'
}: PercentageWeightInputProps) {
  const { getTrainingMax, calculateWorkingWeight, updateTrainingMax } = useProgram();
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [inputTrainingMax, setInputTrainingMax] = useState('');
  const [customWeight, setCustomWeight] = useState<number | null>(null);
  
  // Get the training max for this exercise
  const trainingMax = getTrainingMax(exerciseName);
  
  // Calculate the working weight
  const calculatedWeight = trainingMax 
    ? calculateWorkingWeight(exerciseName, percentage)
    : null;
  
  // The weight to display
  const displayWeight = customWeight || calculatedWeight || defaultWeight || 0;
  
  // Prepare display strings
  const percentageStr = `${percentage}%`;
  const weightStr = `${displayWeight} ${unit}`;
  
  // Handle training max edit toggle
  const handleToggleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isEditingMax) {
      setInputTrainingMax(trainingMax ? trainingMax.weight.toString() : '');
    }
    setIsEditingMax(!isEditingMax);
  };
  
  // Handle training max save
  const handleSaveTrainingMax = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newMax = parseFloat(inputTrainingMax);
    if (!isNaN(newMax) && newMax > 0) {
      updateTrainingMax(exerciseName, newMax, unit);
      setIsEditingMax(false);
    }
  };
  
  // Handle custom weight edit
  const handleCustomWeightChange = (value: string) => {
    const weight = parseFloat(value);
    if (!isNaN(weight) && weight > 0) {
      setCustomWeight(weight);
      onWeightChange && onWeightChange(weight);
    }
  };
  
  // Calculate a suggested training max if none exists
  const calculateSuggestedMax = (): number => {
    if (defaultWeight) {
      return Math.round((defaultWeight / (percentage / 100)) / 2.5) * 2.5;
    }
    return 135; // Default starting point
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.exerciseName}>{exerciseName}</Text>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>{percentageStr}</Text>
        </View>
      </View>
      
      <View style={styles.weightRow}>
        {/* Display weight */}
        <View style={styles.weightDisplay}>
          <Text style={styles.weightText}>{weightStr}</Text>
          
          {/* Weight edit mode */}
          {!calculatedWeight && (
            <TextInput
              style={styles.weightInput}
              value={customWeight?.toString() || ''}
              onChangeText={handleCustomWeightChange}
              keyboardType="numeric"
              placeholder="Enter weight"
              placeholderTextColor="#505050"
            />
          )}
        </View>
        
        {/* Edit training max */}
        {calculatedWeight ? (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleToggleEdit}
          >
            <Ionicons name="create-outline" size={18} color="#0A84FF" />
            <Text style={styles.editText}>
              {trainingMax ? 'Edit Max' : 'Set Max'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={() => {
              const suggested = calculateSuggestedMax();
              setInputTrainingMax(suggested.toString());
              setIsEditingMax(true);
            }}
          >
            <Ionicons name="calculator-outline" size={18} color="#0A84FF" />
            <Text style={styles.editText}>Calculate Max</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Training max edit form */}
      {isEditingMax && (
        <View style={styles.editContainer}>
          <View style={styles.editRow}>
            <Text style={styles.editLabel}>Training Max:</Text>
            <TextInput
              style={styles.trainingMaxInput}
              value={inputTrainingMax}
              onChangeText={setInputTrainingMax}
              keyboardType="numeric"
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.unitText}>{unit}</Text>
          </View>
          
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditingMax(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveTrainingMax}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.helpText}>
            Your training max should be approximately 90% of your true 1-rep max.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A84FF',
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weightInput: {
    width: 80,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A84FF',
    marginLeft: 4,
  },
  editContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  editLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginRight: 8,
  },
  trainingMaxInput: {
    width: 80,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 6,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  cancelButton: {
    padding: 8,
    marginRight: 12,
  },
  cancelText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0A84FF',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: 12,
    color: '#A0A0A0',
    fontStyle: 'italic',
  },
}); 