import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { feedService } from '../../../services/feedService';
import { workoutService } from '../../../services/workoutService';

// Post type options
type PostType = 'text' | 'image' | 'video' | 'poll' | 'workout';

export default function CreatePostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>('text');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [showWorkoutPicker, setShowWorkoutPicker] = useState(false);

  // Available tags for the club
  const availableTags = [
    'Form Check',
    'Question',
    'Success',
    'Progress',
    'Training',
    'Equipment',
    'Nutrition',
    'Recovery'
  ];

  // Fetch user's workouts for workout attachment
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const workouts = await workoutService.getUserWorkouts();
        setAvailableWorkouts(workouts || []);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setAvailableWorkouts([]);
      }
    };

    if (postType === 'workout') {
      fetchWorkouts();
    }
  }, [postType]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // If user has entered content, confirm before leaving
    if (title.trim() || body.trim() || tags.length > 0) {
      Alert.alert(
        'Discard Post?',
        'Your post will be discarded if you leave.',
        [
          {
            text: 'Stay',
            style: 'cancel'
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handlePostTypeChange = (type: PostType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPostType(type);
  };

  const handleAddTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Don't add if already present
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }

    setCurrentTag('');
    setShowAddTag(false);
  };

  const handleRemoveTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTags(tags.filter(t => t !== tag));
  };

  const handleCreatePost = async () => {
    // Validate post
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title to your post.');
      return;
    }

    if (postType === 'text' && !body.trim()) {
      Alert.alert('Missing Content', 'Please add some content to your post.');
      return;
    }

    if (postType === 'image' && selectedImages.length === 0) {
      Alert.alert('Missing Image', 'Please add at least one image to your post.');
      return;
    }

    if (postType === 'workout' && !selectedWorkout) {
      Alert.alert('Missing Workout', 'Please select a workout to attach to your post.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCreatingPost(true);

    try {
      const postData = {
        content: body || title,
        club_id: id, // Ensure club_id is properly set
        image_urls: selectedImages,
        workout_id: selectedWorkout?.id,
        tags: tags,
        post_type: postType
      };

      console.log('Creating post with data:', postData); // Debug log
      await feedService.createPost(postData);

      Alert.alert(
        'Post Created',
        'Your post has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleAddImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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

  const handleAddVideo = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need photo library permissions to select videos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImages([result.assets[0].uri]); // Replace with single video
    }
  };

  const removeImage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectWorkout = (workout: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWorkout(workout);
    setShowWorkoutPicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[
            styles.postButton,
            (isCreatingPost || !title.trim() || (postType === 'text' && !body.trim())) && styles.postButtonDisabled
          ]}
          onPress={handleCreatePost}
          disabled={isCreatingPost || !title.trim() || (postType === 'text' && !body.trim())}
          activeOpacity={0.8}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          {isCreatingPost ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.postButtonText,
              (!title.trim() || postType === 'text' && !body.trim()) && styles.postButtonTextDisabled
            ]}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Post Type Selector */}
      <View style={styles.postTypeSelector}>
        <TouchableOpacity
          style={[styles.postTypeOption, postType === 'text' && styles.postTypeSelected]}
          onPress={() => handlePostTypeChange('text')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={postType === 'text' ? "#0A84FF" : "#A0A0A0"}
          />
          <Text style={[
            styles.postTypeText,
            postType === 'text' && styles.postTypeTextSelected
          ]}>Text</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postTypeOption, postType === 'image' && styles.postTypeSelected]}
          onPress={() => handlePostTypeChange('image')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="image-outline"
            size={20}
            color={postType === 'image' ? "#0A84FF" : "#A0A0A0"}
          />
          <Text style={[
            styles.postTypeText,
            postType === 'image' && styles.postTypeTextSelected
          ]}>Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postTypeOption, postType === 'video' && styles.postTypeSelected]}
          onPress={() => handlePostTypeChange('video')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="videocam-outline"
            size={20}
            color={postType === 'video' ? "#0A84FF" : "#A0A0A0"}
          />
          <Text style={[
            styles.postTypeText,
            postType === 'video' && styles.postTypeTextSelected
          ]}>Video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postTypeOption, postType === 'workout' && styles.postTypeSelected]}
          onPress={() => handlePostTypeChange('workout')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="barbell-outline"
            size={20}
            color={postType === 'workout' ? "#0A84FF" : "#A0A0A0"}
          />
          <Text style={[
            styles.postTypeText,
            postType === 'workout' && styles.postTypeTextSelected
          ]}>Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postTypeOption, postType === 'poll' && styles.postTypeSelected]}
          onPress={() => handlePostTypeChange('poll')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="bar-chart-outline"
            size={20}
            color={postType === 'poll' ? "#0A84FF" : "#A0A0A0"}
          />
          <Text style={[
            styles.postTypeText,
            postType === 'poll' && styles.postTypeTextSelected
          ]}>Poll</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#A0A0A0"
            value={title}
            onChangeText={setTitle}
            maxLength={300}
            multiline
          />
        </View>

        {/* Content Input based on post type */}
        {postType === 'text' && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.bodyInput}
              placeholder="Text (optional)"
              placeholderTextColor="#A0A0A0"
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        {postType === 'image' && (
          <View style={styles.mediaContainer}>
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
                      style={styles.addMoreImageButton}
                      onPress={handleAddImage}
                    >
                      <Ionicons name="add" size={24} color="#0A84FF" />
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addMediaButton}
                onPress={handleAddImage}
              >
                <Ionicons name="image" size={32} color="#0A84FF" />
                <Text style={styles.addMediaText}>Add Images</Text>
              </TouchableOpacity>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption (optional)"
                placeholderTextColor="#A0A0A0"
                value={body}
                onChangeText={setBody}
                multiline
              />
            </View>
          </View>
        )}

        {postType === 'video' && (
          <View style={styles.mediaContainer}>
            <TouchableOpacity
              style={styles.addMediaButton}
              onPress={handleAddVideo}
            >
              <Ionicons name="videocam" size={32} color="#0A84FF" />
              <Text style={styles.addMediaText}>Add Video</Text>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption (optional)"
                placeholderTextColor="#A0A0A0"
                value={body}
                onChangeText={setBody}
                multiline
              />
            </View>
          </View>
        )}

        {postType === 'workout' && (
          <View style={styles.workoutContainer}>
            {selectedWorkout ? (
              <View style={styles.selectedWorkoutContainer}>
                <View style={styles.workoutCard}>
                  <Text style={styles.workoutTitle}>{selectedWorkout.title}</Text>
                  <Text style={styles.workoutDetails}>
                    {selectedWorkout.exercises?.length || 0} exercises • {selectedWorkout.duration || 0} min
                  </Text>
                  <TouchableOpacity
                    style={styles.changeWorkoutButton}
                    onPress={() => setShowWorkoutPicker(true)}
                  >
                    <Text style={styles.changeWorkoutText}>Change Workout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectWorkoutButton}
                onPress={() => setShowWorkoutPicker(true)}
              >
                <Ionicons name="barbell" size={32} color="#0A84FF" />
                <Text style={styles.selectWorkoutText}>Select Workout</Text>
              </TouchableOpacity>
            )}

            {showWorkoutPicker && (
              <View style={styles.workoutPicker}>
                <Text style={styles.workoutPickerTitle}>Select a Workout</Text>
                <ScrollView style={styles.workoutList}>
                  {availableWorkouts.map((workout, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.workoutOption}
                      onPress={() => handleSelectWorkout(workout)}
                    >
                      <Text style={styles.workoutOptionTitle}>{workout.title}</Text>
                      <Text style={styles.workoutOptionDetails}>
                        {workout.exercises?.length || 0} exercises • {workout.duration || 0} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.cancelWorkoutButton}
                  onPress={() => setShowWorkoutPicker(false)}
                >
                  <Text style={styles.cancelWorkoutText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder="Add a caption (optional)"
                placeholderTextColor="#A0A0A0"
                value={body}
                onChangeText={setBody}
                multiline
              />
            </View>
          </View>
        )}

        {postType === 'poll' && (
          <View style={styles.pollContainer}>
            <Text style={styles.pollInfoText}>Poll functionality would be implemented here in a real app.</Text>

            {/* Placeholder poll options */}
            <View style={styles.pollOption}>
              <TextInput
                style={styles.pollOptionInput}
                placeholder="Option 1"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.pollOption}>
              <TextInput
                style={styles.pollOptionInput}
                placeholder="Option 2"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <TouchableOpacity style={styles.addPollOptionButton}>
              <Ionicons name="add-circle-outline" size={20} color="#0A84FF" />
              <Text style={styles.addPollOptionText}>Add Option</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Tags</Text>

          {/* Selected Tags */}
          <View style={styles.selectedTags}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity
                  style={styles.removeTagButton}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Tag Button */}
            {!showAddTag && tags.length < 3 && (
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={() => setShowAddTag(true)}
              >
                <Ionicons name="add" size={18} color="#0A84FF" />
                <Text style={styles.addTagText}>Add Tag</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Tag Selector */}
          {showAddTag && (
            <View style={styles.tagSelector}>
              <TextInput
                style={styles.tagInput}
                placeholder="Search tags"
                placeholderTextColor="#A0A0A0"
                value={currentTag}
                onChangeText={setCurrentTag}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsScrollContent}
              >
                {availableTags
                  .filter(tag => !tags.includes(tag) &&
                    (currentTag.trim() === '' ||
                     tag.toLowerCase().includes(currentTag.toLowerCase())))
                  .map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.tagOption}
                      onPress={() => handleAddTag(tag)}
                    >
                      <Text style={styles.tagOptionText}>{tag}</Text>
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>
            </View>
          )}
        </View>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    backgroundColor: '#000000',
    minHeight: 60,
  },
  headerButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0A84FF',
    minWidth: 70,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  postTypeSelector: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
  },
  postTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 50,
  },
  postTypeSelected: {
    borderBottomWidth: 3,
    borderBottomColor: '#0A84FF',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0A0A0',
    marginLeft: 4,
  },
  postTypeTextSelected: {
    color: '#0A84FF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  inputContainer: {
    backgroundColor: '#1C1C1E',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  bodyInput: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 16,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  mediaContainer: {
    margin: 12,
  },
  addMediaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    borderRadius: 8,
    padding: 24,
    marginBottom: 12,
  },
  addMediaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
    marginTop: 8,
  },
  captionInput: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 12,
    minHeight: 80,
  },
  pollContainer: {
    margin: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    padding: 12,
  },
  pollInfoText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  pollOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
  },
  pollOptionInput: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 12,
  },
  addPollOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  addPollOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
    marginLeft: 6,
  },
  tagsSection: {
    margin: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#0A84FF',
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  addTagText: {
    fontSize: 14,
    color: '#0A84FF',
    marginLeft: 4,
  },
  tagSelector: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    padding: 12,
  },
  tagInput: {
    fontSize: 14,
    color: '#FFFFFF',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 12,
  },
  tagsScrollContent: {
    paddingRight: 16,
  },
  tagOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    marginRight: 8,
  },
  tagOptionText: {
    fontSize: 14,
    color: '#0A84FF',
  },
  // New styles for enhanced functionality
  selectedImagesContainer: {
    marginBottom: 12,
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
  addMoreImageButton: {
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
  workoutContainer: {
    margin: 12,
  },
  selectedWorkoutContainer: {
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  changeWorkoutButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  changeWorkoutText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '500',
  },
  selectWorkoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    borderRadius: 8,
    padding: 24,
    marginBottom: 12,
  },
  selectWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
    marginTop: 8,
  },
  workoutPicker: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  workoutPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  workoutList: {
    maxHeight: 200,
    marginBottom: 12,
  },
  workoutOption: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  workoutOptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  workoutOptionDetails: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cancelWorkoutButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
  },
  cancelWorkoutText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
});