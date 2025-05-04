import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

// Types for our data
interface TagGroup {
  id: string;
  name: string;
  tags: Tag[];
}

interface Tag {
  id: string;
  name: string;
  label: string;
}

interface MeasurementType {
  id: string;
  name: string;
  label: string;
  icon: string;
}

// Available tag groups for selection
const tagGroups: TagGroup[] = [
  {
    id: 'tg1',
    name: 'Exercise Type',
    tags: [
      { id: 't1', name: 'strength_training', label: 'Strength' },
      { id: 't2', name: 'cardio', label: 'Cardio' },
      { id: 't3', name: 'plyometrics', label: 'Plyometrics' },
      { id: 't4', name: 'mobility', label: 'Mobility' },
      { id: 't5', name: 'skill', label: 'Skill' },
    ],
  },
  {
    id: 'tg2',
    name: 'Body Part',
    tags: [
      { id: 't6', name: 'legs', label: 'Legs' },
      { id: 't7', name: 'chest', label: 'Chest' },
      { id: 't8', name: 'back', label: 'Back' },
      { id: 't9', name: 'shoulders', label: 'Shoulders' },
      { id: 't10', name: 'arms', label: 'Arms' },
      { id: 't11', name: 'core', label: 'Core' },
      { id: 't12', name: 'full_body', label: 'Full Body' },
    ],
  },
  {
    id: 'tg3',
    name: 'Equipment',
    tags: [
      { id: 't13', name: 'barbell', label: 'Barbell' },
      { id: 't14', name: 'dumbbell', label: 'Dumbbell' },
      { id: 't15', name: 'kettlebell', label: 'Kettlebell' },
      { id: 't16', name: 'machine', label: 'Machine' },
      { id: 't17', name: 'bodyweight', label: 'Bodyweight' },
      { id: 't18', name: 'bands', label: 'Bands' },
      { id: 't19', name: 'cable', label: 'Cable' },
    ],
  },
  {
    id: 'tg4',
    name: 'Sport',
    tags: [
      { id: 't20', name: 'football', label: 'Football' },
      { id: 't21', name: 'basketball', label: 'Basketball' },
      { id: 't22', name: 'baseball', label: 'Baseball' },
      { id: 't23', name: 'soccer', label: 'Soccer' },
      { id: 't24', name: 'hockey', label: 'Hockey' },
      { id: 't25', name: 'tennis', label: 'Tennis' },
      { id: 't26', name: 'golf', label: 'Golf' },
    ],
  },
];

// Available measurement types
const measurementTypes: MeasurementType[] = [
  { id: 'm1', name: 'weight_reps', label: 'Weight & Reps', icon: 'barbell-outline' },
  { id: 'm2', name: 'reps', label: 'Reps Only', icon: 'repeat-outline' },
  { id: 'm3', name: 'time_based', label: 'Time-Based', icon: 'time-outline' },
  { id: 'm4', name: 'distance', label: 'Distance', icon: 'map-outline' },
  { id: 'm5', name: 'rpe', label: 'RPE', icon: 'speedometer-outline' },
  { id: 'm6', name: 'height', label: 'Height', icon: 'trending-up-outline' },
];

const TagSelector = ({ 
  tag, 
  selected, 
  onPress 
}: { 
  tag: Tag; 
  selected: boolean; 
  onPress: (tagId: string) => void;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.tagPill,
        selected && styles.tagPillSelected,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(tag.id);
      }}
      activeOpacity={0.7}
    >
      {selected && (
        <Ionicons 
          name="checkmark" 
          size={12} 
          color="#FFFFFF" 
          style={styles.tagCheckmark} 
        />
      )}
      <Text style={[
        styles.tagText,
        selected && styles.tagTextSelected,
      ]}>
        {tag.label}
      </Text>
    </TouchableOpacity>
  );
};

const MeasurementTypeSelector = ({ 
  type, 
  selected, 
  onPress 
}: { 
  type: MeasurementType; 
  selected: boolean; 
  onPress: (typeId: string) => void;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.measurementType,
        selected && styles.measurementTypeSelected,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(type.id);
      }}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={type.icon as any} 
        size={16} 
        color={selected ? "#FFFFFF" : "#8E8E93"} 
      />
      <Text style={[
        styles.measurementTypeText,
        selected && styles.measurementTypeTextSelected,
      ]}>
        {type.label}
      </Text>
      {selected && (
        <Ionicons 
          name="checkmark" 
          size={14} 
          color="#FFFFFF" 
          style={styles.measurementCheckmark} 
        />
      )}
    </TouchableOpacity>
  );
};

