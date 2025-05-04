import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';

// Components
import ProfileTabBar from '@/components/profile/ProfileTabBar';
import BadgeCarousel from '@/components/profile/BadgeCarousel';
import {
  WorkoutCard,
  ProgramList,
  ClubCard,
  EmptyContent,
} from '@/components/profile/ContentCards';

// Context
import { useProfile } from '@/contexts/ProfileContext';
import type { ProfileTabType } from '@/components/profile/ProfileTabBar';

const { width, height } = Dimensions.get('window');

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const profileId = params.id as string;
  
  const { 
    viewedProfile, 
    viewedProfileWorkouts,
    viewedProfilePrograms,
    viewedProfileClubs,
    isLoadingProfile,
    isLoadingContent,
    isFollowing,
    fetchProfile,
    loadProfileContent,
    followProfile,
    unfollowProfile, 
  } = useProfile();

  // States
  const [activeTab, setActiveTab] = useState<ProfileTabType>('workouts');
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Calculate header height for the large profile header
  const HEADER_HEIGHT = height * 0.35;
  
  // Load profile data when the component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      if (profileId) {
        await fetchProfile(profileId);
        await loadProfileContent(profileId);
      }
    };
    
    loadProfileData();
  }, [profileId, fetchProfile, loadProfileContent]);
  
  // Loading state
  if (isLoadingProfile || !viewedProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Handle tab change
  const handleTabChange = (tab: ProfileTabType) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Handle share profile
  const handleShareProfile = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Check out ${viewedProfile.name}'s profile on Elite Locker!`,
        url: `https://elitelocker.app/profile/${viewedProfile.handle}`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  // Handle follow user
  const handleFollowUser = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (isFollowing) {
        await unfollowProfile(viewedProfile.id);
      } else {
        await followProfile(viewedProfile.id);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  // Handle message user
  const handleMessageUser = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would navigate to a messaging screen
    Alert.alert('Coming Soon', 'Messaging will be available in a future update');
  };

  // Handle scroll
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrolling(offsetY > 20);
      }
    }
  );

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

  // Handle workout press
  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}`);
  };

  // Handle program press
  const handleProgramPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/template/${id}`);
  };

  // Handle club press
  const handleClubPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${id}`);
  };

  // Calculate animation values for header elements
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 120],
    outputRange: [HEADER_HEIGHT, 120],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT - 120],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 140, HEADER_HEIGHT - 120],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workouts':
        return (
          <View style={styles.workoutsContainer}>
            {viewedProfileWorkouts.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>All Workouts</Text>
                <View style={styles.workoutGrid}>
                  {viewedProfileWorkouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      onPress={handleWorkoutPress}
                    />
                  ))}
                </View>
              </>
            ) : (
              <EmptyContent type="workouts" isOwnProfile={false} />
            )}
          </View>
        );
      case 'programs':
        return (
          <ProgramList
            programs={viewedProfilePrograms}
            onProgramPress={handleProgramPress}
            ListEmptyComponent={
              <EmptyContent type="programs" isOwnProfile={false} />
            }
          />
        );
      case 'clubs':
        return (
          <View style={styles.clubsContainer}>
            {viewedProfileClubs.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>All Clubs</Text>
                <View style={styles.clubGrid}>
                  {viewedProfileClubs.map((club) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      onPress={handleClubPress}
                    />
                  ))}
                </View>
              </>
            ) : (
              <EmptyContent type="clubs" isOwnProfile={false} />
            )}
          </View>
        );
      case 'achievements':
        return (
          <View style={styles.achievementsContainer}>
            <BadgeCarousel badges={viewedProfile.badges} />
            {viewedProfile.badges.length === 0 && (
              <EmptyContent type="achievements" isOwnProfile={false} />
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Animated Header Background */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <Animated.View style={[styles.headerBackground, { opacity: imageOpacity }]}>
          <Image
            source={{ uri: viewedProfile.avatarUrl }}
            style={styles.headerImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', '#000']}
            style={styles.gradient}
          />
        </Animated.View>

        {/* Header Content */}
        <View style={[styles.headerContent, { marginTop: 20 }]}>
          {/* Action buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <BlurView intensity={30} tint="dark" style={styles.blurButton}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareProfile}
              activeOpacity={0.7}
            >
              <BlurView intensity={30} tint="dark" style={styles.blurButton}>
                <Ionicons name="share-outline" size={22} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Profile info */}
          <View style={styles.profileInfo}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: viewedProfile.avatarUrl }}
                style={styles.avatar}
                contentFit="cover"
              />
              {viewedProfile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#0A84FF" />
                </View>
              )}
            </View>

            {/* Name and handle */}
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{viewedProfile.name}</Text>
              <View style={styles.handleContainer}>
                <Text style={styles.handle}>@{viewedProfile.handle}</Text>
                {viewedProfile.role === 'coach' && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>Coach</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
                <Text style={styles.statValue}>{formatNumber(viewedProfile.metrics.totalWorkouts)}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
                <Text style={styles.statValue}>{formatNumber(viewedProfile.metrics.followersCount)}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
                <Text style={styles.statValue}>{formatNumber(viewedProfile.metrics.followingCount)}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
            
            {/* Action buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing ? styles.followingButton : styles.notFollowingButton,
                ]}
                onPress={handleFollowUser}
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
                onPress={handleMessageUser}
                activeOpacity={0.7}
              >
                <BlurView intensity={30} tint="dark" style={styles.blurActionButton}>
                  <Ionicons name="chatbubble-outline" size={18} color="#FFF" />
                </BlurView>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Compact header title (visible when scrolled) */}
        <Animated.View style={[styles.compactHeader, { opacity: titleOpacity }]}>
          <Text style={styles.compactTitle}>{viewedProfile.name}</Text>
          {viewedProfile.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color="#0A84FF" style={{ marginLeft: 4 }} />
          )}
        </Animated.View>
      </Animated.View>
      
      {/* Tab Bar - becomes visible when scrolling */}
      <ProfileTabBar
        tabs={['workouts', 'programs', 'clubs', 'achievements']}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isScrolling={isScrolling}
        counts={{
          workouts: viewedProfileWorkouts.length,
          programs: viewedProfilePrograms.length,
          clubs: viewedProfileClubs.length,
          achievements: viewedProfile.badges.length,
        }}
        isOwnProfile={false}
      />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingTop: HEADER_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* Bio Section */}
        {viewedProfile.bio ? (
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>{viewedProfile.bio}</Text>
          </View>
        ) : null}
        
        {/* Clubs Showcase */}
        {viewedProfileClubs.length > 0 && (
          <View style={styles.showcaseSection}>
            <Text style={styles.sectionTitle}>Clubs</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {viewedProfileClubs.map(club => (
                <TouchableOpacity 
                  key={club.id} 
                  style={styles.clubCard}
                  onPress={() => handleClubPress(club.id)}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={20} tint="dark" style={styles.clubCardBlur}>
                    <Image 
                      source={{ uri: club.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd' }} 
                      style={styles.clubImage} 
                    />
                    <View style={styles.clubInfo}>
                      <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                      <View style={styles.clubMembersContainer}>
                        <Ionicons name="people-outline" size={14} color="#AAA" />
                        <Text style={styles.clubMembers}>{formatNumber(club.memberCount)} members</Text>
                      </View>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Recent Workouts */}
        {viewedProfileWorkouts.length > 0 && (
          <View style={styles.showcaseSection}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <View style={styles.recentWorkoutsContainer}>
              {viewedProfileWorkouts.slice(0, 3).map((workout, index) => (
                <TouchableOpacity 
                  key={workout.id} 
                  style={styles.recentWorkoutItem}
                  onPress={() => handleWorkoutPress(workout.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.workoutRank}>
                    <Text style={styles.workoutRankText}>{index + 1}</Text>
                  </View>
                  <Image 
                    source={{ uri: workout.thumbnailUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd' }} 
                    style={styles.workoutThumbnail} 
                  />
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutTitle} numberOfLines={1}>{workout.title}</Text>
                    <Text style={styles.workoutDate}>
                      {new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' • '}{workout.duration} min
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.workoutMoreButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#AAA" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Tab Content */}
        {isLoadingContent ? (
          <View style={styles.loadingContentContainer}>
            <Text style={styles.loadingText}>Loading content...</Text>
          </View>
        ) : (
          renderTabContent()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingContentContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  blurButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 8,
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    marginTop: 10,
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
  compactHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  bioContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bio: {
    color: '#DDDDDD',
    fontSize: 15,
    lineHeight: 22,
  },
  showcaseSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 16,
    marginBottom: 12,
  },
  horizontalScrollContent: {
    paddingHorizontal: 12,
  },
  clubCard: {
    width: 140,
    height: 180,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  clubCardBlur: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clubImage: {
    width: '100%',
    height: 100,
  },
  clubInfo: {
    padding: 10,
  },
  clubName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  clubMembersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubMembers: {
    color: '#AAAAAA',
    fontSize: 12,
    marginLeft: 4,
  },
  recentWorkoutsContainer: {
    paddingHorizontal: 16,
  },
  recentWorkoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  workoutRank: {
    width: 28,
    alignItems: 'center',
  },
  workoutRankText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontWeight: '500',
  },
  workoutThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  workoutDate: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  workoutMoreButton: {
    padding: 8,
  },
  workoutsContainer: {
    paddingHorizontal: 16,
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  clubsContainer: {
    paddingHorizontal: 16,
  },
  clubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementsContainer: {
    marginTop: 8,
  },
}); 