/**
 * Elite Locker - Marketplace Screen (Spotify-style)
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    ImageBackground,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import IMessagePageWrapper from '../../components/layout/iMessagePageWrapper';
import { clubService } from '../../services/clubService';
import { programService } from '../../services/programService';
import { workoutService } from '../../services/workoutService';

const { width: screenWidth } = Dimensions.get('window');

// Local asset imports for marketplace category images
const marketplaceImages = {
  workouts: require('../../assets/images/marketplace/workouts.jpg'),
  programs: require('../../assets/images/marketplace/programs.jpg'),
  // exercises: require('../../assets/images/marketplace/exercises.jpg'), // TODO: Add actual image
  // collections: require('../../assets/images/marketplace/collections.jpg'), // TODO: Add actual image
  'in-person': require('../../assets/images/marketplace/in-person.jpg'),
  online: require('../../assets/images/marketplace/online.jpg'),
  clubs: require('../../assets/images/marketplace/clubs.jpg'),
  profiles: require('../../assets/images/marketplace/profiles.jpg'),
  elitefit: require('../../assets/images/marketplace/elitefit.jpg'),
};

// Core content type browsing categories (like Spotify's main categories)
const browsingCategories = [
  {
    id: 'workouts',
    title: 'Workouts',
    subtitle: 'Individual training sessions',
    color: '#FF2D55', // Fallback color
    image: marketplaceImages.workouts || null, // Use image if available, null if not
    icon: 'fitness',
    route: '/marketplace/workouts',
  },
  {
    id: 'programs',
    title: 'Programs',
    subtitle: 'Structured training plans',
    color: '#30D158', // Fallback color
    image: marketplaceImages.programs || null,
    icon: 'calendar',
    route: '/marketplace/programs',
  },
  {
    id: 'exercises',
    title: 'Exercises',
    subtitle: 'Individual movements',
    color: '#0A84FF', // Fallback color
    image: null, // TODO: Add actual image
    icon: 'barbell',
    route: '/marketplace/exercises',
  },
  {
    id: 'collections',
    title: 'Collections',
    subtitle: 'Curated exercise sets',
    color: '#32D74B', // Fallback color
    image: null, // TODO: Add actual image
    icon: 'library',
    route: '/marketplace/collections',
  },
  {
    id: 'in-person',
    title: 'In-Person',
    subtitle: 'Local training sessions',
    color: '#64D2FF', // Fallback color
    image: marketplaceImages['in-person'] || null,
    icon: 'location',
    route: '/marketplace/sessions?type=in-person',
  },
  {
    id: 'online',
    title: 'Online',
    subtitle: 'Virtual training sessions',
    color: '#AF52DE', // Fallback color
    image: marketplaceImages.online || null,
    icon: 'videocam',
    route: '/marketplace/sessions?type=online',
  },
  {
    id: 'clubs',
    title: 'Clubs',
    subtitle: 'Trending communities',
    color: '#FF9F0A', // Fallback color
    image: marketplaceImages.clubs || null,
    icon: 'people',
    route: '/marketplace/clubs',
  },
  {
    id: 'profiles',
    title: 'Profiles',
    subtitle: 'Coaches and athletes',
    color: '#5856D6', // Fallback color
    image: marketplaceImages.profiles || null,
    icon: 'person',
    route: '/marketplace/profiles',
  },
  {
    id: 'elitefit',
    title: 'EliteFit',
    subtitle: 'Shop the brand',
    color: '#FFD700', // Fallback color
    image: marketplaceImages.elitefit || null,
    icon: 'star',
    route: '/marketplace/elitefit',
  },
];

const mockRecentSearches = [
  { id: '1', query: 'Push workout', type: 'workout', icon: 'fitness' },
  { id: '2', query: 'Beginner program', type: 'program', icon: 'calendar' },
  { id: '3', query: 'Elite club', type: 'club', icon: 'people' },
  { id: '4', query: 'Strength training', type: 'workout', icon: 'barbell' },
  { id: '5', query: 'HIIT cardio', type: 'workout', icon: 'flash' },
];

export default function MarketplaceScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentSearches] = useState(mockRecentSearches);
  const [featuredContent, setFeaturedContent] = useState<any[]>([]);

  const loadMarketplaceData = async () => {
    try {
      const [workouts, programs, clubs] = await Promise.all([
        workoutService.getWorkoutHistory({ limit: 20 }).catch(() => []),
        programService.getPrograms().catch(() => []),
        clubService.getClubs({ limit: 20 }).catch(() => []),
      ]);

      const workoutsArray = Array.isArray(workouts) ? workouts : [];
      const programsArray = Array.isArray(programs) ? programs : [];
      const clubsArray = Array.isArray(clubs) ? clubs : [];

      setFeaturedContent([
        ...workoutsArray.slice(0, 6),
        ...programsArray.slice(0, 6),
        ...clubsArray.slice(0, 6),
      ]);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    }
  };

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/marketplace/search?q=${encodeURIComponent(searchQuery)}` as any);
    }
  }, [searchQuery, router]);

  const handleBrowsingCategoryPress = useCallback((category: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(category.route as any);
  }, [router]);

  const handleLibraryPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/marketplace/library' as any);
  }, [router]);

  const handleRecentSearchPress = useCallback((search: string) => {
    setSearchQuery(search);
    handleSearchSubmit();
  }, [handleSearchSubmit]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadMarketplaceData();
    } catch (error) {
      console.error('Error refreshing marketplace:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderBrowsingCategory = ({ item }: { item: any }) => {
    const categoryImage = marketplaceImages[item.id as keyof typeof marketplaceImages];

    return (
      <TouchableOpacity
        style={styles.browsingCard}
        onPress={() => handleBrowsingCategoryPress(item)}
        activeOpacity={0.8}
      >
        {categoryImage ? (
          <ImageBackground
            source={categoryImage}
            style={styles.browsingCardImage}
            imageStyle={{ borderRadius: 8 }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.browsingCardGradient}
            >
              <View style={styles.browsingCardContent}>
                <Text style={styles.browsingCardTitle}>{item.title}</Text>
                <Text style={styles.browsingCardSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.browsingCardIcon}>
                <Ionicons name={item.icon as any} size={32} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </ImageBackground>
        ) : (
          // Fallback to color design if image not available
          <View style={[styles.browsingCardImage, { backgroundColor: item.color }]}>
            <LinearGradient
              colors={[item.color, `${item.color}CC`]}
              style={styles.browsingCardGradient}
            >
              <View style={styles.browsingCardContent}>
                <Text style={styles.browsingCardTitle}>{item.title}</Text>
                <Text style={styles.browsingCardSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={styles.browsingCardIcon}>
                <Ionicons name={item.icon as any} size={32} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRecentSearch = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.recentSearchItem}
      onPress={() => handleRecentSearchPress(item.query)}
      activeOpacity={0.7}
    >
      <View style={styles.recentSearchIcon}>
        <Ionicons name={item.icon as any} size={20} color="#999" />
      </View>
      <Text style={styles.recentSearchText}>{item.query}</Text>
      <Text style={styles.recentSearchType}>{item.type}</Text>
    </TouchableOpacity>
  );

  return (
    <IMessagePageWrapper
      title="Search"
      subtitle="Find workouts, programs, and clubs"
    >
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="What do you want to find?"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </View>
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
          {isSearchFocused && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent searches</Text>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {!isSearchFocused && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Start browsing</Text>
                <FlatList
                  data={browsingCategories}
                  renderItem={renderBrowsingCategory}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.browsingGrid}
                />
              </View>

              {/* Discover something new */}
              {featuredContent.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Discover something new</Text>
                  <View style={styles.discoverGrid}>
                    {featuredContent.slice(0, 6).map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.discoverCard}
                        onPress={() => {}}
                      >
                        <View style={styles.discoverCardImage}>
                          <Text style={styles.discoverCardTitle}>
                            {item.title || item.name || 'Content'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Your Library */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Library</Text>
                <TouchableOpacity
                  style={[styles.libraryCard, { backgroundColor: '#1DB954' }]}
                  onPress={handleLibraryPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.libraryCardContent}>
                    <View style={styles.libraryCardIcon}>
                      <Ionicons name="library" size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.libraryCardText}>
                      <Text style={styles.libraryCardTitle}>Your Library</Text>
                      <Text style={styles.libraryCardSubtitle}>Your saved workouts, programs, and clubs</Text>
                    </View>
                    <View style={styles.libraryCardArrow}>
                      <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.7)" />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
      </ScrollView>
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 0,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  browsingGrid: {
    paddingHorizontal: 0,
  },
  browsingCard: {
    flex: 1,
    height: 100,
    borderRadius: 8,
    margin: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  browsingCardImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  browsingCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  browsingCardGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  browsingCardContent: {
    flex: 1,
  },
  browsingCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  browsingCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  browsingCardIcon: {
    marginLeft: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  recentSearchIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  recentSearchType: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  discoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 0,
  },
  discoverCard: {
    width: (screenWidth - 48) / 2,
    height: 120,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  discoverCardImage: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  discoverCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  browseAllGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 0,
  },
  browseAllCard: {
    width: (screenWidth - 48) / 2,
    height: 80,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  browseAllCardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  libraryCard: {
    marginHorizontal: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  libraryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  libraryCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  libraryCardText: {
    flex: 1,
  },
  libraryCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  libraryCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  libraryCardArrow: {
    marginLeft: 8,
  },
});