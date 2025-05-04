import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { WorkoutSummary } from '../../contexts/WorkoutContext';
import WorkoutShareCard from './WorkoutShareCard';

const { width, height } = Dimensions.get('window');

interface SocialShareModalProps {
  visible: boolean;
  onClose: () => void;
  workoutSummary: WorkoutSummary | null;
  selectedPlatforms: string[];
  shareFormat: 'post' | 'story';
  caption: string;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  visible,
  onClose,
  workoutSummary,
  selectedPlatforms,
  shareFormat,
  caption,
}) => {
  const router = useRouter();
  const [currentPlatformIndex, setCurrentPlatformIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Social platforms data with more detailed info
  const socialPlatforms = [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: 'logo-instagram', 
      color: '#C13584',
      tagline: 'Share your workout with your Instagram followers'
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      icon: 'logo-twitter', 
      color: '#1DA1F2',
      tagline: 'Tweet your workout progress with your followers'
    },
    { 
      id: 'facebook', 
      name: 'Facebook', 
      icon: 'logo-facebook', 
      color: '#4267B2',
      tagline: 'Share your achievements with friends and family'
    },
  ];
  
  // Handle case with no platforms selected
  if (selectedPlatforms.length === 0 && visible) {
    onClose();
    return null;
  }
  
  // Get the current platform being shared to
  const currentPlatform = socialPlatforms.find(
    platform => platform.id === selectedPlatforms[currentPlatformIndex]
  );
  
  // Animation for modal
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: height,
        useNativeDriver: true,
        damping: 20,
        mass: 1,
        stiffness: 100,
      }).start();
    }
  }, [visible, slideAnim]);
  
  // Handle the share process
  const handleShare = async () => {
    if (!workoutSummary || !currentPlatform) return;
    
    setIsSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Simulate sharing process with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Move to next platform or complete the process
      if (currentPlatformIndex < selectedPlatforms.length - 1) {
        setCurrentPlatformIndex(prev => prev + 1);
        setIsSharing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setIsComplete(true);
        setIsSharing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError('Failed to share. Please try again.');
      setIsSharing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Reset state when closing
      setCurrentPlatformIndex(0);
      setIsSharing(false);
      setIsComplete(false);
      setError(null);
      onClose();
    });
  };
  
  const handleDone = () => {
    handleClose();
    // Navigate back to workout screen
    router.replace('/workout');
  };
  
  if (!workoutSummary || !currentPlatform) return null;
  
  return (
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
          <BlurView intensity={50} tint="dark" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerHandle} />
              <Text style={styles.headerTitle}>
                {isComplete ? 'Share Complete' : `Share to ${currentPlatform.name}`}
              </Text>
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
              {isComplete ? (
                // Share Complete View
                <View style={styles.completeContainer}>
                  <View style={styles.successIconContainer}>
                    <Ionicons name="checkmark-circle" size={80} color="#30D158" />
                  </View>
                  
                  <Text style={styles.completeTitle}>
                    Workout Shared Successfully!
                  </Text>
                  
                  <Text style={styles.completeText}>
                    Your workout has been shared to all selected platforms.
                  </Text>
                  
                  <View style={styles.platformsSharedContainer}>
                    {selectedPlatforms.map(platformId => {
                      const platform = socialPlatforms.find(p => p.id === platformId);
                      if (!platform) return null;
                      
                      return (
                        <View key={platform.id} style={styles.platformSharedItem}>
                          <Ionicons 
                            name={platform.icon as any} 
                            size={24} 
                            color={platform.color} 
                          />
                          <Text style={styles.platformSharedName}>
                            {platform.name}
                          </Text>
                          <Ionicons name="checkmark-circle" size={16} color="#30D158" />
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                // Share Platform View
                <>
                  <View style={styles.platformHeader}>
                    <View 
                      style={[
                        styles.platformIconContainer,
                        { backgroundColor: `${currentPlatform.color}30` }
                      ]}
                    >
                      <Ionicons 
                        name={currentPlatform.icon as any} 
                        size={40} 
                        color={currentPlatform.color} 
                      />
                    </View>
                    
                    <Text style={styles.platformName}>{currentPlatform.name}</Text>
                    <Text style={styles.platformTagline}>{currentPlatform.tagline}</Text>
                    
                    <View style={styles.progressContainer}>
                      <Text style={styles.progressText}>
                        {`${currentPlatformIndex + 1} of ${selectedPlatforms.length}`}
                      </Text>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${((currentPlatformIndex + 1) / selectedPlatforms.length) * 100}%`,
                              backgroundColor: currentPlatform.color 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.sharePreviewContainer}>
                    <Text style={styles.previewTitle}>Preview</Text>
                    
                    <View style={styles.cardContainer}>
                      <WorkoutShareCard 
                        workout={workoutSummary} 
                        format={shareFormat}
                        showClubLogo={false}
                      />
                    </View>
                    
                    <View style={styles.captionContainer}>
                      <Text style={styles.captionLabel}>Caption</Text>
                      <View style={styles.captionBox}>
                        <Text style={styles.captionText}>
                          {caption || "Just completed a workout with Elite Locker! 💪"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {error && (
                    <View style={styles.errorContainer}>
                      <Ionicons name="alert-circle" size={24} color="#FF3B30" />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
            
            {isComplete ? (
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleDone}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.shareButton,
                  isSharing && { backgroundColor: 'rgba(10, 132, 255, 0.5)' }
                ]}
                onPress={handleShare}
                disabled={isSharing}
                activeOpacity={0.8}
              >
                {isSharing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.shareButtonText}>
                    {`Share to ${currentPlatform.name}`}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
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
    paddingBottom: 100, // Extra space for button
  },
  platformHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  platformIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  platformName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  platformTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  sharePreviewContainer: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  captionContainer: {
    marginBottom: 16,
  },
  captionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  captionBox: {
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    borderRadius: 8,
    padding: 16,
  },
  captionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
  shareButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 30 : 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  completeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  platformsSharedContainer: {
    width: '100%',
  },
  platformSharedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 67, 0.18)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  platformSharedName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  doneButton: {
    backgroundColor: '#30D158',
    borderRadius: 14,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default SocialShareModal; 