export default function CreateExerciseScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMeasurementTypes, setSelectedMeasurementTypes] = useState<string[]>(['m1']); // Default to weight & reps
  const [defaultMeasurementType, setDefaultMeasurementType] = useState('m1');
  const [isPublic, setIsPublic] = useState(true);
  
  const handleGoBack = () => {
    router.back();
  };

  const handleToggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      const isSelected = prev.includes(tagId);
      if (isSelected) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleToggleMeasurementType = (typeId: string) => {
    setSelectedMeasurementTypes(prev => {
      const isSelected = prev.includes(typeId);
      if (isSelected) {
        // Don't allow deselecting the last measurement type
        if (prev.length === 1) return prev;
        
        // If we're removing the default, set a new default
        if (defaultMeasurementType === typeId) {
          const newDefault = prev.find(id => id !== typeId);
          if (newDefault) setDefaultMeasurementType(newDefault);
        }
        
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleSetDefaultMeasurementType = (typeId: string) => {
    // Only set as default if it's already selected
    if (selectedMeasurementTypes.includes(typeId)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setDefaultMeasurementType(typeId);
    } else {
      // If not selected, select it first and set as default
      setSelectedMeasurementTypes(prev => [...prev, typeId]);
      setDefaultMeasurementType(typeId);
    }
  };

  const handleCreateExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Validation
    if (!name.trim()) {
      // Show error - would implement an actual error display in a real app
      console.error('Exercise name is required');
      return;
    }

    // Get tag names from selected tag IDs
    const tagNames = selectedTags.map(id => {
      const tag = tagGroups.flatMap(g => g.tags).find(t => t.id === id);
      return tag ? tag.name : null;
    }).filter(Boolean) as string[];

    // Get measurement type names from selected measurement type IDs
    const measurementTypeNames = selectedMeasurementTypes.map(id => {
      const type = measurementTypes.find(t => t.id === id);
      return type ? type.name : null;
    }).filter(Boolean) as string[];

    // Get default measurement type name
    const defaultMeasurementName = measurementTypes.find(t => t.id === defaultMeasurementType)?.name || 'weight_reps';

    // Create exercise object - in a real app, this would be sent to an API
    const newExercise = {
      name,
      description,
      tags: tagNames,
      measurementConfig: {
        allowed: measurementTypeNames,
        default: defaultMeasurementName,
      },
      isPublic,
      // Other fields would be added by the server
    };

    console.log('Creating exercise:', newExercise);
    
    // Navigate back to the library
    router.push('/exercises' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <BlurView intensity={30} tint="dark" style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <View style={styles.headerRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleGoBack}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>New Exercise</Text>
                
                <TouchableOpacity 
                  style={[
                    styles.saveButton,
                    !name.trim() && styles.saveButtonDisabled
                  ]} 
                  onPress={handleCreateExercise}
                  disabled={!name.trim()}
                >
                  <Text style={[
                    styles.saveButtonText,
                    !name.trim() && styles.saveButtonTextDisabled
                  ]}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Barbell Squat"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textAreaInput]}
                placeholder="Describe the exercise and provide form cues..."
                placeholderTextColor="#8E8E93"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Media</Text>
            <TouchableOpacity style={styles.mediaUploadButton}>
              <Ionicons name="cloud-upload-outline" size={36} color="#0A84FF" />
              <Text style={styles.mediaUploadText}>Upload Video or Image</Text>
              <Text style={styles.mediaUploadSubtext}>
                GIF preview will be generated automatically
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <Text style={styles.sectionSubtitle}>
              Add tags to make your exercise easier to find
            </Text>
            
            {tagGroups.map(group => (
              <View key={group.id} style={styles.tagGroup}>
                <Text style={styles.tagGroupTitle}>{group.name}</Text>
                <View style={styles.tagsContainer}>
                  {group.tags.map(tag => (
                    <TagSelector
                      key={tag.id}
                      tag={tag}
                      selected={selectedTags.includes(tag.id)}
                      onPress={handleToggleTag}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Measurement</Text>
            <Text style={styles.sectionSubtitle}>
              Select how this exercise should be tracked
            </Text>
            
            <View style={styles.measurementTypesContainer}>
              {measurementTypes.map(type => (
                <View key={type.id} style={styles.measurementTypeRow}>
                  <MeasurementTypeSelector
                    type={type}
                    selected={selectedMeasurementTypes.includes(type.id)}
                    onPress={handleToggleMeasurementType}
                  />
                  
                  {selectedMeasurementTypes.includes(type.id) && (
                    <TouchableOpacity
                      style={[
                        styles.defaultButton,
                        defaultMeasurementType === type.id && styles.defaultButtonSelected
                      ]}
                      onPress={() => handleSetDefaultMeasurementType(type.id)}
                    >
                      <Text style={[
                        styles.defaultButtonText,
                        defaultMeasurementType === type.id && styles.defaultButtonTextSelected
                      ]}>
                        {defaultMeasurementType === type.id ? 'Default' : 'Set Default'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Visibility</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Public Exercise</Text>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: '#3A3A3C', true: '#32D74B33' }}
                thumbColor={isPublic ? '#32D74B' : '#FFFFFF'}
                ios_backgroundColor="#3A3A3C"
              />
            </View>
            <Text style={styles.switchDescription}>
              Public exercises can be seen and used by other users. Private exercises are visible only to you.
            </Text>
          </View>
          
          {/* Add extra padding at the bottom for keyboard */}
          <View style={styles.bottomPadding} />
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
    width: '100%',
    height: 60,
    zIndex: 10,
  },
  headerBlur: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#0A84FF',
    fontSize: 16,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#0A84FF',
  },
  scrollView: {
    flex: 1,
  },
  formSection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 48,
  },
  textAreaInput: {
    minHeight: 100,
  },
  mediaUploadButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mediaUploadText: {
    color: '#0A84FF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  mediaUploadSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  tagGroup: {
    marginBottom: 20,
  },
  tagGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -4,
    marginTop: -4,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
  },
  tagPillSelected: {
    backgroundColor: '#0A84FF',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  tagCheckmark: {
    marginRight: 4,
  },
  measurementTypesContainer: {
    marginTop: 8,
  },
  measurementTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  measurementType: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  measurementTypeSelected: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  measurementTypeText: {
    color: '#8E8E93',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  measurementTypeTextSelected: {
    color: '#FFFFFF',
  },
  measurementCheckmark: {
    marginLeft: 4,
  },
  defaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    marginLeft: 8,
  },
  defaultButtonSelected: {
    backgroundColor: '#32D74B33',
  },
  defaultButtonText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  defaultButtonTextSelected: {
    color: '#32D74B',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  switchDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  bottomPadding: {
    height: 100,
  },
}); 