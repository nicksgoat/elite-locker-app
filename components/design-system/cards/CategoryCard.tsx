import { Text } from '@/components/design-system/primitives';
import { useTheme } from '@/components/design-system/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';

export interface CategoryCardProps {
  id: string;
  title: string;
  color: string;
  gradientColors?: string[];
  icon?: keyof typeof Ionicons.glyphMap;
  imageUrl?: string;
  onPress: (id: string) => void;
}

/**
 * CategoryCard component
 *
 * A card component for displaying workout/program categories in a Spotify-like grid.
 *
 * @example
 * ```tsx
 * <CategoryCard
 *   id="strength"
 *   title="Strength Training"
 *   color="#0A84FF"
 *   icon="barbell-outline"
 *   onPress={(id) => console.log(`Category ${id} pressed`)}
 * />
 * ```
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  title,
  color,
  gradientColors,
  icon,
  imageUrl,
  onPress,
}) => {
  const { spacing, colors } = useTheme();

  // Default gradient colors based on the primary color
  const defaultGradientColors = [
    color,
    adjustColorBrightness(color, -0.3), // Darker version of the color
  ];

  const finalGradientColors = gradientColors || defaultGradientColors;

  const handlePress = () => {
    onPress(id);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.card}
          imageStyle={styles.cardImage}
        >
          <LinearGradient
            colors={finalGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, styles.imageGradient]}
          >
            <Text variant="bodySemiBold" color="inverse" style={styles.title}>{title}</Text>
            {icon && (
              <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon} size={20} color="#FFFFFF" />
              </View>
            )}
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient
          colors={finalGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text variant="bodySemiBold" color="inverse" style={styles.title}>{title}</Text>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Ionicons name={icon} size={20} color="#FFFFFF" />
            </View>
          )}
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number) {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  r = Math.min(255, Math.max(0, Math.round(r + (r * percent))));
  g = Math.min(255, Math.max(0, Math.round(g + (g * percent))));
  b = Math.min(255, Math.max(0, Math.round(b + (b * percent))));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
    borderRadius: 8,
    overflow: 'hidden',
    height: 100,
  },
  card: {
    width: '100%',
    height: '100%',
  },
  cardImage: {
    borderRadius: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  imageGradient: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  title: {
    maxWidth: '80%',
  },
  iconContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default CategoryCard;
