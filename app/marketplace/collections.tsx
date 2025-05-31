/**
 * Elite Locker - Marketplace Collections Screen
 * Browse and discover curated exercise collections
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import SpotifyBleedingLayout from '../../components/design-system/layouts/SpotifyBleedingLayout';
import { ExerciseCollection, exerciseCollectionService } from '../../services/exerciseCollectionService';

const { width: screenWidth } = Dimensions.get('window');

// Fallback header image for collections category (using programs image temporarily)
const headerImage = require('../../assets/images/marketplace/programs.jpg');

// Mock collections data
const mockCollections: ExerciseCollection[] = [
  {
    id: '1',
    name: 'Big 3 Powerlifting',
    description: 'The fundamental powerlifting movements: squat, bench press, and deadlift',
    creatorName: 'Elite Coach',
    isPaid: false,
    exerciseCount: 3,
    visibility: 'public',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Bodyweight Basics',
    description: 'Essential bodyweight exercises for strength and conditioning',
    creatorName: 'Fitness Pro',
    isPaid: false,
    exerciseCount: 8,
    visibility: 'public',
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Upper Body Power',
    description: 'Compound movements for building upper body strength and mass',
    creatorName: 'Strength Coach',
    isPaid: true,
    price: 9.99,
    exerciseCount: 12,
    visibility: 'public',
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Core Crusher',
    description: 'Advanced core exercises for athletes and fitness enthusiasts',
    creatorName: 'Core Specialist',
    isPaid: true,
    price: 14.99,
    exerciseCount: 15,
    visibility: 'public',
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Leg Day Legends',
    description: 'Complete lower body workout collection for maximum gains',
    creatorName: 'Leg Day King',
    isPaid: false,
    exerciseCount: 10,
    visibility: 'public',
    createdAt: new Date(),
  },
];

export default function MarketplaceCollectionsScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<ExerciseCollection[]>(mockCollections);
  const [filteredCollections, setFilteredCollections] = useState<ExerciseCollection[]>(mockCollections);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaidOnly, setShowPaidOnly] = useState(false);

  const loadCollections = async () => {
    try {
      setIsLoading(true);

      const collectionsData = await exerciseCollectionService.getCollections({
        search: searchQuery,
        isPaid: showPaidOnly ? true : undefined,
        limit: 50
      });

      setCollections(collectionsData);
      setFilteredCollections(collectionsData);
    } catch (error) {
      console.error('Error loading collections:', error);
      // Fallback to mock data
      let filtered = mockCollections;

      if (searchQuery) {
        filtered = filtered.filter(collection =>
          collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collection.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collection.creatorName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (showPaidOnly) {
        filtered = filtered.filter(collection => collection.isPaid);
      }

      setFilteredCollections(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, [searchQuery, showPaidOnly]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      loadCollections();
    }
  }, [searchQuery]);

  const handleCollectionPress = useCallback((collection: ExerciseCollection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/marketplace/collections/${collection.id}` as any);
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCollections();
    } catch (error) {
      console.error('Error refreshing collections:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderCollection = ({ item }: { item: ExerciseCollection }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => handleCollectionPress(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.collectionCardGradient}
      >
        <View style={styles.collectionHeader}>
          <View style={styles.collectionIcon}>
            <Ionicons
              name="library-outline"
              size={24}
              color="#32D74B"
            />
          </View>
          <View style={styles.collectionInfo}>
            <Text style={styles.collectionName}>{item.name}</Text>
            <Text style={styles.collectionCreator}>by {item.creatorName}</Text>
          </View>
          <View style={styles.collectionPrice}>
            {item.isPaid ? (
              <Text style={styles.priceText}>${item.price}</Text>
            ) : (
              <Text style={styles.freeText}>FREE</Text>
            )}
          </View>
        </View>

        <Text style={styles.collectionDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.collectionFooter}>
          <View style={styles.exerciseCount}>
            <Ionicons name="barbell-outline" size={16} color="#8E8E93" />
            <Text style={styles.exerciseCountText}>
              {item.exerciseCount} exercises
            </Text>
          </View>
          <View style={styles.collectionAction}>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SpotifyBleedingLayout
      categoryImage={headerImage}
      title="Collections"
      subtitle={`${filteredCollections.length} curated sets available`}
      onBackPress={handleBackPress}
      isLoading={isLoading}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search collections..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>
      </View>

      {/* Filter Options */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showPaidOnly && styles.filterButtonActive
          ]}
          onPress={() => setShowPaidOnly(!showPaidOnly)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPaidOnly ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={showPaidOnly ? "#32D74B" : "#8E8E93"}
          />
          <Text style={[
            styles.filterButtonText,
            showPaidOnly && styles.filterButtonTextActive
          ]}>
            Premium only
          </Text>
        </TouchableOpacity>
      </View>

      {filteredCollections.length > 0 ? (
        <FlatList
          data={filteredCollections}
          renderItem={renderCollection}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.collectionsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No collections found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </SpotifyBleedingLayout>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'flex-start',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(50, 215, 75, 0.2)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginLeft: 8,
  },
  filterButtonTextActive: {
    color: '#32D74B',
  },
  content: {
    flex: 1,
  },
  collectionsList: {
    paddingHorizontal: 16,
  },
  collectionCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  collectionCardGradient: {
    padding: 16,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(50, 215, 75, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  collectionCreator: {
    fontSize: 14,
    color: '#8E8E93',
  },
  collectionPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32D74B',
  },
  freeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64D2FF',
  },
  collectionDescription: {
    fontSize: 14,
    color: '#EBEBF5',
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
  },
  collectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseCountText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  collectionAction: {
    // Empty for now, just the chevron
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
