import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import IMessagePageWrapper from '../../components/layout/iMessagePageWrapper';
import ErrorBoundary from '../../components/ui/ErrorBoundary';
import { clubService } from '../../services/clubService';
import { profileService } from '../../services/profileService';
import { programService } from '../../services/programService';
import { workoutService } from '../../services/workoutService';
import { formatRelativeTime } from '../../utils/dateUtils';
import { useWorkoutPurchase } from '../../contexts/WorkoutPurchaseContext';

// Define marketplace item type
type MarketplaceItem = {
  id: string;
  type: 'workout' | 'program' | 'club';
  title: string;
  description?: string;
  price?: number;
  authorId: string;
  createdAt: Date;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  imageUrl?: string;
  memberCount?: number;
};

// Fetch marketplace items from Supabase
const fetchMarketplaceItems = async (): Promise<MarketplaceItem[]> => {
  try {
    // Fetch workouts
    const workouts = await workoutService.getWorkoutHistory({ limit: 50 });
    const workoutItems = workouts
      .filter(workout => workout.isPaid)
      .map(workout => ({
        id: workout.id,
        type: 'workout' as const,
        title: workout.title,
        authorId: workout.author_id || 'user1',
        createdAt: new Date(workout.date || workout.created_at),
        price: workout.price,
        duration: workout.duration,
        imageUrl: workout.thumbnail_url || 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
      }));

    // Fetch programs
    const programs = await programService.getPrograms();
    const programItems = programs.map(program => ({
      id: program.id,
      type: 'program' as const,
      title: program.title,
      description: program.description,
      authorId: program.author_id,
      createdAt: new Date(program.created_at),
      price: program.price,
      level: program.level as any,
      duration: program.duration,
      imageUrl: program.thumbnail_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
    }));

    // Fetch clubs
    const clubs = await clubService.getClubs({});
    const clubItems = clubs
      .filter(club => club.is_paid)
      .map(club => ({
        id: club.id,
        type: 'club' as const,
        title: club.name,
        description: club.description,
        authorId: club.owner_id,
        createdAt: new Date(club.created_at),
        price: club.price,
        memberCount: club.member_count,
        imageUrl: club.profile_image_url || club.banner_image_url,
      }));

    return [...workoutItems, ...programItems, ...clubItems];
  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    return [];
  }
};

// Try to import design system tokens but use safe fallbacks if not available
let designTokens = {
  colors: {
    dark: {
      text: {
        primary: '#FFFFFF',
        secondary: '#9BA1A6',
        inverse: '#000000',
      },
      background: {
        primary: '#000000',
        secondary: '#1C1C1E',
        input: '#1C1C1E',
        card: 'rgba(28, 28, 30, 0.6)',
        subtle: 'rgba(40, 40, 40, 0.6)',
      },
      border: {
        primary: 'rgba(255, 255, 255, 0.1)',
      },
      brand: {
        primary: '#0A84FF',
      },
    },
  },
  typography: {
    textVariants: {
      h1: { fontSize: 28, fontWeight: '700' as const },
      body: { fontSize: 16 },
      bodySmall: { fontSize: 14 },
      bodySmallSemiBold: { fontSize: 14, fontWeight: '600' as const },
      bodySemiBold: { fontSize: 16, fontWeight: '600' as const },
      button: { fontSize: 16, fontWeight: '600' as const },
    },
  },
  spacing: {
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    layout: {
      borderRadius: {
        sm: 4,
        md: 8,
        lg: 16,
        xl: 24,
      },
      borderWidth: {
        thin: 1,
        medium: 2,
        thick: 4,
      },
    },
  },
};

try {
  // Try to import design tokens, but don't fail if they're not available
  const tokens = require('../../components/design-system/tokens');
  if (tokens && tokens.colors && tokens.typography && tokens.spacing) {
    designTokens = tokens;
  }
} catch (error) {
  console.log('Using fallback design tokens');
}

