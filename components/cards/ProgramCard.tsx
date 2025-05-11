import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define program card props
export type ProgramCardProps = {
  id: string;
  title: string;
  description?: string;
  authorName: string;
  authorImageUrl?: string;
  imageUrl?: string;
  duration?: number; // in weeks
  workoutCount?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  onPress?: () => void;
};

/**
 * A robust card component for displaying program information
 * Uses hardcoded styles with fallbacks for maximum stability
 */
export default function ProgramCard({
  title,
  description,
  authorName,
  authorImageUrl,
  imageUrl,
  duration,
  workoutCount,
  level,
  price,
  onPress,
}: ProgramCardProps) {
  // Helper to get level color
  const getLevelColor = (level?: string): string => {
    switch (level) {
      case 'beginner':
        return '#30D158'; // Green
      case 'intermediate':
        return '#0A84FF'; // Blue
      case 'advanced':
        return '#FF3B30'; // Red
      default:
        return '#0A84FF'; // Default blue
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="calendar-outline" size={40} color="#FFFFFF" />
          </View>
        )}
        
        {/* Overlay gradient would go here in a production app */}
        <View style={styles.imageOverlay} />
        
        {level && (
          <View style={[styles.levelBadge, { backgroundColor: `${getLevelColor(level)}30` }]}>
            <Text style={[styles.levelText, { color: getLevelColor(level) }]}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.authorContainer}>
            {authorImageUrl ? (
              <Image 
                source={{ uri: authorImageUrl }} 
                style={styles.authorImage}
              />
            ) : (
              <View style={styles.authorImagePlaceholder}>
                <Text style={styles.authorInitial}>
                  {authorName.charAt(0)}
                </Text>
              </View>
            )}
            <Text style={styles.authorName}>{authorName}</Text>
          </View>
          
          <View style={styles.stats}>
            {workoutCount !== undefined && (
              <View style={styles.stat}>
                <Ionicons 
                  name="barbell-outline" 
                  size={14} 
                  color="#9BA1A6" 
                />
                <Text style={styles.statText}>
                  {workoutCount} {workoutCount === 1 ? 'workout' : 'workouts'}
                </Text>
              </View>
            )}
            
            {duration !== undefined && (
              <View style={styles.stat}>
                <Ionicons 
                  name="calendar-outline" 
                  size={14} 
                  color="#9BA1A6" 
                />
                <Text style={styles.statText}>
                  {duration} {duration === 1 ? 'week' : 'weeks'}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {price !== undefined && (
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              ${price.toFixed(2)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Hardcoded styles for maximum stability
const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.7)', // Dark, semi-transparent
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Slight white border for glassmorphism
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Dark overlay for better text readability
  },
  levelBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    color: '#9BA1A6',
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorImagePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  authorInitial: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  authorName: {
    color: '#9BA1A6',
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    color: '#9BA1A6',
    fontSize: 12,
    marginLeft: 4,
  },
  priceTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(10, 132, 255, 0.9)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 