import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

export default function WorkoutsScreen() {
  const router = useRouter();

  const handleWorkoutPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${id}` as any);
  };

  const handleCreateTemplate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/workout/template/create' as any);
  };

  return (
    <IMessagePageWrapper 
      title="Workouts" 
      subtitle="Track your fitness routine"
      showHeader={false}
    >
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/workout/active' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Start Workout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleCreateTemplate}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Create Template</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        <TouchableOpacity onPress={() => router.push('/workout/history' as any)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentWorkoutsContainer}>
        <WorkoutCard 
          title="Upper Body" 
          date="Today" 
          exercises={7} 
          duration={45 * 60} // 45 minutes in seconds
          id="1"
          onPress={handleWorkoutPress}
        />
        <WorkoutCard 
          title="Leg Day" 
          date="Yesterday" 
          exercises={6} 
          duration={50 * 60} // 50 minutes in seconds
          id="2"
          onPress={handleWorkoutPress}
        />
        <WorkoutCard 
          title="Core Focus" 
          date="2 days ago" 
          exercises={5} 
          duration={30 * 60} // 30 minutes in seconds
          id="3"
          onPress={handleWorkoutPress}
        />
      </ScrollView>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Templates</Text>
        <TouchableOpacity onPress={() => router.push('/workout/template' as any)}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesContainer}>
        <TemplateCard 
          title="Push-Pull-Legs" 
          exercises={12}
          id="t1"
          onPress={handleWorkoutPress}
        />
        <TemplateCard 
          title="5x5 Strength" 
          exercises={5}
          id="t2"
          onPress={handleWorkoutPress}
        />
        <TemplateCard 
          title="HIIT Circuit" 
          exercises={8}
          id="t3"
          onPress={handleWorkoutPress}
        />
      </ScrollView>
    </IMessagePageWrapper>
  );
}

interface WorkoutCardProps {
  title: string;
  date: string;
  exercises: number;
  duration: number; // seconds
  id: string;
  onPress: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ title, date, exercises, duration, id, onPress }) => {
  // Format duration for display (e.g. 47:13)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };

  // Get workout icon color based on workout name
  const getWorkoutIconColor = () => {
    if (title.toLowerCase().includes('leg') ||
        title.toLowerCase().includes('glute') ||
        title.toLowerCase().includes('hamstring')) {
      return '#FF3B30'; // Red
    } else if (title.toLowerCase().includes('pull') ||
        title.toLowerCase().includes('back')) {
      return '#007AFF'; // Blue
    } else if (title.toLowerCase().includes('push') ||
        title.toLowerCase().includes('chest') ||
        title.toLowerCase().includes('upper')) {
      return '#5856D6'; // Purple
    } else if (title.toLowerCase().includes('cycle') ||
        title.toLowerCase().includes('cardio') ||
        title.toLowerCase().includes('core')) {
      return '#FF9500'; // Orange
    }
    return '#FF3B30'; // Default red
  };

  return (
    <TouchableOpacity 
      style={styles.darkCard}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Card header with workout name and icon */}
        <View style={styles.darkCardHeader}>
          <View style={[styles.workoutIcon, { backgroundColor: getWorkoutIconColor() }]} />
          <Text style={styles.darkCardTitle}>{title}</Text>
        </View>
        
        {/* Date below title */}
        <Text style={styles.darkDateText}>{date}</Text>
        
        {/* Stats row - horizontal layout */}
        <View style={styles.darkStatsRow}>
          <View style={styles.darkStatItem}>
            <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
            <Text style={styles.darkStatValue}>{exercises} exercises</Text>
          </View>
          
          <View style={styles.darkStatItem}>
            <Ionicons name="time-outline" size={16} color="#A2A2A2" />
            <Text style={styles.darkStatValue}>{formatDuration(duration)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface TemplateCardProps {
  title: string;
  exercises: number;
  id: string;
  onPress: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ title, exercises, id, onPress }) => {
  // Get template icon color based on workout name
  const getTemplateIconColor = () => {
    if (title.toLowerCase().includes('push-pull-legs') || 
        title.toLowerCase().includes('ppl')) {
      return '#5856D6'; // Purple
    } else if (title.toLowerCase().includes('strength') ||
              title.toLowerCase().includes('5x5')) {
      return '#007AFF'; // Blue
    } else if (title.toLowerCase().includes('hiit') ||
              title.toLowerCase().includes('circuit') ||
              title.toLowerCase().includes('cardio')) {
      return '#FF9500'; // Orange  
    }
    return '#32D74B'; // Green default for templates
  };

  return (
    <TouchableOpacity 
      style={styles.darkCard}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Card header with template name and icon */}
        <View style={styles.darkCardHeader}>
          <View style={[styles.workoutIcon, { backgroundColor: getTemplateIconColor() }]} />
          <Text style={styles.darkCardTitle}>{title}</Text>
        </View>
        
        {/* Stats row with exercises and start button */}
        <View style={styles.darkStatsRow}>
          <View style={styles.darkStatItem}>
            <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
            <Text style={styles.darkStatValue}>{exercises} exercises</Text>
          </View>
          
          <View style={styles.darkStartContainer}>
            <Ionicons name="play-circle" size={16} color="#0A84FF" />
            <Text style={styles.darkStartText}>Start</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 24,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '500',
  },
  recentWorkoutsContainer: {
    marginBottom: 24,
  },
  templatesContainer: {
    marginBottom: 24,
  },
  cardContent: {
    padding: 12,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  
  // Dark card styles
  darkCard: {
    width: 240,
    marginRight: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  darkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  darkCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  darkDateText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  darkStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  darkStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  darkStatValue: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  darkStartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  darkStartText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
    marginLeft: 4,
  },
}); 