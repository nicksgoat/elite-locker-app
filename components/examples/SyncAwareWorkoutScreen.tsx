/**
 * Elite Locker - Sync-Aware Workout Screen Example
 * 
 * This component demonstrates how to use the real-time sync system
 * in a workout logging screen.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { useUnifiedSync } from '../../contexts/UnifiedSyncContext';
import { useWorkout } from '../../contexts/WorkoutContext';
import SyncStatusIndicator from '../SyncStatusIndicator';
import ConflictResolutionModal from '../ConflictResolutionModal';

// Workout screen with real-time sync
export const SyncAwareWorkoutScreen: React.FC = () => {
  const { state, addNotification } = useUnifiedSync();
  const { currentWorkout, updateExerciseSets, isWorkoutActive } = useWorkout();
  
  // Real-time sync for workout data
  const workoutSync = useRealtimeSync<any>({
    table: 'workouts',
    optimisticUpdates: true,
    conflictResolution: 'manual',
    onConflict: (localRecord, remoteRecord) => {
      setConflicts(prev => [...prev, {
        id: `conflict_${Date.now()}`,
        table: 'workouts',
        localRecord,
        remoteRecord,
        timestamp: Date.now(),
      }]);
      return localRecord; // Prefer local for now
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Sync Error',
        message: `Failed to sync workout data: ${error.message}`,
      });
    }
  });

  // State for conflict resolution
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  // Local state for exercise sets
  const [exerciseSets, setExerciseSets] = useState<Record<string, any[]>>({});

  // Initialize exercise sets from workout context
  useEffect(() => {
    if (currentWorkout.exercises.length > 0) {
      const initialSets: Record<string, any[]> = {};
      
      currentWorkout.exercises.forEach(exercise => {
        initialSets[exercise.id] = Array(exercise.sets).fill(0).map((_, idx) => ({
          id: `${exercise.id}-set-${idx + 1}`,
          weight: '',
          reps: '',
          completed: false,
          isPersonalRecord: false,
        }));
      });
      
      setExerciseSets(initialSets);
    }
  }, [currentWorkout.exercises]);

  // Handle set updates with real-time sync
  const handleSetUpdate = async (exerciseId: string, setIndex: number, field: string, value: string) => {
    const updatedSets = [...(exerciseSets[exerciseId] || [])];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: value,
    };

    // Update local state immediately
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: updatedSets,
    }));

    // Update workout context (which will trigger sync)
    updateExerciseSets(exerciseId, updatedSets);

    // Show sync notification for completed sets
    if (field === 'completed' && value === true) {
      addNotification({
        type: 'success',
        title: 'Set Completed',
        message: 'Set logged and syncing...',
      });
    }
  };

  // Handle set completion
  const handleSetCompletion = async (exerciseId: string, setIndex: number) => {
    const set = exerciseSets[exerciseId]?.[setIndex];
    if (!set || !set.weight || !set.reps) {
      Alert.alert('Incomplete Set', 'Please enter weight and reps before completing the set.');
      return;
    }

    await handleSetUpdate(exerciseId, setIndex, 'completed', true);
  };

  // Handle conflict resolution
  const handleConflictResolved = (conflictId: string, resolution: string) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    
    if (conflicts.length <= 1) {
      setShowConflictModal(false);
    }

    addNotification({
      type: 'info',
      title: 'Conflict Resolved',
      message: `Conflict resolved using ${resolution} data.`,
    });
  };

  // Show conflicts modal when conflicts exist
  useEffect(() => {
    if (conflicts.length > 0) {
      setShowConflictModal(true);
    }
  }, [conflicts]);

  if (!isWorkoutActive) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWorkoutText}>No active workout</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sync status indicator */}
      <SyncStatusIndicator 
        position="top" 
        showDetails={true}
        onPress={() => {
          addNotification({
            type: 'info',
            title: 'Sync Status',
            message: `Pending: ${state.syncStatus.pendingOperations}, Conflicts: ${state.syncStatus.conflicts}`,
          });
        }}
      />

      {/* Workout content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Active Workout</Text>
        
        {/* Workout timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {Math.floor(currentWorkout.elapsedTime / 60)}:{(currentWorkout.elapsedTime % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.timerLabel}>Elapsed Time</Text>
        </View>

        {/* Exercises */}
        {currentWorkout.exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseContainer}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            
            {/* Sets */}
            {(exerciseSets[exercise.id] || []).map((set, setIndex) => (
              <View key={set.id} style={styles.setContainer}>
                <Text style={styles.setNumber}>{setIndex + 1}</Text>
                
                {/* Weight input */}
                <TextInput
                  style={[styles.input, set.completed && styles.inputCompleted]}
                  placeholder="Weight"
                  value={set.weight}
                  onChangeText={(value) => handleSetUpdate(exercise.id, setIndex, 'weight', value)}
                  keyboardType="numeric"
                  editable={!set.completed}
                />
                
                {/* Reps input */}
                <TextInput
                  style={[styles.input, set.completed && styles.inputCompleted]}
                  placeholder="Reps"
                  value={set.reps}
                  onChangeText={(value) => handleSetUpdate(exercise.id, setIndex, 'reps', value)}
                  keyboardType="numeric"
                  editable={!set.completed}
                />
                
                {/* Complete button */}
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    set.completed && styles.completeButtonCompleted
                  ]}
                  onPress={() => handleSetCompletion(exercise.id, setIndex)}
                  disabled={set.completed}
                >
                  <Text style={[
                    styles.completeButtonText,
                    set.completed && styles.completeButtonTextCompleted
                  ]}>
                    {set.completed ? '✓' : 'Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        {/* Workout stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentWorkout.totalVolume.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Volume (lbs)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentWorkout.completedSets}</Text>
            <Text style={styles.statLabel}>Completed Sets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentWorkout.personalRecords}</Text>
            <Text style={styles.statLabel}>Personal Records</Text>
          </View>
        </View>

        {/* Sync info */}
        <View style={styles.syncInfo}>
          <Text style={styles.syncInfoTitle}>Sync Status</Text>
          <Text style={styles.syncInfoText}>
            Pending Operations: {workoutSync.pendingOperations}
          </Text>
          <Text style={styles.syncInfoText}>
            Last Sync: {workoutSync.lastSync ? new Date(workoutSync.lastSync).toLocaleTimeString() : 'Never'}
          </Text>
          {workoutSync.hasConflicts && (
            <Text style={[styles.syncInfoText, styles.syncInfoError]}>
              ⚠️ Sync conflicts detected
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Conflict resolution modal */}
      <ConflictResolutionModal
        visible={showConflictModal}
        conflicts={conflicts}
        onClose={() => setShowConflictModal(false)}
        onResolved={handleConflictResolved}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    marginTop: 100, // Space for sync indicator
  },
  contentContainer: {
    padding: 20,
  },
  noWorkoutText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  timerLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  exerciseContainer: {
    marginBottom: 30,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  setNumber: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
    width: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  inputCompleted: {
    backgroundColor: '#1E3A1E',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  completeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeButtonCompleted: {
    backgroundColor: '#34C759',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButtonTextCompleted: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  syncInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  syncInfoTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  syncInfoText: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 4,
  },
  syncInfoError: {
    color: '#FF3B30',
  },
});

export default SyncAwareWorkoutScreen;
