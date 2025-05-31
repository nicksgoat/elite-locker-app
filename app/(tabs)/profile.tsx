import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList as RNFlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { ImageBackground } = require('react-native');

// Import necessary components and context (add more later)
import {
    EditProfileModal,
    EmptyContent,
    ProfileStatsTab,
    ProgramCard
} from '../../components/profile';
import type { ProfileTabType } from '../../components/profile/ProfileTabBar';
import type { ProfileData } from '../../contexts/ProfileContext';
import { useProfile } from '../../contexts/ProfileContext';

const { width, height } = Dimensions.get('window');

// --- Layout Constants ---
const HEADER_MAX_HEIGHT = height * 0.40;
// const HEADER_MIN_HEIGHT = 100; // Will be calculated dynamically based on insets
const COMPACT_TITLE_CONTENT_HEIGHT = 44; // Height for the actual title text area
const TAB_BAR_HEIGHT = 56;
// PROFILE_IMAGE_SIZE remains unused in this snippet but kept for context if needed elsewhere

// --- Main Component ---
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentProfile, currentProfileClubs, fetchProfileData, isLoadingProfile, updateProfile } = useProfile();

  // Debug current profile clubs
  useEffect(() => {
    console.log('Profile tab - currentProfileClubs changed:', currentProfileClubs);
    console.log('Profile tab - currentProfile:', currentProfile);
  }, [currentProfileClubs, currentProfile]);

  // Calculate dynamic header heights that depend on insets
  const HEADER_MIN_HEIGHT = useMemo(() => insets.top + COMPACT_TITLE_CONTENT_HEIGHT, [insets.top]);
  const HEADER_SCROLL_DISTANCE = useMemo(() => HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT, [HEADER_MIN_HEIGHT]);

  // States
  const [activeTab, setActiveTab] = useState<ProfileTabType>('workouts');
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [listData, setListData] = useState<any[]>([]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  // Removed clubs state as tab is removed

  // Edit Profile Modal state
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<RNFlatList<any>>(null);

  // Add monetization and affiliate tracking states
  const [bioLinks, setBioLinks] = useState<{title: string, url: string}[]>([
    { title: 'Instagram', url: 'https://instagram.com/username' },
    { title: 'Website', url: 'https://mywebsite.com' },
    { title: 'YouTube', url: 'https://youtube.com/c/username' },
  ]);

  const [affiliateEarnings, setAffiliateEarnings] = useState({
    total: 1247.85,
    thisMonth: 324.50,
    referrals: 156,
  });

  const [monetizedContent, setMonetizedContent] = useState({
    programs: 3,
    workouts: 5,
    subscribers: 245,
    monthlyRevenue: 2175.25,
  });

  // --- Animations ---
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerElementsOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE * 0.5, HEADER_SCROLL_DISTANCE * 0.9],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: 'clamp',
  });

  const compactHeaderActualTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0], // Compact header is part of the shrinking header, doesn't need separate Y translation
    extrapolate: 'clamp',
  });

  // --- Handlers ---
  const handleTabChange = useCallback((tab: ProfileTabType) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
    setListData([]);
    flatListRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }, []);

  // --- ADD BACK MISSING HANDLERS ---
  const handleWorkoutPress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}`);
  }, [router]);

  const handleProgramPress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/programs/detail/${id}`); // Assuming this is the correct route
  }, [router]);

  const handleClubPress = useCallback((id: string) => {
    // Validate club ID before navigation
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.warn('Invalid club ID provided for navigation:', id);
      Alert.alert('Error', 'Unable to open club. Please try again.');
      return;
    }

    console.log('Profile tab - Navigating to club:', id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${id.trim()}`);
  }, [router]);

  // Add handler for bio links
  const handleBioLinkPress = useCallback((url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('External Link', `Opening ${url}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open', onPress: () => {/* In a real app would use Linking.openURL */} }
    ]);
  }, []);

  // Handler for opening the Edit Profile modal
  const handleEditProfilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditProfileModalVisible(true);
  }, []);

  // Handler for saving profile changes
  const handleSaveProfile = useCallback(async (updatedProfile: Partial<ProfileData>) => {
    try {
      // Call the updateProfile function from the ProfileContext
      await updateProfile(updatedProfile);

      // Show success feedback
      Alert.alert('Success', 'Profile updated successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      return Promise.reject(error);
    }
  }, [updateProfile]);

  // --- Data Loading Effect ---
  useEffect(() => {
    const loadTabData = async () => {
      if (!currentProfile) return;
      setIsLoadingTab(true);
      setListData([]);

      try {
        let dataToSet = [];
        switch (activeTab) {
          case 'workouts':
            if (workouts.length === 0) {
              const fetched = await fetchProfileData('workouts', currentProfile.id) || [];
              setWorkouts(fetched);
              dataToSet = fetched;
            } else {
              dataToSet = workouts;
            }
            break;
          case 'programs':
             if (programs.length === 0) {
              const fetched = await fetchProfileData('programs', currentProfile.id) || [];
              setPrograms(fetched);
              dataToSet = fetched;
            } else {
              dataToSet = programs;
            }
            break;
          case 'stats':
            setListData([{ type: 'statsTab', userId: currentProfile.id }]);
            break;
        }
        if (activeTab !== 'stats') {
            setListData(dataToSet);
        }
      } catch (error) {
        console.error(`Error loading ${activeTab}:`, error);
        Alert.alert('Error', `Failed to load ${activeTab}.`);
        setListData([]);
      } finally {
        setIsLoadingTab(false);
      }
    };

    if (currentProfile && !isLoadingProfile) {
        loadTabData();
    }
  }, [activeTab, currentProfile?.id, fetchProfileData, isLoadingProfile, workouts, programs]);

  // Helper to get profile image for bleeding effect
  const getProfileImage = () => {
    if (currentProfile?.headerUrl) {
      return { uri: currentProfile.headerUrl };
    }
    if (currentProfile?.avatarUrl) {
      return { uri: currentProfile.avatarUrl };
    }
    // Fallback to a default marketplace image
    return require('../../assets/images/marketplace/profiles.jpg');
  };

  // Helper to format workout stats line
  const formatWorkoutStats = (workout: any): string => {
    const parts = [];
    if (workout.totalVolume) parts.push(`${workout.totalVolume.toLocaleString()} lbs`);
    if (workout.sets) parts.push(`${workout.sets} sets`); // Assuming 'sets' is total sets number
    if (workout.duration) parts.push(`${workout.duration} min`);
    return parts.join(' • ');
  };

  // --- Render Item for FlatList ---
  const renderListItem = useCallback(({ item, index }: { item: any, index: number }) => {
    switch (activeTab) {
      case 'workouts':
        // Render workout list item based on reference image
        return (
          <TouchableOpacity
            style={styles.workoutListItem}
            onPress={() => handleWorkoutPress(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.workoutRank}>{index + 1}</Text>
            <Image
              source={{ uri: item.thumbnailUrl || 'https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500' }}
              style={styles.workoutThumbnail}
              contentFit="cover"
            />
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.workoutStats}>{formatWorkoutStats(item)}</Text>
            </View>
            {/* Optional: Add bookmark/like icons similar to WorkoutCard if needed */}
            <TouchableOpacity style={styles.workoutMoreButton}>
                 <Ionicons name="ellipsis-horizontal" size={20} color="#AAA" />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      case 'programs':
        return (
          <View style={styles.listItemContainer}>
             <ProgramCard program={item} onPress={handleProgramPress} />
          </View>
        );
      case 'stats':
        if (item.type === 'statsTab' && currentProfile) {
          return <ProfileStatsTab userId={currentProfile.id} />;
        }
        return null;
      default:
        return null;
    }
  }, [activeTab, currentProfile, handleWorkoutPress, handleProgramPress, formatWorkoutStats]);

  // --- Loading State ---
  if (isLoadingProfile || !currentProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  // --- Main Return ---
  return (
    <SafeAreaView style={styles.screenContainer}>
      <StatusBar style="light" />

      {/* Extended background image that bleeds down - Spotify style */}
      <View style={styles.extendedBackground}>
        <ImageBackground
          source={getProfileImage()}
          style={styles.extendedBackgroundImage}
          imageStyle={{ resizeMode: 'cover' }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.4, 0.7, 1]}
          style={styles.extendedGradient}
        />
      </View>

      {/* Header (Absolute Position) */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        {/* Background */}
        <Animated.View style={[styles.headerBackground, { opacity: headerElementsOpacity }]}>
           <ImageBackground
             source={getProfileImage()}
             style={styles.headerImage}
             imageStyle={{ resizeMode: 'cover' }}
           >
             <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)', '#000']} style={styles.gradient} />
           </ImageBackground>
        </Animated.View>

        {/* Settings Button - Top Right of Header */}
        <Animated.View style={[
          styles.headerSettingsContainer,
          {
            opacity: headerElementsOpacity,
            top: insets.top + 10 // Use safe area insets
          }
        ]}>
          <TouchableOpacity
            style={styles.headerSettingsButton}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Header Content (Adjusted Alignment & Position) */}
        <Animated.View style={[styles.headerContent, { opacity: headerElementsOpacity }]}>
          <Text style={styles.profileName}>{currentProfile?.name ?? 'User Name'}</Text>
          <Text style={styles.profileHandle}>@{currentProfile?.handle ?? 'username'}</Text>

          {/* Club Container - Show user's first club if they have one */}
          {currentProfileClubs && currentProfileClubs.length > 0 && (
            <TouchableOpacity
              style={styles.clubContainer}
              onPress={() => {
                console.log('Profile club pressed:', currentProfileClubs[0]);
                console.log('Club ID:', currentProfileClubs[0].id);
                handleClubPress(currentProfileClubs[0].id);
              }}
              activeOpacity={0.8}
            >
               <BlurView intensity={25} tint="dark" style={styles.clubContainerBlur}>
                  <View style={styles.clubInfoContainer}>
                      <Text style={styles.clubName}>{currentProfileClubs[0].name}</Text>
                      <View style={styles.clubMembersRow}>
                          <Ionicons name="people-outline" size={12} color="#AAA" />
                          <Text style={styles.clubMembersText}>
                            {(currentProfileClubs[0].member_count || currentProfileClubs[0].memberCount || 0).toLocaleString()} members
                          </Text>
                      </View>
                  </View>
                  <View style={styles.clubPriceContainer}>
                      <Text style={styles.clubPriceText}>
                        {currentProfileClubs[0].is_paid ? `$${currentProfileClubs[0].price || 9}/mo` : 'Free'}
                      </Text>
                  </View>
               </BlurView>
            </TouchableOpacity>
          )}
        </Animated.View>

         {/* Compact Header - Updated to match club screen's layout */}
         <Animated.View style={[
           styles.compactHeader,
           {
             opacity: compactTitleOpacity,
             height: HEADER_MIN_HEIGHT,
             paddingTop: insets.top // Apply safe area padding here
           }
          ]}>
            {/* Mimic Club Screen: Back Button (optional functionality) */}
            <TouchableOpacity style={styles.compactHeaderButton} onPress={() => router.canGoBack() ? router.back() : router.push('/')}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.compactTitle} numberOfLines={1}>{currentProfile?.name ?? 'Profile'}</Text>

            {/* Settings and Edit Profile Buttons */}
            <View style={styles.compactHeaderButtons}>
              <TouchableOpacity style={styles.compactHeaderButton} onPress={() => router.push('/settings')}>
                <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.compactHeaderButton} onPress={handleEditProfilePress}>
                <Ionicons name="pencil-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
        </Animated.View>
      </Animated.View>

      {/* Club-style Tab Navigation */}
      <Animated.View style={[
        styles.tabBarContainer,
        {
          top: HEADER_MAX_HEIGHT, // Correct initial position: below fully expanded header
          transform: [{ translateY: tabBarTranslateY }] // Animates upwards with scroll
        }
      ]}>
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabScrollContent}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === 'workouts' && styles.activeTab]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleTabChange('workouts');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'workouts' && styles.activeTabText]}>
                Workouts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'programs' && styles.activeTab]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleTabChange('programs');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'programs' && styles.activeTabText]}>
                Programs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleTabChange('stats');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
                Stats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleTabChange('earnings');
              }}
            >
              <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
                Earnings
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.View>

      {/* Main Content List */}
      <Animated.FlatList
        ref={flatListRef as React.RefObject<RNFlatList<any>>}
        style={styles.listStyle}
        data={activeTab === 'earnings' ? [{ type: 'earnings' }] : listData}
        renderItem={({ item, index }) => {
          if (activeTab === 'earnings' && item.type === 'earnings') {
            return (
              <View style={styles.earningsContainer}>
                <View style={styles.earningsSummaryCard}>
                  <Text style={styles.earningsSummaryTitle}>Creator Earnings</Text>
                  <View style={styles.earningsSummaryRow}>
                    <View style={styles.earningsSummaryItem}>
                      <Text style={styles.earningsSummaryValue}>${monetizedContent.monthlyRevenue.toFixed(2)}</Text>
                      <Text style={styles.earningsSummaryLabel}>Monthly Revenue</Text>
                    </View>
                    <View style={styles.earningsSummaryItem}>
                      <Text style={styles.earningsSummaryValue}>{monetizedContent.subscribers}</Text>
                      <Text style={styles.earningsSummaryLabel}>Subscribers</Text>
                    </View>
                  </View>
                  <View style={styles.earningsSummaryRow}>
                    <View style={styles.earningsSummaryItem}>
                      <Text style={styles.earningsSummaryValue}>{monetizedContent.programs}</Text>
                      <Text style={styles.earningsSummaryLabel}>Programs</Text>
                    </View>
                    <View style={styles.earningsSummaryItem}>
                      <Text style={styles.earningsSummaryValue}>{monetizedContent.workouts}</Text>
                      <Text style={styles.earningsSummaryLabel}>Workouts</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.affiliateEarningsCard}>
                  <Text style={styles.earningsSummaryTitle}>Affiliate Earnings</Text>
                  <View style={styles.earningsSummaryRow}>
                    <View style={styles.earningsSummaryItem}>
                      <Text style={styles.earningsSummaryValue}>${affiliateEarnings.total.toFixed(2)}</Text>
                      <Text style={styles.earningsSummaryLabel}>Total Earnings</Text>
                    </View>
                    <View style={styles.earningsSummaryItem}>
                      <Text style={styles.earningsSummaryValue}>${affiliateEarnings.thisMonth.toFixed(2)}</Text>
                      <Text style={styles.earningsSummaryLabel}>This Month</Text>
                    </View>
                  </View>
                  <View style={styles.earningsSummaryRow}>
                    <View style={styles.earningsSummaryItem}>
                      <Text style={styles.earningsSummaryValue}>{affiliateEarnings.referrals}</Text>
                      <Text style={styles.earningsSummaryLabel}>Total Referrals</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.createContentButton}>
                  <Text style={styles.createContentButtonText}>Create New Content</Text>
                </TouchableOpacity>

                {/* Test Workout Ownership Buttons */}
                <View style={styles.testButtonsContainer}>
                  <Text style={styles.testButtonsTitle}>Test Workout Ownership</Text>

                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => router.push('/workout/detail/workout_123')}
                  >
                    <Text style={styles.testButtonText}>My Workout (Should redirect to template)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => router.push('/workout/detail/workout_other_1')}
                  >
                    <Text style={styles.testButtonText}>Other's Workout (Should show purchase)</Text>
                  </TouchableOpacity>

                  {/* Test Club Navigation */}
                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => {
                      console.log('Testing club navigation to Nick\'s Club');
                      handleClubPress('be3e99fd-f08a-4a86-99ae-af4f8314ee6b');
                    }}
                  >
                    <Text style={styles.testButtonText}>Test Club Navigation (Nick's Club)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => {
                      console.log('Testing club navigation to Elite Athletes');
                      handleClubPress('550e8400-e29b-41d4-a716-446655440001');
                    }}
                  >
                    <Text style={styles.testButtonText}>Test Club Navigation (Elite Athletes)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }
          return renderListItem({ item, index });
        }}
        keyExtractor={(item, index) => `${activeTab}-${item?.id?.toString() || item?.type || index}`}
        ListHeaderComponent={
            <>
                {/* Spacer View */}
                <View style={{ height: HEADER_MAX_HEIGHT + TAB_BAR_HEIGHT }} />
                {/* Title is now handled in the recent activity page */}
            </>
        }
        ListEmptyComponent={() => {
          if (isLoadingTab) return <ActivityIndicator style={{marginTop: 50}} size="large" color="#888" />;
          if (activeTab !== 'stats' && activeTab !== 'earnings' && listData.length === 0) {
             // Render EmptyContent without containerStyle
             return <EmptyContent type={activeTab as any} isOwnProfile={true} />;
          }
          return null;
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
           paddingBottom: insets.bottom + 20,
           flexGrow: listData.length === 0 && activeTab !== 'stats' && activeTab !== 'earnings' ? 1 : 0,
           // No horizontal padding needed directly here if list items handle it
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Profile Modal */}
      {currentProfile && (
        <EditProfileModal
          visible={isEditProfileModalVisible}
          onClose={() => setIsEditProfileModalVisible(false)}
          profileData={currentProfile}
          onSave={handleSaveProfile}
        />
      )}

    </SafeAreaView>
  );
}

