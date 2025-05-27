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

export default function CreatePostScreen() {
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to add photos');
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
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCreatePost = async () => {
    if (!postText.trim() && selectedImages.length === 0) {
      Alert.alert('Error', 'Please add some content to your post');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // Here you would typically make an API call to create the post
      // For now, we'll simulate a successful creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success!', 
        'Your post has been shared.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create post. Please try again.');
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
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity 
            style={[styles.shareButton, isLoading && styles.shareButtonDisabled]}
            onPress={handleCreatePost}
            disabled={isLoading}
          >
            <Text style={styles.shareButtonText}>
              {isLoading ? 'Sharing...' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Content */}
          <BlurView intensity={20} tint="dark" style={styles.contentSection}>
            <TextInput
              style={styles.postInput}
              value={postText}
              onChangeText={setPostText}
              placeholder="What's on your mind?"
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{postText.length}/500</Text>
          </BlurView>

          {/* Images */}
          {selectedImages.length > 0 && (
            <BlurView intensity={20} tint="dark" style={styles.imagesSection}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri }} style={styles.selectedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </BlurView>
          )}

          {/* Add Media */}
          <BlurView intensity={20} tint="dark" style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>Add to your post</Text>
            <TouchableOpacity style={styles.mediaButton} onPress={handlePickImages}>
              <Ionicons name="images" size={24} color="#D3D3D3" />
              <Text style={styles.mediaButtonText}>Photos</Text>
              <Text style={styles.mediaButtonSubtext}>
                {selectedImages.length}/4
              </Text>
            </TouchableOpacity>
          </BlurView>

          {/* Privacy */}
          <BlurView intensity={20} tint="dark" style={styles.privacySection}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <View style={styles.privacyOptions}>
              {[
                { key: 'public', label: 'Public', icon: 'globe-outline', desc: 'Anyone can see' },
                { key: 'friends', label: 'Friends', icon: 'people-outline', desc: 'Friends only' },
                { key: 'private', label: 'Only me', icon: 'lock-closed-outline', desc: 'Only you can see' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.privacyOption,
                    privacy === option.key && styles.privacyOptionSelected
                  ]}
                  onPress={() => {
                    setPrivacy(option.key as any);
                    Haptics.selectionAsync();
                  }}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={privacy === option.key ? '#000000' : '#D3D3D3'} 
                  />
                  <View style={styles.privacyOptionText}>
                    <Text style={[
                      styles.privacyOptionLabel,
                      privacy === option.key && styles.privacyOptionLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.privacyOptionDesc,
                      privacy === option.key && styles.privacyOptionDescSelected
                    ]}>
                      {option.desc}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  shareButton: {
    backgroundColor: '#D3D3D3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentSection: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  postInput: {
    fontSize: 18,
    color: '#FFFFFF',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 12,
  },
  imagesSection: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  imageContainer: {
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
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaSection: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  mediaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  mediaButtonSubtext: {
    color: '#8E8E93',
    fontSize: 14,
  },
  privacySection: {
    marginBottom: 40,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  privacyOptions: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  privacyOptionSelected: {
    backgroundColor: '#D3D3D3',
    borderColor: '#D3D3D3',
  },
  privacyOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  privacyOptionLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  privacyOptionLabelSelected: {
    color: '#000000',
  },
  privacyOptionDesc: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  privacyOptionDescSelected: {
    color: '#666666',
  },
}); 