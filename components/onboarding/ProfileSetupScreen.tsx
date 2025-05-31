/**
 * Elite Locker - Profile Setup Screen
 *
 * First step of onboarding - collect basic profile information
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useOnboarding } from '../../hooks/useOnboarding';
import { ProfileSetupData } from '../../types/onboarding';

interface ProfileSetupScreenProps {
  onNext: () => void;
}

const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to fitness' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Very experienced' }
];

const WORKOUT_TYPES = [
  'Strength Training',
  'Cardio',
  'HIIT',
  'Yoga',
  'Running',
  'Cycling',
  'Swimming',
  'Sports'
];

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onNext }) => {
  const { updateProfile, isLoading } = useOnboarding();

  const [formData, setFormData] = useState<ProfileSetupData>({
    fullName: '',
    username: '',
    bio: '',
    avatarUrl: '',
    fitnessLevel: 'beginner',
    preferredWorkoutTypes: []
  });

  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleInputChange = (field: keyof ProfileSetupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkoutTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      preferredWorkoutTypes: prev.preferredWorkoutTypes?.includes(type)
        ? prev.preferredWorkoutTypes.filter(t => t !== type)
        : [...(prev.preferredWorkoutTypes || []), type]
    }));
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a profile picture.');
        return;
      }

      setAvatarLoading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.Images],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // For now, just use the local URI
        // In a real app, you'd upload to Supabase storage
        handleInputChange('avatarUrl', result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    // Basic username validation
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return;
    }

    try {
      await updateProfile(formData);
      // updateProfile now automatically advances to the next step
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>
            Tell us about yourself to personalize your experience
          </Text>
        </View>

        {/* Avatar picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleImagePicker}
            disabled={avatarLoading}
          >
            {avatarLoading ? (
              <ActivityIndicator size="large" color="#1DB954" />
            ) : formData.avatarUrl ? (
              <Image source={{ uri: formData.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={32} color="#8E8E93" />
                <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => handleInputChange('fullName', text)}
              placeholder="Enter your full name"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text.toLowerCase())}
              placeholder="Choose a username"
              placeholderTextColor="#8E8E93"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Fitness level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Level</Text>
          <View style={styles.optionsContainer}>
            {FITNESS_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.optionCard,
                  formData.fitnessLevel === level.id && styles.optionCardSelected
                ]}
                onPress={() => handleInputChange('fitnessLevel', level.id)}
              >
                <Text style={[
                  styles.optionTitle,
                  formData.fitnessLevel === level.id && styles.optionTitleSelected
                ]}>
                  {level.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  formData.fitnessLevel === level.id && styles.optionDescriptionSelected
                ]}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferred workout types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Workout Types</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.tagsContainer}>
            {WORKOUT_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.tag,
                  formData.preferredWorkoutTypes?.includes(type) && styles.tagSelected
                ]}
                onPress={() => handleWorkoutTypeToggle(type)}
              >
                <Text style={[
                  styles.tagText,
                  formData.preferredWorkoutTypes?.includes(type) && styles.tagTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Continue button */}
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
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  continueButton: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
