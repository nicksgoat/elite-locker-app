/**
 * Elite Locker - Training Max History Screen
 * Shows the history of training maxes for a specific exercise
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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

import SpotifyBleedingLayout from '../../../../components/design-system/layouts/SpotifyBleedingLayout';
import { ExerciseTrainingMax } from '../../../../types/workout';

const { width: screenWidth } = Dimensions.get('window');

// Fallback header image
const headerImage = require('../../../../assets/images/marketplace/workouts.jpg');

// Mock history data with source tracking
const mockHistoryData: ExerciseTrainingMax[] = [
  {
    id: '1',
    userId: 'user1',
    exerciseId: 'e1',
    measurementType: 'weight_reps',
    maxValue: 315,
    maxReps: 1,
    dateAchieved: new Date('2024-01-15'),
    notes: 'Auto-updated from workout: 315 lbs x 1 reps',
    sourceType: 'workout_tracker',
    workoutId: 'w1',
    exerciseLogId: 'el1',
    workout: {
      id: 'w1',
      title: 'Heavy Squat Day',
      date: new Date('2024-01-15'),
    },
  },
  {
    id: '2',
    userId: 'user1',
    exerciseId: 'e1',
    measurementType: 'weight_reps',
    maxValue: 305,
    maxReps: 1,
    dateAchieved: new Date('2023-12-10'),
    notes: 'PR! Finally broke 300',
    sourceType: 'manual',
  },
  {
    id: '3',
    userId: 'user1',
    exerciseId: 'e1',
    measurementType: 'weight_reps',
    maxValue: 295,
    maxReps: 1,
    dateAchieved: new Date('2023-11-05'),
    sourceType: 'estimated',
    notes: 'Calculated from 275 lbs x 3 reps',
  },
  {
    id: '4',
    userId: 'user1',
    exerciseId: 'e1',
    measurementType: 'weight_reps',
    maxValue: 285,
    maxReps: 1,
    dateAchieved: new Date('2023-10-01'),
    notes: 'Back to training after injury',
    sourceType: 'manual',
  },
];

export default function TrainingMaxHistoryScreen() {
  const router = useRouter();
  const { id, exerciseName } = useLocalSearchParams<{ id: string; exerciseName: string }>();

  const [history, setHistory] = useState<ExerciseTrainingMax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace with real API call
      // const historyData = await trainingMaxService.getTrainingMaxHistory(id, 'weight_reps');

      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      setHistory(mockHistoryData);
    } catch (error) {
      console.error('Error loading training max history:', error);
      setHistory(mockHistoryData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeleteMax = useCallback(async (maxId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // TODO: Implement delete functionality
      // await trainingMaxService.deleteTrainingMax(maxId);

      // For now, just remove from local state
      setHistory(prev => prev.filter(item => item.id !== maxId));
    } catch (error) {
      console.error('Error deleting training max:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadHistory();
    } catch (error) {
      console.error('Error refreshing history:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getProgressIndicator = (current: number, previous?: number) => {
    if (!previous) return null;

    const change = current - previous;
    const isIncrease = change > 0;
    const isDecrease = change < 0;

    if (change === 0) return null;

    return {
      icon: isIncrease ? 'trending-up' : 'trending-down',
      color: isIncrease ? '#32D74B' : '#FF3B30',
      text: `${isIncrease ? '+' : ''}${change} lbs`,
    };
  };

  const getSourceIcon = (sourceType?: string) => {
    switch (sourceType) {
      case 'workout_tracker':
        return { icon: 'fitness', color: '#32D74B', label: 'From Workout' };
      case 'estimated':
        return { icon: 'calculator', color: '#FF9F0A', label: 'Estimated' };
      case 'manual':
      default:
        return { icon: 'create', color: '#0A84FF', label: 'Manual Entry' };
    }
  };

  const renderHistoryEntry = ({ item, index }: { item: ExerciseTrainingMax; index: number }) => {
    const previousMax = index < history.length - 1 ? history[index + 1] : undefined;
    const progress = getProgressIndicator(item.maxValue, previousMax?.maxValue);
    const isLatest = index === 0;
    const sourceInfo = getSourceIcon(item.sourceType);

    return (
      <View style={[styles.entryCard, isLatest && styles.latestEntry]}>
        <View style={styles.entryHeader}>
          <View style={styles.entryInfo}>
            <View style={styles.valueSection}>
              <Text style={[styles.maxValue, isLatest && styles.latestValue]}>
                {item.maxValue}
              </Text>
              <Text style={styles.maxUnit}>
                {item.measurementType === 'weight_reps' ? 'lbs' : 'reps'}
              </Text>
              {progress && (
                <View style={[styles.progressBadge, { backgroundColor: `${progress.color}20` }]}>
                  <Ionicons name={progress.icon as any} size={12} color={progress.color} />
                  <Text style={[styles.progressText, { color: progress.color }]}>
                    {progress.text}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.dateAndSource}>
              <Text style={styles.entryDate}>
                {item.dateAchieved.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <View style={[styles.sourceBadge, { backgroundColor: `${sourceInfo.color}20` }]}>
                <Ionicons name={sourceInfo.icon as any} size={12} color={sourceInfo.color} />
                <Text style={[styles.sourceText, { color: sourceInfo.color }]}>
                  {sourceInfo.label}
                </Text>
              </View>
            </View>
          </View>

          {!isLatest && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteMax(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>

        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}

        {/* Show workout link if from tracker */}
        {item.sourceType === 'workout_tracker' && item.workout && (
          <View style={styles.workoutLinkSection}>
            <TouchableOpacity
              style={styles.workoutLink}
              onPress={() => {
                // Navigate to workout detail
                router.push(`/workouts/${item.workoutId}` as any);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="barbell" size={14} color="#32D74B" />
              <Text style={styles.workoutLinkText}>
                View Workout: {item.workout.title}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        )}

        {isLatest && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>CURRENT</Text>
          </View>
        )}
      </View>
    );
  };

  const totalProgress = history.length > 1
    ? history[0].maxValue - history[history.length - 1].maxValue
    : 0;

  return (
    <SpotifyBleedingLayout
      categoryImage={headerImage}
      title="Training Max History"
      subtitle={exerciseName || 'Exercise Progress'}
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
      {/* Progress Summary */}
      {history.length > 1 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Progress</Text>
            <View style={styles.summaryValue}>
              <Text style={[
                styles.summaryNumber,
                { color: totalProgress >= 0 ? '#32D74B' : '#FF3B30' }
              ]}>
                {totalProgress >= 0 ? '+' : ''}{totalProgress}
              </Text>
              <Text style={styles.summaryUnit}>lbs</Text>
            </View>
            <Text style={styles.summaryPeriod}>
              Since {history[history.length - 1].dateAchieved.toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
      )}

      {/* History List */}
      {history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderHistoryEntry}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.historyList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No History Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your training max history will appear here as you update it
          </Text>
        </View>
      )}
    </SpotifyBleedingLayout>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  summaryValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryUnit: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  summaryPeriod: {
    fontSize: 12,
    color: '#8E8E93',
  },
  historyList: {
    paddingHorizontal: 16,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  latestEntry: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  entryInfo: {
    flex: 1,
  },
  valueSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  maxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  latestValue: {
    color: '#0A84FF',
  },
  maxUnit: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  dateAndSource: {
    alignItems: 'flex-start',
  },
  entryDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  workoutLinkSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  workoutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 215, 75, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  workoutLinkText: {
    fontSize: 12,
    color: '#32D74B',
    marginLeft: 4,
    marginRight: 4,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  notesSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#EBEBF5',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0A84FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
