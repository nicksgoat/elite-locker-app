import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useRunTracking } from '../../contexts/RunTrackingContext';
import FloatingActionButton from './FloatingActionButton';

const { width } = Dimensions.get('window');

interface FloatingRunTrackerProps {
  visible?: boolean;
}

/**
 * A component that adds a floating tracker for run tracking
 * This can be included in any screen where run tracking should be available
 */
const FloatingRunTracker: React.FC<FloatingRunTrackerProps> = ({
  visible = true,
}) => {
  if (!visible) return null;
  
  const { 
    isTracking,
    isPaused,
    currentRun,
    resumeRun,
    pauseRun,
    stopRun
  } = useRunTracking();
  
  const router = useRouter();
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [isMinimized, setIsMinimized] = React.useState(true);
  
  // Show animation when tracker appears
  React.useEffect(() => {
    if (isTracking && isMinimized) {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [isTracking, isMinimized]);
  
  if (!isTracking || !isMinimized) {
    return null;
  }
  
  const { 
    route,
    elapsedTime,
    distance,
    pace,
    currentSpeed
  } = currentRun;
  
  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Format distance
  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2);
  };
  
  // Format pace
  const formatPace = (paceInSecondsPerKm: number) => {
    if (!paceInSecondsPerKm || !isFinite(paceInSecondsPerKm)) return '--:--';
    const mins = Math.floor(paceInSecondsPerKm / 60);
    const secs = Math.floor(paceInSecondsPerKm % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle maximize run tracker
  const handleMaximize = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMinimized(false);
    router.push('/workout/run');
  };
  
  // Handle end run confirmation
  const handleEndRun = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    Alert.alert(
      "End Run",
      "Are you sure you want to end this run?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "End Run",
          style: "destructive",
          onPress: async () => {
            try {
              const runData = await stopRun();
              router.replace({
                pathname: `/workout/share`,
                params: {
                  type: 'run',
                  runId: runData.id,
                }
              });
            } catch (error) {
              console.error('Error ending run:', error);
              Alert.alert('Error', 'Something went wrong when ending your run.');
            }
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.container} pointerEvents="box-none">
      <FloatingActionButton />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              },
              { scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }
            ],
            opacity: animatedValue
          }
        ]}
      >
        <TouchableOpacity
          style={styles.trackerContainer}
          onPress={handleMaximize}
          activeOpacity={0.9}
        >
          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            {/* Status indicator */}
            <View style={[styles.statusIndicator, isPaused ? styles.statusPaused : styles.statusActive]}>
              <Text style={styles.statusText}>{isPaused ? 'PAUSED' : 'RUNNING'}</Text>
            </View>
            
            {/* Quick stats row */}
            <View style={styles.quickStatsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatElapsedTime(elapsedTime)}</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDistance(distance)}</Text>
                <Text style={styles.statLabel}>Distance (km)</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatPace(pace)}</Text>
                <Text style={styles.statLabel}>Pace</Text>
              </View>
            </View>
            
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  isPaused ? resumeRun() : pauseRun();
                }}
              >
                <Ionicons name={isPaused ? "play" : "pause"} size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={handleMaximize}>
                <Ionicons name="expand" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={handleEndRun}>
                <Ionicons name="stop-circle" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    pointerEvents: 'box-none',
    zIndex: 1000,
  },
  trackerContainer: {
    margin: 16,
    marginBottom: 95, // Provide space for tabs and floating action button
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
    marginHorizontal: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(50, 50, 50, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    paddingVertical: 4,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)', // Green
  },
  statusPaused: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)', // Orange
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
});

export default FloatingRunTracker; 