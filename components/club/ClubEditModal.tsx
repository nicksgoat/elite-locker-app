import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Define the club data structure
export interface ClubData {
  id: string;
  name: string;
  description: string;
  members?: number;
  onlineNow?: number;
  createdAt?: string;
  bannerImage: string;
  icon: string;
  tags: string[];
  rules: string[];
  moderators?: {
    name: string;
    avatar: string;
    isOwner?: boolean;
  }[];
  price?: number;
  isPremium?: boolean;
}

interface ClubEditModalProps {
  visible: boolean;
  onClose: () => void;
  clubData: ClubData;
  onSave: (updatedClub: Partial<ClubData>) => Promise<void>;
}

const ClubEditModal: React.FC<ClubEditModalProps> = ({
  visible,
  onClose,
  clubData,
  onSave,
}) => {
  // Form state
  const [name, setName] = useState(clubData.name);
  const [description, setDescription] = useState(clubData.description);
  const [bannerImage, setBannerImage] = useState(clubData.bannerImage);
  const [iconImage, setIconImage] = useState(clubData.icon);
  const [tags, setTags] = useState<string[]>(clubData.tags);
  const [rules, setRules] = useState<string[]>(clubData.rules);
  const [newTag, setNewTag] = useState('');
  const [newRule, setNewRule] = useState('');
  const [price, setPrice] = useState(clubData.price?.toString() || '');
  const [isPremium, setIsPremium] = useState(clubData.isPremium || false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when club data changes
  useEffect(() => {
    if (visible) {
      setName(clubData.name);
      setDescription(clubData.description);
      setBannerImage(clubData.bannerImage);
      setIconImage(clubData.icon);
      setTags(clubData.tags);
      setRules(clubData.rules);
      setPrice(clubData.price?.toString() || '');
      setIsPremium(clubData.isPremium || false);
    }
  }, [visible, clubData]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Pick a banner image from gallery
  const pickBannerImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your banner image.');
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
        console.log('Selected banner image:', selectedImageUri);
        setBannerImage(selectedImageUri);

        // Show success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking banner image:', error);
      Alert.alert('Error', 'There was an error selecting the image. Please try again.');
    }
  };

  // Pick an icon image from gallery
  const pickIconImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your club icon.');
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
        console.log('Selected icon image:', selectedImageUri);
        setIconImage(selectedImageUri);

        // Show success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking icon image:', error);
      Alert.alert('Error', 'There was an error selecting the image. Please try again.');
    }
  };

  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Add a new rule
  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Remove a rule
  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Handle form submission
  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      Alert.alert('Error', 'Club name cannot be empty');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Description cannot be empty');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // Prepare updated club data
      // Don't include moderators - they will be handled by the parent component
      const updatedClub: Partial<ClubData> = {
        name,
        description,
        bannerImage,
        icon: iconImage,
        tags,
        rules,
        price: price ? parseFloat(price) : undefined,
        isPremium,
      };

      await onSave(updatedClub);
      onClose();
    } catch (error) {
      console.error('Error saving club:', error);
      Alert.alert('Error', 'Failed to save club changes. Please try again.');
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

              <Text style={styles.headerTitle}>Edit Club</Text>

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
              {/* Club Images */}
              <View style={styles.imagesContainer}>
                {/* Banner image */}
                <TouchableOpacity
                  style={styles.bannerImageContainer}
                  onPress={pickBannerImage}
                  activeOpacity={0.8}
                >
                  {bannerImage ? (
                    <Image
                      source={{ uri: bannerImage }}
                      style={styles.bannerImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.bannerImagePlaceholder}>
                      <Ionicons name="image-outline" size={30} color="#AAAAAA" />
                      <Text style={styles.imagePlaceholderText}>Add Banner Image</Text>
                    </View>
                  )}

                  <View style={styles.editIconContainer}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>

                {/* Club icon */}
                <TouchableOpacity
                  style={styles.iconContainer}
                  onPress={pickIconImage}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: iconImage }}
                    style={styles.iconImage}
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
                  <Text style={styles.inputLabel}>Club Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#666666"
                    placeholder="Club name"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.descriptionInput]}
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor="#666666"
                    placeholder="Describe your club"
                    multiline
                    maxLength={500}
                  />
                  <Text style={styles.charCount}>{description.length}/500</Text>
                </View>

                {/* Premium settings */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Premium Club</Text>
                  <View style={styles.premiumContainer}>
                    <TouchableOpacity
                      style={[styles.premiumOption, isPremium && styles.selectedOption]}
                      onPress={() => setIsPremium(true)}
                    >
                      <Text style={[styles.premiumOptionText, isPremium && styles.selectedOptionText]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.premiumOption, !isPremium && styles.selectedOption]}
                      onPress={() => setIsPremium(false)}
                    >
                      <Text style={[styles.premiumOptionText, !isPremium && styles.selectedOptionText]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {isPremium && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Monthly Price ($)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={price}
                      onChangeText={setPrice}
                      placeholderTextColor="#666666"
                      placeholder="9.99"
                      keyboardType="decimal-pad"
                    />
                  </View>
                )}
              </View>

              {/* Tags */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                        <Ionicons name="close-circle" size={16} color="#AAAAAA" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={styles.tagInput}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Add a tag"
                    placeholderTextColor="#666666"
                    onSubmitEditing={handleAddTag}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Rules */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Club Rules</Text>
                {rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={styles.ruleNumber}>{index + 1}.</Text>
                    <Text style={styles.ruleText}>{rule}</Text>
                    <TouchableOpacity onPress={() => handleRemoveRule(index)}>
                      <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={styles.ruleInputContainer}>
                  <TextInput
                    style={styles.ruleInput}
                    value={newRule}
                    onChangeText={setNewRule}
                    placeholder="Add a rule"
                    placeholderTextColor="#666666"
                    onSubmitEditing={handleAddRule}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddRule}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeText: {
    color: '#999999',
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0A84FF',
    borderRadius: 14,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  imagesContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  bannerImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#1C1C1E',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
    marginTop: -40,
    borderWidth: 3,
    borderColor: '#000',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#AAAAAA',
    marginTop: 8,
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  premiumContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  premiumOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#0A84FF',
  },
  premiumOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
  },
  ruleNumber: {
    color: '#AAAAAA',
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  ruleText: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  ruleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ruleInput: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  bottomPadding: {
    height: 40,
  },
});

export default ClubEditModal;
