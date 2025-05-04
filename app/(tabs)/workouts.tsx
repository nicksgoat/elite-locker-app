import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MainLayout from '@/components/layout/MainLayout';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

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
    <MainLayout hasTabBar={true} hasHeader={true}>
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>My Workouts</Text>
        <Text style={styles.headerSubtitle}>Track and manage your fitness routine</Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/workout/start' as any)}
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
          duration="45 min"
          id="1"
          onPress={handleWorkoutPress}
        />
        <WorkoutCard 
          title="Leg Day" 
          date="Yesterday" 
          exercises={6} 
          duration="50 min"
          id="2"
          onPress={handleWorkoutPress}
        />
        <WorkoutCard 
          title="Core Focus" 
          date="2 days ago" 
          exercises={5} 
          duration="30 min"
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
      
      <View style={styles.templatesContainer}>
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
      </View>
    </MainLayout>
  );
}

interface WorkoutCardProps {
  title: string;
  date: string;
  exercises: number;
  duration: string;
  id: string;
  onPress: (id: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ title, date, exercises, duration, id, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.workoutCard}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <BlurView intensity={25} tint="dark" style={styles.cardBlur}>
        <Text style={styles.workoutTitle}>{title}</Text>
        <Text style={styles.workoutDate}>{date}</Text>
        <View style={styles.workoutDetails}>
          <View style={styles.workoutDetail}>
            <Ionicons name="barbell-outline" size={14} color="#8E8E93" />
            <Text style={styles.workoutDetailText}>{exercises} exercises</Text>
          </View>
          <View style={styles.workoutDetail}>
            <Ionicons name="time-outline" size={14} color="#8E8E93" />
            <Text style={styles.workoutDetailText}>{duration}</Text>
          </View>
        </View>
      </BlurView>
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
  return (
    <TouchableOpacity 
      style={styles.templateCard}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
    >
      <BlurView intensity={25} tint="dark" style={styles.cardBlur}>
        <View style={styles.templateIconContainer}>
          <Ionicons name="copy-outline" size={18} color="#0A84FF" />
        </View>
        <Text style={styles.templateTitle}>{title}</Text>
        <Text style={styles.templateExercises}>{exercises} exercises</Text>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
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
  workoutCard: {
    width: 200,
    height: 140,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardBlur: {
    flex: 1,
    padding: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  workoutDetails: {
    flexDirection: 'column',
    gap: 6,
  },
  workoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDetailText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  templatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  templateCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  templateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  templateExercises: {
    fontSize: 14,
    color: '#8E8E93',
  },
}); 