import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Alert
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface WorkoutSummary {
  duration: number;
  totalVolume: number;
  exercisesCompleted: number;
  setsCompleted: number;
  personalRecords: number;
  caloriesBurned?: number;
}

interface WorkoutCompletionPopupProps {
  visible: boolean;
  workoutSummary: WorkoutSummary;
  onClose: () => void;
  onShare?: () => void;
  onSaveToLibrary?: () => void;
}

export default function WorkoutCompletionPopup({
  visible,
  workoutSummary,
  onClose,
  onShare,
  onSaveToLibrary
}: WorkoutCompletionPopupProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        })
      ]).start();
      
      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShare?.();
  };

  const handleSaveToLibrary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSaveToLibrary?.();
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k lbs`;
    }
    return `${volume.toLocaleString()} lbs`;
  };

  if (!visible) return null;

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
            styles.popupContainer,
            { 
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ] 
            }
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.popupContent}>
            {/* Success Icon */}
            <Animated.View 
              style={[
                styles.successIcon,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <Ionicons name="checkmark-circle" size={64} color="#30D158" />
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>Workout Complete!</Text>
            <Text style={styles.subtitle}>Great job crushing your workout</Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={24} color="#0A84FF" />
                <Text style={styles.statValue}>{formatDuration(workoutSummary.duration)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="barbell-outline" size={24} color="#FF9F0A" />
                <Text style={styles.statValue}>{formatVolume(workoutSummary.totalVolume)}</Text>
                <Text style={styles.statLabel}>Total Volume</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="fitness-outline" size={24} color="#FF2D55" />
                <Text style={styles.statValue}>{workoutSummary.exercisesCompleted}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="repeat-outline" size={24} color="#5856D6" />
                <Text style={styles.statValue}>{workoutSummary.setsCompleted}</Text>
                <Text style={styles.statLabel}>Sets</Text>
              </View>
            </View>

            {/* Personal Records */}
            {workoutSummary.personalRecords > 0 && (
              <View style={styles.prSection}>
                <View style={styles.prHeader}>
                  <Ionicons name="trophy" size={20} color="#FF9F0A" />
                  <Text style={styles.prText}>
                    {workoutSummary.personalRecords} Personal Record{workoutSummary.personalRecords > 1 ? 's' : ''}!
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveToLibrary}
              >
                <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Template</Text>
              </TouchableOpacity>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  popupContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
  },
  popupContent: {
    padding: 32,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  prSection: {
    width: '100%',
    marginBottom: 24,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 159, 10, 0.3)',
  },
  prText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9F0A',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#30D158',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    width: '100%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