// Create styles with proper TypeScript types
const styles = StyleSheet.create({
  mainTitleContainer: {
    paddingHorizontal: designTokens.spacing.spacing.lg,
    paddingTop: designTokens.spacing.spacing.md,
    paddingBottom: designTokens.spacing.spacing.sm,
  },
  mainTitle: {
    ...designTokens.typography.textVariants.h1,
    color: designTokens.colors.dark.text.primary,
  },
  mainSubtitle: {
    ...designTokens.typography.textVariants.body,
    color: designTokens.colors.dark.text.secondary,
    marginTop: designTokens.spacing.spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: designTokens.spacing.spacing.lg,
    marginBottom: designTokens.spacing.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: designTokens.colors.dark.background.input,
    borderRadius: designTokens.spacing.layout.borderRadius.md,
    paddingHorizontal: designTokens.spacing.spacing.md,
    borderWidth: designTokens.spacing.layout.borderWidth.thin,
    borderColor: designTokens.colors.dark.border.primary,
  },
  searchIcon: {
    marginRight: designTokens.spacing.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: designTokens.spacing.spacing.md,
    color: designTokens.colors.dark.text.primary,
    ...designTokens.typography.textVariants.body,
  },
  filtersContainer: {
    paddingHorizontal: designTokens.spacing.spacing.lg,
    paddingVertical: designTokens.spacing.spacing.sm,
    flexDirection: 'row' as const,
  },
  filterChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: designTokens.colors.dark.background.card,
    borderRadius: designTokens.spacing.layout.borderRadius.xl,
    paddingVertical: designTokens.spacing.spacing.xs,
    paddingHorizontal: designTokens.spacing.spacing.md,
    marginRight: designTokens.spacing.spacing.sm,
    borderWidth: designTokens.spacing.layout.borderWidth.thin,
    borderColor: designTokens.colors.dark.border.primary,
  },
  filterChipSelected: {
    backgroundColor: designTokens.colors.dark.brand.primary,
  },
  filterChipText: {
    ...designTokens.typography.textVariants.bodySmall,
    color: designTokens.colors.dark.text.secondary,
    marginLeft: designTokens.spacing.spacing.xs,
  },
  filterChipTextSelected: {
    color: designTokens.colors.dark.text.inverse,
  },
  resultsHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: designTokens.spacing.spacing.lg,
    marginVertical: designTokens.spacing.spacing.md,
  },
  resultsCount: {
    ...designTokens.typography.textVariants.bodySmall,
    color: designTokens.colors.dark.text.secondary,
  },
  listContainer: {
    paddingHorizontal: designTokens.spacing.spacing.lg,
    paddingBottom: designTokens.spacing.spacing.xxl,
  },
  itemCard: {
    backgroundColor: designTokens.colors.dark.background.card,
    borderRadius: designTokens.spacing.layout.borderRadius.md,
    marginBottom: designTokens.spacing.spacing.md,
    overflow: 'hidden' as const,
    borderWidth: designTokens.spacing.layout.borderWidth.thin,
    borderColor: designTokens.colors.dark.border.primary,
  },
  itemCardContent: {
    flexDirection: 'row' as const,
  },
  itemImage: {
    width: 100,
    height: 100,
    backgroundColor: designTokens.colors.dark.background.subtle,
  },
  itemDetails: {
    flex: 1,
    padding: designTokens.spacing.spacing.md,
  },
  itemTypeContainer: {
    flexDirection: 'row' as const,
    marginBottom: designTokens.spacing.spacing.xs,
  },
  itemType: {
    ...designTokens.typography.textVariants.bodySmall,
    color: designTokens.colors.dark.text.secondary,
    backgroundColor: designTokens.colors.dark.background.subtle,
    paddingHorizontal: designTokens.spacing.spacing.sm,
    paddingVertical: designTokens.spacing.spacing.xs / 2,
    borderRadius: designTokens.spacing.layout.borderRadius.sm,
    marginRight: designTokens.spacing.spacing.xs,
  },
  itemLevel: {
    backgroundColor: designTokens.colors.dark.brand.primary + '30',
    color: designTokens.colors.dark.brand.primary,
  },
  itemTitle: {
    ...designTokens.typography.textVariants.bodySemiBold,
    color: designTokens.colors.dark.text.primary,
    marginBottom: designTokens.spacing.spacing.xs,
  },
  itemDescription: {
    ...designTokens.typography.textVariants.bodySmall,
    color: designTokens.colors.dark.text.secondary,
    marginBottom: designTokens.spacing.spacing.xs,
  },
  itemMetadata: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: designTokens.spacing.spacing.xs,
  },
  authorContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  authorImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: designTokens.spacing.spacing.xs,
  },
  authorName: {
    ...designTokens.typography.textVariants.bodySmall,
    color: designTokens.colors.dark.text.secondary,
  },
  itemDate: {
    ...designTokens.typography.textVariants.bodySmall,
    color: designTokens.colors.dark.text.secondary,
  },
  itemFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: designTokens.spacing.spacing.xs,
  },
  itemStat: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  itemStatText: {
    ...designTokens.typography.textVariants.bodySmall,
    color: designTokens.colors.dark.text.secondary,
    marginLeft: designTokens.spacing.spacing.xs,
  },
  purchaseButton: {
    backgroundColor: designTokens.colors.dark.brand.primary,
    paddingVertical: designTokens.spacing.spacing.xs,
    paddingHorizontal: designTokens.spacing.spacing.md,
    borderRadius: designTokens.spacing.layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  purchasedButton: {
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  purchaseButtonText: {
    ...designTokens.typography.textVariants.bodySmallSemiBold,
    color: designTokens.colors.dark.text.inverse,
  },
  purchasedButtonText: {
    color: '#30D158',
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: designTokens.spacing.spacing.xl,
  },
  emptyStateText: {
    ...designTokens.typography.textVariants.body,
    color: designTokens.colors.dark.text.secondary,
    marginTop: designTokens.spacing.spacing.md,
    marginBottom: designTokens.spacing.spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: designTokens.colors.dark.brand.primary,
    borderRadius: designTokens.spacing.layout.borderRadius.md,
    paddingVertical: designTokens.spacing.spacing.sm,
    paddingHorizontal: designTokens.spacing.spacing.lg,
  },
  emptyStateButtonText: {
    ...designTokens.typography.textVariants.button,
    color: designTokens.colors.dark.text.inverse,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: designTokens.spacing.spacing.xl,
  },
  loadingText: {
    ...designTokens.typography.textVariants.body,
    color: designTokens.colors.dark.text.secondary,
    marginTop: designTokens.spacing.spacing.md,
  },
});

