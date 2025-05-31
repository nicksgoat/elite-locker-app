import { Image as ExpoImage } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';

interface SmartImageProps {
  source: string | { uri: string } | number;
  style?: ViewStyle;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: React.ReactNode;
  transition?: number;
  cachePolicy?: 'memory' | 'disk' | 'memory-disk' | 'none';
  recyclingKey?: string;
}

/**
 * SmartImage component that handles both local and remote images
 * with loading states and error handling
 */
const SmartImage: React.FC<SmartImageProps> = ({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  transition = 300,
  cachePolicy = 'memory-disk',
  recyclingKey,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Convert source to appropriate format for expo-image
  const imageSource = typeof source === 'number'
    ? source // Required local asset (from require())
    : typeof source === 'string'
    ? {
        uri: source.startsWith('http')
          ? source
          : source.startsWith('file:') || source.startsWith('content:')
            ? source // Already a local file URI (from image picker)
            : `../../assets/images/${source}` // Relative path to assets
      }
    : source; // Already an object with uri

  // Handle image load success
  const handleLoadSuccess = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle image load error
  const handleLoadError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Show placeholder or loading indicator while loading
  if (isLoading || hasError) {
    return (
      <View style={[styles.container, style]}>
        {placeholder || (
          <View style={[styles.container, style, styles.placeholderContainer]}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        )}
      </View>
    );
  }

  // Render the image
  return (
    <ExpoImage
      source={imageSource}
      style={style}
      contentFit={contentFit}
      transition={transition}
      cachePolicy={cachePolicy}
      recyclingKey={recyclingKey}
      onLoad={handleLoadSuccess}
      onError={handleLoadError}
      // Add these props to improve loading behavior
      placeholder={{ color: '#1C1C1E' }}
      contentPosition="center"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholderContainer: {
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SmartImage;
