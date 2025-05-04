import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useProgram, TrainingMax } from '../../contexts/ProgramContext';

export default function TrainingMaxesScreen() {
  const router = useRouter();
  const { trainingMaxes, updateTrainingMax } = useProgram();
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [exerciseGroups, setExerciseGroups] = useState<{[key: string]: TrainingMax[]}>({});
  
  // Group training maxes by exercise type
  useEffect(() => {
    const groups: {[key: string]: TrainingMax[]} = {
      'Upper Body': [],
      'Lower Body': [],
      'Full Body': [],
      'Other': []
    };
    
    trainingMaxes.forEach(max => {
      // Simple categorization based on exercise name
      if (max.exerciseName.includes('Bench') || 
          max.exerciseName.includes('Press') || 
          max.exerciseName.includes('Row') || 
          max.exerciseName.includes('Pull') || 
          max.exerciseName.includes('Curl')) {
        groups['Upper Body'].push(max);
      } else if (max.exerciseName.includes('Squat') || 
                 max.exerciseName.includes('Deadlift') || 
                 max.exerciseName.includes('Leg')) {
        groups['Lower Body'].push(max);
      } else if (max.exerciseName.includes('Clean') || 
                 max.exerciseName.includes('Snatch') || 
                 max.exerciseName.includes('Jerk')) {
        groups['Full Body'].push(max);
      } else {
        groups['Other'].push(max);
      }
    });
    
    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) {
        delete groups[key];
      }
    });
    
    setExerciseGroups(groups);
  }, [trainingMaxes]);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEditPress = (exerciseName: string, currentWeight: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditMode(exerciseName);
    setEditValue(currentWeight.toString());
  };

  const handleSavePress = (exerciseName: string, unit: 'kg' | 'lb') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newWeight = parseFloat(editValue);
    
    if (isNaN(newWeight) || newWeight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight greater than 0.');
      return;
    }
    
    updateTrainingMax(exerciseName, newWeight, unit);
    setEditMode(null);
  };

  const handleCancelPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditMode(null);
  };

  // Format date to be more readable
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderTrainingMax = (max: TrainingMax) => {
    const isEditing = editMode === max.exerciseName;
    
    return (
      <View key={max.exerciseName} style={styles.trainingMaxItem}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{max.exerciseName}</Text>
          <Text style={styles.lastUpdated}>
            Updated {formatDate(max.lastUpdated)}
          </Text>
        </View>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.weightInput}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
            <Text style={styles.unitText}>{max.unit}</Text>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSavePress(max.exerciseName, max.unit)}
            >
              <Ionicons name="checkmark" size={18} color="#30D158" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelPress}
            >
              <Ionicons name="close" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.weightContainer}
            onPress={() => handleEditPress(max.exerciseName, max.weight)}
          >
            <Text style={styles.weightText}>{max.weight}</Text>
            <Text style={styles.unitText}>{max.unit}</Text>
            <Ionicons name="create-outline" size={18} color="#0A84FF" style={styles.editIcon} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </BlurView>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Training Maxes</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="barbell-outline" size={20} color="#0A84FF" />
            <Text style={styles.infoTitle}>About Training Maxes</Text>
          </View>
          <Text style={styles.infoText}>
            Training maxes are used to calculate your working weights for percentage-based exercises in programs. Your training max should be approximately 90% of your true 1 rep max.
          </Text>
        </View>

        {/* Training Maxes By Group */}
        {Object.entries(exerciseGroups).map(([groupName, exercises]) => (
          <View key={groupName} style={styles.exerciseGroup}>
            <Text style={styles.groupTitle}>{groupName}</Text>
            
            <View style={styles.trainingMaxList}>
              {exercises.map(max => renderTrainingMax(max))}
            </View>
          </View>
        ))}

        {/* Add New Training Max Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            // In a real app, this would open a modal to add a new training max
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert(
              'Add New Training Max',
              'In a complete implementation, this would open a modal to select an exercise and enter a training max.'
            );
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color="#0A84FF" />
          <Text style={styles.addButtonText}>Add New Training Max</Text>
        </TouchableOpacity>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 55 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderButton: {
    width: 36,
    height: 36,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 20,
  },
  exerciseGroup: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  trainingMaxList: {
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    overflow: 'hidden',
  },
  trainingMaxItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  weightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  unitText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginLeft: 4,
  },
  editIcon: {
    marginLeft: 8,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInput: {
    width: 60,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
    marginLeft: 8,
  },
  cancelButton: {
    padding: 8,
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
    marginLeft: 8,
  },
}); 