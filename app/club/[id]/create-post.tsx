import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity, 
  ScrollView,
  Image,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

// Post type options
type PostType = 'text' | 'image' | 'video' | 'poll';

export default function CreatePostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>('text');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  
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
  
  const handleCreatePost = () => {
    // Validate post
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title to your post.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // In a real app, this would create the post
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
  };
  
  const handleAddImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Add Image', 'This would open the image picker in a real app.');
  };
  
  const handleAddVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Add Video', 'This would open the video picker in a real app.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleBack}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          style={[
            styles.postButton,
            (!title.trim() || postType === 'text' && !body.trim()) && styles.postButtonDisabled
          ]}
          onPress={handleCreatePost}
          disabled={!title.trim() || (postType === 'text' && !body.trim())}
        >
          <Text style={[
            styles.postButtonText,
            (!title.trim() || postType === 'text' && !body.trim()) && styles.postButtonTextDisabled
          ]}>Post</Text>
        </TouchableOpacity>
      </View>
      
      {/* Post Type Selector */}
      <View style={styles.postTypeSelector}>
        <TouchableOpacity 
          style={[styles.postTypeOption, postType === 'text' && styles.postTypeSelected]}
          onPress={() => handlePostTypeChange('text')}
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
          style={[styles.postTypeOption, postType === 'poll' && styles.postTypeSelected]}
          onPress={() => handlePostTypeChange('poll')}
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
            <TouchableOpacity 
              style={styles.addMediaButton}
              onPress={handleAddImage}
            >
              <Ionicons name="image" size={32} color="#0A84FF" />
              <Text style={styles.addMediaText}>Add Image</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#0A84FF',
  },
  postButtonDisabled: {
    backgroundColor: 'rgba(10, 132, 255, 0.3)',
  },
  postButtonText: {
    fontSize: 14,
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
    paddingVertical: 12,
  },
  postTypeSelected: {
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF',
  },
  postTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A0A0A0',
    marginLeft: 6,
  },
  postTypeTextSelected: {
    color: '#0A84FF',
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: '#1C1C1E',
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 12,
    minHeight: 60,
  },
  bodyInput: {
    fontSize: 16,
    color: '#FFFFFF',
    padding: 12,
    minHeight: 200,
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
}); 