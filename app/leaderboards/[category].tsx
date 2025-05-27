import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LeaderboardEntry {
  rank: number;
  name: string;
  value: string | number;
  avatar: string;
  change?: number; // Position change from last period
  stats?: {
    total: number;
    average: number;
    best: number;
  };
}

// Extended mock data for full leaderboard
const fullLeaderboardData: Record<string, LeaderboardEntry[]> = {
  'most-workouts-completed': [
    { rank: 1, name: 'Sarah Johnson', value: 28, avatar: 'https://i.pravatar.cc/150?img=5', change: 2, stats: { total: 28, average: 7, best: 12 } },
    { rank: 2, name: 'Jason Miller', value: 24, avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2', change: -1, stats: { total: 24, average: 6, best: 10 } },
    { rank: 3, name: 'Emma Davis', value: 22, avatar: 'https://i.pravatar.cc/150?img=23', change: 1, stats: { total: 22, average: 5.5, best: 9 } },
    { rank: 4, name: 'Michael Brown', value: 21, avatar: 'https://i.pravatar.cc/150?img=68', change: 0, stats: { total: 21, average: 5.25, best: 8 } },
    { rank: 5, name: 'Olivia Wilson', value: 19, avatar: 'https://i.pravatar.cc/150?img=47', change: 3, stats: { total: 19, average: 4.75, best: 7 } },
    { rank: 6, name: 'David Clark', value: 18, avatar: 'https://i.pravatar.cc/150?img=33', change: -2, stats: { total: 18, average: 4.5, best: 8 } },
    { rank: 7, name: 'Lisa White', value: 17, avatar: 'https://i.pravatar.cc/150?img=32', change: 1, stats: { total: 17, average: 4.25, best: 6 } },
    { rank: 8, name: 'Robert Smith', value: 16, avatar: 'https://i.pravatar.cc/150?img=42', change: -1, stats: { total: 16, average: 4, best: 7 } },
    { rank: 9, name: 'Jennifer Lee', value: 15, avatar: 'https://i.pravatar.cc/150?img=29', change: 2, stats: { total: 15, average: 3.75, best: 6 } },
    { rank: 10, name: 'Andrew Moore', value: 14, avatar: 'https://i.pravatar.cc/150?img=25', change: 0, stats: { total: 14, average: 3.5, best: 5 } },
  ],
  'highest-speed-recorded': [
    { rank: 1, name: 'Jason Miller', value: '24.8 mph', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2', change: 0, stats: { total: 15, average: 23.2, best: 24.8 } },
    { rank: 2, name: 'Michael Brown', value: '24.2 mph', avatar: 'https://i.pravatar.cc/150?img=68', change: 1, stats: { total: 12, average: 22.8, best: 24.2 } },
    { rank: 3, name: 'Emma Davis', value: '23.9 mph', avatar: 'https://i.pravatar.cc/150?img=23', change: -1, stats: { total: 18, average: 22.1, best: 23.9 } },
    { rank: 4, name: 'Sarah Johnson', value: '23.5 mph', avatar: 'https://i.pravatar.cc/150?img=5', change: 2, stats: { total: 22, average: 21.8, best: 23.5 } },
    { rank: 5, name: 'Olivia Wilson', value: '22.7 mph', avatar: 'https://i.pravatar.cc/150?img=47', change: 0, stats: { total: 14, average: 21.2, best: 22.7 } },
  ],
  'most-consistent': [
    { rank: 1, name: 'Emma Davis', value: '95%', avatar: 'https://i.pravatar.cc/150?img=23', change: 1, stats: { total: 20, average: 92, best: 100 } },
    { rank: 2, name: 'Sarah Johnson', value: '92%', avatar: 'https://i.pravatar.cc/150?img=5', change: -1, stats: { total: 28, average: 89, best: 98 } },
    { rank: 3, name: 'Olivia Wilson', value: '88%', avatar: 'https://i.pravatar.cc/150?img=47', change: 2, stats: { total: 16, average: 85, best: 95 } },
    { rank: 4, name: 'Jason Miller', value: '85%', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2', change: 0, stats: { total: 24, average: 82, best: 92 } },
    { rank: 5, name: 'Michael Brown', value: '82%', avatar: 'https://i.pravatar.cc/150?img=68', change: -2, stats: { total: 21, average: 79, best: 88 } },
  ],
};

const getCategoryTitle = (category: string): string => {
  return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getCategoryDescription = (category: string): string => {
  switch (category) {
    case 'most-workouts-completed':
      return 'Athletes ranked by total number of completed workouts this month';
    case 'highest-speed-recorded':
      return 'Top speeds recorded by athletes across all training sessions';
    case 'most-consistent':
      return 'Athletes with the highest consistency percentage in completing their scheduled workouts';
    default:
      return 'Performance rankings for club members';
  }
};

// Leaderboard Entry component
const LeaderboardEntryItem: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => {
  const router = useRouter();
  
  const handleViewProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${entry.name.replace(/\s+/g, '-').toLowerCase()}`);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#FFFFFF';
  };

  const getChangeIcon = (change?: number) => {
    if (!change || change === 0) return null;
    return (
      <View style={[styles.changeIndicator, { backgroundColor: change > 0 ? '#30D15820' : '#FF453A20' }]}>
        <Ionicons 
          name={change > 0 ? "arrow-up" : "arrow-down"} 
          size={12} 
          color={change > 0 ? "#30D158" : "#FF453A"} 
        />
        <Text style={[styles.changeText, { color: change > 0 ? "#30D158" : "#FF453A" }]}>
          {Math.abs(change)}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.entryItem} onPress={handleViewProfile} activeOpacity={0.7}>
      <View style={styles.rankSection}>
        <Text style={[styles.rankText, { color: getRankColor(entry.rank) }]}>
          {entry.rank}
        </Text>
        {entry.rank <= 3 && (
          <Ionicons 
            name="trophy" 
            size={16} 
            color={getRankColor(entry.rank)} 
          />
        )}
        {getChangeIcon(entry.change)}
      </View>
      
      <Image source={{ uri: entry.avatar }} style={styles.entryAvatar} />
      
      <View style={styles.entryInfo}>
        <Text style={styles.entryName}>{entry.name}</Text>
        {entry.stats && (
          <Text style={styles.entryStats}>
            Avg: {entry.stats.average} • Best: {entry.stats.best}
          </Text>
        )}
      </View>
      
      <Text style={styles.entryValue}>{entry.value}</Text>
      
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function LeaderboardDetailScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [timeFilter, setTimeFilter] = useState('month');
  
  const categoryStr = Array.isArray(category) ? category[0] : category || 'most-workouts-completed';
  const leaderboardData = fullLeaderboardData[categoryStr] || [];
  
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  const handleTimeFilterChange = (filter: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeFilter(filter);
    // In a real app, this would refetch data
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <BlurView intensity={80} tint="dark" style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{getCategoryTitle(categoryStr)}</Text>
            <Text style={styles.headerDescription}>{getCategoryDescription(categoryStr)}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="funnel-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Time Filter */}
        <View style={styles.filterContainer}>
          {['week', 'month', 'quarter', 'all'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, timeFilter === filter && styles.activeFilterChip]}
              onPress={() => handleTimeFilterChange(filter)}
            >
              <Text style={[styles.filterText, timeFilter === filter && styles.activeFilterText]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>

      {/* Leaderboard List */}
      <FlatList
        data={leaderboardData}
        renderItem={({ item }) => <LeaderboardEntryItem entry={item} />}
        keyExtractor={item => item.rank.toString()}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  filterButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(60, 60, 67, 0.1)',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#0A84FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  rankSection: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  entryAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  entryStats: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  entryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A84FF',
    marginRight: 12,
  },
  moreButton: {
    padding: 4,
  },
}); 