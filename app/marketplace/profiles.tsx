/**
 * Elite Locker - Marketplace Profiles Screen
 * Spotify-style browsing for trainers and athletes
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categoryService } from '../../services/categoryService';

const { width: screenWidth } = Dimensions.get('window');

const filterOptions = [
  { id: 'all', title: 'All Profiles', color: '#0A84FF' },
  { id: 'trainers', title: 'Trainers', color: '#FF2D55' },
  { id: 'athletes', title: 'Athletes', color: '#30D158' },
  { id: 'coaches', title: 'Coaches', color: '#FF9F0A' },
  { id: 'influencers', title: 'Influencers', color: '#5856D6' },
  { id: 'verified', title: 'Verified', color: '#64D2FF' },
];

const specialtyFilters = [
  { id: 'all', title: 'All Specialties' },
  { id: 'strength', title: 'Strength' },
  { id: 'cardio', title: 'Cardio' },
  { id: 'sports', title: 'Sports' },
  { id: 'nutrition', title: 'Nutrition' },
  { id: 'wellness', title: 'Wellness' },
];

const sortOptions = [
  { id: 'popular', title: 'Popular' },
  { id: 'newest', title: 'Newest' },
  { id: 'followers', title: 'Most Followers' },
  { id: 'rating', title: 'Top Rated' },
];

export default function MarketplaceProfilesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');

  const loadProfiles = async () => {
    try {
      // Since profileService doesn't have getProfiles, we'll use mock data for now
      // In a real implementation, you'd need to add a getProfiles method to profileService
      const categoriesData = await categoryService.getCategories().catch(() => []);
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];

      // Mock profiles data for demonstration
      const mockProfilesData = [
        {
          id: '1',
          username: 'devon_allen',
          full_name: 'Devon Allen',
          bio: 'Olympic hurdler and fitness coach',
          avatar_url: '',
          followers_count: 15000,
          is_verified: true,
          is_premium: true,
          specialty: 'Track & Field',
          rating: 4.9,
        },
        {
          id: '2',
          username: 'fitness_coach_sarah',
          full_name: 'Sarah Johnson',
          bio: 'Certified personal trainer specializing in strength training',
          avatar_url: '',
          followers_count: 8500,
          is_verified: false,
          is_premium: true,
          specialty: 'Strength Training',
          rating: 4.7,
        },
        {
          id: '3',
          username: 'yoga_master_mike',
          full_name: 'Mike Chen',
          bio: 'Yoga instructor and mindfulness coach',
          avatar_url: '',
          followers_count: 12000,
          is_verified: true,
          is_premium: false,
          specialty: 'Yoga',
          rating: 4.8,
        },
      ];

      // Transform profiles for display
      const transformedProfiles = mockProfilesData.map(profile => ({
        ...profile,
        type: 'profile',
        imageUrl: profile.avatar_url || '',
        name: profile.full_name || profile.username || 'Unknown',
        handle: profile.username || '',
        bio: profile.bio || '',
        followersCount: profile.followers_count || 0,
        isVerified: profile.is_verified || false,
        isPremium: profile.is_premium || false,
        specialty: profile.specialty || 'General',
        rating: profile.rating || 4.5,
      }));

      setProfiles(transformedProfiles);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfiles();
    setRefreshing(false);
  }, []);

  const handleProfilePress = useCallback((profile: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${profile.id}` as any);
  }, [router]);

  const handleFilterPress = useCallback((filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
  }, []);

  const handleSpecialtyPress = useCallback((specialtyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSpecialty(specialtyId);
  }, []);

  const handleSortPress = useCallback((sortId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSort(sortId);
  }, []);

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const filteredProfiles = profiles.filter(profile => {
    let matchesFilter = true;
    let matchesSpecialty = true;

    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'verified':
          matchesFilter = profile.isVerified;
          break;
        case 'trainers':
        case 'athletes':
        case 'coaches':
        case 'influencers':
          matchesFilter = profile.role?.toLowerCase() === selectedFilter.slice(0, -1) ||
                         profile.specialty?.toLowerCase().includes(selectedFilter.slice(0, -1));
          break;
      }
    }

    if (selectedSpecialty !== 'all') {
      matchesSpecialty = profile.specialty?.toLowerCase().includes(selectedSpecialty.toLowerCase()) ||
                        profile.tags?.some((tag: string) => tag.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    }

    return matchesFilter && matchesSpecialty;
  });

  const renderFilterChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedFilter === item.id && { backgroundColor: item.color }
      ]}
      onPress={() => handleFilterPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.filterChipText,
        selectedFilter === item.id && styles.filterChipTextActive
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderSpecialtyChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.specialtyChip,
        selectedSpecialty === item.id && styles.specialtyChipActive
      ]}
      onPress={() => handleSpecialtyPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.specialtyChipText,
        selectedSpecialty === item.id && styles.specialtyChipTextActive
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderSortOption = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        selectedSort === item.id && styles.sortOptionActive
      ]}
      onPress={() => handleSortPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.sortOptionText,
        selectedSort === item.id && styles.sortOptionTextActive
      ]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderProfile = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => handleProfilePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.profileImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>
              {(item.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.profileHandle} numberOfLines={1}>@{item.handle}</Text>
        {item.bio && (
          <Text style={styles.profileBio} numberOfLines={2}>{item.bio}</Text>
        )}

        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={14} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.statText}>{item.followersCount}</Text>
          </View>
          {item.rating && (
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>{item.rating}</Text>
            </View>
          )}
          {item.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Extended background image that bleeds down */}
        <View style={styles.extendedBackground}>
          <ImageBackground
            source={require('../../assets/images/marketplace/profiles.jpg')}
            style={styles.extendedBackgroundImage}
            imageStyle={{ resizeMode: 'cover' }}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
            locations={[0, 0.2, 0.4, 0.7, 1]}
            style={styles.extendedGradient}
          />
        </View>

        {/* Spotify-style Header with Background Image */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/marketplace/profiles.jpg')}
            style={styles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
              style={styles.headerGradient}
            >
              <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profiles</Text>
                <Text style={styles.headerSubtitle}>Loading profiles...</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Extended background image that bleeds down */}
      <View style={styles.extendedBackground}>
        <ImageBackground
          source={require('../../assets/images/marketplace/profiles.jpg')}
          style={styles.extendedBackgroundImage}
          imageStyle={{ resizeMode: 'cover' }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)']}
          locations={[0, 0.2, 0.4, 0.7, 1]}
          style={styles.extendedGradient}
        />
      </View>

      {/* Spotify-style Header with Background Image */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../../assets/images/marketplace/profiles.jpg')}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']}
            style={styles.headerGradient}
          >
            <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profiles</Text>
              <Text style={styles.headerSubtitle}>{filteredProfiles.length} profiles available</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
          {/* Filter Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={filterOptions}
              renderItem={renderFilterChip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>

          {/* Specialty Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <FlatList
              data={specialtyFilters}
              renderItem={renderSpecialtyChip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort by</Text>
            <FlatList
              data={sortOptions}
              renderItem={renderSortOption}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortList}
            />
          </View>

          {/* Profiles Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'All Profiles' : filterOptions.find(f => f.id === selectedFilter)?.title}
            </Text>
            <FlatList
              data={filteredProfiles}
              renderItem={renderProfile}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.profilesGrid}
              columnWrapperStyle={styles.profilesRow}
            />
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  extendedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 800,
  },
  extendedBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.7,
  },
  extendedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 2,
  },
  headerBackground: {
    height: 200,
    width: '100%',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  specialtyChipActive: {
    backgroundColor: 'rgba(88, 86, 214, 0.2)',
  },
  specialtyChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  specialtyChipTextActive: {
    color: '#5856D6',
  },
  sortList: {
    paddingHorizontal: 16,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sortOptionTextActive: {
    color: '#0A84FF',
  },
  profilesGrid: {
    paddingHorizontal: 16,
  },
  profilesRow: {
    justifyContent: 'space-between',
  },
  profileCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    textAlign: 'center',
  },
  profileHandle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    textAlign: 'center',
  },
  profileBio: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
});
