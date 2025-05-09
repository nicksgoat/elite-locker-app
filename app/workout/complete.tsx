import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useWorkout } from '@/contexts/WorkoutContext';

// Club type definition
interface Club {
  id: string;
  name: string;
  memberCount: number;
  selected: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  workoutCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  notesInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  mediaButton: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaButtonText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  clubItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  memberCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  saveButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default function CompleteWorkoutScreen() {
  const router = useRouter();
  const { workoutSummary, saveWorkoutSummary } = useWorkout();

  // Format the current date as MM/DD/YYYY
  const today = new Date();
  const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

  // State for form fields
  const [workoutTitle, setWorkoutTitle] = useState(`Workout ${formattedDate}`);
  const [notes, setNotes] = useState('');
  const [clubs, setClubs] = useState<Club[]>([
    { id: '1', name: 'Elite Lifters', memberCount: 128, selected: false },
    { id: '2', name: 'Running Club', memberCount: 85, selected: false },
  ]);

  // Format duration as minutes and seconds
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Toggle club selection
  const toggleClub = (clubId: string) => {
    setClubs(clubs.map(club =>
      club.id === clubId ? { ...club, selected: !club.selected } : club
    ));
  };

  // Handle save workout
  const handleSaveWorkout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Get selected clubs
    const selectedClubs = clubs
      .filter(club => club.selected)
      .map(club => club.id);

    // Save workout summary
    saveWorkoutSummary({
      title: workoutTitle,
      notes,
      sharedTo: {
        clubs: selectedClubs,
      },
    });

    // Navigate to feed
    router.replace('/(tabs)/feed-new');
  };

  // Handle adding photo or video
  const handleAddMedia = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // This would open the media picker
    console.log('Open media picker');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          title: 'Complete Workout',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Workout Stats Card */}
        <LinearGradient
          colors={['#0A84FF', '#0066CC']}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.workoutCardTitle}>{workoutTitle}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {workoutSummary?.duration ? formatDuration(workoutSummary.duration) : '0m 13s'}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {workoutSummary?.totalVolume || 0}
              </Text>
              <Text style={styles.statLabel}>Volume (lbs)</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {workoutSummary?.totalSets || 4}
              </Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            style={styles.titleInput}
            value={workoutTitle}
            onChangeText={setWorkoutTitle}
            placeholder="Enter workout title"
            placeholderTextColor="#666666"
          />
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="How was your workout?"
            placeholderTextColor="#666666"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          <TouchableOpacity style={styles.mediaButton} onPress={handleAddMedia}>
            <Ionicons name="camera" size={24} color="#0A84FF" />
            <Text style={styles.mediaButtonText}>Add Photo or Video</Text>
          </TouchableOpacity>
        </View>

        {/* Share to Clubs Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share to Clubs</Text>
          {clubs.map(club => (
            <TouchableOpacity
              key={club.id}
              style={styles.clubItem}
              onPress={() => toggleClub(club.id)}
            >
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{club.name}</Text>
                <Text style={styles.memberCount}>{club.memberCount} members</Text>
              </View>
              <View style={[styles.checkbox, club.selected && styles.checkboxSelected]}>
                {club.selected && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveWorkout}
        >
          <Text style={styles.saveButtonText}>Save Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
