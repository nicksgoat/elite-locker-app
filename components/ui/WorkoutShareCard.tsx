import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutSummary } from '../../contexts/WorkoutContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface RunMetrics {
  distance: number; // in meters
  duration: number; // in seconds
  pace: number; // in seconds per km
  calories: number;
}

interface WorkoutShareCardProps {
  workout: WorkoutSummary;
  userName?: string;
  userAvatarUrl?: string;
  timestamp?: string;
  location?: string;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onMoreOptions?: () => void;
  showHeader?: boolean;
  // Social sharing props
  format?: 'post' | 'story';
  showClubLogo?: boolean;
  routeImageUri?: string | null;
  workoutType?: 'standard' | 'run';
  runMetrics?: RunMetrics;
}

// Run Stats Component for run metrics display
const RunStatsOverlay: React.FC<RunMetrics> = ({ 
  duration, 
  distance, 
  pace, 
  calories 
}) => {
  const formatPace = (paceInSecondsPerKm: number) => {
    if (!paceInSecondsPerKm || !isFinite(paceInSecondsPerKm)) return '--:--';
    const mins = Math.floor(paceInSecondsPerKm / 60);
    const secs = Math.floor(paceInSecondsPerKm % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <View style={runStyles.statsRow}>
      <View style={runStyles.statItem}>
        <Ionicons name="speedometer-outline" size={16} color="#A2A2A2" />
        <Text style={runStyles.statValue}>{formatPace(pace)}/km</Text>
      </View>
      <View style={runStyles.statItem}>
        <Ionicons name="map-outline" size={16} color="#A2A2A2" />
        <Text style={runStyles.statValue}>{formatDistance(distance)}</Text>
      </View>
      <View style={runStyles.statItem}>
        <Ionicons name="flame" size={16} color="#FF9500" />
        <Text style={runStyles.statValue}>{calories} cal</Text>
      </View>
    </View>
  );
};

const WorkoutShareCard: React.FC<WorkoutShareCardProps> = ({
  workout,
  userName = "User",
  userAvatarUrl,
  timestamp = "Just now",
  location,
  onPress,
  onLike,
  onComment,
  onMoreOptions,
  showHeader = true,
  // Social sharing props
  format = 'post',
  showClubLogo = false,
  routeImageUri = null,
  workoutType = 'standard',
  runMetrics,
}) => {
  // Format functions
  const formatDuration = (seconds: number) => {
    if (seconds === undefined) return '--:--';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };

  // Get workout icon color based on workout name
  const getWorkoutIconColor = () => {
    const title = workout.title || '';
    
    if (workoutType === 'run') {
      return '#FF9500'; // Orange for run
    }
    
    // Default to red for common strength workouts
    if (title.toLowerCase().includes('leg') ||
        title.toLowerCase().includes('glute') ||
        title.toLowerCase().includes('hamstring')) {
      return '#FF3B30'; // Red
    } else if (title.toLowerCase().includes('pull') ||
        title.toLowerCase().includes('back')) {
      return '#007AFF'; // Blue
    } else if (title.toLowerCase().includes('push') ||
        title.toLowerCase().includes('chest')) {
      return '#5856D6'; // Purple
    } else if (title.toLowerCase().includes('cycle') ||
        title.toLowerCase().includes('cardio') ||
        title.toLowerCase().includes('run')) {
      return '#FF9500'; // Orange
    }
    return '#FF3B30'; // Default red
  };

  // Generate display values
  const displayTitle = workout.title || (workoutType === 'run' ? 'Morning Run' : 'Workout');
  const displayVolume = workout.totalVolume || 0;
  const displayDuration = workout.duration || 0;
  const displayPRs = workout.personalRecords || 0;
  
  // Calculate card width based on format
  const isStory = format === 'story';
  const cardWidth = isStory ? width * 0.85 : width * 0.9;
  const cardMaxWidth = 320; // For desktop or tablet

  // Date formatting
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render different card based on if it's for social sharing
  if (format === 'story' || format === 'post') {
    // Social share card with gradient
    return (
      <View style={[
        styles.shareContainer,
        { width: Math.min(cardWidth, cardMaxWidth) }
      ]}>
        <LinearGradient
          colors={['#000000', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {showClubLogo && (
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Text style={styles.logoText}>E</Text>
              </View>
              <Text style={styles.appName}>ELITE LOCKER</Text>
            </View>
          )}
          
          <View style={styles.shareContent}>
            {/* Workout title and date */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{displayTitle}</Text>
              <Text style={styles.date}>
                {workout.date ? formatDate(new Date(workout.date)) : formatDate(new Date())}
              </Text>
            </View>
            
            {/* Route image for runs */}
            {workoutType === 'run' && routeImageUri && (
              <View style={styles.routeContainer}>
                <Image
                  source={{ uri: routeImageUri }}
                  style={styles.routeImage}
                  resizeMode="cover"
                />
              </View>
            )}
            
            {/* Card with workout info - styled like the feed cards */}
            <View style={styles.workoutCard}>
              {/* Workout info row */}
              <View style={styles.workoutRow}>
                <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]} />
                <Text style={styles.workoutTitle}>{displayTitle}</Text>
              </View>
              
              {/* Stats */}
              {workoutType === 'run' && runMetrics ? (
                <RunStatsOverlay {...runMetrics} />
              ) : (
                <View style={styles.statsRow}>
                  {displayVolume > 0 && (
                    <View style={styles.statItem}>
                      <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
                      <Text style={styles.statValue}>{displayVolume.toLocaleString()} lb</Text>
                    </View>
                  )}
                  
                  {displayDuration > 0 && (
                    <View style={styles.statItem}>
                      <Ionicons name="time-outline" size={16} color="#A2A2A2" />
                      <Text style={styles.statValue}>{formatDuration(displayDuration)}</Text>
                    </View>
                  )}
                  
                  {displayPRs > 0 && (
                    <View style={styles.prBadge}>
                      <Text style={styles.prText}>PR {displayPRs}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
          
          {/* App URL */}
          <Text style={styles.appUrl}>elite-locker.app</Text>
        </LinearGradient>
      </View>
    );
  }

  // Standard feed card view - now dark themed
  return (
    <View style={styles.container}>
      {/* User header section - only show if avatar available */}
      {showHeader && userAvatarUrl && (
        <View style={styles.userHeader}>
          <Image 
            source={{ uri: userAvatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.finishedText}>
              finished <Text style={styles.workoutNameLink}>{displayTitle}</Text>
            </Text>
          </View>
          <TouchableOpacity onPress={onMoreOptions} style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      )}

      {/* Dark themed card - similar to the iMessage style cards */}
      <TouchableOpacity 
        style={styles.darkWorkoutCard} 
        onPress={onPress} 
        activeOpacity={0.9}
      >
        {/* Main workout title */}
        <View style={styles.darkCardHeader}>
          <Text style={styles.darkCardTitle}>{displayTitle}</Text>
          
          {/* PR badge next to title if applicable */}
          {displayPRs > 0 && (
            <View style={styles.darkPrBadge}>
              <Text style={styles.darkPrText}>{displayPRs} PR</Text>
            </View>
          )}
        </View>
        
        {/* Timestamp if available */}
        {timestamp && (
          <Text style={styles.darkCardTimestamp}>
            {timestamp}
          </Text>
        )}

        {/* Stats row - horizontal layout */}
        <View style={styles.darkStatsRow}>
          {/* Duration */}
          {displayDuration > 0 && (
            <View style={styles.darkStatItem}>
              <Ionicons name="time-outline" size={16} color="#A2A2A2" />
              <Text style={styles.darkStatValue}>{formatDuration(displayDuration)}</Text>
            </View>
          )}

          {/* Exercise count */}
          {workout.exercises && (
            <View style={styles.darkStatItem}>
              <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
              <Text style={styles.darkStatValue}>
                {workout.exercises.length}/{workout.exercises.length}
              </Text>
            </View>
          )}
          
          {/* Volume */}
          {displayVolume > 0 && (
            <View style={styles.darkStatItem}>
              <Ionicons name="trending-up-outline" size={16} color="#A2A2A2" />
              <Text style={styles.darkStatValue}>
                {displayVolume >= 1000 
                  ? `${(displayVolume/1000).toFixed(1)}k` 
                  : displayVolume.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Social actions - only show if needed */}
      {(onLike || onComment) && (
        <View style={styles.socialContainer}>
          <View style={styles.actionButtons}>
            {onLike && (
              <TouchableOpacity onPress={onLike} style={styles.actionButton}>
                <Ionicons name="heart-outline" size={22} color="#8E8E93" />
              </TouchableOpacity>
            )}
            {onComment && (
              <TouchableOpacity onPress={onComment} style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

// Run stats styles
const runStyles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statValue: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 4,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  // Feed card styles
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishedText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  workoutNameLink: {
    fontSize: 14,
    color: '#63A1FF',
    fontWeight: '500',
  },
  moreButton: {
    padding: 5,
  },
  
  // Original white card styles (kept for backward compatibility)
  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  workoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statValue: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 4,
    fontWeight: '500',
  },
  prBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  prText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // New dark card styles
  darkWorkoutCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  darkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  darkCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  darkCardTimestamp: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  darkStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'flex-start',
  },
  darkStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  darkStatValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  darkPrBadge: {
    backgroundColor: '#8B5500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  darkPrText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  timestamp: {
    fontSize: 13,
    color: '#8E8E93',
  },
  
  // Share card styles
  shareContainer: {
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
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  shareContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    marginVertical: 8,
  },
  title: {
    color: '#D3D3D3',
    fontSize: 22,
    fontWeight: 'bold',
  },
  date: {
    color: 'rgba(211, 211, 211, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  routeContainer: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  routeImage: {
    width: '100%',
    height: '100%',
  },
  appUrl: {
    color: 'rgba(211, 211, 211, 0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default WorkoutShareCard; 