/**
 * Elite Locker - Streamlined Workout Interface
 * 
 * This is a simplified, intuitive workout interface that gets users
 * working out faster with minimal complexity.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUnifiedDataStore } from '../../stores/UnifiedDataStore';
import { createLogger } from '../../utils/secureLogger';

const logger = createLogger('StreamlinedWorkout');

export default function StreamlinedWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    exercises,
    workoutSessions,
    startWorkout,
    addExerciseToWorkout,
    updateWorkoutSet,
    completeSet,
    finishWorkout,
    loadExercises,
  } = useUnifiedDataStore();

  // Local state
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load exercises on mount
  useEffect(() => {
    if (exercises.length === 0) {
      loadExercises();
    }
  }, []);

  // Timer for active workout
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeWorkout && activeWorkout.startTime) {
      interval = setInterval(() => {
        const startTime = new Date(activeWorkout.startTime).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeWorkout]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle start workout
  const handleStartWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Workout Name Required', 'Please enter a name for your workout');
      return;
    }

    try {
      await startWorkout(workoutName.trim());
      setShowStartModal(false);
      setWorkoutName('');
      logger.info('Workout started', { name: workoutName });
    } catch (error: any) {
      Alert.alert('Error', `Failed to start workout: ${error.message}`);
      logger.error('Failed to start workout', { error: error.message });
    }
  };

  // Handle quick start with template
  const handleQuickStart = async (templateName: string, templateExercises: string[]) => {
    try {
      await startWorkout(templateName);
      
      // Add template exercises
      for (const exerciseName of templateExercises) {
        const exercise = exercises.find(ex => ex.name.toLowerCase().includes(exerciseName.toLowerCase()));
        if (exercise) {
          await addExerciseToWorkout(exercise.id);
        }
      }
      
      logger.info('Quick start workout created', { template: templateName });
    } catch (error: any) {
      Alert.alert('Error', `Failed to start workout: ${error.message}`);
    }
  };

  // Handle add exercise
  const handleAddExercise = (exercise: any) => {
    addExerciseToWorkout(exercise.id);
    setShowExerciseSearch(false);
    logger.info('Exercise added to workout', { exerciseId: exercise.id });
  };

  // Handle finish workout
  const handleFinishWorkout = async () => {
    if (!activeWorkout) return;

    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: async () => {
            try {
              await finishWorkout();
              Alert.alert('Great Job!', 'Your workout has been saved! 💪');
              logger.info('Workout finished', { workoutId: activeWorkout.id });
            } catch (error: any) {
              Alert.alert('Error', `Failed to finish workout: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  // Filter exercises based on search
  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.muscleGroups.some(muscle => 
      muscle.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Quick start templates
  const quickStartTemplates = [
    {
      name: 'Push Day',
      icon: 'fitness',
      color: '#FF3B30',
      exercises: ['Bench Press', 'Push Up', 'Shoulder Press', 'Tricep'],
    },
    {
      name: 'Pull Day',
      icon: 'barbell',
      color: '#007AFF',
      exercises: ['Pull Up', 'Row', 'Lat Pulldown', 'Bicep'],
    },
    {
      name: 'Leg Day',
      icon: 'walk',
      color: '#34C759',
      exercises: ['Squat', 'Deadlift', 'Lunge', 'Calf'],
    },
    {
      name: 'Full Body',
      icon: 'body',
      color: '#FF9500',
      exercises: ['Squat', 'Push Up', 'Pull Up', 'Plank'],
    },
  ];

  // Get workout stats
  const getWorkoutStats = () => {
    if (!activeWorkout) return { totalSets: 0, completedSets: 0, totalVolume: 0 };

    let totalSets = 0;
    let completedSets = 0;
    let totalVolume = 0;

    activeWorkout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        totalSets++;
        if (set.completed) {
          completedSets++;
          if (set.weight && set.reps) {
            totalVolume += set.weight * set.reps;
          }
        }
      });
    });

    return { totalSets, completedSets, totalVolume };
  };

  const stats = getWorkoutStats();

  // If there's an active workout, show the workout interface
  if (activeWorkout) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Active Workout Header */}
        <BlurView intensity={20} style={styles.activeWorkoutHeader}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{activeWorkout.name}</Text>
            <Text style={styles.workoutTime}>{formatTime(elapsedTime)}</Text>
          </View>
          
          <View style={styles.workoutStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedSets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(stats.totalVolume)}</Text>
              <Text style={styles.statLabel}>Volume</Text>
            </View>
          </View>
        </BlurView>

        {/* Exercise List */}
        <ScrollView style={styles.exerciseList} contentContainerStyle={styles.exerciseListContent}>
          {activeWorkout.exercises.map((workoutExercise, index) => {
            const exercise = exercises.find(ex => ex.id === workoutExercise.exerciseId);
            if (!exercise) return null;

            return (
              <View key={index} style={styles.exerciseContainer}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseCategory}>{exercise.category}</Text>
                
                {/* Sets */}
                <View style={styles.setsContainer}>
                  {workoutExercise.sets.map((set, setIndex) => (
                    <View key={setIndex} style={styles.setRow}>
                      <Text style={styles.setNumber}>{setIndex + 1}</Text>
                      
                      <TextInput
                        style={styles.setInput}
                        placeholder="Weight"
                        value={set.weight?.toString() || ''}
                        onChangeText={(value) => {
                          const updates = { weight: parseFloat(value) || undefined };
                          updateWorkoutSet(workoutExercise.exerciseId, setIndex, updates);
                        }}
                        keyboardType="numeric"
                      />
                      
                      <TextInput
                        style={styles.setInput}
                        placeholder="Reps"
                        value={set.reps?.toString() || ''}
                        onChangeText={(value) => {
                          const updates = { reps: parseInt(value) || undefined };
                          updateWorkoutSet(workoutExercise.exerciseId, setIndex, updates);
                        }}
                        keyboardType="numeric"
                      />
                      
                      <TouchableOpacity
                        style={[styles.completeButton, set.completed && styles.completedButton]}
                        onPress={() => completeSet(workoutExercise.exerciseId, setIndex)}
                      >
                        <Ionicons 
                          name={set.completed ? "checkmark-circle" : "ellipse-outline"} 
                          size={24} 
                          color={set.completed ? "#34C759" : "#007AFF"} 
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
          
          {/* Add Exercise Button */}
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowExerciseSearch(true)}
          >
            <Ionicons name="add-circle" size={24} color="#007AFF" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Finish Workout Button */}
        <View style={styles.finishContainer}>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
            <Text style={styles.finishButtonText}>Finish Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Search Modal */}
        <Modal
          visible={showExerciseSearch}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowExerciseSearch(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowExerciseSearch(false)}>
                <Ionicons name="close" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#8E8E93" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
            
            <ScrollView style={styles.exerciseSearchList}>
              {filteredExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseSearchItem}
                  onPress={() => handleAddExercise(exercise)}
                >
                  <Text style={styles.exerciseSearchName}>{exercise.name}</Text>
                  <Text style={styles.exerciseSearchCategory}>{exercise.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  }

  // No active workout - show start options
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Start Workout</Text>
        <Text style={styles.headerSubtitle}>Choose how you want to work out today</Text>
      </View>

      <ScrollView contentContainerStyle={styles.startOptionsContainer}>
        {/* Quick Start Templates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <Text style={styles.sectionSubtitle}>Pre-built workouts to get you started</Text>
          
          <View style={styles.templatesGrid}>
            {quickStartTemplates.map((template, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.templateCard, { backgroundColor: template.color }]}
                onPress={() => handleQuickStart(template.name, template.exercises)}
              >
                <Ionicons name={template.icon as any} size={32} color="#FFFFFF" />
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateExercises}>
                  {template.exercises.length} exercises
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Workout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Workout</Text>
          <Text style={styles.sectionSubtitle}>Start from scratch and add exercises as you go</Text>
          
          <TouchableOpacity
            style={styles.customWorkoutButton}
            onPress={() => setShowStartModal(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.customWorkoutText}>Start Empty Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Workouts */}
        {workoutSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <Text style={styles.sectionSubtitle}>Repeat a previous workout</Text>
            
            {workoutSessions.slice(0, 3).map((session, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentWorkoutItem}
                onPress={() => handleQuickStart(session.name, [])}
              >
                <View style={styles.recentWorkoutInfo}>
                  <Text style={styles.recentWorkoutName}>{session.name}</Text>
                  <Text style={styles.recentWorkoutDetails}>
                    {session.totalSets} sets • {Math.round(session.totalVolume)} lbs
                  </Text>
                </View>
                <Ionicons name="refresh" size={20} color="#007AFF" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Start Workout Modal */}
      <Modal
        visible={showStartModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowStartModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start New Workout</Text>
            <TouchableOpacity onPress={() => setShowStartModal(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={styles.workoutNameInput}
              placeholder="Workout name (e.g., Push Day, Legs, etc.)"
              value={workoutName}
              onChangeText={setWorkoutName}
              autoFocus
            />
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartWorkout}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 16,
  },
  startOptionsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 16,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  templateExercises: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  customWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  customWorkoutText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  recentWorkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  recentWorkoutInfo: {
    flex: 1,
  },
  recentWorkoutName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  recentWorkoutDetails: {
    color: '#8E8E93',
    fontSize: 14,
  },
  activeWorkoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutTime: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseListContent: {
    padding: 20,
  },
  exerciseContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseCategory: {
    color: '#007AFF',
    fontSize: 14,
    marginBottom: 16,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setNumber: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    width: 20,
  },
  setInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  completeButton: {
    padding: 4,
  },
  completedButton: {
    opacity: 0.7,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  addExerciseText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  finishContainer: {
    padding: 20,
  },
  finishButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  workoutNameInput: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  exerciseSearchList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseSearchItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  exerciseSearchName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  exerciseSearchCategory: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
