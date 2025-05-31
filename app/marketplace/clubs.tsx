/**
 * Elite Locker - Marketplace Clubs Screen
 * Spotify-style browsing for fitness clubs and communities
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ClubCard from '../../components/cards/ClubCard';
import { categoryService } from '../../services/categoryService';
import { clubService } from '../../services/clubService';

const { width: screenWidth } = Dimensions.get('window');

const filterOptions = [
  { id: 'all', title: 'All Clubs', color: '#0A84FF' },
  { id: 'strength', title: 'Strength', color: '#FF2D55' },
  { id: 'cardio', title: 'Cardio', color: '#30D158' },
  { id: 'sports', title: 'Sports', color: '#FF9F0A' },
  { id: 'wellness', title: 'Wellness', color: '#5856D6' },
  { id: 'nutrition', title: 'Nutrition', color: '#64D2FF' },
];

const membershipFilters = [
  { id: 'all', title: 'All Clubs' },
  { id: 'free', title: 'Free' },
  { id: 'premium', title: 'Premium' },
  { id: 'exclusive', title: 'Exclusive' },
];

const sortOptions = [
  { id: 'popular', title: 'Popular' },
  { id: 'newest', title: 'Newest' },
  { id: 'members', title: 'Most Members' },
  { id: 'active', title: 'Most Active' },
];

export default function MarketplaceClubsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [clubs, setClubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedMembership, setSelectedMembership] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');

  const loadClubs = async () => {
    try {
      const [clubsData, categoriesData] = await Promise.all([
        clubService.getClubs({ limit: 50 }).catch(() => []),
        categoryService.getCategories().catch(() => []),
      ]);

      const clubsArray = Array.isArray(clubsData) ? clubsData : [];
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];

      // Transform clubs for display
      const transformedClubs = clubsArray.map(club => ({
        ...club,
        type: 'club',
        imageUrl: club.profile_image_url || '',
        ownerName: club.owner_name || 'Unknown',
        memberCount: club.member_count || 0,
        price: club.price || 0,
        isPaid: club.is_paid || false,
        isActive: true,
        category: club.category || 'General',
      }));

      setClubs(transformedClubs);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadClubs();
    setRefreshing(false);
  }, []);

  const handleClubPress = useCallback((club: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${club.id}` as any);
  }, [router]);

  const handleFilterPress = useCallback((filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
  }, []);

  const handleMembershipPress = useCallback((membershipId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMembership(membershipId);
  }, []);

  const handleSortPress = useCallback((sortId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSort(sortId);
  }, []);

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const filteredClubs = clubs.filter(club => {
    let matchesFilter = true;
    let matchesMembership = true;

    if (selectedFilter !== 'all') {
      matchesFilter = club.category?.toLowerCase().includes(selectedFilter.toLowerCase()) ||
                     club.tags?.some((tag: string) => tag.toLowerCase().includes(selectedFilter.toLowerCase()));
    }

    if (selectedMembership !== 'all') {
      switch (selectedMembership) {
        case 'free':
          matchesMembership = !club.isPaid;
          break;
        case 'premium':
          matchesMembership = club.isPaid && club.price > 0;
          break;
        case 'exclusive':
          matchesMembership = club.isPaid && club.price > 50;
          break;
      }
    }

    return matchesFilter && matchesMembership;
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

  const renderMembershipChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.membershipChip,
        selectedMembership === item.id && styles.membershipChipActive
      ]}
      onPress={() => handleMembershipPress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.membershipChipText,
        selectedMembership === item.id && styles.membershipChipTextActive
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

  const renderClub = ({ item }: { item: any }) => (
    <ClubCard
      id={item.id}
      name={item.name}
      description={item.description}
      ownerName={item.ownerName}
      profileImageUrl={item.imageUrl}
      memberCount={item.memberCount}
      price={item.price}
      onPress={() => handleClubPress(item)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Extended background image that bleeds down */}
        <View style={styles.extendedBackground}>
          <ImageBackground
            source={require('../../assets/images/marketplace/clubs.jpg')}
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
            source={require('../../assets/images/marketplace/clubs.jpg')}
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
                <Text style={styles.headerTitle}>Clubs</Text>
                <Text style={styles.headerSubtitle}>Loading clubs...</Text>
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
          source={require('../../assets/images/marketplace/clubs.jpg')}
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
          source={require('../../assets/images/marketplace/clubs.jpg')}
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
              <Text style={styles.headerTitle}>Clubs</Text>
              <Text style={styles.headerSubtitle}>{filteredClubs.length} clubs available</Text>
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

          {/* Membership Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership</Text>
            <FlatList
              data={membershipFilters}
              renderItem={renderMembershipChip}
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

          {/* Clubs List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'All Clubs' : filterOptions.find(f => f.id === selectedFilter)?.title}
            </Text>
            <FlatList
              data={filteredClubs}
              renderItem={renderClub}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.clubsList}
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
  membershipChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  membershipChipActive: {
    backgroundColor: 'rgba(255, 159, 10, 0.2)',
  },
  membershipChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  membershipChipTextActive: {
    color: '#FF9F0A',
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
  clubsList: {
    paddingHorizontal: 16,
  },
});
