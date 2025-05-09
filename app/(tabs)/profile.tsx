import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList, // Use regular FlatList for Animated.FlatList type
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

// Import necessary components and context (add more later)
import { useProfile } from '@/contexts/ProfileContext';
import type { ProfileData } from '@/contexts/ProfileContext';
import ProfileTabBar from '@/components/profile/ProfileTabBar';
import type { ProfileTabType } from '@/components/profile/ProfileTabBar';
import BadgeCarousel from '@/components/profile/BadgeCarousel';
import ProfileStatsTab from '@/components/profile/ProfileStatsTab';
import { WorkoutCard, ProgramCard, ClubCard, EmptyContent } from '@/components/profile/ContentCards';

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
  const { currentProfile, fetchProfileData, isLoadingProfile } = useProfile();

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

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // --- Animations ---
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerElementsOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const tabBarTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE], // Correct: moves up by the scrolled distance
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${id}`);
  }, [router]);
  // --- END ADDED HANDLERS ---

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
              source={{ uri: item.thumbnailUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd' }} 
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
      
      {/* Header (Absolute Position) */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        {/* Background */}
        <Animated.View style={[styles.headerBackground, { opacity: headerElementsOpacity }]}>
           <Image source={{ uri: currentProfile?.avatarUrl || 'https://via.placeholder.com/400x200' }} style={styles.headerImage} contentFit="cover" />
           <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)', '#000']} style={styles.gradient} />
        </Animated.View>

        {/* Header Content (Adjusted Alignment & Position) */}
        <Animated.View style={[styles.headerContent, { opacity: headerElementsOpacity }]}>
          <Text style={styles.profileName}>{currentProfile?.name ?? 'User Name'}</Text>
          <Text style={styles.profileHandle}>@{currentProfile?.handle ?? 'username'}</Text>
          
          {/* Club Container */}
          <TouchableOpacity 
            style={styles.clubContainer}
            onPress={() => handleClubPress('sulek-lifting')} 
            activeOpacity={0.8}
          >
             <BlurView intensity={25} tint="dark" style={styles.clubContainerBlur}>
                <View style={styles.clubInfoContainer}>
                    <Text style={styles.clubName}>Sulek Lifting Club</Text>
                    <View style={styles.clubMembersRow}>
                        <Ionicons name="people-outline" size={12} color="#AAA" />
                        <Text style={styles.clubMembersText}>1,245 members</Text>
                    </View>
                </View>
                <View style={styles.clubPriceContainer}>
                    <Text style={styles.clubPriceText}>$9/mo</Text> 
                </View>
             </BlurView>
          </TouchableOpacity>

          {/* Stats Row - Needs to be positioned appropriately now */}
          {currentProfile?.metrics && (
             <View style={styles.statsRow}>
               {/* ... stats items ... */}
            </View>
          )}
          
          {/* Action Buttons - Needs to be positioned appropriately */}
          <View style={styles.actionButtonsRow}>
            {/* ... action buttons ... */}
          </View>
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
            
            {/* Mimic Club Screen: Action Button (e.g., Share or Settings) */}
            <TouchableOpacity style={styles.compactHeaderButton} onPress={() => alert('Profile Action')}> 
              <Ionicons name="share-outline" size={22} color="#FFFFFF" /> 
              {/* Or use "settings-outline" or another relevant icon */}
            </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      
      {/* Tab Bar (Absolute Position, Animated Transform) */}
      <Animated.View style={[
        styles.tabBarContainer, 
        {
          top: HEADER_MAX_HEIGHT, // Correct initial position: below fully expanded header
          transform: [{ translateY: tabBarTranslateY }] // Animates upwards with scroll
        }
      ]}>
         <BlurView intensity={80} tint="dark" style={styles.tabBarBlur}>
          <ProfileTabBar
            tabs={['workouts', 'programs', 'stats']}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOwnProfile={true}
          />
        </BlurView>
      </Animated.View>
      
      {/* Main Content List - REMOVE numColumns for workouts */}
      <Animated.FlatList
        ref={flatListRef}
        style={styles.listStyle}
        data={listData}
        renderItem={renderListItem}
        keyExtractor={(item, index) => `${activeTab}-${item?.id?.toString() || item?.type || index}`}
        ListHeaderComponent={
            <> 
                {/* Spacer View */} 
                <View style={{ height: HEADER_MAX_HEIGHT + TAB_BAR_HEIGHT }} /> 
                {/* Add Title for Workouts Tab */} 
                {activeTab === 'workouts' && listData.length > 0 && ( 
                   <Text style={styles.recentWorkoutsTitle}>Recent Workouts</Text> 
                )} 
            </> 
        }
        ListEmptyComponent={() => {
          if (isLoadingTab) return <ActivityIndicator style={{marginTop: 50}} size="large" color="#888" />;
          if (activeTab !== 'stats' && listData.length === 0) { 
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
           flexGrow: listData.length === 0 && activeTab !== 'stats' ? 1 : 0, 
           // No horizontal padding needed directly here if list items handle it
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* TODO: Add Edit Profile Modal later */}

    </SafeAreaView>
  );
}

// --- Basic Styles (Refine later) ---
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: '#000', // Collapsed header background
  },
  headerBackground: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  headerImage: {
    width: '100%', height: '100%',
  },
  gradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  headerContent: {
    position: 'absolute',
    bottom: 25, // Lowered position
    left: 16, // Added left padding/margin
    right: 16, // Added right padding/margin
    // alignItems: 'flex-start', // Already set implicitly by removing center
  },
  profileName: {
    fontSize: 28, // Larger name
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
    textAlign: 'left', // Explicit left alignment
  },
  profileHandle: {
    fontSize: 16, 
    color: '#AAA', 
    marginBottom: 15, // Increased space before club card
    textAlign: 'left',
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
  // Tab Bar
  tabBarContainer: {
    position: 'absolute',
    // top: HEADER_MAX_HEIGHT, // Initial position now set inline with animation
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    zIndex: 5,
  },
  tabBarBlur: {
    width: '100%', height: '100%',
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  // FlatList
  listStyle: {
    flex: 1,
    backgroundColor: '#000', // Ensure background covers behind header
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
    marginBottom: 20, // Space below club card
    borderRadius: 12, // Match reference image rounding
    overflow: 'hidden', // Needed for BlurView border radius
  },
   clubContainerBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(40, 40, 40, 0.7)', // Darker blur background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', 
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
      width: '100%', // Make button row take full width
  },
  primaryButton: {
    flex: 1, 
    marginRight: 8,
    borderRadius: 25,
    overflow: 'hidden',
    // Keep blur styles
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  // ... buttonBlur, primaryButtonText styles ...
  // ... TabBar styles ...
  // ... FlatList styles ...
  // ... Workout list styles ...
}); 