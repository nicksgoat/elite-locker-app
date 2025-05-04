import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { ProfileData } from '@/contexts/ProfileContext';

const { width } = Dimensions.get('window');

interface ProfileHeaderProps {
  profile: ProfileData;
  isOwnProfile: boolean;
  onEditPress?: () => void;
  onFollowPress?: () => void;
  onMessagePress?: () => void;
  onSharePress?: () => void;
  isFollowing?: boolean;
  workoutsThisWeek?: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  onEditPress,
  onFollowPress,
  onMessagePress,
  onSharePress,
  isFollowing = false,
  workoutsThisWeek = 0,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleActionPress = (action: 'edit' | 'follow' | 'message' | 'share') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch (action) {
      case 'edit':
        onEditPress?.();
        break;
      case 'follow':
        onFollowPress?.();
        break;
      case 'message':
        onMessagePress?.();
        break;
      case 'share':
        onSharePress?.();
        break;
    }
  };

  // Progress for the avatar ring showing workouts this week (0-7)
  const progressPercentage = Math.min(100, (workoutsThisWeek / 7) * 100);

  // Format large numbers with k/m suffix
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}m`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header background with blur and gradient overlay */}
      <ImageBackground
        source={{ uri: profile.headerUrl || profile.avatarUrl }}
        style={styles.headerBackground}
        blurRadius={50}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000']}
          style={styles.headerGradient}
        />
      </ImageBackground>

      {/* Action buttons */}
      <View style={styles.headerActions}>
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

      {/* Profile info */}
      <View style={styles.profileInfo}>
        {/* Avatar with progress ring */}
        <View style={styles.avatarContainer}>
          <View style={styles.progressRing}>
            <View style={[
              styles.progressFill,
              { width: `${progressPercentage}%` }
            ]} />
          </View>
          <Image
            source={{ uri: profile.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
          />
          {profile.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#0A84FF" />
            </View>
          )}
        </View>

        {/* Name and handle */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          <View style={styles.handleContainer}>
            <Text style={styles.handle}>@{profile.handle}</Text>
            {profile.role === 'coach' && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Coach</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio */}
        {profile.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : null}

        {/* Stats row */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statValue}>{formatNumber(profile.metrics.totalWorkouts)}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statValue}>{formatNumber(profile.metrics.followersCount)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statValue}>{formatNumber(profile.metrics.followingCount)}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          {isOwnProfile ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleActionPress('edit')}
              activeOpacity={0.7}
            >
              <BlurView intensity={30} tint="dark" style={styles.blurActionButton}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </BlurView>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing ? styles.followingButton : styles.notFollowingButton,
                ]}
                onPress={() => handleActionPress('follow')}
                activeOpacity={0.7}
              >
                <BlurView
                  intensity={30}
                  tint="dark"
                  style={[
                    styles.blurActionButton,
                    isFollowing ? styles.followingBlur : styles.notFollowingBlur,
                  ]}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      isFollowing ? styles.followingText : styles.notFollowingText,
                    ]}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => handleActionPress('message')}
                activeOpacity={0.7}
              >
                <BlurView intensity={30} tint="dark" style={styles.blurActionButton}>
                  <Ionicons name="chatbubble-outline" size={18} color="#FFF" />
                </BlurView>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Premium indicator if applicable */}
        {profile.isPremium && (
          <View style={styles.premiumIndicator}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  headerBackground: {
    width: '100%',
    height: 150,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerGradient: {
    width: '100%',
    height: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
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
  profileInfo: {
    padding: 16,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -50,
    marginBottom: 16,
  },
  progressRing: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 6,
    backgroundColor: '#0A84FF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#000',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  handleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handle: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  roleBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  roleText: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    color: '#DDDDDD',
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  editButton: {
    width: '80%',
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'center',
  },
  followButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 8,
  },
  followingButton: {},
  notFollowingButton: {},
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  followingText: {
    color: '#FFFFFF',
  },
  notFollowingText: {
    color: '#FFFFFF',
  },
  followingBlur: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notFollowingBlur: {
    borderColor: 'rgba(10,132,255,0.5)',
    backgroundColor: 'rgba(10,132,255,0.2)',
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  blurActionButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  premiumIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 10,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ProfileHeader; 