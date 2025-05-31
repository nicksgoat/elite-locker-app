import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthContext } from '../../../contexts/AuthContext';
import { clubService } from '../../../services/clubService';
import { Club } from '../../../types/workout';

/**
 * Club Management Screen
 *
 * Allows club owners to manage their club settings, members, and content.
 */
export default function ClubManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthContext();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadClub();
    }
  }, [id]);

  const loadClub = async () => {
    try {
      setLoading(true);
      const clubData = await clubService.getClub(id!);
      setClub(clubData);
      setClubName(clubData.name || '');
      setClubDescription(clubData.description || '');
      setBannerImage(clubData.banner_image_url || null);
      setProfileImage(clubData.profile_image_url || null);

      // Check if user is the owner
      if (user && clubData.owner_id !== user.id) {
        Alert.alert('Access Denied', 'You are not the owner of this club.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      console.error('Error loading club:', err);
      Alert.alert('Error', 'Failed to load club details.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!clubName.trim()) {
      Alert.alert('Error', 'Club name is required.');
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Update the club via API with images
      const updateData = {
        name: clubName,
        description: clubDescription,
        banner_image_url: bannerImage,
        profile_image_url: profileImage,
      };

      await clubService.updateClub(id!, updateData);

      Alert.alert('Success', 'Club updated successfully!');
      router.back();
    } catch (err) {
      console.error('Error updating club:', err);
      Alert.alert('Error', 'Failed to update club. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const pickBannerImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change the banner image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setBannerImage(selectedImageUri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking banner image:', error);
      Alert.alert('Error', 'There was an error selecting the image. Please try again.');
    }
  };

  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change the profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        setProfileImage(selectedImageUri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking profile image:', error);
      Alert.alert('Error', 'There was an error selecting the image. Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading club...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Club</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* Club Images */}
          <View style={styles.imagesContainer}>
            {/* Banner Image */}
            <View style={styles.imageSection}>
              <Text style={styles.inputLabel}>Banner Image</Text>
              <TouchableOpacity
                style={styles.bannerImageContainer}
                onPress={pickBannerImage}
                activeOpacity={0.8}
              >
                {bannerImage ? (
                  <ImageBackground
                    source={{ uri: bannerImage }}
                    style={styles.bannerImage}
                    imageStyle={styles.bannerImageStyle}
                  >
                    <LinearGradient
                      colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                      style={styles.bannerOverlay}
                    >
                      <View style={styles.editIconContainer}>
                        <Ionicons name="camera" size={20} color="#FFFFFF" />
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                ) : (
                  <View style={styles.bannerImagePlaceholder}>
                    <Ionicons name="image-outline" size={40} color="#8E8E93" />
                    <Text style={styles.imagePlaceholderText}>Add Banner Image</Text>
                    <Text style={styles.imagePlaceholderSubtext}>Recommended: 2:1 aspect ratio</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Profile Image */}
            <View style={styles.imageSection}>
              <Text style={styles.inputLabel}>Profile Image</Text>
              <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={pickProfileImage}
                activeOpacity={0.8}
              >
                {profileImage ? (
                  <View style={styles.profileImageWrapper}>
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.profileImage}
                      contentFit="cover"
                    />
                    <View style={styles.profileEditIconContainer}>
                      <Ionicons name="camera" size={16} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person-outline" size={40} color="#8E8E93" />
                    <Text style={styles.imagePlaceholderText}>Add Profile Image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Club Name</Text>
            <TextInput
              style={styles.textInput}
              value={clubName}
              onChangeText={setClubName}
              placeholder="Enter club name"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={clubDescription}
              onChangeText={setClubDescription}
              placeholder="Enter club description"
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Club Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Club Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{club?.member_count || 0}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {new Date(club?.created_at || '').toLocaleDateString()}
              </Text>
              <Text style={styles.statLabel}>Created</Text>
            </View>
          </View>
        </View>

        {/* Management Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="people" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Manage Members</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Manage Events</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Club Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Ionicons name="trash" size={20} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.dangerText]}>Delete Club</Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: '#2A1A1A',
  },
  dangerText: {
    color: '#FF3B30',
  },
  // Image upload styles
  imagesContainer: {
    marginBottom: 24,
  },
  imageSection: {
    marginBottom: 20,
  },
  bannerImageContainer: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  bannerImage: {
    flex: 1,
  },
  bannerImageStyle: {
    borderRadius: 12,
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  profileImageContainer: {
    alignSelf: 'flex-start',
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#333333',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  profileEditIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: '#000000',
  },
  imagePlaceholderText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  imagePlaceholderSubtext: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