export default function MarketplaceScreen() {
  return (
    <ErrorBoundary>
      <MarketplaceContent />
    </ErrorBoundary>
  );
}

function MarketplaceContent() {
  const router = useRouter();
  const { purchaseContent, isPurchased, hasAccess } = useWorkoutPurchase();
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<{
    types: ('workout' | 'program' | 'club')[];
    priceRange: [number, number] | null;
    levels: ('beginner' | 'intermediate' | 'advanced')[];
  }>({
    types: ['workout', 'program', 'club'],
    priceRange: null,
    levels: ['beginner', 'intermediate', 'advanced'],
  });

  // Initialize data
  useEffect(() => {
    const loadMarketplaceItems = async () => {
      setIsLoading(true);
      try {
        const items = await fetchMarketplaceItems();
        setMarketplaceItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Error loading marketplace items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketplaceItems();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = marketplaceItems;

    // Filter by type
    if (selectedFilters.types.length > 0) {
      filtered = filtered.filter(item => selectedFilters.types.includes(item.type));
    }

    // Filter by price range
    if (selectedFilters.priceRange) {
      const [min, max] = selectedFilters.priceRange;
      filtered = filtered.filter(
        item => item.price !== undefined && item.price >= min && item.price <= max
      );
    }

    // Filter by level (for programs)
    if (selectedFilters.levels.length > 0) {
      filtered = filtered.filter(
        item => item.level === undefined || selectedFilters.levels.includes(item.level)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedFilters, marketplaceItems]);

  const toggleTypeFilter = (type: 'workout' | 'program' | 'club') => {
    setSelectedFilters(prev => {
      const types = [...prev.types];
      const index = types.indexOf(type);

      if (index >= 0) {
        types.splice(index, 1);
      } else {
        types.push(type);
      }

      return { ...prev, types };
    });
  };

  const toggleLevelFilter = (level: 'beginner' | 'intermediate' | 'advanced') => {
    setSelectedFilters(prev => {
      const levels = [...prev.levels];
      const index = levels.indexOf(level);

      if (index >= 0) {
        levels.splice(index, 1);
      } else {
        levels.push(level);
      }

      return { ...prev, levels };
    });
  };

  const setPriceRange = (range: [number, number] | null) => {
    setSelectedFilters(prev => ({ ...prev, priceRange: range }));
  };

  const handleItemPress = (item: MarketplaceItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (item.type) {
      case 'workout':
        router.push(`/workout/detail/${item.id}` as any);
        break;
      case 'program':
        router.push(`/programs/detail/${item.id}` as any);
        break;
      case 'club':
        router.push(`/club/${item.id}` as any);
        break;
    }
  };

  const handlePurchase = async (item: MarketplaceItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Check if already purchased
    if (isPurchased(item.id, item.type)) {
      Alert.alert('Already Purchased', 'You already own this content. Check your library.');
      return;
    }

    // Show purchase confirmation
    Alert.alert(
      'Purchase Confirmation',
      `Would you like to purchase ${item.title} for $${item.price?.toFixed(2)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              const result = await purchaseContent(
                item.id,
                item.type,
                item.price || 0,
                'stripe' // Default payment method
              );

              if (result.success) {
                Alert.alert(
                  'Purchase Successful!',
                  'Content has been added to your library. You now have full access.',
                  [
                    {
                      text: 'View in Library',
                      onPress: () => router.push('/library')
                    },
                    {
                      text: 'Continue Shopping',
                      style: 'cancel'
                    }
                  ]
                );
              } else {
                Alert.alert('Purchase Failed', result.error || 'Something went wrong. Please try again.');
              }
            } catch (error) {
              console.error('Purchase error:', error);
              Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
            }
          },
        },
      ]
    );
  };

  // State for author profiles
  const [authorProfiles, setAuthorProfiles] = useState<Record<string, any>>({});

  // Fetch author profiles
  useEffect(() => {
    const fetchAuthorProfiles = async () => {
      const uniqueAuthorIds = [...new Set(marketplaceItems.map(item => item.authorId))];
      const profiles: Record<string, any> = {};

      for (const authorId of uniqueAuthorIds) {
        try {
          const profile = await profileService.getProfile(authorId);
          profiles[authorId] = profile;
        } catch (error) {
          console.error(`Error fetching profile for author ${authorId}:`, error);
        }
      }

      setAuthorProfiles(profiles);
    };

    if (marketplaceItems.length > 0) {
      fetchAuthorProfiles();
    }
  }, [marketplaceItems]);

  const renderItem = ({ item }: { item: MarketplaceItem }) => {
    const author = authorProfiles[item.authorId];

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={styles.itemCard as any}
      >
        <TouchableOpacity
          style={styles.itemCardContent}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />

          <View style={styles.itemDetails}>
            <View style={styles.itemTypeContainer}>
              <Text style={styles.itemType}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
              {item.level && (
                <Text style={[styles.itemType, styles.itemLevel]}>
                  {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                </Text>
              )}
            </View>

            <Text style={styles.itemTitle}>{item.title}</Text>

            {item.description && (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View style={styles.itemMetadata}>
              <View style={styles.authorContainer}>
                {author?.avatar_url && (
                  <Image
                    source={{ uri: author.avatar_url }}
                    style={styles.authorImage}
                  />
                )}
                <Text style={styles.authorName}>{author?.full_name || author?.username || 'Unknown'}</Text>
              </View>

              <Text style={styles.itemDate}>
                {formatRelativeTime(item.createdAt)}
              </Text>
            </View>

            <View style={styles.itemFooter}>
              {item.type === 'program' && item.duration && (
                <View style={styles.itemStat}>
                  <Ionicons name="calendar-outline" size={14} color="#999" />
                  <Text style={styles.itemStatText}>{item.duration} weeks</Text>
                </View>
              )}

              {item.type === 'club' && item.memberCount && (
                <View style={styles.itemStat}>
                  <Ionicons name="people-outline" size={14} color="#999" />
                  <Text style={styles.itemStatText}>{item.memberCount} members</Text>
                </View>
              )}

              {item.price && (
                <TouchableOpacity
                  style={[
                    styles.purchaseButton,
                    isPurchased(item.id, item.type) && styles.purchasedButton
                  ]}
                  onPress={() => handlePurchase(item)}
                  disabled={isPurchased(item.id, item.type)}
                >
                  {isPurchased(item.id, item.type) ? (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color="#30D158" />
                      <Text style={[styles.purchaseButtonText, styles.purchasedButtonText]}>
                        Owned
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.purchaseButtonText}>
                      ${item.price.toFixed(2)}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  try {
    return (
      <IMessagePageWrapper
        title="Marketplace"
        subtitle="Discover premium content"
        showHeader={false}
      >
        <View style={styles.mainTitleContainer}>
          <Text style={styles.mainTitle}>Marketplace</Text>
          <Text style={styles.mainSubtitle}>Discover premium content</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workouts, programs, clubs..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {/* Type filters */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilters.types.includes('workout') && styles.filterChipSelected,
            ]}
            onPress={() => toggleTypeFilter('workout')}
          >
            <Ionicons
              name="barbell-outline"
              size={16}
              color={selectedFilters.types.includes('workout') ? '#fff' : '#999'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilters.types.includes('workout') && styles.filterChipTextSelected,
              ]}
            >
              Workouts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilters.types.includes('program') && styles.filterChipSelected,
            ]}
            onPress={() => toggleTypeFilter('program')}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={selectedFilters.types.includes('program') ? '#fff' : '#999'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilters.types.includes('program') && styles.filterChipTextSelected,
              ]}
            >
              Programs
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilters.types.includes('club') && styles.filterChipSelected,
            ]}
            onPress={() => toggleTypeFilter('club')}
          >
            <Ionicons
              name="people-outline"
              size={16}
              color={selectedFilters.types.includes('club') ? '#fff' : '#999'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilters.types.includes('club') && styles.filterChipTextSelected,
              ]}
            >
              Clubs
            </Text>
          </TouchableOpacity>

          {/* Price range filters */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilters.priceRange === null && styles.filterChipSelected,
            ]}
            onPress={() => setPriceRange(null)}
          >
            <Ionicons
              name="pricetag-outline"
              size={16}
              color={selectedFilters.priceRange === null ? '#fff' : '#999'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedFilters.priceRange === null && styles.filterChipTextSelected,
              ]}
            >
              Any Price
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilters.priceRange?.[0] === 0 && selectedFilters.priceRange?.[1] === 10 && styles.filterChipSelected,
            ]}
            onPress={() => setPriceRange([0, 10])}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilters.priceRange?.[0] === 0 && selectedFilters.priceRange?.[1] === 10 && styles.filterChipTextSelected,
              ]}
            >
              Under $10
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilters.priceRange?.[0] === 10 && selectedFilters.priceRange?.[1] === 25 && styles.filterChipSelected,
            ]}
            onPress={() => setPriceRange([10, 25])}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilters.priceRange?.[0] === 10 && selectedFilters.priceRange?.[1] === 25 && styles.filterChipTextSelected,
              ]}
            >
              $10 - $25
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilters.priceRange?.[0] === 25 && selectedFilters.priceRange?.[1] === 1000 && styles.filterChipSelected,
            ]}
            onPress={() => setPriceRange([25, 1000])}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilters.priceRange?.[0] === 25 && selectedFilters.priceRange?.[1] === 1000 && styles.filterChipTextSelected,
              ]}
            >
              $25+
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Show level filters only when programs are selected */}
        {selectedFilters.types.includes('program') && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilters.levels.includes('beginner') && styles.filterChipSelected,
              ]}
              onPress={() => toggleLevelFilter('beginner')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilters.levels.includes('beginner') && styles.filterChipTextSelected,
                ]}
              >
                Beginner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilters.levels.includes('intermediate') && styles.filterChipSelected,
              ]}
              onPress={() => toggleLevelFilter('intermediate')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilters.levels.includes('intermediate') && styles.filterChipTextSelected,
                ]}
              >
                Intermediate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilters.levels.includes('advanced') && styles.filterChipSelected,
              ]}
              onPress={() => toggleLevelFilter('advanced')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilters.levels.includes('advanced') && styles.filterChipTextSelected,
                ]}
              >
                Advanced
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {isLoading ? 'Loading...' : `${filteredItems.length} results`}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={designTokens.colors.dark.brand.primary} />
            <Text style={styles.loadingText}>Loading marketplace items...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={(
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 48, color: '#555' }}>🔍</Text>
                <Text style={styles.emptyStateText}>No items match your search</Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilters({
                      types: ['workout', 'program', 'club'],
                      priceRange: null,
                      levels: ['beginner', 'intermediate', 'advanced'],
                    });
                  }}
                >
                  <Text style={styles.emptyStateButtonText}>Clear Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </IMessagePageWrapper>
    );
  } catch (error) {
    console.error('Error rendering MarketplaceContent:', error);
    // Fallback UI if IMessagePageWrapper fails
    return (
      <View style={[styles.mainTitleContainer, { backgroundColor: '#000000', flex: 1 }]}>
        <Text style={styles.mainTitle}>Marketplace</Text>
        <Text style={styles.mainSubtitle}>Discover premium content</Text>
        <Text style={[styles.mainSubtitle, { marginTop: 20, color: '#FF3B30' }]}>
          Error loading marketplace content. Please try again later.
        </Text>
      </View>
    );
  }
}