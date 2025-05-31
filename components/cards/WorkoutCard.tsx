import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define workout type
export type WorkoutCardProps = {
  id: string;
  title: string;
  description?: string;
  authorName: string;
  authorImageUrl?: string;
  imageUrl?: string;
  duration?: number;
  exerciseCount?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  dateCreated?: Date;
  price?: number;
  onPress?: () => void;
};

/**
 * A robust card component for displaying workout information
 * Uses hardcoded styles with fallbacks for maximum stability
 */
export default function WorkoutCard({
  title,
  description,
  authorName,
  authorImageUrl,
  imageUrl,
  duration,
  exerciseCount,
  level,
  dateCreated,
  price,
  onPress,
}: WorkoutCardProps) {
  // Safe formatter function that doesn't rely on external dependencies
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    try {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Recent';
    }
  };

  // Format time duration
  const formatDuration = (minutes?: number): string => {
    if (!minutes) return '';
    try {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    } catch (e) {
      return '';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="barbell-outline" size={24} color="#FFFFFF" />
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            {level && (
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </View>
            )}
            {dateCreated && (
              <Text style={styles.date}>{formatDate(dateCreated)}</Text>
            )}
          </View>

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
              {duration !== undefined && (
                <View style={styles.stat}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="#9BA1A6"
                  />
                  <Text style={styles.statText}>
                    {formatDuration(duration)}
                  </Text>
                </View>
              )}

              {exerciseCount !== undefined && (
                <View style={styles.stat}>
                  <Ionicons
                    name="barbell-outline"
                    size={14}
                    color="#9BA1A6"
                  />
                  <Text style={styles.statText}>
                    {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {price !== undefined && price !== null && (
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>
                ${price.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Hardcoded styles for maximum stability
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(28, 28, 30, 0.7)', // Dark, semi-transparent
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Slight white border for glassmorphism
  },
  cardContent: {
    flexDirection: 'row',
  },
  image: {
    width: 100,
    height: 120,
    backgroundColor: '#2C2C2E',
  },
  imagePlaceholder: {
    width: 100,
    height: 120,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  levelText: {
    color: '#0A84FF',
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    color: '#9BA1A6',
    fontSize: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#9BA1A6',
    fontSize: 13,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
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
    top: 12,
    right: 12,
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