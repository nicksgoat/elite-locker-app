import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export type MeasurementType = 
  | 'weight_reps'
  | 'reps'
  | 'time_based'
  | 'distance'
  | 'rpe'
  | 'height'
  | 'bodyweight'
  | 'assisted';

interface ExerciseSetInputProps {
  setNumber: number;
  completed: boolean;
  measurementType: MeasurementType;
  values: {
    weight?: string;
    reps?: string;
    duration?: string;
    distance?: string;
    rpe?: string;
    height?: string;
    assistedWeight?: string;
  };
  previousValues: {
    weight?: string;
    reps?: string;
    duration?: string;
    distance?: string;
    rpe?: string;
    height?: string;
    assistedWeight?: string;
  };
  onValueChange: (field: string, value: string) => void;
  onCompleteToggle: () => void;
}

export const DynamicExerciseSetInput: React.FC<ExerciseSetInputProps> = ({
  setNumber,
  completed,
  measurementType,
  values,
  previousValues,
  onValueChange,
  onCompleteToggle,
}) => {
  const renderInputs = () => {
    switch (measurementType) {
      case 'weight_reps':
        return (
          <>
            <View style={styles.previousContainer}>
              <Text style={styles.previousText}>
                {previousValues.weight && previousValues.reps 
                  ? `${previousValues.weight} × ${previousValues.reps}`
                  : '--'
                }
              </Text>
            </View>
            <View style={styles.inputsContainer}>
              <View style={[styles.inputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.weight || ''}
                  onChangeText={(value) => onValueChange('weight', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>lb</Text>
              </View>
              <View style={[styles.inputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.reps || ''}
                  onChangeText={(value) => onValueChange('reps', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>reps</Text>
              </View>
            </View>
          </>
        );

      case 'reps':
      case 'bodyweight':
        return (
          <>
            <View style={styles.previousContainer}>
              <Text style={styles.previousText}>
                {previousValues.reps ? `${previousValues.reps} reps` : '--'}
              </Text>
            </View>
            <View style={styles.inputsContainer}>
              <View style={[styles.inputContainer, styles.singleInputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.reps || ''}
                  onChangeText={(value) => onValueChange('reps', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>reps</Text>
              </View>
            </View>
          </>
        );

      case 'time_based':
        return (
          <>
            <View style={styles.previousContainer}>
              <Text style={styles.previousText}>
                {previousValues.duration ? `${previousValues.duration}s` : '--'}
              </Text>
            </View>
            <View style={styles.inputsContainer}>
              <View style={[styles.inputContainer, styles.singleInputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.duration || ''}
                  onChangeText={(value) => onValueChange('duration', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>sec</Text>
              </View>
            </View>
          </>
        );

      case 'distance':
        return (
          <>
            <View style={styles.previousContainer}>
              <Text style={styles.previousText}>
                {previousValues.distance ? `${previousValues.distance}m` : '--'}
              </Text>
            </View>
            <View style={styles.inputsContainer}>
              <View style={[styles.inputContainer, styles.singleInputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.distance || ''}
                  onChangeText={(value) => onValueChange('distance', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>m</Text>
              </View>
            </View>
          </>
        );

      case 'rpe':
        return (
          <>
            <View style={styles.previousContainer}>
              <Text style={styles.previousText}>
                {previousValues.rpe ? `RPE ${previousValues.rpe}` : '--'}
              </Text>
            </View>
            <View style={styles.inputsContainer}>
              <View style={[styles.inputContainer, styles.singleInputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.rpe || ''}
                  onChangeText={(value) => onValueChange('rpe', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>RPE</Text>
              </View>
            </View>
          </>
        );

      case 'height':
        return (
          <>
            <View style={styles.previousContainer}>
              <Text style={styles.previousText}>
                {previousValues.height ? `${previousValues.height}"` : '--'}
              </Text>
            </View>
            <View style={styles.inputsContainer}>
              <View style={[styles.inputContainer, styles.singleInputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.height || ''}
                  onChangeText={(value) => onValueChange('height', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>in</Text>
              </View>
            </View>
          </>
        );

      case 'assisted':
        return (
          <>
            <View style={styles.previousContainer}>
              <Text style={styles.previousText}>
                {previousValues.assistedWeight && previousValues.reps 
                  ? `-${previousValues.assistedWeight} × ${previousValues.reps}`
                  : '--'
                }
              </Text>
            </View>
            <View style={styles.inputsContainer}>
              <View style={[styles.inputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.assistedWeight || ''}
                  onChangeText={(value) => onValueChange('assistedWeight', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>-lb</Text>
              </View>
              <View style={[styles.inputContainer, completed && styles.completedInputContainer]}>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  value={values.reps || ''}
                  onChangeText={(value) => onValueChange('reps', value)}
                  editable={!completed}
                  selectTextOnFocus
                />
                <Text style={styles.inputLabel}>reps</Text>
              </View>
            </View>
          </>
        );

      default:
        return renderInputs(); // Fallback to weight_reps
    }
  };

  return (
    <BlurView intensity={50} tint="dark" style={[styles.setRow, completed && styles.completedSetRow]}>
      <View style={styles.setNumberContainer}>
        <Text style={styles.setNumberText}>{setNumber}×</Text>
      </View>

      {renderInputs()}

      <View style={styles.completeButtonContainer}>
        <View
          style={[
            styles.completeButton,
            completed && styles.completedButtonActive
          ]}
          onTouchEnd={onCompleteToggle}
        >
          {completed && (
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          )}
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  completedSetRow: {
    opacity: 0.7,
  },
  setNumberContainer: {
    width: 28,
    marginRight: 12,
  },
  setNumberText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  previousContainer: {
    flex: 2,
    marginRight: 12,
  },
  previousText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  inputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  singleInputContainer: {
    flex: 2,
  },
  completedInputContainer: {
    backgroundColor: '#1C3A28',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    padding: 0,
  },
  inputLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  completeButtonContainer: {
    marginLeft: 8,
  },
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  completedButtonActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
});
