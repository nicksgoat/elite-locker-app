import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import ExerciseLibraryModal, { ExerciseWithSets } from '@/components/ui/ExerciseLibraryModal';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

// Template types
interface Template {
  id: string;
  name: string;
  description: string;
  exercises: ExerciseWithSets[];
  category?: string;
  createdAt: Date;
}

// Mock exercise suggestions
const exerciseSuggestions = [
  { id: 'e1', name: 'Bench Press', category: 'Chest' },
  { id: 'e2', name: 'Squats', category: 'Legs' },
  { id: 'e3', name: 'Pull-ups', category: 'Back' },
  { id: 'e4', name: 'Shoulder Press', category: 'Shoulders' },
  { id: 'e5', name: 'Deadlift', category: 'Back' },
  { id: 'e6', name: 'Bicep Curls', category: 'Arms' },
  { id: 'e7', name: 'Tricep Extensions', category: 'Arms' },
  { id: 'e8', name: 'Leg Press', category: 'Legs' },
];

export default function CreateTemplateScreen() {
  const router = useRouter();
  const [template, setTemplate] = useState<Partial<Template>>({
    name: '',
    description: '',
    exercises: [],
    category: 'Strength',
  });
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  
  const handleBackPress = () => {
    if (template.exercises && template.exercises.length > 0) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard this template?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', onPress: () => router.back(), style: 'destructive' },
        ]
      );
    } else {
      router.back();
    }
  };
  
  const handleAddExercise = (exercise: ExerciseWithSets) => {
    if (!template.exercises) return;
    
    setTemplate({
      ...template,
      exercises: [...template.exercises, exercise],
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleRemoveExercise = (id: string) => {
    if (!template.exercises) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTemplate({
      ...template,
      exercises: template.exercises.filter(e => e.id !== id),
    });
  };
  
  const handleUpdateExercise = (id: string, updates: Partial<ExerciseWithSets>) => {
    if (!template.exercises) return;
    
    setTemplate({
      ...template,
      exercises: template.exercises.map(e => 
        e.id === id ? { ...e, ...updates } : e
      ),
    });
  };
  
  const handleSaveTemplate = () => {
    if (!template.name) {
      Alert.alert('Missing Name', 'Please enter a name for your template');
      return;
    }
    
    if (!template.exercises || template.exercises.length === 0) {
      Alert.alert('No Exercises', 'Please add at least one exercise to your template');
      return;
    }
    
    // In a real app, you would save to a database or context
    const newTemplate: Template = {
      id: `template_${Date.now()}`,
      name: template.name,
      description: template.description || '',
      exercises: template.exercises,
      category: template.category,
      createdAt: new Date(),
    };
    
    // Mock saving
    Alert.alert(
      'Template Saved',
      `"${newTemplate.name}" has been saved to your templates`,
      [{ text: 'OK', onPress: () => router.replace('/workout/template' as any) }]
    );
  };
  
  return (
    <IMessagePageWrapper
      title=""
      subtitle=""
      showHeader={false}
    >
      {/* Header */}
      <BlurView intensity={50} tint="dark" style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={28} color="#0A84FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Template</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveTemplate}
        >
          <Ionicons name="checkmark" size={24} color="#34C759" />
        </TouchableOpacity>
      </BlurView>
      
      <ScrollView style={styles.content}>
        {/* Template Info */}
        <View style={styles.infoSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Template Name</Text>
            <TextInput
              style={styles.input}
              value={template.name}
              onChangeText={(text) => setTemplate({ ...template, name: text })}
              placeholder="My Workout Template"
              placeholderTextColor="#666666"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={template.description}
              onChangeText={(text) => setTemplate({ ...template, description: text })}
              placeholder="Describe your workout template..."
              placeholderTextColor="#666666"
              multiline={true}
              numberOfLines={3}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryContainer}>
              {['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Recovery'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryItem,
                    template.category === category && styles.categoryItemActive,
                  ]}
                  onPress={() => {
                    setTemplate({ ...template, category });
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      template.category === category && styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Exercises List */}
        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowExerciseLibrary(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={24} color="#0A84FF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          {/* Exercises List */}
          {(template.exercises as ExerciseWithSets[]).length > 0 ? (
            (template.exercises as ExerciseWithSets[]).map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseItem}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveExercise(exercise.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF453A" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.exerciseDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Sets</Text>
                    <View style={styles.counterContainer}>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => {
                          if (exercise.sets && exercise.sets > 1) {
                            handleUpdateExercise(exercise.id, { sets: exercise.sets - 1 });
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                      >
                        <Ionicons name="remove" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{exercise.sets}</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => {
                          if (exercise.sets) {
                            handleUpdateExercise(exercise.id, { sets: exercise.sets + 1 });
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                      >
                        <Ionicons name="add" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Target Reps</Text>
                    <TextInput
                      style={styles.detailInput}
                      value={exercise.targetReps}
                      onChangeText={(text) => handleUpdateExercise(exercise.id, { targetReps: text })}
                      placeholder="8-12"
                      placeholderTextColor="#666666"
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Rest (sec)</Text>
                    <TextInput
                      style={styles.detailInput}
                      value={exercise.restTime ? exercise.restTime.toString() : '60'}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 0;
                        handleUpdateExercise(exercise.id, { restTime: value });
                      }}
                      placeholder="60"
                      placeholderTextColor="#666666"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                
                {index < (template.exercises as ExerciseWithSets[]).length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={40} color="#444444" />
              <Text style={styles.emptyStateText}>No exercises added yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap 'Add' to start building your template</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Use the reusable Exercise Library Modal */}
      <ExerciseLibraryModal
        visible={showExerciseLibrary}
        onClose={() => setShowExerciseLibrary(false)}
        onSelectExercise={handleAddExercise}
        title="Add Exercise to Template"
      />
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryItemActive: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  categoryTextActive: {
    fontWeight: '600',
  },
  exercisesSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#0A84FF',
    fontSize: 16,
    marginLeft: 5,
  },
  exerciseItem: {
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  removeButton: {
    padding: 5,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '30%',
    marginBottom: 10,
  },
  detailLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 8,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
  },
  counterButton: {
    padding: 3,
  },
  counterValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detailInput: {
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 16,
    height: 36,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 15,
  },
  emptyStateSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
}); 