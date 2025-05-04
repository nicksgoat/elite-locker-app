import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutSummary } from '../../contexts/WorkoutContext';

const { width } = Dimensions.get('window');

interface WorkoutShareCardProps {
  workout: WorkoutSummary;
  format?: 'post' | 'story';
  showClubLogo?: boolean;
  style?: ViewStyle;
  routeImageUri?: string | null;
  workoutType?: 'standard' | 'run';
  runMetrics?: {
    distance: number; // in meters
    duration: number; // in seconds
    pace: number; // in seconds per km
    calories: number;
  };
}

// Run Stats Component for better visualization of run metrics
const RunStatsOverlay: React.FC<{ 
  duration: number;
  distance: number;
  pace: number; 
  calories: number;
}> = ({ duration, distance, pace, calories }) => {
  // Format pace (min:sec per km)
  const formatPace = (paceInSecondsPerKm: number) => {
    if (!paceInSecondsPerKm || !isFinite(paceInSecondsPerKm)) return '--:--';
    const mins = Math.floor(paceInSecondsPerKm / 60);
    const secs = Math.floor(paceInSecondsPerKm % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format duration (hh:mm:ss)
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };
  
  return (
    <View style={runStatsStyles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
        style={runStatsStyles.gradient}
      >
        <View style={runStatsStyles.statsContainer}>
          <View style={runStatsStyles.statItem}>
            <Text style={runStatsStyles.statValue}>{formatDistance(distance)}</Text>
            <Text style={runStatsStyles.statLabel}>Distance</Text>
          </View>
          <View style={runStatsStyles.divider} />
          <View style={runStatsStyles.statItem}>
            <Text style={runStatsStyles.statValue}>{formatDuration(duration)}</Text>
            <Text style={runStatsStyles.statLabel}>Time</Text>
          </View>
          <View style={runStatsStyles.divider} />
          <View style={runStatsStyles.statItem}>
            <Text style={runStatsStyles.statValue}>{formatPace(pace)}</Text>
            <Text style={runStatsStyles.statLabel}>Pace</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const runStatsStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  gradient: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

const WorkoutShareCard: React.FC<WorkoutShareCardProps> = ({
  workout,
  format = 'post',
  showClubLogo = true,
  style,
  routeImageUri,
  workoutType = 'standard',
  runMetrics,
}) => {
  // Format functions
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatPace = (paceInSecondsPerKm: number) => {
    if (!paceInSecondsPerKm || !isFinite(paceInSecondsPerKm)) return '--:--';
    const mins = Math.floor(paceInSecondsPerKm / 60);
    const secs = Math.floor(paceInSecondsPerKm % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate card dimensions based on format
  const isStory = format === 'story';
  const cardWidth = isStory ? width * 0.85 : width * 0.9;
  const cardHeight = isStory ? cardWidth * 1.8 : cardWidth * 0.7;
  
  // Generate random values for demo if not provided
  const displayedExercises = workout.totalExercises || Math.floor(Math.random() * 6) + 2;
  const displayedSets = workout.totalSets || Math.floor(Math.random() * 15) + 5;
  const displayedVolume = workout.totalVolume || Math.floor(Math.random() * 5000) + 1000;
  const displayedDuration = workout.duration || Math.floor(Math.random() * 3600) + 600;
  
  // If this is a run workout with metrics
  const isRunWorkout = workoutType === 'run' && runMetrics;
  
  return (
    <View
      style={[
        styles.container,
        { width: cardWidth, height: cardHeight },
        style
      ]}
    >
      <LinearGradient
        colors={['#000000', '#121212']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* App Logo Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Text style={styles.logoText}>E</Text>
            </View>
            <Text style={styles.appName}>ELITE LOCKER</Text>
          </View>
          
          {showClubLogo && (
            <View style={styles.profileContainer}>
              <Image 
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
                style={styles.profileImage}
              />
              <Text style={styles.profileName}>nickm2</Text>
            </View>
          )}
        </View>
        
        {/* Workout Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.workoutTitle}>
            {isRunWorkout ? 'Morning Run 🏃‍♂️' : (workout.title || 'Afternoon workout 💪')}
          </Text>
          <Text style={styles.workoutDate}>
            {workout.date ? formatDate(new Date(workout.date)) : formatDate(new Date())}
          </Text>
        </View>

        {/* Run Route Image for Run Workouts */}
        {isRunWorkout && routeImageUri && (
          <View style={styles.routeImageContainer}>
            <Image 
              source={{ uri: routeImageUri }} 
              style={styles.routeImage} 
              resizeMode="cover"
            />
            {/* Stats overlay on the route image */}
            <RunStatsOverlay
              duration={runMetrics?.duration || 0}
              distance={runMetrics?.distance || 0}
              pace={runMetrics?.pace || 0}
              calories={runMetrics?.calories || 0}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)']}
              style={styles.routeImageBottomOverlay}
            />
          </View>
        )}
        
        {/* Stats Grid */}
        <View style={[
          styles.statsGrid, 
          isStory && styles.storyStatsGrid,
          isRunWorkout && styles.runStatsGrid
        ]}>
          {isRunWorkout ? (
            // Run specific stats
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="time-outline" size={24} color="#D3D3D3" />
                  </View>
                  <Text style={styles.statValue}>
                    {formatDuration(runMetrics?.duration || displayedDuration)}
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="speedometer-outline" size={24} color="#D3D3D3" />
                  </View>
                  <Text style={styles.statValue}>
                    {formatPace(runMetrics?.pace || 0)}
                  </Text>
                  <Text style={styles.statLabel}>Pace (min/km)</Text>
                </View>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="map-outline" size={24} color="#D3D3D3" />
                  </View>
                  <Text style={styles.statValue}>
                    {formatDistance(runMetrics?.distance || 0)}
                  </Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
                
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="flame-outline" size={24} color="#D3D3D3" />
                  </View>
                  <Text style={styles.statValue}>
                    {runMetrics?.calories || Math.floor(Math.random() * 400) + 100}
                  </Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>
              </View>
            </>
          ) : (
            // Standard workout stats
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="time-outline" size={24} color="#D3D3D3" />
                  </View>
                  <Text style={styles.statValue}>
                    {formatDuration(displayedDuration)}
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="fitness-outline" size={24} color="#D3D3D3" />
                  </View>
                  <Text style={styles.statValue}>
                    {displayedExercises}
                  </Text>
                  <Text style={styles.statLabel}>Exercises</Text>
                </View>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="sync-outline" size={24} color="#D3D3D3" />
                  </View>
                  <Text style={styles.statValue}>
                    {displayedSets}
                  </Text>
                  <Text style={styles.statLabel}>Sets</Text>
                </View>
                
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="barbell-outline" size={24} color="#D3D3D3" />
                  </View>
                  <Text style={styles.statValue}>
                    {displayedVolume.toLocaleString()} lbs
                  </Text>
                  <Text style={styles.statLabel}>Volume</Text>
                </View>
              </View>
            </>
          )}
        </View>
        
        {/* App URL */}
        <Text style={styles.appUrl}>elite-locker.app</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBackground: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#D3D3D3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  appName: {
    color: '#D3D3D3',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
  },
  profileName: {
    color: '#D3D3D3',
    fontSize: 14,
    marginLeft: 8,
  },
  titleContainer: {
    marginVertical: 8,
  },
  workoutTitle: {
    color: '#D3D3D3',
    fontSize: 22,
    fontWeight: 'bold',
  },
  workoutDate: {
    color: 'rgba(211, 211, 211, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  routeImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    position: 'relative',
  },
  routeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  routeImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  routeImageBottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  statsGrid: {
    flex: 1,
    justifyContent: 'center',
  },
  storyStatsGrid: {
    paddingVertical: 48,
  },
  runStatsGrid: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(211, 211, 211, 0.1)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'flex-start',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(211, 211, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#D3D3D3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(211, 211, 211, 0.7)',
    fontSize: 12,
  },
  appUrl: {
    color: 'rgba(211, 211, 211, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default WorkoutShareCard; 