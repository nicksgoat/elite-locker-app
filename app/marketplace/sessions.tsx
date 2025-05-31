/**
 * Elite Locker - Marketplace Sessions Screen
 * Spotify-style browsing for in-person and online sessions
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { SessionCard } from '../../components/design-system/cards/SessionCard';
import { Category, categoryService } from '../../services/categoryService';
import { sessionService } from '../../services/sessionService';

const { width: screenWidth } = Dimensions.get('window');

// Interface for filter options (includes database categories + "All" option)
interface FilterOption {
  id: string;
  title: string;
  color: string;
  slug?: string;
}

const sortOptions = [
  { id: 'date', title: 'Date' },
  { id: 'popular', title: 'Popular' },
  { id: 'price', title: 'Price' },
  { id: 'location', title: 'Location' },
];

const typeOptions = [
  { id: 'all', title: 'All Sessions', color: '#0A84FF' },
  { id: 'online', title: 'Online', color: '#30D158' },
  { id: 'in-person', title: 'In-Person', color: '#FF9F0A' },
];

export default function MarketplaceSessionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams();

  const [sessions, setSessions] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedType, setSelectedType] = useState(type as string || 'all');
  const [selectedSort, setSelectedSort] = useState('date');

  const loadSessions = async (categoryId?: string, typeFilter?: string) => {
    try {
      // Load categories first
      const categoriesData = await categoryService.getCategories().catch(() => []);
      const categoriesArray = Array.isArray(categoriesData) ? categoriesData : [];

      // Build filter options from database categories
      const dynamicFilterOptions: FilterOption[] = [
        { id: 'all', title: 'All Categories', color: '#0A84FF' },
        ...categoriesArray.map(category => ({
          id: category.id,
          title: category.name,
          color: category.color_hex,
          slug: category.slug,
        }))
      ];

      // Load sessions based on selected filters
      let sessionsData: any[] = [];
      const isOnlineFilter = typeFilter === 'online' ? true : typeFilter === 'in-person' ? false : undefined;

      if (categoryId && categoryId !== 'all') {
        // Load sessions for specific category (when category service supports it)
        sessionsData = await sessionService.getMarketplaceSessions({ limit: 50 }).catch(() => []);
        // Filter by category on client side for now
        sessionsData = sessionsData.filter(session => session.category_id === categoryId);
      } else {
        // Load all marketplace sessions
        sessionsData = await sessionService.getMarketplaceSessions({ limit: 50 }).catch(() => []);
      }

      // Apply type filter
      if (isOnlineFilter !== undefined) {
        sessionsData = sessionsData.filter(session => session.isOnline === isOnlineFilter);
      }

      const sessionsArray = Array.isArray(sessionsData) ? sessionsData : [];

      // Transform sessions for display
      const transformedSessions = sessionsArray.map(session => ({
        ...session,
        type: 'session',
        imageUrl: session.image_url || session.thumbnail_url || '',
        dateTime: session.dateTime || session.date_time || new Date().toISOString(),
        location: session.location || (session.isOnline ? 'Online' : 'TBD'),
        host: session.host || { id: session.host_id, name: session.host_name || 'Unknown Host' },
        attendeeCount: session.attendeeCount || session.attendee_count || 0,
        maxAttendees: session.maxAttendees || session.max_attendees,
        isAttending: session.isAttending || false,
        isPaid: session.isPaid || session.is_paid || false,
        price: session.price || 0,
      }));

      setSessions(transformedSessions);
      setCategories(categoriesArray);
      setFilterOptions(dynamicFilterOptions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions('all', selectedType);
  }, [selectedType]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions(selectedFilter, selectedType);
    setRefreshing(false);
  }, [selectedFilter, selectedType]);

  const handleSessionPress = useCallback((session: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/session/detail/${session.id}` as any);
  }, [router]);

  const handleFilterPress = useCallback(async (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
    setIsLoading(true);
    await loadSessions(filterId, selectedType);
  }, [selectedType]);

  const handleTypePress = useCallback(async (typeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(typeId);
    setIsLoading(true);
    await loadSessions(selectedFilter, typeId);
  }, [selectedFilter]);

  const handleSortPress = useCallback((sortId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSort(sortId);
  }, []);

  const handleBackPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  // Since we're loading sessions by category, we don't need client-side filtering
  const filteredSessions = sessions;

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

  const renderTypeChip = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedType === item.id && { backgroundColor: item.color }
      ]}
      onPress={() => handleTypePress(item.id)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.filterChipText,
        selectedType === item.id && styles.filterChipTextActive
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

  const renderSession = ({ item }: { item: any }) => (
    <SessionCard
      session={item}
      onPress={() => handleSessionPress(item)}
      onJoin={() => handleSessionPress(item)}
    />
  );

  // Get the page title based on the type
  const getPageTitle = () => {
    if (selectedType === 'online') return 'Online Sessions';
    if (selectedType === 'in-person') return 'In-Person Sessions';
    return 'Sessions';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Extended background image that bleeds down */}
        <View style={styles.extendedBackground}>
          <ImageBackground
            source={require('../../assets/images/marketplace/in-person.jpg')}
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
            source={require('../../assets/images/marketplace/in-person.jpg')}
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
                <Text style={styles.headerTitle}>{getPageTitle()}</Text>
                <Text style={styles.headerSubtitle}>Loading sessions...</Text>
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
          source={require('../../assets/images/marketplace/in-person.jpg')}
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
          source={require('../../assets/images/marketplace/in-person.jpg')}
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
              <Text style={styles.headerTitle}>{getPageTitle()}</Text>
              <Text style={styles.headerSubtitle}>{filteredSessions.length} sessions available</Text>
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

          {/* Session Type Filter */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session Type</Text>
            <FlatList
              data={typeOptions}
              renderItem={renderTypeChip}
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

          {/* Sessions List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {filterOptions.find(f => f.id === selectedFilter)?.title || 'All Sessions'}
            </Text>
            <FlatList
              data={filteredSessions}
              renderItem={renderSession}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.sessionsList}
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterChipTextActive: {
    color: '#000000',
  },
  sortList: {
    paddingHorizontal: 16,
  },
  sortOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: '#0A84FF',
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  sessionsList: {
    paddingHorizontal: 16,
  },
});
