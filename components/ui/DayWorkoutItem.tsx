import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface DayWorkoutItemProps {
  id: string;
  day: number;
  title: string;
  type?: string;
  image?: string;
  onPress?: () => void;
}

export default function DayWorkoutItem({
  id,
  day,
  title,
  type = 'Workout',
  image,
  onPress
}: DayWorkoutItemProps) {
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      // Navigate to workout detail
      router.push(`/workout/detail/${id}`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.dayIndicator}>
        <View style={styles.dayDot} />
        <Text style={styles.dayText}>Day {day}</Text>
      </View>
      
      <View style={styles.workoutCard}>
        {image && (
          <Image 
            source={{ uri: image }} 
            style={styles.workoutImage}
            contentFit="cover"
          />
        )}
        
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutTitle}>{title}</Text>
          <Text style={styles.workoutType}>{type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dayIndicator: {
    alignItems: 'center',
    width: 50,
    marginRight: 12,
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutImage: {
    width: 80,
    height: 80,
  },
  workoutInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutType: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
