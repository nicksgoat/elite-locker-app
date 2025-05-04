import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useWorkout, WorkoutSummary } from '../../contexts/WorkoutContext';
import WorkoutShareCard from './WorkoutShareCard';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [shareToOptions, setShareToOptions] = useState({
    instagram: false,
    twitter: false,
    facebook: false,
  });
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Social platforms to share to
  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: 'logo-instagram', color: '#C13584' },
    { id: 'twitter', name: 'Twitter', icon: 'logo-twitter', color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: 'logo-facebook', color: '#4267B2' },
  ];
  
  // Dummy club data
  const availableClubs = [
    { id: 'c1', name: 'Elite Lifters', memberCount: 128 },
    { id: 'c2', name: 'Running Club', memberCount: 85 },
    { id: 'c3', name: 'CrossFit Warriors', memberCount: 64 },
  ];
  
  React.useEffect(() => {
    if (visible) {
      // Initialize with any existing summary data
      if (workoutSummary?.title) setTitle(workoutSummary.title);
      if (workoutSummary?.notes) setNotes(workoutSummary.notes);
      if (workoutSummary?.visibility) setVisibility(workoutSummary.visibility);
      
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
  
  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const updatedSummary: Partial<WorkoutSummary> = {
      title: title || `Workout on ${new Date().toLocaleDateString()}`,
      notes,
      visibility,
      sharedTo: {
        clubs: selectedClubs,
        platforms: Object.entries(shareToOptions)
          .filter(([_, isSelected]) => isSelected)
          .map(([platform]) => platform)
      },
      media: selectedImage ? [{ type: 'photo', url: selectedImage }] : undefined
    };
    
    saveWorkoutSummary(updatedSummary);
    
    // Get platforms to share to
    const platformsToShareTo = Object.entries(shareToOptions)
      .filter(([_, isSelected]) => isSelected)
      .map(([platform]) => platform);
    
    // Navigate to the share page and then close this modal
    onClose();
    
    // If the user has shared to at least one platform or club, or uploaded media, navigate to the share page 
    if (platformsToShareTo.length > 0 || selectedClubs.length > 0 || selectedImage) {
      router.push("/workout/share");
    } else {
      // Otherwise just navigate back to workouts
      router.replace('/workout');
    }
  };
  
  const handleAddMedia = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would open the camera or photo library
    // Mock selecting an image for now
    setSelectedImage('https://source.unsplash.com/random/300x400/?fitness');
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
                  
                  {selectedImage ? (
                    <View style={styles.selectedMediaContainer}>
                      <Image 
                        source={{ uri: selectedImage }} 
                        style={styles.selectedMedia}
                        resizeMode="cover"
                      />
                      <TouchableOpacity 
                        style={styles.removeMediaButton}
                        onPress={() => setSelectedImage(null)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.addMediaButton}
                      onPress={handleAddMedia}
                    >
                      <Ionicons name="camera" size={24} color="#0A84FF" />
                      <Text style={styles.addMediaText}>Add Photo or Video</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Share to Clubs */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Share to Clubs</Text>
                  
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
                        <Text style={[
                          styles.clubName,
                          selectedClubs.includes(club.id) && styles.selectedClubName
                        ]}>
                          {club.name}
                        </Text>
                        <Text style={styles.memberCount}>
                          {club.memberCount} members
                        </Text>
                        
                        {selectedClubs.includes(club.id) && (
                          <View style={styles.checkIcon}>
                            <Ionicons name="checkmark-circle" size={20} color="#30D158" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
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
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save Workout</Text>
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
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default WorkoutCompleteModal; 