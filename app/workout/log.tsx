import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Exercise, ExerciseSet, useWorkout } from '@/contexts/WorkoutContext';

// Exercise set component
interface LogSetProps {
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onCompleteToggle: () => void;
}

const LogSet: React.FC<LogSetProps> = ({
  setNumber,
  weight,
  reps,
  completed,
  onWeightChange,
  onRepsChange,
  onCompleteToggle,
}) => {
  return (
    <View style={styles.setRow}>
      <Text style={styles.setNumber}>{setNumber}x</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="--"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={weight}
          onChangeText={onWeightChange}
          editable={!completed}
          selectTextOnFocus
        />
        <Text style={styles.inputLabel}>lb</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="--"
          placeholderTextColor="#666666"
          keyboardType="numeric"
          value={reps}
          onChangeText={onRepsChange}
          editable={!completed}
          selectTextOnFocus
        />
        <Text style={styles.inputLabel}>reps</Text>
      </View>

      <TouchableOpacity
        style={[styles.completeButton, completed && styles.completedButtonActive]}
        onPress={onCompleteToggle}
      >
        {completed && (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

// Exercise component
interface LogExerciseProps {
  exercise: Exercise;
  sets: ExerciseSet[];
  onUpdateSets: (sets: ExerciseSet[]) => void;
  onAddSet: () => void;
  onSuperSet: () => void;
}

const LogExercise: React.FC<LogExerciseProps> = ({
  exercise,
  sets,
  onUpdateSets,
  onAddSet,
  onSuperSet,
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleSetCompleteToggle = (setId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const updatedSets = sets.map(set =>
      set.id === setId ? { ...set, completed: !set.completed } : set
    );

    onUpdateSets(updatedSets);
  };

  const handleWeightChange = (setId: number, value: string) => {
    const updatedSets = sets.map(set =>
      set.id === setId ? { ...set, weight: value } : set
    );

    onUpdateSets(updatedSets);
  };

  const handleRepsChange = (setId: number, value: string) => {
    const updatedSets = sets.map(set =>
      set.id === setId ? { ...set, reps: value } : set
    );

    onUpdateSets(updatedSets);
  };

  return (
    <View style={styles.exerciseCard}>
      <TouchableOpacity
        style={styles.exerciseHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.exerciseIconContainer}>
          <Ionicons name="barbell-outline" size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Ionicons
          name={expanded ? "chevron-down" : "chevron-forward"}
          size={16}
          color="#8E8E93"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.exerciseContent}>
          <View style={styles.setsHeader}>
            <Text style={styles.setsHeaderText}>PREVIOUS</Text>
            <Text style={styles.setsHeaderText}>WEIGHT</Text>
            <Text style={styles.setsHeaderText}>REP</Text>
          </View>

          {sets.map((set) => (
            <LogSet
              key={set.id}
              setNumber={set.id}
              weight={set.weight}
              reps={set.reps}
              completed={set.completed}
              onWeightChange={(value) => handleWeightChange(set.id, value)}
              onRepsChange={(value) => handleRepsChange(set.id, value)}
              onCompleteToggle={() => handleSetCompleteToggle(set.id)}
            />
          ))}

          <View style={styles.addSetButtonContainer}>
            <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.superSetButton} onPress={onSuperSet}>
              <Text style={styles.superSetText}>Super Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Styles for the workout log screen
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
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  exerciseCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  exerciseContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 30,
  },
  setsHeaderText: {
    fontSize: 11,
    color: '#8E8E93',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: 40,
  },
  setNumber: {
    width: 30,
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'left',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 4,
  },
  completeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  completedButtonActive: {
    backgroundColor: '#30D158',
    borderColor: '#30D158',
  },
  addSetButtonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  addSetText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 5,
  },
  superSetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  superSetText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
  },
  addExerciseText: {
    fontSize: 16,
    color: '#0A84FF',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  completeWorkoutButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default function WorkoutLogScreen() {
  const router = useRouter();
  const { startWorkout, updateExerciseSets, addExercise, endWorkout } = useWorkout();

  // State for the workout
  const [workoutName, setWorkoutName] = useState('Hamstrings + Glutes');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseSets, setExerciseSets] = useState<Record<string, ExerciseSet[]>>({});

  // Initialize with sample data
  useEffect(() => {
    // Sample exercises based on the screenshots
    const sampleExercises: Exercise[] = [
      {
        id: 'ex1',
        name: 'Smith Machine Hip Thrust',
        sets: 2,
        targetReps: '10-12',
        restTime: 90,
      },
      {
        id: 'ex2',
        name: 'Smith Machine KAS Glute Bridge',
        sets: 1,
        targetReps: '5',
        restTime: 90,
      },
      {
        id: 'ex3',
        name: 'Dumbbell Romanian Deadlift',
        sets: 3,
        targetReps: '12-15',
        restTime: 60,
      },
      {
        id: 'ex4',
        name: 'Seated Leg Curl',
        sets: 3,
        targetReps: '8-12',
        restTime: 60,
      },
    ];

    setExercises(sampleExercises);

    // Initialize sets for each exercise
    const initialSets: Record<string, ExerciseSet[]> = {};
    sampleExercises.forEach(exercise => {
      initialSets[exercise.id] = Array(exercise.sets).fill(0).map((_, idx) => ({
        id: idx + 1,
        weight: '',
        reps: '',
        completed: false,
      }));
    });

    setExerciseSets(initialSets);

    // Start the workout in the context
    startWorkout(sampleExercises);
  }, []);

  // Handle updating sets for an exercise
  const handleUpdateSets = (exerciseId: string, sets: ExerciseSet[]) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: sets
    }));

    // Update in context
    updateExerciseSets(exerciseId, sets);
  };

  // Handle adding a set to an exercise
  const handleAddSet = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setExerciseSets(prev => {
      const currentSets = prev[exerciseId] || [];
      const newSetId = currentSets.length + 1;

      // Copy weight and reps from the last set if available
      const lastSet = currentSets[currentSets.length - 1];
      const newSet: ExerciseSet = {
        id: newSetId,
        weight: lastSet ? lastSet.weight : '',
        reps: lastSet ? lastSet.reps : '',
        completed: false,
      };

      const updatedSets = [...currentSets, newSet];

      // Update in context
      updateExerciseSets(exerciseId, updatedSets);

      return {
        ...prev,
        [exerciseId]: updatedSets
      };
    });
  };

  // Handle creating a superset
  const handleSuperSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // This would be implemented to create a superset
    console.log('Create superset');
  };

  // Handle completing the workout
  const handleCompleteWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    endWorkout();
    router.push('/workout/share-workout');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{workoutName}</Text>
          <Ionicons name="chevron-down" size={16} color="#8E8E93" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pauseButton}>
          <Ionicons name="pause" size={24} color="#FFFFFF" />
          <Text style={styles.timerText}>0:05</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {exercises.map((exercise) => (
          <LogExercise
            key={exercise.id}
            exercise={exercise}
            sets={exerciseSets[exercise.id] || []}
            onUpdateSets={(sets) => handleUpdateSets(exercise.id, sets)}
            onAddSet={() => handleAddSet(exercise.id)}
            onSuperSet={handleSuperSet}
          />
        ))}

        <TouchableOpacity style={styles.addExerciseButton}>
          <Ionicons name="add-circle" size={24} color="#0A84FF" />
          <Text style={styles.addExerciseText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeWorkoutButton}
          onPress={handleCompleteWorkout}
        >
          <Text style={styles.completeWorkoutText}>Complete Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
