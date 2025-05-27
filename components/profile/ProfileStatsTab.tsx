import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface ProfileStatsTabProps {
  userId: string; // Or whatever identifier is needed to fetch stats
}

interface StatDetail {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface StatCategory {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  stats: StatDetail[];
}

// Placeholder data for stat categories
const statCategories: StatCategory[] = [
  {
    title: 'Leaderboard Rankings',
    icon: 'trophy-outline',
    stats: [
      { label: 'Overall Club Rank', value: '#5', trend: 'up' },
      { label: 'Workout Streak', value: '12 days', trend: 'neutral' },
      { label: 'Program Completion', value: '85%', trend: 'down' },
    ],
  },
  {
    title: 'Exercise Milestones',
    icon: 'barbell-outline',
    stats: [
      { label: 'Squat PR', value: '315 lbs', trend: 'up' },
      { label: 'Bench Press PR', value: '225 lbs', trend: 'up' },
      { label: 'Deadlift PR', value: '405 lbs', trend: 'neutral' },
    ],
  },
  {
    title: 'Workout Consistency',
    icon: 'checkmark-circle-outline',
    stats: [
      { label: 'Workouts This Month', value: '18', trend: 'up' },
      { label: 'Average Duration', value: '55 min', trend: 'neutral' },
      { label: 'Total Volume (Month)', value: '150,000 lbs', trend: 'up' },
    ],
  },
  {
    title: 'Program Progress',
    icon: 'trending-up-outline',
    stats: [
      { label: 'Current Program', value: 'Elite Strength Vol. 2' },
      { label: 'Weeks Completed', value: '6/12', trend: 'neutral' },
      { label: 'Next Milestone', value: 'Heavy Lifting Phase' },
    ],
  },
];

const TrendIcon: React.FC<{ trend?: 'up' | 'down' | 'neutral' }> = ({ trend }) => {
  if (trend === 'up') {
    return <Ionicons name="arrow-up-circle" size={20} color="#34C759" />;
  }
  if (trend === 'down') {
    return <Ionicons name="arrow-down-circle" size={20} color="#FF3B30" />;
  }
  return <Ionicons name="remove-circle-outline" size={20} color="#8E8E93" />;
};

const ProfileStatsTab: React.FC<ProfileStatsTabProps> = ({ userId }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {statCategories.map((category, index) => (
        <View key={`category-${category.title}-${index}`} style={styles.categoryContainer}>
          <View style={styles.categoryHeader}>
            <Ionicons name={category.icon} size={24} color="#0A84FF" />
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </View>
          {category.stats.map((stat, statIndex) => (
            <View key={`stat-${category.title}-${stat.label}-${statIndex}`} style={styles.statItem}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{stat.value}</Text>
                {stat.trend && <TrendIcon trend={stat.trend} />}
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 16,
  },
  categoryContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3A3A3C',
  },
  statLabel: {
    fontSize: 15,
    color: '#EBEBF599', // Apple secondary label color (iOS dark)
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
  },
});

export default ProfileStatsTab;