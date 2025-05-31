/**
 * Elite Locker - Collection Detail Screen
 * View details and exercises in a specific collection
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import SpotifyBleedingLayout from '../../../components/design-system/layouts/SpotifyBleedingLayout';
import { ExerciseCollection, ExerciseCollectionItem, exerciseCollectionService } from '../../../services/exerciseCollectionService';

const { width: screenWidth } = Dimensions.get('window');

// Fallback header image (using programs image temporarily)
const headerImage = require('../../../assets/images/marketplace/programs.jpg');

export default function CollectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [collection, setCollection] = useState<(ExerciseCollection & { items: ExerciseCollectionItem[] }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCollection = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const collectionData = await exerciseCollectionService.getCollectionById(id);
      setCollection(collectionData);
    } catch (error) {
      console.error('Error loading collection:', error);
      // Fallback to mock data
      setCollection({
        id: id,
        name: 'Sample Collection',
        description: 'A sample exercise collection',
        creatorName: 'Elite Coach',
        isPaid: false,
        visibility: 'public',
        exerciseCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollection();
  }, [id]);

  const handleExercisePress = useCallback((exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/exercises/detail/${exerciseId}` as any);
  }, [router]);

  const handleStartWorkout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Create workout from collection
    router.push('/workout/enhanced-log' as any);
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadCollection();
    } catch (error) {
      console.error('Error refreshing collection:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderExercise = ({ item, index }: { item: ExerciseCollectionItem; index: number }) => (
    <TouchableOpacity
      style={styles.exerciseCard}
      onPress={() => handleExercisePress(item.exerciseId)}
      activeOpacity={0.8}
    >
      <View style={styles.exerciseCardContent}>
        <View style={styles.exerciseNumber}>
          <Text style={styles.exerciseNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>
            {item.exercise?.name || 'Exercise'}
          </Text>
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {item.exercise?.description || item.notes || 'No description available'}
          </Text>
        </View>
        <View style={styles.exerciseAction}>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  if (isLoading) {
    return (
      <SpotifyBleedingLayout
        categoryImage={headerImage}
        title="Loading..."
        subtitle="Please wait"
        onBackPress={handleBackPress}
        isLoading={true}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading collection...</Text>
        </View>
      </SpotifyBleedingLayout>
    );
  }

  if (!collection) {
    return (
      <SpotifyBleedingLayout
        categoryImage={headerImage}
        title="Not Found"
        subtitle="Collection not found"
        onBackPress={handleBackPress}
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>Collection not found</Text>
          <Text style={styles.emptySubtitle}>
            This collection may have been removed or made private
          </Text>
        </View>
      </SpotifyBleedingLayout>
    );
  }

  return (
    <SpotifyBleedingLayout
      categoryImage={headerImage}
      title={collection.name}
      subtitle={`${collection.exerciseCount} exercises • by ${collection.creatorName}`}
      onBackPress={handleBackPress}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
        {/* Collection Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.description}>{collection.description}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Ionicons name="barbell-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>
                {collection.exerciseCount} exercises
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>
                {collection.creatorName}
              </Text>
            </View>
            {collection.isPaid && (
              <View style={styles.metaItem}>
                <Ionicons name="card-outline" size={16} color="#32D74B" />
                <Text style={[styles.metaText, { color: '#32D74B' }]}>
                  ${collection.price}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Start Workout Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FF2D55', '#FF375F']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.exercisesTitle}>Exercises</Text>
          {collection.items && collection.items.length > 0 ? (
            <FlatList
              data={collection.items}
              renderItem={renderExercise}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.exercisesList}
            />
          ) : (
            <View style={styles.emptyExercises}>
              <Text style={styles.emptyExercisesText}>
                No exercises in this collection yet
              </Text>
            </View>
          )}
        </View>
    </SpotifyBleedingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#EBEBF5',
    opacity: 0.8,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  exercisesContainer: {
    paddingHorizontal: 16,
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  exercisesList: {
    // No additional styles needed
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A84FF',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#EBEBF5',
    opacity: 0.8,
  },
  exerciseAction: {
    marginLeft: 12,
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
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyExercisesText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
