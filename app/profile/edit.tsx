import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function EditProfileScreen() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    username: 'johndoe',
    bio: 'Fitness enthusiast and powerlifter',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    website: 'https://johndoe.com',
    profileImage: null as string | null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change your profile photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const handleSave = async () => {
    if (!profileData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!profileData.username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // Here you would typically make an API call to update the profile
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success!', 
        'Your profile has been updated.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Photo */}
          <BlurView intensity={20} tint="dark" style={styles.photoSection}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            <View style={styles.photoContainer}>
              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                {profileData.profileImage ? (
                  <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="person" size={40} color="#8E8E93" />
                  </View>
                )}
                <View style={styles.editPhotoOverlay}>
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Basic Info */}
          <BlurView intensity={20} tint="dark" style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Enter your name"
                placeholderTextColor="#8E8E93"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.username}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, username: text.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                placeholder="Enter username"
                placeholderTextColor="#8E8E93"
                maxLength={30}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                placeholderTextColor="#8E8E93"
                multiline
                maxLength={150}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{profileData.bio.length}/150</Text>
            </View>
          </BlurView>

          {/* Contact Info */}
          <BlurView intensity={20} tint="dark" style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.email}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, email: text }))}
                placeholder="Enter email"
                placeholderTextColor="#8E8E93"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.phone}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                placeholderTextColor="#8E8E93"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.location}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
                placeholder="Enter location"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.textInput}
                value={profileData.website}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, website: text }))}
                placeholder="Enter website URL"
                placeholderTextColor="#8E8E93"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </BlurView>

          {/* Privacy Settings */}
          <BlurView intensity={20} tint="dark" style={styles.privacySection}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <TouchableOpacity style={styles.privacyOption}>
              <View style={styles.privacyOptionContent}>
                <Ionicons name="lock-closed-outline" size={20} color="#D3D3D3" />
                <Text style={styles.privacyOptionText}>Privacy Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#D3D3D3',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#D3D3D3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoButton: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D3D3D3',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D3D3D3',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  privacySection: {
    marginBottom: 40,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  privacyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
}); 