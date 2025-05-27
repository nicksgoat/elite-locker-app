import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileStatsScreen() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const statsData: {
    week: {
      workouts: number;
      totalTime: string;
      totalVolume: string;
      avgDuration: string;
      streak: number;
      calories: number;
    };
    month: {
      workouts: number;
      totalTime: string;
      totalVolume: string;
      avgDuration: string;
      streak: number;
      calories: number;
    };
    year: {
      workouts: number;
      totalTime: string;
      totalVolume: string;
      avgDuration: string;
      streak: number;
      calories: number;
    };
  } = {
    week: {
      workouts: 5,
      totalTime: '4h 32m',
      totalVolume: '12,450 lbs',
      avgDuration: '54m',
      streak: 7,
      calories: 2840,
    },
    month: {
      workouts: 18,
      totalTime: '16h 24m',
      totalVolume: '48,920 lbs',
      avgDuration: '55m',
      streak: 12,
      calories: 10680,
    },
    year: {
      workouts: 156,
      totalTime: '142h 18m',
      totalVolume: '425,680 lbs',
      avgDuration: '55m',
      streak: 45,
      calories: 89240,
    },
  };

  const achievements = [
    { id: 1, title: 'First Workout', description: 'Complete your first workout', earned: true, icon: 'trophy' },
    { id: 2, title: 'Week Warrior', description: 'Complete 7 workouts in a week', earned: true, icon: 'medal' },
    { id: 3, title: 'Consistency King', description: '30-day workout streak', earned: true, icon: 'flame' },
    { id: 4, title: 'Volume Master', description: 'Lift 100,000 lbs total', earned: false, icon: 'barbell' },
    { id: 5, title: 'Marathon Trainer', description: '100 hours of training', earned: true, icon: 'time' },
    { id: 6, title: 'Social Butterfly', description: 'Share 10 workouts', earned: false, icon: 'share' },
  ];

  const personalRecords = [
    { exercise: 'Bench Press', weight: '225 lbs', date: '2 weeks ago' },
    { exercise: 'Squat', weight: '315 lbs', date: '1 month ago' },
    { exercise: 'Deadlift', weight: '405 lbs', date: '3 weeks ago' },
    { exercise: 'Overhead Press', weight: '155 lbs', date: '1 week ago' },
  ];

  const currentStats = statsData[selectedPeriod];

  const StatCard = ({ title, value, subtitle, icon }: any) => (
    <BlurView intensity={20} tint="dark" style={styles.statCard}>
      <View style={styles.statCardHeader}>
        <Ionicons name={icon} size={20} color="#D3D3D3" />
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={styles.statCardValue}>{value}</Text>
      {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
    </BlurView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Stats</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <BlurView intensity={20} tint="dark" style={styles.periodSelector}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.periodButtons}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonSelected
                ]}
                onPress={() => {
                  setSelectedPeriod(period);
                  Haptics.selectionAsync();
                }}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextSelected
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Workouts"
            value={currentStats.workouts}
            icon="fitness"
          />
          <StatCard
            title="Total Time"
            value={currentStats.totalTime}
            icon="time"
          />
          <StatCard
            title="Total Volume"
            value={currentStats.totalVolume}
            icon="barbell"
          />
          <StatCard
            title="Avg Duration"
            value={currentStats.avgDuration}
            icon="stopwatch"
          />
          <StatCard
            title="Current Streak"
            value={`${currentStats.streak} days`}
            icon="flame"
          />
          <StatCard
            title="Calories Burned"
            value={currentStats.calories.toLocaleString()}
            icon="flash"
          />
        </View>

        {/* Personal Records */}
        <BlurView intensity={20} tint="dark" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {personalRecords.map((record, index) => (
            <View key={index} style={styles.recordItem}>
              <View style={styles.recordInfo}>
                <Text style={styles.recordExercise}>{record.exercise}</Text>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              <View style={styles.recordWeight}>
                <Text style={styles.recordWeightText}>{record.weight}</Text>
                <Ionicons name="trophy" size={16} color="#FFD700" />
              </View>
            </View>
          ))}
        </BlurView>

        {/* Achievements */}
        <BlurView intensity={20} tint="dark" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementProgress}>4/6 Earned</Text>
          </View>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementCardLocked
              ]}>
                <View style={[
                  styles.achievementIcon,
                  !achievement.earned && styles.achievementIconLocked
                ]}>
                  <Ionicons 
                    name={achievement.icon as any} 
                    size={24} 
                    color={achievement.earned ? "#FFD700" : "#8E8E93"} 
                  />
                </View>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </BlurView>

        {/* Progress Chart Placeholder */}
        <BlurView intensity={20} tint="dark" style={styles.section}>
          <Text style={styles.sectionTitle}>Progress Over Time</Text>
          <View style={styles.chartPlaceholder}>
            <LinearGradient
              colors={['#D3D3D3', 'rgba(211, 211, 211, 0.3)']}
              style={styles.chartGradient}
            />
            <Text style={styles.chartPlaceholderText}>
              Workout frequency and volume trends
            </Text>
          </View>
        </BlurView>
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  periodButtonSelected: {
    backgroundColor: '#D3D3D3',
    borderColor: '#D3D3D3',
  },
  periodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  periodButtonTextSelected: {
    color: '#000000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  statCardValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statCardSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  seeAllText: {
    color: '#D3D3D3',
    fontSize: 14,
    fontWeight: '500',
  },
  achievementProgress: {
    color: '#8E8E93',
    fontSize: 14,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  recordInfo: {
    flex: 1,
  },
  recordExercise: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  recordDate: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  recordWeight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordWeightText: {
    color: '#D3D3D3',
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: (width - 64) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#8E8E93',
  },
  achievementDescription: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  chartPlaceholder: {
    height: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chartGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  chartPlaceholderText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
}); 