// --- Basic Styles (Refine later) ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Spotify Bleeding Effect Styles
  extendedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 800,
    zIndex: -1, // Behind everything to not block interactions
  },
  extendedBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  extendedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  // Header
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#000',
    overflow: 'hidden', // Prevent content from spilling out during animation
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#111', // Fallback background color
  },
  headerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111', // Placeholder color while loading
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', // Fallback overlay for image
  },
  headerContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    justifyContent: 'flex-end',
  },
  headerSettingsContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  headerSettingsButton: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  profileHandle: {
    fontSize: 16,
    color: '#DDD',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Compact Header
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // height is set dynamically in style prop to HEADER_MIN_HEIGHT
    // paddingTop is set dynamically in style prop to insets.top
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // To space out back, title, action
    paddingHorizontal: 10, // Padding for the buttons
    // backgroundColor: '#000', // Already set on headerContainer
  },
  compactTitle: {
    flex: 1, // Allow title to take available space
    textAlign: 'center', // Center title between buttons
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
    marginHorizontal: 5, // Add some margin if buttons are present
  },
  compactHeaderButton: { // Style for the new buttons
    padding: 8,
    // backgroundColor: 'rgba(255,255,255,0.1)', // Optional: for better tap feedback area
    // borderRadius: 20,
  },
  compactHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Tab Bar
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    zIndex: 5,
    backgroundColor: 'transparent', // Transparent for bleeding effect
  },
  // Club-style Tab Navigation
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
    height: TAB_BAR_HEIGHT,
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  // FlatList
  listStyle: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to show bleeding effect
  },
  // Container for full-width list items (programs, clubs)
  listItemContainer: {
     marginHorizontal: 16,
     marginBottom: 16,
  },
  // Styling for the badge carousel container
   badgeContainer: {
     paddingHorizontal: 16, // Consistent horizontal padding
     paddingVertical: 8,
     // Ensure BadgeCarousel itself fills width or centers appropriately
   },
  // Re-add sectionTitle for badges
  sectionTitle: {
    fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12
  },
  // Club container styles
  clubContainer: {
    width: '100%', // Take full width within padding
    marginBottom: 0, // Remove space below club card since it's the last element
    borderRadius: 12, // Match reference image rounding
    overflow: 'hidden', // Needed for BlurView border radius
  },
   clubContainerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(40, 40, 40, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
   },
   clubInfoContainer: {
     // No specific changes needed here, rely on flex layout
   },
   clubName: {
     fontSize: 15,
     fontWeight: '600',
     color: '#FFF',
     marginBottom: 3,
   },
   clubMembersRow: {
     flexDirection: 'row',
     alignItems: 'center',
   },
   clubMembersText: {
     color: '#AAA',
     fontSize: 12,
     marginLeft: 5,
   },
   clubPriceContainer: {
     // Positioned by justifyContent: 'space-between' in blur view
   },
   clubPriceText: {
     color: '#30D158', // Green color like image
     fontSize: 14,
     fontWeight: '600',
   },
  // --- Workout List Item Styles ---
  recentWorkoutsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10, // Adjust spacing as needed
    marginBottom: 15,
    paddingHorizontal: 16,
  },
  workoutListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 2, // Minimal space between items
    // backgroundColor: '#111', // Optional background
  },
  workoutRank: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    width: 25, // Fixed width for rank number
    textAlign: 'center',
    marginRight: 15,
  },
  workoutThumbnail: {
    width: 55,
    height: 55,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#333', // Placeholder
  },
  workoutInfo: {
    flex: 1, // Take remaining space
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  workoutStats: {
    fontSize: 13,
    color: '#8E8E93',
  },
   workoutMoreButton: {
     paddingLeft: 10, // Space before the button
     paddingVertical: 5,
  },
  // Stats row styles
  statsRow: {
      flexDirection: 'row',
      alignSelf: 'flex-start', // Align to the left
      marginBottom: 16, // Space before action buttons
  },
  statItem: {
      alignItems: 'center',
      marginRight: 25, // Adjust spacing between stats
  },
  // Action buttons row styles
  actionButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    height: 50,
    marginRight: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // ... buttonBlur, primaryButtonText styles ...
  // ... TabBar styles ...
  // ... FlatList styles ...
  // ... Workout list styles ...
  // ... Earnings styles ...
  earningsContainer: {
    padding: 16,
  },
  earningsSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  earningsSummaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  earningsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  earningsSummaryItem: {
    alignItems: 'center',
  },
  earningsSummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  earningsSummaryLabel: {
    fontSize: 12,
    color: '#AAA',
  },
  createContentButton: {
    backgroundColor: '#30D158',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
  },
  createContentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileBio: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 15,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bioLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  bioLinkButton: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bioLinkBlur: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bioLinkText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
  },
  buttonBlur: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  affiliateEarningsCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  testButtonsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
  },
  testButtonsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#30D158',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});