import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEnhancedWorkout } from '@/contexts/EnhancedWorkoutContext';
import { Ionicons } from '@expo/vector-icons';

export default function TestEnhancedWorkoutScreen() {
  const router = useRouter();
  const {
    activeWorkout,
    isWorkoutActive,
    elapsedTime,
    exerciseLibrary,
    userPreferences,
    totalVolume,
    completedSets,
    startWorkout,
    endWorkout,
    lastError,
    clearError
  } = useEnhancedWorkout();

  useEffect(() => {
    if (lastError) {
      Alert.alert('Enhanced Workout Error', lastError, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [lastError, clearError]);

  const runQuickTest = async () => {
    try {
      Alert.alert(
        'Enhanced Workout System Test',
        `✅ Context Connected Successfully!\n\n` +
        `📊 System Status:\n` +
        `• Exercise Library: ${exerciseLibrary.length} exercises\n` +
        `• User Preferences: ${userPreferences ? 'Loaded' : 'Loading...'}\n` +
        `• Active Workout: ${isWorkoutActive ? 'Yes' : 'No'}\n` +
        `• Total Volume: ${totalVolume}\n` +
        `• Completed Sets: ${completedSets}\n` +
        `• Elapsed Time: ${elapsedTime}s\n\n` +
        `🚀 Enhanced workout logging is ready!`,
        [{ text: 'Excellent!', style: 'default' }]
      );
    } catch (error: any) {
      Alert.alert('Test Failed', error?.toString() || 'Unknown error');
    }
  };

  const handleStartTestWorkout = async () => {
    try {
      await startWorkout('Test Enhanced Workout');
      Alert.alert('Success', 'Test workout started successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to start workout: ${error}`);
    }
  };

  const handleEndTestWorkout = async () => {
    if (!isWorkoutActive) {
      Alert.alert('No Active Workout', 'Start a workout first to test ending it.');
      return;
    }

    try {
      const summary = await endWorkout('Test workout completed');
      Alert.alert(
        'Workout Completed!', 
        `Summary: ${summary?.title || 'No summary'}\n` +
        `Duration: ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`
      );
    } catch (error) {
      Alert.alert('Error', `Failed to end workout: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#00D4FF" />
        </TouchableOpacity>
        <Text style={styles.title}>Enhanced Workout Test</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>System Status</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Exercise Library:</Text>
            <Text style={styles.statusValue}>{exerciseLibrary.length} exercises</Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>User Preferences:</Text>
            <Text style={styles.statusValue}>
              {userPreferences ? `✅ Loaded (Rest: ${userPreferences.defaultRestTime}s)` : '⏳ Loading...'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Active Workout:</Text>
            <Text style={styles.statusValue}>
              {isWorkoutActive ? `✅ ${activeWorkout?.name}` : '❌ None'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Workout Stats:</Text>
            <Text style={styles.statusValue}>
              {totalVolume} volume • {completedSets} sets • {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.testButton} onPress={runQuickTest}>
            <Ionicons name="checkmark-circle" size={20} color="#00D4FF" />
            <Text style={styles.buttonText}>Run System Test</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, !isWorkoutActive && styles.primaryButton]} 
            onPress={handleStartTestWorkout}
            disabled={isWorkoutActive}
          >
            <Ionicons name="play" size={20} color={isWorkoutActive ? "#666" : "#00D4FF"} />
            <Text style={[styles.buttonText, isWorkoutActive && styles.disabledText]}>
              Start Test Workout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, isWorkoutActive && styles.dangerButton]} 
            onPress={handleEndTestWorkout}
            disabled={!isWorkoutActive}
          >
            <Ionicons name="stop" size={20} color={!isWorkoutActive ? "#666" : "#FF3B30"} />
            <Text style={[styles.buttonText, !isWorkoutActive && styles.disabledText]}>
              End Test Workout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.primaryButton]} 
            onPress={() => router.push('/workout/enhanced-log')}
          >
            <Ionicons name="fitness" size={20} color="#00D4FF" />
            <Text style={styles.buttonText}>Go to Enhanced Logging</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusLabel: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  buttonContainer: {
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: '#00D4FF',
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00D4FF',
  },
  disabledText: {
    color: '#666',
  },
}); 