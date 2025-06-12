import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { useWorkout } from '@/contexts/WorkoutContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shareCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userHandle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  brandLogo: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  workoutInfo: {
    padding: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  exerciseList: {
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    paddingTop: 12,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#333333',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  exerciseStats: {
    fontSize: 12,
    color: '#8E8E93',
  },
  sharingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
    width: '100%',
  },
  shareOption: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 16,
    width: 70,
  },
  shareIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  doneButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default function WorkoutShareScreen() {
  const router = useRouter();
  const { workoutSummary, saveWorkoutSummary, shareWorkout } = useWorkout();
  const workoutCardRef = useRef(null);

  const [workoutName, setWorkoutName] = useState('My Workout 9');
  const [notes, setNotes] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [shareToSocial, setShareToSocial] = useState({
    instagram: false,
    snapchat: false,
    story: false,
    saveImage: false,
  });
  const [isCapturing, setIsCapturing] = useState(false);

  // Mock data for preview
  const mockWorkoutData = {
    id: 'workout1',
    userName: 'Nick McKenzie',
    userAvatarUrl: 'https://i.pravatar.cc/150?u=nick',
    workoutName: workoutName,
    caloriesBurned: 0,
    totalVolume: 240,
    duration: 22, // 22 seconds
    prsAchieved: 0,
    timestamp: 'Just now',
    location: 'Your Location',
    workoutId: 'workout-detail-1',
    exercises: [
      {
        id: 'ex1',
        name: 'Barbell Lunge',
        sets: [
          { id: 1, weight: 4, reps: 10, completed: true },
        ]
      }
    ],
  };

  // Capture workout card as image
  const captureWorkoutCard = async () => {
    if (isCapturing || !workoutCardRef.current) return null;

    try {
      setIsCapturing(true);

      // Wait for next frame to ensure UI is fully rendered
      const uri = await captureRef(workoutCardRef, {
        format: 'png',
        quality: 1,
        result: 'file',
      });

      setIsCapturing(false);
      return uri;
    } catch (error) {
      console.error('Error capturing workout card:', error);
      setIsCapturing(false);
      return null;
    }
  };

  // Share to social platforms
  const handleShareToSocial = async (platform: 'story' | 'instagram' | 'snapchat' | 'saveImage') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Record that we've shared to this platform
      setShareToSocial(prev => ({
        ...prev,
        [platform]: true
      }));

      // Capture workout card as image
      const imageUri = await captureWorkoutCard();
      if (!imageUri) {
        throw new Error('Failed to capture workout card image.');
      }

      console.log(`Sharing to ${platform}`);

      // Create share message
      const shareMessage = `Check out my workout! #fitness #workout #elitelocker`;

      // Share based on platform
      if (platform === 'saveImage') {
        // Just show success message for saving image
        console.log('Image saved to gallery');
      } else {
        // For social platforms, use the Share API
        await Share.share({
          message: shareMessage,
          url: imageUri,
        });
      }

      // Call the share function in the workout context
      shareWorkout([platform], notes);

    } catch (error) {
      console.error('Error in handleShareToSocial:', error);
    }
  };

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Get platforms to share to
    const platformsToShareTo = Object.entries(shareToSocial)
      .filter(([_, isSelected]) => isSelected)
      .map(([platform]) => platform);

    // Save workout summary
    saveWorkoutSummary({
      title: workoutName,
      notes,
      visibility,
      sharedTo: {
        platforms: platformsToShareTo,
      },
    });

    // Navigate to our new feed screen
    router.replace('/(tabs)/feed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Stack.Screen
        options={{
          title: 'Share Result',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Workout Card Preview */}
        <View style={styles.cardWrapper} ref={workoutCardRef}>
          <View style={styles.shareCard}>
            <View style={styles.userHeader}>
              <Image
                source={{ uri: mockWorkoutData.userAvatarUrl }}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{mockWorkoutData.userName}</Text>
                <Text style={styles.userHandle}>@nickmckenzie_q8at</Text>
              </View>
              <View style={styles.brandLogo}>
                <Text style={styles.brandText}>F L E X</Text>
              </View>
            </View>

            <View style={styles.workoutInfo}>
              <Text style={styles.workoutTitle}>{workoutName}</Text>

              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.statText}>22s</Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="barbell-outline" size={16} color="#FF9500" />
                  <Text style={styles.statText}>240 lb</Text>
                </View>
              </View>

              <View style={styles.exerciseList}>
                {mockWorkoutData.exercises.map(exercise => (
                  <View key={exercise.id} style={styles.exerciseItem}>
                    <Image
                      source={{ uri: 'https://via.placeholder.com/30' }}
                      style={styles.exerciseIcon}
                    />
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseStats}>
                      {exercise.sets[0].weight} lb × {exercise.sets[0].reps} reps
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Sharing Options */}
        <View style={styles.sharingOptions}>
          <TouchableOpacity
            style={styles.shareOption}
            onPress={() => handleShareToSocial('story')}
          >
            <View style={[styles.shareIconCircle, { backgroundColor: '#FF2D55' }]}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.shareOptionText}>Story</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareOption}
            onPress={() => handleShareToSocial('instagram')}
          >
            <View style={[styles.shareIconCircle, { backgroundColor: '#E1306C' }]}>
              <Ionicons name="logo-instagram" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.shareOptionText}>Instagram</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareOption}
            onPress={() => handleShareToSocial('snapchat')}
          >
            <View style={[styles.shareIconCircle, { backgroundColor: '#FFFC00' }]}>
              <Ionicons name="logo-snapchat" size={24} color="#000000" />
            </View>
            <Text style={styles.shareOptionText}>Snapchat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareOption}
            onPress={() => handleShareToSocial('saveImage')}
          >
            <View style={[styles.shareIconCircle, { backgroundColor: '#333333' }]}>
              <Ionicons name="download-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.shareOptionText}>Save Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareOption}
          >
            <View style={[styles.shareIconCircle, { backgroundColor: '#333333' }]}>
              <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.shareOptionText}>More...</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
