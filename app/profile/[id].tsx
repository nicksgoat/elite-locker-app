import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Platform,
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
  ProgramCard,
  ProgramList,
  ClubCard,
  EmptyContent,
} from '@/components/profile/ContentCards';

// Context
import { useProfile } from '@/contexts/ProfileContext';
import type { ProfileTabType } from '@/components/profile/ProfileTabBar';

const { width, height } = Dimensions.get('window');

// Constants for layout calculations
const COMPACT_HEADER_HEIGHT = 80;
const TAB_BAR_HEIGHT = 56;
const ACTION_BUTTONS_HEIGHT = 60;
const HEADER_HEIGHT = height * 0.30; // Optimized header height

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const profileId = params.id as string;
  
  // States with memoized initial values to prevent unnecessary re-renders
  const [activeTab, setActiveTab] = useState<ProfileTabType>('workouts');
  const [isScrolling, setIsScrolling] = useState(false);
  const [loadedContent, setLoadedContent] = useState<Record<string, boolean>>({});
  
  // Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { 
    viewedProfile, 
    viewedProfileWorkouts,
    viewedProfilePrograms,
    viewedProfileClubs,
    isLoadingProfile,
    isLoadingContent,
    isFollowing,
    fetchProfile,
    fetchProfileData,
    followProfile,
    unfollowProfile,
    resetViewedProfile,
  } = useProfile();

  // Memoized number formatter to prevent unnecessary calculations
  const formatNumber = useMemo(() => (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}m`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  }, []);

  // Tab counts memoized for better performance - moved up to maintain hook order
  const tabCounts = useMemo(() => {
    if (!viewedProfile) return { 
      workouts: 0,
      programs: 0,
      clubs: 0,
      achievements: 0 
    };
    
    return {
      workouts: viewedProfileWorkouts.length,
      programs: viewedProfilePrograms.length,
      clubs: viewedProfileClubs.length,
      achievements: viewedProfile.badges.length,
    };
  }, [viewedProfile, viewedProfileWorkouts.length, viewedProfilePrograms.length, viewedProfileClubs.length, viewedProfile?.badges?.length]);

  // Memoized animations for better performance
  const animations = useMemo(() => ({
    headerHeight: scrollY.interpolate({
      inputRange: [0, HEADER_HEIGHT - COMPACT_HEADER_HEIGHT],
      outputRange: [HEADER_HEIGHT, COMPACT_HEADER_HEIGHT],
      extrapolate: 'clamp',
    }),
    imageOpacity: scrollY.interpolate({
      inputRange: [0, HEADER_HEIGHT / 4, HEADER_HEIGHT / 2],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    }),
    titleOpacity: scrollY.interpolate({
      inputRange: [HEADER_HEIGHT / 2, HEADER_HEIGHT - COMPACT_HEADER_HEIGHT - 20],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    // Position the tab bar directly below the header
    tabBarTop: scrollY.interpolate({
      inputRange: [0, HEADER_HEIGHT - COMPACT_HEADER_HEIGHT],
      outputRange: [HEADER_HEIGHT, COMPACT_HEADER_HEIGHT],
      extrapolate: 'clamp',
    }),
    // Position action buttons below the tab bar
    actionButtonTop: scrollY.interpolate({
      inputRange: [0, HEADER_HEIGHT - COMPACT_HEADER_HEIGHT],
      outputRange: [HEADER_HEIGHT + TAB_BAR_HEIGHT, COMPACT_HEADER_HEIGHT + TAB_BAR_HEIGHT],
      extrapolate: 'clamp',
    }),
  }), [scrollY]);

  // Load profile data when the component mounts - with useCallback
  const loadProfile = useCallback(async () => {
    if (profileId) {
      await fetchProfile(profileId);
    }
  }, [profileId, fetchProfile]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleTabChange = useCallback((tab: ProfileTabType) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  }, []);

  const handleShareProfile = useCallback(async () => {
    if (!viewedProfile) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Check out ${viewedProfile.name}'s profile on Elite Locker!`,
        url: `https://elitelocker.app/profile/${viewedProfile.handle}`,
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  }, [viewedProfile]);

  const handleFollowUser = useCallback(async () => {
    if (!viewedProfile) return;
    
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
  }, [viewedProfile, isFollowing, followProfile, unfollowProfile]);

  const handleMessageUser = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would navigate to a messaging screen
    Alert.alert('Coming Soon', 'Messaging will be available in a future update');
  }, []);

  // Memoized navigation handlers
  const handleWorkoutPress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}`);
  }, [router]);

  const handleProgramPress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/template/${id}`);
  }, [router]);

  const handleClubPress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${id}`);
  }, [router]);

  // Optimized scroll handler with more direct approach
  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    // Update the animated value directly
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
    
    // Update isScrolling state (with debounce effect by only triggering on threshold change)
    if (offsetY > 5 && !isScrolling) {
      setIsScrolling(true);
    } else if (offsetY <= 5 && isScrolling) {
      setIsScrolling(false);
    }
  }, [scrollY, isScrolling]);

  // Effects - always keep these after all memoized values and callbacks
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  
  // Optimized tab content loading with a single effect
  useEffect(() => {
    const loadTabData = async () => {
      if (!profileId || !viewedProfile || loadedContent[activeTab]) return;
      
      await fetchProfileData(
        activeTab === 'achievements' ? 'badges' : activeTab as 'workouts' | 'programs' | 'clubs', 
        profileId
      );
      
      // Update loaded state
      setLoadedContent(prev => ({
        ...prev,
        [activeTab]: true
      }));
    };
    
    loadTabData();
  }, [activeTab, profileId, viewedProfile, loadedContent, fetchProfileData]);

  // Add cleanup effect to reset profile when unmounting
  useEffect(() => {
    return () => {
      // This will be called when the component unmounts
      resetViewedProfile();
    };
  }, [resetViewedProfile]);

  // Loading state - simplified
  if (isLoadingProfile || !viewedProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Render content based on active tab
  const renderTabContent = () => {
    if (isLoadingContent) {
      return (
        <View style={styles.loadingContentContainer}>
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      );
    }
    
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
          <View style={styles.programsContainer}>
            {viewedProfilePrograms.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>All Programs</Text>
                {viewedProfilePrograms.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    onPress={handleProgramPress}
                  />
                ))}
              </>
            ) : (
              <EmptyContent type="programs" isOwnProfile={false} />
            )}
          </View>
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
      
      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, { height: animations.headerHeight }]}>
        <Animated.View style={[styles.headerBackground, { opacity: animations.imageOpacity }]}>
          <Image
            source={{ uri: viewedProfile.avatarUrl }}
            style={styles.headerImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={viewedProfile.id}
            transition={300}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', '#000']}
            style={styles.gradient}
          />
        </Animated.View>

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Action buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
            >
              <BlurView intensity={30} tint="dark" style={styles.blurButton}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareProfile}
              activeOpacity={0.7}
              hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
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
                cachePolicy="memory-disk"
                recyclingKey={viewedProfile.id}
                transition={300}
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
            
            {/* Stats row - Always visible at the bottom of the header */}
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
          </View>
        </View>

        {/* Compact header title (visible when scrolled) */}
        <Animated.View style={[styles.compactHeader, { opacity: animations.titleOpacity }]}>
          <Text style={styles.compactTitle}>{viewedProfile.name}</Text>
          {viewedProfile.isVerified && (
            <Ionicons name="checkmark-circle" size={16} color="#0A84FF" style={{ marginLeft: 4 }} />
          )}
        </Animated.View>
      </Animated.View>
      
      {/* Tab Bar - Always positioned directly below the header */}
      <Animated.View style={[styles.tabBarContainer, { top: animations.tabBarTop }]}>
        <BlurView intensity={60} tint="dark" style={styles.tabBarBlur}>
          <ProfileTabBar
            tabs={['workouts', 'programs', 'clubs', 'achievements']}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isScrolling={true}
            counts={tabCounts}
            isOwnProfile={false}
          />
        </BlurView>
      </Animated.View>
      
      {/* Action buttons - Always below the tab bar */}
      <Animated.View style={[styles.actionButtonsContainer, { top: animations.actionButtonTop }]}>
        <BlurView intensity={40} tint="dark" style={styles.actionButtonsBlur}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing ? styles.followingButton : styles.notFollowingButton,
            ]}
            onPress={handleFollowUser}
            activeOpacity={0.7}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessageUser}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent, 
          { paddingTop: HEADER_HEIGHT + TAB_BAR_HEIGHT + ACTION_BUTTONS_HEIGHT }
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        bounces={true}
        overScrollMode="always"
        removeClippedSubviews={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* User's Club - Horizontal container */}
        <View style={styles.clubContainer}>
          <BlurView intensity={30} tint="dark" style={styles.clubContainerBlur}>
            <TouchableOpacity 
              style={styles.clubButton}
              activeOpacity={0.7}
              onPress={() => router.push('/club/sulek-lifting')}
            >
              <View style={styles.clubInfoContainer}>
                <Text style={styles.clubName}>Sulek Lifting Club</Text>
                <View style={styles.clubMembersRow}>
                  <Ionicons name="people-outline" size={12} color="#AAA" />
                  <Text style={styles.clubMembersText}>1,245 members</Text>
                </View>
              </View>
              <View style={styles.clubPriceContainer}>
                <Text style={styles.clubPriceText}>$0/mo</Text>
              </View>
            </TouchableOpacity>
          </BlurView>
        </View>
        
        {/* Bio Section */}
        {viewedProfile.bio ? (
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>{viewedProfile.bio}</Text>
          </View>
        ) : null}
        
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
                      <Text>{new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                      <Text>{' • '}</Text>
                      <Text>{workout.duration} min</Text>
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
        {renderTabContent()}
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
    overflow: 'hidden',
    backgroundColor: '#000',
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
    padding: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  shareButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  blurButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  handleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handle: {
    fontSize: 16,
    color: '#AAAAAA',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    width: '100%',
    marginTop: 5,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  statLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    zIndex: 10,
    overflow: 'hidden',
  },
  tabBarBlur: {
    width: '100%',
    height: '100%',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ACTION_BUTTONS_HEIGHT,
    zIndex: 10,
    overflow: 'hidden',
  },
  actionButtonsBlur: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  followButton: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  followingButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notFollowingButton: {
    backgroundColor: '#0A84FF',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  messageButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  compactHeader: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    zIndex: 11,
  },
  compactTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  bioContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 15,
  },
  bio: {
    color: '#DDDDDD',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 16,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  workoutsContainer: {
    paddingTop: 10,
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  clubsContainer: {
    paddingTop: 10,
  },
  clubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  achievementsContainer: {
    marginTop: 10,
  },
  programsContainer: {
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  showcaseSection: {
    marginTop: 8,
    marginBottom: 16,
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  workoutDate: {
    color: '#AAAAAA',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  workoutMoreButton: {
    padding: 8,
  },
  clubContainer: {
    marginHorizontal: 16,
    marginBottom: 15,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
  },
  clubContainerBlur: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
  },
  clubButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  clubInfoContainer: {
    flex: 1,
  },
  clubName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  clubMembersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  clubMembersText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginLeft: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  clubPriceContainer: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  clubPriceText: {
    color: '#0A84FF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
}); 