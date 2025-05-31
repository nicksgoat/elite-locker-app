/**
 * Elite Locker - Preferences Screen
 *
 * Third step of onboarding - set user preferences and goals
 */

import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useOnboarding } from '../../hooks/useOnboarding';
import { PreferencesData } from '../../types/onboarding';

interface PreferencesScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

const WORKOUT_FREQUENCIES = [
  { value: 1, label: '1x per week', description: 'Light activity' },
  { value: 2, label: '2x per week', description: 'Getting started' },
  { value: 3, label: '3x per week', description: 'Regular routine' },
  { value: 4, label: '4x per week', description: 'Active lifestyle' },
  { value: 5, label: '5+ per week', description: 'Very active' }
];

const WORKOUT_DURATIONS = [
  { value: 15, label: '15 min', description: 'Quick sessions' },
  { value: 30, label: '30 min', description: 'Standard' },
  { value: 45, label: '45 min', description: 'Extended' },
  { value: 60, label: '60 min', description: 'Full workout' },
  { value: 90, label: '90+ min', description: 'Long sessions' }
];

const FITNESS_GOALS = [
  'Lose Weight',
  'Build Muscle',
  'Improve Endurance',
  'Increase Strength',
  'Stay Active',
  'Improve Flexibility',
  'Sport Performance',
  'General Health'
];

const EQUIPMENT_OPTIONS = [
  'Bodyweight Only',
  'Dumbbells',
  'Barbell',
  'Resistance Bands',
  'Kettlebells',
  'Pull-up Bar',
  'Full Gym Access',
  'Home Gym Setup'
];

export const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ onNext, onSkip }) => {
  const { setPreferences: savePreferences, isLoading } = useOnboarding();

  const [preferences, setPreferences] = useState<PreferencesData>({
    workoutFrequency: 3,
    preferredDuration: 45,
    goals: [],
    equipment: [],
    notifications: {
      workoutReminders: true,
      socialUpdates: true,
      programUpdates: true
    }
  });

  const handleFrequencySelect = (frequency: number) => {
    setPreferences(prev => ({ ...prev, workoutFrequency: frequency }));
  };

  const handleDurationSelect = (duration: number) => {
    setPreferences(prev => ({ ...prev, preferredDuration: duration }));
  };

  const handleGoalToggle = (goal: string) => {
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals?.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...(prev.goals || []), goal]
    }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    setPreferences(prev => ({
      ...prev,
      equipment: prev.equipment?.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...(prev.equipment || []), equipment]
    }));
  };

  const handleNotificationToggle = (type: keyof PreferencesData['notifications']) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications?.[type]
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      await savePreferences(preferences);
      // savePreferences now automatically advances to the next step
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set your goals</Text>
          <Text style={styles.subtitle}>
            Help us personalize your fitness experience
          </Text>
        </View>

        {/* Workout frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How often do you want to work out?</Text>
          <View style={styles.optionsContainer}>
            {WORKOUT_FREQUENCIES.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.optionCard,
                  preferences.workoutFrequency === freq.value && styles.optionCardSelected
                ]}
                onPress={() => handleFrequencySelect(freq.value)}
              >
                <Text style={[
                  styles.optionTitle,
                  preferences.workoutFrequency === freq.value && styles.optionTitleSelected
                ]}>
                  {freq.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  preferences.workoutFrequency === freq.value && styles.optionDescriptionSelected
                ]}>
                  {freq.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Workout duration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred workout duration</Text>
          <View style={styles.durationContainer}>
            {WORKOUT_DURATIONS.map((duration) => (
              <TouchableOpacity
                key={duration.value}
                style={[
                  styles.durationCard,
                  preferences.preferredDuration === duration.value && styles.durationCardSelected
                ]}
                onPress={() => handleDurationSelect(duration.value)}
              >
                <Text style={[
                  styles.durationLabel,
                  preferences.preferredDuration === duration.value && styles.durationLabelSelected
                ]}>
                  {duration.label}
                </Text>
                <Text style={[
                  styles.durationDescription,
                  preferences.preferredDuration === duration.value && styles.durationDescriptionSelected
                ]}>
                  {duration.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fitness goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are your fitness goals?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.tagsContainer}>
            {FITNESS_GOALS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.tag,
                  preferences.goals?.includes(goal) && styles.tagSelected
                ]}
                onPress={() => handleGoalToggle(goal)}
              >
                <Text style={[
                  styles.tagText,
                  preferences.goals?.includes(goal) && styles.tagTextSelected
                ]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What equipment do you have access to?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.tagsContainer}>
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <TouchableOpacity
                key={equipment}
                style={[
                  styles.tag,
                  preferences.equipment?.includes(equipment) && styles.tagSelected
                ]}
                onPress={() => handleEquipmentToggle(equipment)}
              >
                <Text style={[
                  styles.tagText,
                  preferences.equipment?.includes(equipment) && styles.tagTextSelected
                ]}>
                  {equipment}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification preferences</Text>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Workout Reminders</Text>
              <Text style={styles.notificationDescription}>
                Get reminded when it's time to work out
              </Text>
            </View>
            <Switch
              value={preferences.notifications?.workoutReminders}
              onValueChange={() => handleNotificationToggle('workoutReminders')}
              trackColor={{ false: '#333333', true: '#1DB954' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Social Updates</Text>
              <Text style={styles.notificationDescription}>
                Get notified about club activities and posts
              </Text>
            </View>
            <Switch
              value={preferences.notifications?.socialUpdates}
              onValueChange={() => handleNotificationToggle('socialUpdates')}
              trackColor={{ false: '#333333', true: '#1DB954' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Program Updates</Text>
              <Text style={styles.notificationDescription}>
                Get notified about new workouts and programs
              </Text>
            </View>
            <Switch
              value={preferences.notifications?.programUpdates}
              onValueChange={() => handleNotificationToggle('programUpdates')}
              trackColor={{ false: '#333333', true: '#1DB954' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
  },
  optionCardSelected: {
    borderColor: '#1DB954',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#1DB954',
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  optionDescriptionSelected: {
    color: '#1DB954',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 12,
    minWidth: '30%',
    alignItems: 'center',
  },
  durationCardSelected: {
    borderColor: '#1DB954',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  durationLabelSelected: {
    color: '#1DB954',
  },
  durationDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  durationDescriptionSelected: {
    color: '#1DB954',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagSelected: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  tagText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  tagTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  buttonContainer: {
    marginTop: 20,
  },
  continueButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
});
