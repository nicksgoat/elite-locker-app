import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Placeholder workout data type (use real type later)
interface WorkoutStub {
    id: string;
    title: string;
}

interface WorkoutPickerProps {
    onSelect: (workout: WorkoutStub) => void;
    onClose: () => void; // Add a way to close the picker
}

// Mock workouts for picker display
const mockPickerWorkouts: WorkoutStub[] = [
    { id: 'w1', title: 'Day 1: Upper Hypertrophy' },
    { id: 'w2', title: 'Day 2: Lower Hypertrophy' },
    { id: 'w3', title: 'Day 3: Upper Strength' },
    { id: 'w4', title: 'Day 4: Lower Strength' },
    { id: 'w5', title: 'Full Body Blast' },
    { id: 't1', title: 'Template: Push Day' },
    { id: 't2', title: 'Template: Pull Day' },
];

const WorkoutPicker: React.FC<WorkoutPickerProps> = ({ onSelect, onClose }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Attach Workout</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={24} color="#8E8E93" />
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {mockPickerWorkouts.map(workout => (
                    <TouchableOpacity key={workout.id} style={styles.workoutCard} onPress={() => onSelect(workout)}>
                        {/* Add small thumbnail/icon later */}
                         <Ionicons name="barbell" size={24} color="#FFF" />
                         <Text style={styles.workoutTitle} numberOfLines={2}>{workout.title}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 200, // Adjust height as needed
        backgroundColor: '#1C1C1E',
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    title: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
       padding: 4, 
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'flex-start',
    },
    workoutCard: {
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 12,
        marginRight: 10,
        width: 110, // Fixed width for horizontal scroll
        height: 110,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    workoutTitle: {
        color: '#FFF',
        fontSize: 13,
        textAlign: 'center',
    },
});

export default WorkoutPicker; 