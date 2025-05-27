import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface LeaderboardEntry {
  rank: number;
  name: string;
  value: string | number;
  avatar: string;
}

interface LeaderboardCategory {
  category: string;
  timeFrame: string;
  leaders: LeaderboardEntry[];
}

// Mock leaderboard data
const leaderboardData: LeaderboardCategory[] = [
  {
    category: 'Most Workouts Completed',
    timeFrame: 'This Month',
    leaders: [
      { rank: 1, name: 'Sarah Johnson', value: 28, avatar: 'https://i.pravatar.cc/150?img=5' },
      { rank: 2, name: 'Jason Miller', value: 24, avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2' },
      { rank: 3, name: 'Emma Davis', value: 22, avatar: 'https://i.pravatar.cc/150?img=23' },
      { rank: 4, name: 'Michael Brown', value: 21, avatar: 'https://i.pravatar.cc/150?img=68' },
      { rank: 5, name: 'Olivia Wilson', value: 19, avatar: 'https://i.pravatar.cc/150?img=47' },
    ]
  },
  {
    category: 'Highest Speed Recorded',
    timeFrame: 'All Time',
    leaders: [
      { rank: 1, name: 'Jason Miller', value: '24.8 mph', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2' },
      { rank: 2, name: 'Michael Brown', value: '24.2 mph', avatar: 'https://i.pravatar.cc/150?img=68' },
      { rank: 3, name: 'Emma Davis', value: '23.9 mph', avatar: 'https://i.pravatar.cc/150?img=23' },
      { rank: 4, name: 'Sarah Johnson', value: '23.5 mph', avatar: 'https://i.pravatar.cc/150?img=5' },
      { rank: 5, name: 'Olivia Wilson', value: '22.7 mph', avatar: 'https://i.pravatar.cc/150?img=47' },
    ]
  },
  {
    category: 'Most Consistent',
    timeFrame: 'This Quarter',
    leaders: [
      { rank: 1, name: 'Emma Davis', value: '95%', avatar: 'https://i.pravatar.cc/150?img=23' },
      { rank: 2, name: 'Sarah Johnson', value: '92%', avatar: 'https://i.pravatar.cc/150?img=5' },
      { rank: 3, name: 'Olivia Wilson', value: '88%', avatar: 'https://i.pravatar.cc/150?img=47' },
      { rank: 4, name: 'Jason Miller', value: '85%', avatar: 'https://pbs.twimg.com/profile_images/1745305109008154624/oO6jSpTf_400x400.jpg2' },
      { rank: 5, name: 'Michael Brown', value: '82%', avatar: 'https://i.pravatar.cc/150?img=68' },
    ]
  }
];

// Leaderboard Category component
const LeaderboardCategory: React.FC<{ category: LeaderboardCategory }> = ({ category }) => {
  const router = useRouter();
  
  const handleViewAllLeaderboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to full leaderboard view - create this screen if needed
    router.push(`/leaderboards/${category.category.replace(/\s+/g, '-').toLowerCase()}`);
  };
  
  const handleViewProfile = (leader: LeaderboardEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${leader.name.replace(/\s+/g, '-').toLowerCase()}`);
  };
  
  return (
    <View style={styles.leaderboardCategory}>
      <View style={styles.leaderboardHeader}>
        <View>
          <Text style={styles.leaderboardTitle}>{category.category}</Text>
          <Text style={styles.leaderboardTimeFrame}>{category.timeFrame}</Text>
        </View>
        <TouchableOpacity onPress={handleViewAllLeaderboard}>
          <Text style={styles.leaderboardViewAll}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {category.leaders.map((leader) => (
        <TouchableOpacity 
          key={leader.rank} 
          style={styles.leaderItem}
          onPress={() => handleViewProfile(leader)}
          activeOpacity={0.7}
        >
          <View style={styles.rankContainer}>
            <Text style={[
              styles.leaderRank, 
              leader.rank === 1 ? styles.goldRank : 
              leader.rank === 2 ? styles.silverRank : 
              leader.rank === 3 ? styles.bronzeRank : 
              styles.leaderRank
            ]}>
              {leader.rank}
            </Text>
            {leader.rank <= 3 && (
              <Ionicons 
                name="trophy" 
                size={12} 
                color={
                  leader.rank === 1 ? '#FFD700' : 
                  leader.rank === 2 ? '#C0C0C0' : 
                  '#CD7F32'
                } 
              />
            )}
          </View>
          <Image source={{ uri: leader.avatar }} style={styles.leaderAvatar} />
          <Text style={styles.leaderName}>{leader.name}</Text>
          <Text style={styles.leaderValue}>{leader.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function Leaderboards() {
  return (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Club Leaderboards</Text>
        <View style={styles.trophyIcon}>
          <Ionicons name="trophy" size={24} color="#FFD700" />
        </View>
      </View>
      
      {leaderboardData.map((category, index) => (
        <LeaderboardCategory key={index} category={category} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trophyIcon: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 8,
    borderRadius: 20,
  },
  
  // Leaderboard styles
  leaderboardCategory: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaderboardTimeFrame: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  leaderboardViewAll: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60, 60, 67, 0.1)',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 8,
  },
  leaderRank: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 12,
  },
  leaderName: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  leaderValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0A84FF',
  },
  goldRank: {
    color: '#FFD700',
    fontWeight: '800',
  },
  silverRank: {
    color: '#C0C0C0',
    fontWeight: '800',
  },
  bronzeRank: {
    color: '#CD7F32',
    fontWeight: '800',
  },
}); 