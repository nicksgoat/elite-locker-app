/**
 * SpotifyBleedingLayout - Reusable Spotify-style bleeding effect layout
 * 
 * This component provides a consistent implementation of the Spotify-style
 * bleeding effect pattern used across marketplace category screens.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    ImageBackground,
    ImageSourcePropType,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SpotifyBleedingLayoutProps {
  // Required props
  categoryImage: ImageSourcePropType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBackPress: () => void;

  // Optional customization
  isLoading?: boolean;
  loadingColor?: string;
  headerHeight?: number;
  extendedHeight?: number;
  backgroundOpacity?: number;
  customHeaderContent?: React.ReactNode;
  scrollEnabled?: boolean;
  refreshControl?: React.ReactElement;
  
  // Style overrides
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
}

const SpotifyBleedingLayout: React.FC<SpotifyBleedingLayoutProps> = ({
  categoryImage,
  title,
  subtitle,
  children,
  onBackPress,
  isLoading = false,
  loadingColor = '#0A84FF',
  headerHeight = 200,
  extendedHeight = 800,
  backgroundOpacity = 0.7,
  customHeaderContent,
  scrollEnabled = true,
  refreshControl,
  containerStyle,
  contentStyle,
  headerStyle,
}) => {
  const insets = useSafeAreaInsets();

  // Default gradient configurations
  const extendedGradientColors = [
    'rgba(0,0,0,0)',
    'rgba(0,0,0,0.1)',
    'rgba(0,0,0,0.5)',
    'rgba(0,0,0,0.9)',
    'rgba(0,0,0,1)'
  ];
  const extendedGradientLocations = [0, 0.2, 0.4, 0.7, 1];
  const headerGradientColors = ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)'];

  // Dynamic styles based on props
  const dynamicStyles = StyleSheet.create({
    extendedBackground: {
      ...styles.extendedBackground,
      height: extendedHeight,
    },
    extendedBackgroundImage: {
      ...styles.extendedBackgroundImage,
      opacity: backgroundOpacity,
    },
    headerBackground: {
      ...styles.headerBackground,
      height: headerHeight,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, containerStyle]}>
        {/* Extended background image that bleeds down */}
        <View style={dynamicStyles.extendedBackground}>
          <ImageBackground
            source={categoryImage}
            style={dynamicStyles.extendedBackgroundImage}
            imageStyle={{ resizeMode: 'cover' }}
          />
          <LinearGradient
            colors={extendedGradientColors}
            locations={extendedGradientLocations}
            style={styles.extendedGradient}
          />
        </View>

        {/* Spotify-style Header with Background Image */}
        <View style={[styles.headerContainer, headerStyle]}>
          <ImageBackground
            source={categoryImage}
            style={dynamicStyles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <LinearGradient
              colors={headerGradientColors}
              style={styles.headerGradient}
            >
              <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={onBackPress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>{title}</Text>
                  <Text style={styles.headerSubtitle}>{subtitle}</Text>
                </View>
                {customHeaderContent}
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={loadingColor} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Extended background image that bleeds down */}
      <View style={dynamicStyles.extendedBackground}>
        <ImageBackground
          source={categoryImage}
          style={dynamicStyles.extendedBackgroundImage}
          imageStyle={{ resizeMode: 'cover' }}
        />
        <LinearGradient
          colors={extendedGradientColors}
          locations={extendedGradientLocations}
          style={styles.extendedGradient}
        />
      </View>

      {/* Spotify-style Header with Background Image */}
      <View style={[styles.headerContainer, headerStyle]}>
        <ImageBackground
          source={categoryImage}
          style={dynamicStyles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <LinearGradient
            colors={headerGradientColors}
            style={styles.headerGradient}
          >
            <View style={[styles.headerContent, { paddingTop: insets.top + 20 }]}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackPress}
                activeOpacity={0.8}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
              </View>
              {customHeaderContent}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <ScrollView
        style={[styles.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  extendedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  extendedBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  extendedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 2,
  },
  headerBackground: {
    width: '100%',
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
});

export default SpotifyBleedingLayout;
