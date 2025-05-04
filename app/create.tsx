import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

// Available sports for selection
const availableSports = [
  { id: 'football', name: 'Football' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'speed_training', name: 'Speed Training' },
  { id: 'agility', name: 'Agility' },
  { id: 'strength', name: 'Strength' },
  { id: 'yoga', name: 'Yoga' },
  { id: 'wellness', name: 'Wellness' },
  { id: 'flexibility', name: 'Flexibility' },
  { id: 'running', name: 'Running' },
  { id: 'crossfit', name: 'CrossFit' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'swimming', name: 'Swimming' },
];

export default function CreateClubScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport_tags: [],
    monthly_price: '',
    annual_price: '',
    trial_days: '7',
    coverImage: null,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const handleSportToggle = (sportId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentTags = [...formData.sport_tags];
    
    if (currentTags.includes(sportId)) {
      // Remove sport if already selected
      setFormData({
        ...formData,
        sport_tags: currentTags.filter(tag => tag !== sportId),
      });
    } else {
      // Add sport if not already selected (max 3)
      if (currentTags.length < 3) {
        setFormData({
          ...formData,
          sport_tags: [...currentTags, sportId],
        });
      } else {
        Alert.alert('Limit Reached', 'You can select up to 3 sport tags for your club.');
      }
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to add a cover image for your club.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData({
          ...formData,
          coverImage: result.assets[0].uri,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error picking the image.');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.sport_tags.length === 0) {
      newErrors.sport_tags = 'Please select at least one sport tag';
    }

    if (!formData.monthly_price.trim()) {
      newErrors.monthly_price = 'Monthly price is required';
    } else if (isNaN(parseFloat(formData.monthly_price)) || parseFloat(formData.monthly_price) <= 0) {
      newErrors.monthly_price = 'Please enter a valid price';
    }

    if (!formData.annual_price.trim()) {
      newErrors.annual_price = 'Annual price is required';
    } else if (isNaN(parseFloat(formData.annual_price)) || parseFloat(formData.annual_price) <= 0) {
      newErrors.annual_price = 'Please enter a valid price';
    }

    if (!formData.coverImage) {
      newErrors.coverImage = 'Please add a cover image for your club';
    }

    return newErrors;
  };

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // In a real app, this would send data to a backend server
    Alert.alert(
      'Club Created',
      `Your club "${formData.name}" has been created successfully!`,
      [
        {
          text: 'View Club',
          onPress: () => {
            // Navigate to the club detail screen
            router.push('/club/new');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <BlurView intensity={30} style={styles.header}>
        <Text style={styles.title}>Create Club</Text>
      </BlurView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Cover Image Picker */}
          <TouchableOpacity style={styles.coverImageContainer} onPress={pickImage}>
            {formData.coverImage ? (
              <Image source={{ uri: formData.coverImage }} style={styles.coverImage} />
            ) : (
              <View style={styles.coverImagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#8E8E93" />
                <Text style={styles.coverImageText}>Add Cover Image</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.coverImage && (
            <Text style={styles.errorText}>{errors.coverImage}</Text>
          )}

          {/* Club Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Club Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Elite Training Club"
              placeholderTextColor="#8E8E93"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Tell people what your club is about..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={5}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Sport Tags */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sport Tags (select up to 3)</Text>
            <View style={styles.sportsContainer}>
              {availableSports.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportTag,
                    formData.sport_tags.includes(sport.id) && styles.sportTagSelected,
                  ]}
                  onPress={() => handleSportToggle(sport.id)}
                >
                  <Text
                    style={[
                      styles.sportTagText,
                      formData.sport_tags.includes(sport.id) && styles.sportTagTextSelected,
                    ]}
                  >
                    {sport.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.sport_tags && (
              <Text style={styles.errorText}>{errors.sport_tags}</Text>
            )}
          </View>

          {/* Pricing */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pricing</Text>
            <View style={styles.pricingRow}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Monthly ($)</Text>
                <TextInput
                  style={[styles.priceInput, errors.monthly_price && styles.inputError]}
                  placeholder="29.99"
                  placeholderTextColor="#8E8E93"
                  keyboardType="decimal-pad"
                  value={formData.monthly_price}
                  onChangeText={(text) => handleInputChange('monthly_price', text)}
                />
                {errors.monthly_price && (
                  <Text style={styles.errorText}>{errors.monthly_price}</Text>
                )}
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Annual ($)</Text>
                <TextInput
                  style={[styles.priceInput, errors.annual_price && styles.inputError]}
                  placeholder="299.99"
                  placeholderTextColor="#8E8E93"
                  keyboardType="decimal-pad"
                  value={formData.annual_price}
                  onChangeText={(text) => handleInputChange('annual_price', text)}
                />
                {errors.annual_price && (
                  <Text style={styles.errorText}>{errors.annual_price}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Trial Period */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Free Trial Period (days)</Text>
            <TextInput
              style={styles.input}
              placeholder="7"
              placeholderTextColor="#8E8E93"
              keyboardType="number-pad"
              value={formData.trial_days}
              onChangeText={(text) => handleInputChange('trial_days', text)}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
            <Text style={styles.createButtonText}>Create Club</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(60, 60, 67, 0.29)',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  coverImageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textArea: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    height: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  sportsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sportTag: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  sportTagSelected: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  sportTagText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  sportTagTextSelected: {
    color: '#FFFFFF',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 6,
  },
  priceInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.29)',
  },
  createButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 