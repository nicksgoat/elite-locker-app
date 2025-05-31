/**
 * Elite Locker - Exercise Leaderboard Screen
 * Shows training max leaderboard for a specific exercise
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import trainingMaxService from '../../../services/trainingMaxService';

const { width: screenWidth } = Dimensions.get('window');

// Fallback header image
const headerImage = require('../../../assets/images/marketplace/workouts.jpg');

// Leaderboard entry interface
interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  maxValue: number;
  maxReps: number;
  measurementType: string;
  dateAchieved: Date;
  rank: number;
  isCurrentUser?: boolean;
}

// Mock leaderboard data
const mockLeaderboardData: LeaderboardEntry[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'powerlifter_pro',
    fullName: 'Mike Johnson',
    maxValue: 405,
    maxReps: 1,
    measurementType: 'weight_reps',
    dateAchieved: new Date('2024-01-15'),
    rank: 1,
  },
  {
    id: '2',
    userId: 'user2',
    username: 'strength_beast',
    fullName: 'Sarah Wilson',
    maxValue: 385,
    maxReps: 1,
    measurementType: 'weight_reps',
    dateAchieved: new Date('2024-01-10'),
    rank: 2,
  },
  {
    id: '3',
    userId: 'user3',
    username: 'iron_warrior',
    fullName: 'Alex Chen',
    maxValue: 365,
    maxReps: 1,
    measurementType: 'weight_reps',
    dateAchieved: new Date('2024-01-08'),
    rank: 3,
  },
  {
    id: '4',
    userId: 'current_user',
    username: 'you',
    fullName: 'You',
    maxValue: 315,
    maxReps: 1,
    measurementType: 'weight_reps',
    dateAchieved: new Date('2024-01-05'),
    rank: 4,
    isCurrentUser: true,
  },
  {
    id: '5',
    userId: 'user5',
    username: 'gym_legend',
    fullName: 'David Rodriguez',
    maxValue: 295,
    maxReps: 1,
    measurementType: 'weight_reps',
    dateAchieved: new Date('2024-01-03'),
    rank: 5,
  },
];

export default function ExerciseLeaderboardScreen() {
  const router = useRouter();
  const { id, exerciseName } = useLocalSearchParams<{ id: string; exerciseName: string }>();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'week'>('all');

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with real API call
      // const leaderboardData = await trainingMaxService.getExerciseLeaderboard(id, selectedPeriod);
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      setLeaderboard(mockLeaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard(mockLeaderboardData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handlePeriodPress = useCallback((period: 'all' | 'month' | 'week') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPeriod(period);
  }, []);

  const handleUserPress = useCallback((entry: LeaderboardEntry) => {
    if (!entry.isCurrentUser) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Navigate to user profile
      router.push(`/profile/${entry.userId}` as any);
    }
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadLeaderboard();
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: 'trophy', color: '#FFD700' }; // Gold
      case 2:
        return { icon: 'medal', color: '#C0C0C0' }; // Silver
      case 3:
        return { icon: 'medal', color: '#CD7F32' }; // Bronze
      default:
        return { icon: 'person', color: '#8E8E93' };
    }
  };

  const renderLeaderboardEntry = ({ item }: { item: LeaderboardEntry }) => {
    const rankInfo = getRankIcon(item.rank);
    
    return (
      <TouchableOpacity
        style={[
          styles.entryCard,
          item.isCurrentUser && styles.currentUserCard
        ]}
        onPress={() => handleUserPress(item)}
        activeOpacity={item.isCurrentUser ? 1 : 0.8}
      >
        <View style={styles.entryContent}>
          <View style={styles.rankSection}>
            <View style={[styles.rankBadge, { backgroundColor: `${rankInfo.color}20` }]}>
              <Ionicons name={rankInfo.icon as any} size={20} color={rankInfo.color} />
            </View>
            <Text style={styles.rankNumber}>#{item.rank}</Text>
          </View>

          <View style={styles.userSection}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={20} color="#8E8E93" />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, item.isCurrentUser && styles.currentUserName]}>
                {item.fullName || item.username}
              </Text>
              <Text style={styles.userHandle}>@{item.username}</Text>
            </View>
          </View>

          <View style={styles.maxSection}>
            <Text style={[styles.maxValue, item.isCurrentUser && styles.currentUserMax]}>
              {item.maxValue}
            </Text>
            <Text style={styles.maxUnit}>
              {item.measurementType === 'weight_reps' ? 'lbs' : 'reps'}
            </Text>
          </View>
        </View>

        {item.isCurrentUser && (
          <View style={styles.currentUserBadge}>
            <Text style={styles.currentUserBadgeText}>YOU</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SpotifyBleedingLayout
      categoryImage={headerImage}
      title="Leaderboard"
      subtitle={exerciseName || 'Exercise Rankings'}
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
      {/* Period Filter */}
      <View style={styles.filterContainer}>
        <View style={styles.filterButtons}>
          {(['all', 'month', 'week'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.filterButton,
                selectedPeriod === period && styles.filterButtonActive
              ]}
              onPress={() => handlePeriodPress(period)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterButtonText,
                selectedPeriod === period && styles.filterButtonTextActive
              ]}>
                {period === 'all' ? 'All Time' : period === 'month' ? 'This Month' : 'This Week'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Leaderboard List */}
      {leaderboard.length > 0 ? (
        <FlatList
          data={leaderboard}
          renderItem={renderLeaderboardEntry}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.leaderboardList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No Rankings Yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to set a training max for this exercise
          </Text>
        </View>
      )}
    </SpotifyBleedingLayout>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#0A84FF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  leaderboardList: {
    paddingHorizontal: 16,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  currentUserCard: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rankSection: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  userSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#0A84FF',
  },
  userHandle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  maxSection: {
    alignItems: 'flex-end',
  },
  maxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentUserMax: {
    color: '#0A84FF',
  },
  maxUnit: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  currentUserBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0A84FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentUserBadgeText: {
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
