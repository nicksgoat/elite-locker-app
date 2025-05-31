import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useWorkout, WorkoutSummary } from '../../contexts/WorkoutContext';
import { clubService } from '../../services/clubService';
import { feedService } from '../../services/feedService';

const { width, height } = Dimensions.get('window');

interface WorkoutCompleteModalProps {
  visible: boolean;
  onClose: () => void;
}

const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({ visible, onClose }) => {
  const { workoutSummary, saveWorkoutSummary, shareWorkout } = useWorkout();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [shareToOptions, setShareToOptions] = useState({
    instagram: false,
    twitter: false,
    facebook: false,
  });
  const [availableClubs, setAvailableClubs] = useState<any[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;

  // Social platforms to share to
  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#C13584' },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#4267B2' },
  ];

  // Fetch user's clubs when modal opens
  const fetchUserClubs = async () => {
    setIsLoadingClubs(true);
    try {
      // Get user's joined clubs (memberships) and owned clubs
      const [memberships, ownedClubs] = await Promise.all([
        clubService.getMyMemberships().catch(() => []),
        clubService.getMyClubs().catch(() => [])
      ]);

      // Combine and deduplicate clubs
      const allClubs = [...(memberships || []), ...(ownedClubs || [])];
      const uniqueClubs = allClubs.filter((club, index, self) =>
        index === self.findIndex(c => c.id === club.id)
      );

      if (uniqueClubs.length > 0) {
        setAvailableClubs(uniqueClubs);
      } else {
        // Fallback to mock clubs for better UX
        console.log('No user clubs found, using mock clubs for demo');
        setAvailableClubs([
          { id: 'demo-1', name: 'Elite Fitness', member_count: 128 },
          { id: 'demo-2', name: 'Track & Field Elite', member_count: 85 },
          { id: 'demo-3', name: 'CrossFit Warriors', member_count: 64 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      // Fallback to demo clubs
      setAvailableClubs([
        { id: 'demo-1', name: 'Elite Fitness', member_count: 128 },
        { id: 'demo-2', name: 'Track & Field Elite', member_count: 85 },
        { id: 'demo-3', name: 'CrossFit Warriors', member_count: 64 }
      ]);
    } finally {
      setIsLoadingClubs(false);
    }
  };

  useEffect(() => {
    if (visible) {
      // Initialize with any existing summary data
      if (workoutSummary?.title) setTitle(workoutSummary.title);
      if (workoutSummary?.notes) setNotes(workoutSummary.notes);
      if (workoutSummary?.visibility) setVisibility(workoutSummary.visibility);

      // Fetch user's clubs
      fetchUserClubs();

      // Animate slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }).start();
    } else {
      // Animate slide down
      Animated.spring(slideAnim, {
        toValue: height,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleToggleClub = (clubId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedClubs(prev =>
      prev.includes(clubId)
        ? prev.filter(id => id !== clubId)
        : [...prev, clubId]
    );
  };

  const handleToggleSocialPlatform = (platformId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShareToOptions(prev => ({
      ...prev,
      [platformId]: !prev[platformId as keyof typeof prev]
    }));
  };

  const handleSetVisibility = (newVisibility: 'public' | 'friends' | 'private') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisibility(newVisibility);
  };

  // Create posts in selected clubs
  const createClubPosts = async (workoutTitle: string, summary: WorkoutSummary) => {
    const postPromises = selectedClubs.map(async (clubId) => {
      try {
        const postContent = notes || `Just completed "${workoutTitle}"!`;

        const postData = {
          content: postContent,
          club_id: clubId,
          workout_id: summary.id, // Attach workout to post
          image_urls: selectedImages,
          visibility: visibility
        };

        await feedService.createPost(postData);
      } catch (error) {
        console.error(`Error creating post for club ${clubId}:`, error);
        // Don't throw - we want to continue with other clubs
      }
    });

    await Promise.allSettled(postPromises);
  };

  const handleSave = async () => {
    if (isCreatingPost) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsCreatingPost(true);

    try {
      const workoutTitle = title || `Workout on ${new Date().toLocaleDateString()}`;

      const updatedSummary: Partial<WorkoutSummary> = {
        title: workoutTitle,
        notes,
        visibility,
        sharedTo: {
          clubs: selectedClubs,
          platforms: Object.entries(shareToOptions)
            .filter(([_, isSelected]) => isSelected)
            .map(([platform]) => platform)
        },
        media: selectedImages.length > 0 ? selectedImages.map(url => ({ type: 'photo', url })) : undefined
      };

      saveWorkoutSummary(updatedSummary);

      // Create posts in selected clubs
      if (selectedClubs.length > 0 && workoutSummary) {
        await createClubPosts(workoutTitle, workoutSummary);
      }

      // Get platforms to share to
      const platformsToShareTo = Object.entries(shareToOptions)
        .filter(([_, isSelected]) => isSelected)
        .map(([platform]) => platform);

      // Navigate to the share page and then close this modal
      onClose();

      // If the user has shared to at least one platform or club, or uploaded media, navigate to the share page
      if (platformsToShareTo.length > 0 || selectedClubs.length > 0 || selectedImages.length > 0) {
        router.push("/workout/share");
      } else {
        // Otherwise just navigate back to workouts
        router.replace('/workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleAddMedia = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Add Media',
      'Choose how you want to add media to your workout post',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Photo Library',
          onPress: () => openImagePicker(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera permissions to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const openImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need photo library permissions to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 4)); // Max 4 images
    }
  };

  const removeImage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!workoutSummary) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <BlurView intensity={20} tint="dark" style={styles.blurBackground} />

          <TouchableOpacity
            style={styles.dismissArea}
            onPress={handleClose}
            activeOpacity={1}
          />

          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <BlurView intensity={40} tint="dark" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.headerHandle} />
                <Text style={styles.headerTitle}>Complete Workout</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <Ionicons name="close-circle" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Workout Summary Card */}
                <View style={styles.summaryCard}>
                  <LinearGradient
                    colors={['rgba(10, 132, 255, 0.8)', 'rgba(94, 92, 230, 0.8)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.summaryBackground}
                  >
                    <View style={styles.summaryContent}>
                      <Text style={styles.summaryTitle}>
                        {title || 'Untitled Workout'}
                      </Text>

                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>
                            {Math.floor(workoutSummary.duration / 60)}m {workoutSummary.duration % 60}s
                          </Text>
                          <Text style={styles.statLabel}>Duration</Text>
                        </View>

                        <View style={styles.verticalDivider} />

                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>
                            {workoutSummary.totalVolume.toLocaleString()}
                          </Text>
                          <Text style={styles.statLabel}>Volume (lbs)</Text>
                        </View>

                        <View style={styles.verticalDivider} />

                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>
                            {workoutSummary.totalSets}
                          </Text>
                          <Text style={styles.statLabel}>Sets</Text>
                        </View>
                      </View>

                      {workoutSummary.personalRecords > 0 && (
                        <View style={styles.prBadge}>
                          <Ionicons name="trophy" size={14} color="#FFD700" />
                          <Text style={styles.prText}>
                            {workoutSummary.personalRecords} Personal Record{workoutSummary.personalRecords > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </View>

                {/* Title Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Title</Text>
                  <TextInput
                    style={styles.titleInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Add a title to your workout"
                    placeholderTextColor="#8E8E93"
                  />
                </View>

                {/* Notes Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={styles.notesInput}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="How was your workout?"
                    placeholderTextColor="#8E8E93"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Media Attachment */}
                <View style={styles.mediaSection}>
                  <Text style={styles.sectionTitle}>Media</Text>

                  {selectedImages.length > 0 ? (
                    <View style={styles.selectedImagesContainer}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.imagesScrollView}
                      >
                        {selectedImages.map((imageUri, index) => (
                          <View key={index} style={styles.selectedImageWrapper}>
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.selectedImage}
                              resizeMode="cover"
                            />
                            <TouchableOpacity
                              style={styles.removeImageButton}
                              onPress={() => removeImage(index)}
                            >
                              <Ionicons name="close-circle" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                          </View>
                        ))}

                        {selectedImages.length < 4 && (
                          <TouchableOpacity
                            style={styles.addMoreMediaButton}
                            onPress={handleAddMedia}
                          >
                            <Ionicons name="add" size={24} color="#0A84FF" />
                          </TouchableOpacity>
                        )}
                      </ScrollView>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addMediaButton}
                      onPress={handleAddMedia}
                    >
                      <Ionicons name="camera" size={24} color="#0A84FF" />
                      <Text style={styles.addMediaText}>Add Photos</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Share to Clubs */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Share to Clubs</Text>

                  {isLoadingClubs ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>Loading your clubs...</Text>
                    </View>
                  ) : availableClubs.length > 0 ? (
                    <View style={styles.clubsContainer}>
                      {availableClubs.map(club => (
                        <TouchableOpacity
                          key={club.id}
                          style={[
                            styles.clubItem,
                            selectedClubs.includes(club.id) && styles.selectedClubItem
                          ]}
                          onPress={() => handleToggleClub(club.id)}
                        >
                          <View style={styles.clubInfo}>
                            <Text style={[
                              styles.clubName,
                              selectedClubs.includes(club.id) && styles.selectedClubName
                            ]}>
                              {club.name}
                            </Text>
                            <Text style={styles.memberCount}>
                              {club.member_count || club.memberCount || 0} members
                            </Text>
                          </View>

                          {selectedClubs.includes(club.id) && (
                            <View style={styles.checkIcon}>
                              <Ionicons name="checkmark-circle" size={20} color="#30D158" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyClubsContainer}>
                      <Text style={styles.emptyClubsText}>
                        You haven't joined any clubs yet. Join clubs to share your workouts!
                      </Text>
                    </View>
                  )}
                </View>

                {/* Visibility Options */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Visibility</Text>

                  <View style={styles.visibilityOptions}>
                    <TouchableOpacity
                      style={[
                        styles.visibilityOption,
                        visibility === 'public' && styles.selectedVisibilityOption
                      ]}
                      onPress={() => handleSetVisibility('public')}
                    >
                      <Ionicons
                        name="globe-outline"
                        size={20}
                        color={visibility === 'public' ? '#0A84FF' : '#8E8E93'}
                      />
                      <Text style={[
                        styles.visibilityOptionText,
                        visibility === 'public' && styles.selectedVisibilityText
                      ]}>
                        Public
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.visibilityOption,
                        visibility === 'friends' && styles.selectedVisibilityOption
                      ]}
                      onPress={() => handleSetVisibility('friends')}
                    >
                      <Ionicons
                        name="people-outline"
                        size={20}
                        color={visibility === 'friends' ? '#0A84FF' : '#8E8E93'}
                      />
                      <Text style={[
                        styles.visibilityOptionText,
                        visibility === 'friends' && styles.selectedVisibilityText
                      ]}>
                        Friends
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.visibilityOption,
                        visibility === 'private' && styles.selectedVisibilityOption
                      ]}
                      onPress={() => handleSetVisibility('private')}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={visibility === 'private' ? '#0A84FF' : '#8E8E93'}
                      />
                      <Text style={[
                        styles.visibilityOptionText,
                        visibility === 'private' && styles.selectedVisibilityText
                      ]}>
                        Private
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveButton, isCreatingPost && styles.saveButtonDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={isCreatingPost}
              >
                {isCreatingPost ? (
                  <View style={styles.saveButtonLoading}>
                    <Text style={styles.saveButtonText}>Creating Posts...</Text>
                  </View>
                ) : (
                  <Text style={styles.saveButtonText}>Save Workout</Text>
                )}
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    height: height * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.2)',
  },
  headerHandle: {
    width: 36,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2.5,
    position: 'absolute',
    top: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for the save button
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  summaryBackground: {
    borderRadius: 16,
  },
  summaryContent: {
    padding: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'center',
  },
  prText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 6,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    height: 100,
    textAlignVertical: 'top',
  },
  mediaSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.18)',
    borderRadius: 8,
    padding: 16,
  },
  addMediaText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0A84FF',
    marginLeft: 8,
  },
  selectedMediaContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  selectedMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  selectedImagesContainer: {
    marginTop: 12,
  },
  imagesScrollView: {
    flexDirection: 'row',
  },
  selectedImageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
  },
  addMoreMediaButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0A84FF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  clubsContainer: {
    marginBottom: 8,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  clubInfo: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyClubsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyClubsText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedClubItem: {
    backgroundColor: 'rgba(48, 209, 88, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  clubName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  selectedClubName: {
    color: '#30D158',
  },
  memberCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 8,
  },
  checkIcon: {
    marginLeft: 8,
  },
  visibilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  selectedVisibilityOption: {
    backgroundColor: 'rgba(10, 132, 255, 0.18)',
  },
  visibilityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 6,
  },
  selectedVisibilityText: {
    color: '#0A84FF',
  },
  saveButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(10, 132, 255, 0.5)',
  },
  saveButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default WorkoutCompleteModal;