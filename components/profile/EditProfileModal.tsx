import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { ProfileData, SocialLinks, PrivacySettings } from '@/contexts/ProfileContext';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onSave: (updatedProfile: Partial<ProfileData>) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  profileData,
  onSave,
}) => {
  // Form state
  const [name, setName] = useState(profileData.name);
  const [handle, setHandle] = useState(profileData.handle);
  const [bio, setBio] = useState(profileData.bio);
  const [avatarUrl, setAvatarUrl] = useState(profileData.avatarUrl);
  const [headerUrl, setHeaderUrl] = useState(profileData.headerUrl || '');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(profileData.socialLinks);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(profileData.privacySettings);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when profile data changes
  useEffect(() => {
    if (visible) {
      setName(profileData.name);
      setHandle(profileData.handle);
      setBio(profileData.bio);
      setAvatarUrl(profileData.avatarUrl);
      setHeaderUrl(profileData.headerUrl || '');
      setSocialLinks(profileData.socialLinks);
      setPrivacySettings(profileData.privacySettings);
    }
  }, [visible, profileData]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Handle social link changes
  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks({
      ...socialLinks,
      [platform]: value,
    });
  };

  // Handle privacy setting toggle
  const handlePrivacyToggle = (setting: keyof PrivacySettings) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting],
    });
  };

  // Pick a profile image from gallery
  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  // Pick a header image from gallery
  const pickHeaderImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setHeaderUrl(result.assets[0].uri);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!handle.trim()) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }

    // Check username format
    if (!/^[a-zA-Z0-9._]+$/.test(handle)) {
      Alert.alert(
        'Invalid Username',
        'Username can only contain letters, numbers, periods, and underscores'
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // Prepare updated profile data
      const updatedProfile: Partial<ProfileData> = {
        name,
        handle,
        bio,
        avatarUrl,
        headerUrl: headerUrl || undefined,
        socialLinks,
        privacySettings,
      };

      await onSave(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.modalContent}>
          <BlurView intensity={30} tint="dark" style={styles.blurView}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Edit Profile</Text>
              
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.disabledButton]}
                onPress={handleSave}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Text style={styles.saveText}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Profile Images */}
              <View style={styles.imagesContainer}>
                {/* Header image */}
                <TouchableOpacity
                  style={styles.headerImageContainer}
                  onPress={pickHeaderImage}
                  activeOpacity={0.8}
                >
                  {headerUrl ? (
                    <Image
                      source={{ uri: headerUrl }}
                      style={styles.headerImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.headerImagePlaceholder}>
                      <Ionicons name="image-outline" size={30} color="#AAAAAA" />
                      <Text style={styles.imagePlaceholderText}>Add Cover Photo</Text>
                    </View>
                  )}
                  
                  <View style={styles.editIconContainer}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                
                {/* Profile picture */}
                <TouchableOpacity
                  style={styles.profilePictureContainer}
                  onPress={pickProfileImage}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.profilePicture}
                    contentFit="cover"
                  />
                  
                  <View style={styles.editIconContainer}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Basic Info */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Basic Info</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#666666"
                    placeholder="Your name"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.textInput}
                    value={handle}
                    onChangeText={setHandle}
                    placeholderTextColor="#666666"
                    placeholder="username"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Bio</Text>
                  <TextInput
                    style={[styles.textInput, styles.bioInput]}
                    value={bio}
                    onChangeText={setBio}
                    placeholderTextColor="#666666"
                    placeholder="Tell us about yourself"
                    multiline
                    maxLength={150}
                  />
                  <Text style={styles.charCount}>{bio.length}/150</Text>
                </View>
              </View>

              {/* Social Media Links */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Social Media</Text>
                
                <View style={styles.inputContainer}>
                  <View style={styles.socialInputRow}>
                    <Ionicons name="logo-instagram" size={22} color="#E4405F" />
                    <TextInput
                      style={styles.socialInput}
                      value={socialLinks.instagram || ''}
                      onChangeText={(text) => handleSocialLinkChange('instagram', text)}
                      placeholderTextColor="#666666"
                      placeholder="Instagram username"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.socialInputRow}>
                    <Ionicons name="logo-twitter" size={22} color="#1DA1F2" />
                    <TextInput
                      style={styles.socialInput}
                      value={socialLinks.twitter || ''}
                      onChangeText={(text) => handleSocialLinkChange('twitter', text)}
                      placeholderTextColor="#666666"
                      placeholder="Twitter username"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.socialInputRow}>
                    <Ionicons name="logo-tiktok" size={22} color="#FFFFFF" />
                    <TextInput
                      style={styles.socialInput}
                      value={socialLinks.tiktok || ''}
                      onChangeText={(text) => handleSocialLinkChange('tiktok', text)}
                      placeholderTextColor="#666666"
                      placeholder="TikTok username"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.socialInputRow}>
                    <Ionicons name="logo-youtube" size={22} color="#FF0000" />
                    <TextInput
                      style={styles.socialInput}
                      value={socialLinks.youtube || ''}
                      onChangeText={(text) => handleSocialLinkChange('youtube', text)}
                      placeholderTextColor="#666666"
                      placeholder="YouTube channel"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.socialInputRow}>
                    <Ionicons name="globe-outline" size={22} color="#FFFFFF" />
                    <TextInput
                      style={styles.socialInput}
                      value={socialLinks.website || ''}
                      onChangeText={(text) => handleSocialLinkChange('website', text)}
                      placeholderTextColor="#666666"
                      placeholder="Website URL"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>

              {/* Privacy Settings */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Privacy Settings</Text>
                
                <View style={styles.toggleContainer}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>Public Workouts</Text>
                    <Text style={styles.toggleDescription}>
                      Let others see your workout history
                    </Text>
                  </View>
                  <Switch
                    value={privacySettings.workoutsPublic}
                    onValueChange={() => handlePrivacyToggle('workoutsPublic')}
                    trackColor={{ false: '#222', true: '#0A84FF30' }}
                    thumbColor={privacySettings.workoutsPublic ? '#0A84FF' : '#666'}
                    ios_backgroundColor="#222"
                  />
                </View>
                
                <View style={styles.toggleContainer}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>Public Clubs</Text>
                    <Text style={styles.toggleDescription}>
                      Show clubs you're a member of on your profile
                    </Text>
                  </View>
                  <Switch
                    value={privacySettings.clubsPublic}
                    onValueChange={() => handlePrivacyToggle('clubsPublic')}
                    trackColor={{ false: '#222', true: '#0A84FF30' }}
                    thumbColor={privacySettings.clubsPublic ? '#0A84FF' : '#666'}
                    ios_backgroundColor="#222"
                  />
                </View>
                
                <View style={styles.toggleContainer}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>Visible Followers</Text>
                    <Text style={styles.toggleDescription}>
                      Let others see who follows you
                    </Text>
                  </View>
                  <Switch
                    value={privacySettings.followersVisible}
                    onValueChange={() => handlePrivacyToggle('followersVisible')}
                    trackColor={{ false: '#222', true: '#0A84FF30' }}
                    thumbColor={privacySettings.followersVisible ? '#0A84FF' : '#666'}
                    ios_backgroundColor="#222"
                  />
                </View>
                
                <View style={styles.toggleContainer}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleTitle}>Allow Messages</Text>
                    <Text style={styles.toggleDescription}>
                      Let others send you direct messages
                    </Text>
                  </View>
                  <Switch
                    value={privacySettings.allowMessages}
                    onValueChange={() => handlePrivacyToggle('allowMessages')}
                    trackColor={{ false: '#222', true: '#0A84FF30' }}
                    thumbColor={privacySettings.allowMessages ? '#0A84FF' : '#666'}
                    ios_backgroundColor="#222"
                  />
                </View>
              </View>
              
              {/* Bottom padding */}
              <View style={styles.bottomPadding} />
            </ScrollView>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    flex: 1,
    marginTop: 44,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  blurView: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  imagesContainer: {
    position: 'relative',
    marginBottom: 60,
  },
  headerImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 8,
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'absolute',
    bottom: -50,
    left: '50%',
    marginLeft: -50,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#222',
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#AAAAAA',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  socialInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  socialInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  toggleDescription: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
});

export default EditProfileModal; 