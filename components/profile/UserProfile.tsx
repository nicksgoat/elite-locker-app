import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Platform,
  ImageBackground 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

export type WorkoutItem = {
  id: string;
  title: string;
  date: string;
  duration: number;
  sets: number;
  thumbnail?: string;
};

export type UserType = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
  stats: {
    workouts: number;
    following: number;
    followers: number;
  };
  isPremium?: boolean;
  premiumInfo?: {
    clubName: string;
    memberCount: number;
    price: number;
  };
};

type UserProfileProps = {
  user: UserType;
  recentWorkouts: WorkoutItem[];
  isOwnProfile?: boolean;
  onFollowPress?: () => void;
  onMessagePress?: () => void;
  onSharePress?: () => void;
  onSubscribePress?: () => void;
};

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  recentWorkouts,
  isOwnProfile = false,
  onFollowPress,
  onMessagePress,
  onSharePress,
  onSubscribePress
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleActionPress = (action: 'follow' | 'message' | 'share' | 'subscribe') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch(action) {
      case 'follow':
        onFollowPress?.();
        break;
      case 'message':
        onMessagePress?.();
        break;
      case 'share':
        onSharePress?.();
        break;
      case 'subscribe':
        onSubscribePress?.();
        break;
    }
  };

  const handleWorkoutPress = (workout: WorkoutItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${workout.id}`);
  };

  const renderWorkoutItem = (workout: WorkoutItem, index: number) => {
    return (
      <TouchableOpacity 
        key={workout.id} 
        style={styles.workoutItem}
        activeOpacity={0.7}
        onPress={() => handleWorkoutPress(workout)}
      >
        <BlurView intensity={10} tint="dark" style={styles.workoutCard}>
          <View style={styles.workoutNumberContainer}>
            <Text style={styles.workoutNumber}>{index + 1}</Text>
          </View>
          {workout.thumbnail ? (
            <Image 
              source={{ uri: workout.thumbnail }} 
              style={styles.workoutThumbnail}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.workoutThumbnail, styles.placeholderThumbnail]}>
              <Ionicons name="barbell-outline" size={24} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.workoutDetails}>
            <Text style={styles.workoutTitle} numberOfLines={1}>{workout.title}</Text>
            <View style={styles.workoutStats}>
              <Text style={styles.workoutStat}>{workout.sets} sets</Text>
              <Text style={styles.workoutStatSeparator}>•</Text>
              <Text style={styles.workoutStat}>{workout.duration} min</Text>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: user.avatar }}
        style={styles.headerBackground}
        blurRadius={50}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000']}
          style={styles.headerGradient}
        />
      </ImageBackground>

      {/* Back button and share/action buttons */}
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <BlurView intensity={30} tint="dark" style={styles.blurButton}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={() => handleActionPress('share')}
          activeOpacity={0.7}
        >
          <BlurView intensity={30} tint="dark" style={styles.blurButton}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User info section */}
        <View style={styles.userInfoSection}>
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar}
            contentFit="cover"
          />
          
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.handleContainer}>
              <Ionicons name="fitness-outline" size={14} color="#AAAAAA" style={styles.handleIcon} />
              <Text style={styles.handle}>{user.stats.workouts} exercises logged</Text>
            </View>
          </View>

          {/* Club membership info if premium */}
          {user.isPremium && user.premiumInfo && (
            <BlurView intensity={40} tint="dark" style={styles.clubMembership}>
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{user.premiumInfo.clubName}</Text>
                <View style={styles.membershipInfo}>
                  <Ionicons name="people-outline" size={12} color="#AAAAAA" />
                  <Text style={styles.memberCount}>{user.premiumInfo.memberCount} members</Text>
                </View>
              </View>
              <Text style={styles.priceTag}>${user.premiumInfo.price}/mo</Text>
            </BlurView>
          )}

          {/* Action buttons */}
          {!isOwnProfile && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleActionPress('follow')}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Follow</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => handleActionPress('message')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent workouts section */}
        <View style={styles.workoutsSection}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <View style={styles.workoutsList}>
            {recentWorkouts.map((workout, index) => 
              renderWorkoutItem(workout, index)
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingBottom: 40,
  },
  userInfoSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#000',
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  handleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handleIcon: {
    marginRight: 5,
  },
  handle: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  clubMembership: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    width: '90%',
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  membershipInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#AAAAAA',
    marginLeft: 5,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8AFF8A',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 25,
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginHorizontal: 6,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  workoutsSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  workoutsList: {
    width: '100%',
  },
  workoutItem: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  workoutNumberContainer: {
    width: 28,
    alignItems: 'center',
  },
  workoutNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  workoutThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderThumbnail: {
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutDetails: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutStat: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  workoutStatSeparator: {
    fontSize: 10,
    color: '#888888',
    marginHorizontal: 6,
  },
});

export default UserProfile; 