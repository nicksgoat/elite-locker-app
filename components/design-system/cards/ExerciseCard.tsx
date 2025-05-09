/**
 * Elite Locker Design System - ExerciseCard Component
 * 
 * A card component for displaying exercise information.
 */

import React from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// Exercise data interface
export interface ExerciseCardData {
  id: string;
  name: string;
  category?: string;
  tags?: string[];
  sets?: number;
  targetReps?: number;
  restTime?: number;
  isFavorite?: boolean;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

// ExerciseCard props
export interface ExerciseCardProps {
  exercise: ExerciseCardData;
  variant?: 'default' | 'row' | 'compact';
  onPress?: (exercise: ExerciseCardData) => void;
  onFavoriteToggle?: (exerciseId: string, isFavorite: boolean) => void;
}

/**
 * ExerciseCard component
 * 
 * A card component for displaying exercise information.
 * 
 * @example
 * ```tsx
 * <ExerciseCard 
 *   exercise={exerciseData} 
 *   onPress={(exercise) => console.log(`Exercise ${exercise.id} pressed`)} 
 * />
 * ```
 */
export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  variant = 'default',
  onPress,
  onFavoriteToggle,
}) => {
  const { colors, spacing } = useTheme();
  
  // Handle card press
  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(exercise);
    }
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (onFavoriteToggle) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFavoriteToggle(exercise.id, !exercise.isFavorite);
    }
  };
  
  // Determine which icon to show based on primary tag or category
  const getPrimaryIcon = () => {
    if (exercise.tags) {
      if (exercise.tags.includes('strength_training')) {
        return 'barbell-outline';
      }
      if (exercise.tags.includes('route_running')) {
        return 'football-outline';
      }
      if (exercise.tags.includes('plyometrics')) {
        return 'flash-outline';
      }
    }
    
    if (exercise.category) {
      switch (exercise.category) {
        case 'Chest':
          return 'fitness-outline';
        case 'Back':
          return 'body-outline';
        case 'Legs':
          return 'footsteps-outline';
        case 'Shoulders':
        case 'Arms':
          return 'barbell-outline';
        case 'Core':
          return 'ellipse-outline';
      }
    }
    
    return 'fitness-outline';
  };
  
  // Render row variant
  if (variant === 'row') {
    return (
      <TouchableOpacity
        style={styles.exerciseRow}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseIconContainer}>
          <Ionicons
            name={getPrimaryIcon()}
            size={20}
            color="#FFFFFF"
          />
        </View>
        
        <View style={styles.exerciseDetails}>
          <Text variant="bodySemiBold" color="inverse" numberOfLines={1}>
            {exercise.name}
          </Text>
          <View style={styles.exerciseMeta}>
            <Text variant="bodySmall" color="secondary">
              {exercise.sets || 0} sets • {exercise.targetReps || 0} reps • {exercise.restTime || 0}s rest
            </Text>
          </View>
        </View>
        
        {onFavoriteToggle && (
          <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoriteToggle}>
            <Ionicons
              name={exercise.isFavorite ? 'star' : 'star-outline'}
              size={22}
              color={exercise.isFavorite ? '#FF9F0A' : colors.icon.secondary}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }
  
  // Render compact variant
  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactExercise}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={getPrimaryIcon()}
          size={16}
          color={colors.icon.primary}
          style={styles.compactIcon}
        />
        <Text variant="body" color="primary" numberOfLines={1} style={styles.compactName}>
          {exercise.name}
        </Text>
        {exercise.isFavorite && (
          <Ionicons
            name="star"
            size={14}
            color="#FF9F0A"
            style={styles.compactStar}
          />
        )}
      </TouchableOpacity>
    );
  }
  
  // Render default variant
  return (
    <Card
      variant="blur"
      blurIntensity={15}
      blurTint="dark"
      style={styles.exerciseCard}
      onPress={handlePress}
    >
      <View style={styles.videoThumbnail}>
        <Ionicons name={getPrimaryIcon()} size={32} color="#FFFFFF" />
      </View>
      
      <View style={styles.cardContent}>
        <Text variant="bodySemiBold" color="inverse" numberOfLines={2} style={styles.exerciseName}>
          {exercise.name}
        </Text>
        
        {exercise.category && (
          <View style={styles.categoryBadge}>
            <Text variant="labelSmall" color="inverse">
              {exercise.category}
            </Text>
          </View>
        )}
        
        {onFavoriteToggle && (
          <TouchableOpacity 
            style={styles.cardFavoriteButton} 
            onPress={handleFavoriteToggle}
          >
            <Ionicons
              name={exercise.isFavorite ? 'star' : 'star-outline'}
              size={22}
              color={exercise.isFavorite ? '#FF9F0A' : colors.icon.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Default card styles
  exerciseCard: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoThumbnail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardContent: {
    padding: 12,
    position: 'relative',
  },
  exerciseName: {
    marginRight: 30, // Space for favorite button
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardFavoriteButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Row variant styles
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  
  // Compact variant styles
  compactExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  compactIcon: {
    marginRight: 8,
  },
  compactName: {
    flex: 1,
  },
  compactStar: {
    marginLeft: 8,
  },
});

export default ExerciseCard;
