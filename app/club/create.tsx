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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CreateClubScreen() {
  const router = useRouter();
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'General', 'Powerlifting', 'Bodybuilding', 'CrossFit', 
    'Running', 'Cycling', 'Yoga', 'Martial Arts', 'Other'
  ];

  const handleCreateClub = async () => {
    if (!clubName.trim()) {
      Alert.alert('Error', 'Please enter a club name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      // Here you would typically make an API call to create the club
      // For now, we'll simulate a successful creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success!', 
        'Your club has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create club. Please try again.');
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
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Club</Text>
          <TouchableOpacity 
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateClub}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Club Name */}
          <BlurView intensity={20} tint="dark" style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Club Name</Text>
            <TextInput
              style={styles.textInput}
              value={clubName}
              onChangeText={setClubName}
              placeholder="Enter club name"
              placeholderTextColor="#8E8E93"
              maxLength={50}
            />
            <Text style={styles.characterCount}>{clubName.length}/50</Text>
          </BlurView>

          {/* Description */}
          <BlurView intensity={20} tint="dark" style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your club and what it's about"
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{description.length}/200</Text>
          </BlurView>

          {/* Category */}
          <BlurView intensity={20} tint="dark" style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonSelected
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextSelected
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </BlurView>

          {/* Privacy */}
          <BlurView intensity={20} tint="dark" style={styles.inputSection}>
            <View style={styles.privacyHeader}>
              <Text style={styles.sectionTitle}>Privacy</Text>
              <TouchableOpacity
                style={styles.toggleContainer}
                onPress={() => {
                  setIsPrivate(!isPrivate);
                  Haptics.selectionAsync();
                }}
              >
                <View style={[styles.toggle, isPrivate && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, isPrivate && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.privacyDescription}>
              {isPrivate 
                ? 'Only members you invite can join this club'
                : 'Anyone can find and join this club'
              }
            </Text>
          </BlurView>

          {/* Guidelines */}
          <BlurView intensity={20} tint="dark" style={styles.guidelinesSection}>
            <Text style={styles.sectionTitle}>Community Guidelines</Text>
            <Text style={styles.guidelinesText}>
              • Keep discussions respectful and supportive{'\n'}
              • Share workouts, tips, and motivation{'\n'}
              • No spam or self-promotion{'\n'}
              • Report inappropriate content
            </Text>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#D3D3D3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
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
    marginBottom: 12,
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
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 8,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonSelected: {
    backgroundColor: '#D3D3D3',
    borderColor: '#D3D3D3',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#000000',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleContainer: {
    padding: 4,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#D3D3D3',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  privacyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  guidelinesSection: {
    marginBottom: 40,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  guidelinesText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 22,
  },
}); 