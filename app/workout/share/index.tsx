import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useWorkout } from '../../../contexts/WorkoutContext';
import { useRunTracking } from '../../../contexts/RunTrackingContext';
import WorkoutShareCard from '../../../components/ui/WorkoutShareCard';

const { width } = Dimensions.get('window');

export default function ShareWorkoutScreen() {
  const router = useRouter();
  const { workoutSummary, shareWorkout } = useWorkout();
  const { getPastRun } = useRunTracking();
  const [sharedPlatforms, setSharedPlatforms] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'post' | 'story'>('post');
  const [routeImageUri, setRouteImageUri] = useState<string | null>(null);
  const [workoutType, setWorkoutType] = useState<'standard' | 'run'>('standard');
  const [runMetrics, setRunMetrics] = useState<any>(null);
  const workoutCardRef = useRef(null);
  
  // Check if this is a run workout by examining the URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const type = queryParams.get('type');
    const runId = queryParams.get('runId');
    
    if (type === 'run' && runId) {
      setWorkoutType('run');
      // Get run data from RunTrackingContext
      const runData = getPastRun(runId);
      if (runData) {
        // Update run metrics and map image
        setRunMetrics(runData.metrics);
        setRouteImageUri(runData.mapSnapshot || null);
      }
    }
  }, [getPastRun]);
  
  if (!workoutSummary) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Workout</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No workout to share</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Capture workout card as image
  const captureWorkoutCard = async () => {
    if (isCapturing) return;
    
    try {
      setIsCapturing(true);
      
      // Wait for next frame to ensure UI is fully rendered
      const uri = await captureRef(workoutCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      
      setIsCapturing(false);
      return uri;
    } catch (error) {
      console.error('Error capturing workout card:', error);
      setIsCapturing(false);
      Alert.alert('Error', 'Failed to capture workout card image.');
      return null;
    }
  };

  const handleShareToSocial = async (platform: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Record that we've shared to this platform
      setSharedPlatforms(prev => [...prev, platform]);
      
      // Call the share function in the workout context
      shareWorkout([platform], workoutSummary.notes);
      
      // Capture workout card as image
      const imageUri = await captureWorkoutCard();
      if (!imageUri) {
        throw new Error('Failed to capture workout card image.');
      }
      
      console.log(`Sharing to ${platform}`);
      
      // Create share message
      const shareMessage = `${workoutSummary.notes || 'Check out my workout!'} #fitness #workout #elitelocker`;
      
      if (platform === 'copy') {
        // For copy, just use the share message
        await Share.share({ message: shareMessage });
      } else {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          throw new Error('Sharing is not available on this device');
        }
        
        // Share the image
        await Sharing.shareAsync(imageUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your workout',
          UTI: 'public.png', // iOS only
        });
      }
    } catch (error) {
      console.error('Error in handleShareToSocial:', error);
      Alert.alert('Error', 'An error occurred while trying to share your workout.');
    }
  };
  
  const handleDone = () => {
    router.replace('/workout');
  };
  
  // Determine share count message
  const getWorkoutCount = () => {
    // In a real app, you would get this from the user's data
    return "5th"; 
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.successTitle}>Nice work!</Text>
        <Text style={styles.successSubtitle}>
          {workoutType === 'run' ? 'You crushed that run!' : `This is your ${getWorkoutCount()} workout`}
        </Text>
        <View style={styles.celebrationIconContainer}>
          {workoutType === 'run' ? (
            <Ionicons name="trophy" size={40} color="#FFD700" />
          ) : (
            <Ionicons name="medal" size={40} color="#FFD700" />
          )}
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formatSelector}>
          <Text style={styles.formatLabel}>Share Format:</Text>
          <SegmentedControl
            values={['Post', 'Story']}
            selectedIndex={selectedFormat === 'post' ? 0 : 1}
            onChange={(event) => {
              const format = event.nativeEvent.selectedSegmentIndex === 0 ? 'post' : 'story';
              setSelectedFormat(format as 'post' | 'story');
              Haptics.selectionAsync();
            }}
            backgroundColor="#1A1A1A"
            tintColor="#D3D3D3"
            fontStyle={{ color: '#8E8E93' }}
            activeFontStyle={{ color: '#FFFFFF' }}
            style={styles.segmentedControl}
          />
        </View>
        
        <View style={styles.cardWrapper} ref={workoutCardRef}>
          <WorkoutShareCard
            workout={workoutSummary}
            format={selectedFormat}
            showClubLogo={workoutSummary.sharedTo?.clubs && workoutSummary.sharedTo.clubs.length > 0}
            workoutType={workoutType}
            routeImageUri={routeImageUri}
            runMetrics={runMetrics}
          />
        </View>
        
        <Text style={styles.shareText}>Share workout - Tag @elitelocker</Text>
        
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleShareToSocial('instagram-stories')}
          >
            <LinearGradient
              colors={['#FCAF45', '#E1306C', '#C13584', '#833AB4']}
              style={styles.instagramButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="logo-instagram" size={30} color="#FFFFFF" />
              {sharedPlatforms.includes('instagram-stories') && (
                <View style={styles.sharedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                </View>
              )}
            </LinearGradient>
            <Text style={styles.socialButtonText}>Instagram</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleShareToSocial('facebook-stories')}
          >
            <View style={[styles.socialButtonIcon, { backgroundColor: '#1877F2' }]}>
              <Ionicons name="logo-facebook" size={30} color="#FFFFFF" />
              {sharedPlatforms.includes('facebook-stories') && (
                <View style={styles.sharedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleShareToSocial('twitter')}
          >
            <View style={[styles.socialButtonIcon, { backgroundColor: '#000000' }]}>
              <Ionicons name="logo-twitter" size={30} color="#FFFFFF" />
              {sharedPlatforms.includes('twitter') && (
                <View style={styles.sharedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.socialButtonText}>Twitter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleShareToSocial('more')}
          >
            <View style={[styles.socialButtonIcon, { backgroundColor: '#333333' }]}>
              <Ionicons name="share-outline" size={30} color="#FFFFFF" />
              {sharedPlatforms.includes('more') && (
                <View style={styles.sharedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.socialButtonText}>More</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleShareToSocial('copy')}
          >
            <View style={[styles.socialButtonIcon, { backgroundColor: '#666666' }]}>
              <Ionicons name="copy-outline" size={28} color="#FFFFFF" />
              {sharedPlatforms.includes('copy') && (
                <View style={styles.sharedIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
            <Text style={styles.socialButtonText}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    position: 'relative',
  },
  backButton: {
    padding: 4,
    position: 'absolute',
    left: 16,
    top: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 17,
    color: '#8E8E93',
  },
  celebrationIconContainer: {
    position: 'absolute',
    right: 40,
    top: 20,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  formatSelector: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D3D3D3',
  },
  segmentedControl: {
    width: 180,
    height: 36,
  },
  cardWrapper: {
    marginVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  shareText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 16,
  },
  socialButton: {
    alignItems: 'center',
    marginBottom: 24,
    width: width / 5 - 16,
  },
  socialButtonIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  instagramButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  doneButton: {
    backgroundColor: '#D3D3D3',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  sharedIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#30D158',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 