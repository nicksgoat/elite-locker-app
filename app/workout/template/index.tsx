import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

// Mock workout templates
const workoutTemplates = [
  {
    id: 't1',
    name: 'Push-Pull-Legs',
    level: 'Intermediate',
    description: 'A 3-day split focusing on pushing, pulling, and leg movements',
    exercises: 12,
    duration: 60,
    creator: 'Elite Locker',
    category: 'strength',
  },
  {
    id: 't2',
    name: '5x5 Strength',
    level: 'Beginner',
    description: 'Simple but effective strength program with compound movements',
    exercises: 5,
    duration: 45,
    creator: 'Elite Locker',
    category: 'strength',
  },
  {
    id: 't3',
    name: 'HIIT Circuit',
    level: 'Advanced',
    description: 'High-intensity interval training for maximum calorie burn',
    exercises: 8,
    duration: 30,
    creator: 'Elite Locker',
    category: 'hiit',
  },
  {
    id: 't4',
    name: 'Core Crusher',
    level: 'Intermediate',
    description: 'Focus on abs and core muscles for improved stability',
    exercises: 6,
    duration: 30,
    creator: 'Elite Locker',
    category: 'strength',
  },
  {
    id: 't5',
    name: 'Full Body Strength',
    level: 'Beginner',
    description: 'Complete full body workout with balanced movements',
    exercises: 10,
    duration: 60,
    creator: 'Elite Locker',
    category: 'strength',
  },
  {
    id: 't6',
    name: '30-Min Cardio',
    level: 'All Levels',
    description: 'Quick cardio routine for busy days',
    exercises: 5,
    duration: 30,
    creator: 'Elite Locker',
    category: 'cardio',
  },
];

// Function to get color for workout category
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'strength':
      return '#0A84FF';
    case 'cardio':
      return '#FF2D55';
    case 'hiit':
      return '#FF9500';
    default:
      return '#8E8E93';
  }
};

// Get template icon color based on workout name
const getTemplateIconColor = (name: string) => {
  if (name.toLowerCase().includes('leg') ||
      name.toLowerCase().includes('glute') ||
      name.toLowerCase().includes('hamstring')) {
    return '#FF3B30'; // Red
  } else if (name.toLowerCase().includes('pull') ||
      name.toLowerCase().includes('back')) {
    return '#007AFF'; // Blue
  } else if (name.toLowerCase().includes('push') ||
      name.toLowerCase().includes('chest')) {
    return '#5856D6'; // Purple
  } else if (name.toLowerCase().includes('cycle') ||
      name.toLowerCase().includes('cardio') ||
      name.toLowerCase().includes('hiit')) {
    return '#FF9500'; // Orange
  } else if (name.toLowerCase().includes('core') ||
      name.toLowerCase().includes('abs')) {
    return '#32D74B'; // Green
  }
  return '#8E8E93'; // Default gray
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
  } else {
    return `${mins} min`;
  }
};

interface TemplateItemProps {
  template: any;
  onPress: () => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.darkCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Card header with template name and icon */}
        <View style={styles.darkCardHeader}>
          <View style={[styles.workoutIcon, { backgroundColor: getTemplateIconColor(template.name) }]} />
          <Text style={styles.darkCardTitle}>{template.name}</Text>
        </View>
        
        {/* Level */}
        <Text style={styles.darkDateText}>{template.level}</Text>
        
        {/* Stats row - horizontal layout */}
        <View style={styles.darkStatsRow}>
          <View style={styles.darkStatItem}>
            <Ionicons name="barbell-outline" size={16} color="#A2A2A2" />
            <Text style={styles.darkStatValue}>{template.exercises} exercises</Text>
          </View>
          
          <View style={styles.darkStatItem}>
            <Ionicons name="time-outline" size={16} color="#A2A2A2" />
            <Text style={styles.darkStatValue}>{formatDuration(template.duration)}</Text>
          </View>
          
          <View style={styles.categoryTag}>
            <Text style={[styles.categoryText, { color: getCategoryColor(template.category) }]}>
              {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
            </Text>
          </View>
        </View>
        
        {/* Start button */}
        <View style={styles.darkActionRow}>
          <Text style={styles.descriptionText} numberOfLines={1}>
            {template.description}
          </Text>
          <View style={styles.darkStartContainer}>
            <Ionicons name="play-circle" size={16} color="#0A84FF" />
            <Text style={styles.darkStartText}>Start</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function TemplatesScreen() {
  const router = useRouter();

  const handleCreateTemplate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/workout/template/create' as any);
  };

  const handleTemplatePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/template/${id}` as any);
  };

  return (
    <IMessagePageWrapper 
      title=""
      subtitle=""
      showHeader={false}
    >
      <BlurView intensity={50} tint="dark" style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#0A84FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Templates</Text>
        <View style={styles.rightPlaceholder} />
      </BlurView>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateTemplate}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Template</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={workoutTemplates}
        renderItem={({ item }) => (
          <TemplateItem
            template={item}
            onPress={() => handleTemplatePress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  rightPlaceholder: {
    width: 40,
    height: 40,
  },
  actionsContainer: {
    padding: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  // Dark card styles
  darkCard: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#333333',
  },
  cardContent: {
    padding: 12,
  },
  darkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  workoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
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
  categoryTag: {
    marginLeft: 'auto',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  darkActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
    paddingTop: 12,
  },
  descriptionText: {
    fontSize: 13,
    color: '#8E8E93',
    flex: 1,
    marginRight: 8,
  },
  darkStartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkStartText: {
    fontSize: 14,
    color: '#0A84FF',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default TemplatesScreen; 