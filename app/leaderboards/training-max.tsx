import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trainingMaxService, ExerciseLeaderboard } from '../../services/trainingMaxService';

const { width, height } = Dimensions.get('window');

type TimeFilter = 'week' | 'month' | 'quarter' | 'all';

export default function TrainingMaxLeaderboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [topExercises, setTopExercises] = useState<any[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<ExerciseLeaderboard | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTopExercises();
    startFadeAnimation();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      loadLeaderboard();
    }
  }, [selectedExercise, timeFilter]);

  const startFadeAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const loadTopExercises = async () => {
    try {
      setLoading(true);
      const exercises = await trainingMaxService.getTopExercises(10);
      setTopExercises(exercises);
      
      // Auto-select first exercise if available
      if (exercises.length > 0 && !selectedExercise) {
        setSelectedExercise(exercises[0].exerciseId);
      }
    } catch (error) {
      console.error('Error loading top exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    if (!selectedExercise) return;
    
    try {
      const leaderboardData = await trainingMaxService.getExerciseLeaderboard(
        selectedExercise,
        timeFilter,
        50
      );
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadTopExercises(),
        selectedExercise ? loadLeaderboard() : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExerciseSelect = (exerciseId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExercise(exerciseId);
  };

  const handleTimeFilterChange = (filter: TimeFilter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeFilter(filter);
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatTimeFilter = (filter: TimeFilter): string => {
    switch (filter) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'all': return 'All Time';
    }
  };

  const renderExerciseCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.exerciseCard,
        selectedExercise === item.exerciseId && styles.selectedExerciseCard
      ]}
      onPress={() => handleExerciseSelect(item.exerciseId)}
      activeOpacity={0.8}
    >
      <View style={styles.exerciseCardContent}>
        <Text style={[
          styles.exerciseName,
          selectedExercise === item.exerciseId && styles.selectedExerciseName
        ]}>
          {item.exerciseName}
        </Text>
        <Text style={styles.exerciseStats}>
          {item.participantCount} participants
        </Text>
        <Text style={styles.exerciseTopMax}>
          Top: {Math.round(item.topMax)} lb
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderLeaderboardEntry = ({ item, index }: { item: any; index: number }) => (
    <View style={[
      styles.leaderboardEntry,
      index < 3 && styles.topThreeEntry,
      leaderboard?.userEntry?.userId === item.userId && styles.userEntry
    ]}>
      <View style={styles.rankSection}>
        <Text style={[
          styles.rank,
          item.rank === 1 ? styles.goldRank :
          item.rank === 2 ? styles.silverRank :
          item.rank === 3 ? styles.bronzeRank : {}
        ]}>
          {item.rank}
        </Text>
        {item.rank <= 3 && (
          <Ionicons 
            name="trophy" 
            size={20} 
            color={
              item.rank === 1 ? '#FFD700' :
              item.rank === 2 ? '#C0C0C0' : '#CD7F32'
            } 
          />
        )}
      </View>
      
      <Image 
        source={{ uri: item.avatarUrl || 'https://via.placeholder.com/50x50' }} 
        style={styles.userAvatar} 
      />
      
      <View style={styles.userSection}>
        <Text style={styles.userName}>{item.fullName || item.username}</Text>
        <View style={styles.userMeta}>
          <Text style={styles.userValue}>{item.value} {item.unit}</Text>
          <View style={styles.badges}>
            {item.verificationStatus === 'verified' && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#30D158" />
              </View>
            )}
            <View style={[styles.sourceBadge, { backgroundColor: getSourceColor(item.source) + '20' }]}>
              <Ionicons 
                name={getSourceIcon(item.source) as any} 
                size={12} 
                color={getSourceColor(item.source)} 
              />
            </View>
          </View>
        </View>
      </View>
      
      <Text style={styles.achievedDate}>
        {item.achievedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </Text>
    </View>
  );

  const getSourceIcon = (source: string): string => {
    switch (source) {
      case 'tracker': return 'fitness-outline';
      case 'manual': return 'create-outline';
      case 'calculated': return 'calculator-outline';
      default: return 'help-circle-outline';
    }
  };

  const getSourceColor = (source: string): string => {
    switch (source) {
      case 'tracker': return '#30D158';
      case 'manual': return '#0A84FF';
      case 'calculated': return '#FF9F0A';
      default: return '#8E8E93';
    }
  };

  const selectedExerciseData = topExercises.find(ex => ex.exerciseId === selectedExercise);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Training Max Leaderboards</Text>
          <Text style={styles.headerSubtitle}>
            {selectedExerciseData ? selectedExerciseData.exerciseName : 'Select an exercise'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Exercise Selection */}
        <View style={styles.exerciseSection}>
          <Text style={styles.sectionTitle}>Popular Exercises</Text>
          <FlatList
            horizontal
            data={topExercises}
            renderItem={renderExerciseCard}
            keyExtractor={(item) => item.exerciseId}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exerciseList}
          />
        </View>

        {/* Time Filter */}
        {selectedExercise && (
          <View style={styles.filterSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {(['week', 'month', 'quarter', 'all'] as TimeFilter[]).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, timeFilter === filter && styles.activeFilterChip]}
                  onPress={() => handleTimeFilterChange(filter)}
                >
                  <Text style={[styles.filterText, timeFilter === filter && styles.activeFilterText]}>
                    {formatTimeFilter(filter)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Leaderboard */}
        {selectedExercise && leaderboard ? (
          <View style={styles.leaderboardSection}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.sectionTitle}>
                {leaderboard.exerciseName} - {formatTimeFilter(timeFilter)}
              </Text>
              <Text style={styles.participantCount}>
                {leaderboard.totalParticipants} participants
              </Text>
            </View>
            
            {leaderboard.userRank && (
              <View style={styles.userRankCard}>
                <Text style={styles.userRankText}>Your Rank: #{leaderboard.userRank}</Text>
                {leaderboard.userEntry && (
                  <Text style={styles.userRankValue}>
                    {leaderboard.userEntry.value} {leaderboard.userEntry.unit}
                  </Text>
                )}
              </View>
            )}
            
            <FlatList
              data={leaderboard.entries}
              renderItem={renderLeaderboardEntry}
              keyExtractor={(item) => item.userId}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#FFFFFF"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="trophy-outline" size={48} color="#8E8E93" />
                  <Text style={styles.emptyStateText}>No entries yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Be the first to set a training max for this exercise!
                  </Text>
                </View>
              }
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateText}>Select an exercise</Text>
            <Text style={styles.emptyStateSubtext}>
              Choose an exercise above to view its leaderboard
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },

  // Exercise Selection
  exerciseSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  exerciseList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    width: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedExerciseCard: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    borderColor: '#0A84FF',
  },
  exerciseCardContent: {
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedExerciseName: {
    color: '#0A84FF',
  },
  exerciseStats: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  exerciseTopMax: {
    fontSize: 12,
    fontWeight: '600',
    color: '#30D158',
  },

  // Filters
  filterSection: {
    marginBottom: 20,
  },
  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilterChip: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Leaderboard
  leaderboardSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  userRankCard: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A84FF',
  },
  userRankValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Leaderboard Entries
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topThreeEntry: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  userEntry: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  rankSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    marginRight: 12,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 6,
  },
  goldRank: {
    color: '#FFD700',
  },
  silverRank: {
    color: '#C0C0C0',
  },
  bronzeRank: {
    color: '#CD7F32',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userSection: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#30D158',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievedDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
