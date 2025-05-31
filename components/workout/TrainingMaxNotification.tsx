/**
 * Elite Locker - Training Max Notification Component
 * Shows celebration notification when new training maxes are achieved
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { TrainingMaxUpdate } from '../../contexts/WorkoutContext';

const { width: screenWidth } = Dimensions.get('window');

interface TrainingMaxNotificationProps {
  updates: TrainingMaxUpdate[];
  visible: boolean;
  onDismiss: () => void;
  onViewDetails?: (exerciseId: string) => void;
}

export default function TrainingMaxNotification({
  updates,
  visible,
  onDismiss,
  onViewDetails
}: TrainingMaxNotificationProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && updates.length > 0) {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show animation
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
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible, updates]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handleViewDetails = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewDetails?.(exerciseId);
    handleDismiss();
  };

  if (!visible || updates.length === 0) {
    return null;
  }

  const primaryUpdate = updates[0];
  const hasMultiple = updates.length > 1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {hasMultiple ? 'New Training Maxes!' : 'New Training Max!'}
              </Text>
              <Text style={styles.subtitle}>
                {hasMultiple 
                  ? `${updates.length} exercises improved` 
                  : 'Personal record achieved'
                }
              </Text>
            </View>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Primary Update */}
          <TouchableOpacity
            style={styles.updateCard}
            onPress={() => handleViewDetails(primaryUpdate.exerciseId)}
            activeOpacity={0.8}
          >
            <View style={styles.updateInfo}>
              <Text style={styles.exerciseName}>{primaryUpdate.exerciseName}</Text>
              <View style={styles.maxInfo}>
                <Text style={styles.newMax}>{primaryUpdate.newMax} lbs</Text>
                <View style={styles.improvement}>
                  <Ionicons name="trending-up" size={14} color="#32D74B" />
                  <Text style={styles.improvementText}>
                    +{primaryUpdate.improvement} lbs
                  </Text>
                </View>
              </View>
              <Text style={styles.performance}>
                From {primaryUpdate.performance.weight} lbs × {primaryUpdate.performance.reps} reps
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Multiple Updates Indicator */}
          {hasMultiple && (
            <View style={styles.multipleIndicator}>
              <Text style={styles.multipleText}>
                +{updates.length - 1} more exercise{updates.length > 2 ? 's' : ''}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  updateInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  maxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  newMax: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  improvement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 215, 75, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#32D74B',
    marginLeft: 2,
  },
  performance: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  multipleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  multipleText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 4,
  },
});
