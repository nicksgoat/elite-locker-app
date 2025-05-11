import React, { useCallback, useContext } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ScrollContext } from '../../app/_layout';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

interface MainLayoutProps {
  children: React.ReactNode;
  scrollEnabled?: boolean;
  hasTabBar?: boolean;
  hasHeader?: boolean;
  noPadding?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  scrollEnabled = true,
  hasTabBar = true,
  hasHeader = true,
  noPadding = false,
}) => {
  // Get scroll handlers from context
  const { scrollHandler } = useContext(ScrollContext);

  // Create a safe scroll handler
  const safeScrollHandler = useCallback((event: any) => {
    if (!event || !event.nativeEvent || !event.nativeEvent.contentOffset) return;
    scrollHandler(event.nativeEvent);
  }, [scrollHandler]);

  return (
    <View style={styles.container}>
      {scrollEnabled ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            !noPadding && styles.scrollContent,
            hasTabBar && styles.scrollContentWithTabBar,
            hasHeader && styles.scrollContentWithHeader
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={safeScrollHandler}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[
          styles.content,
          !noPadding && styles.contentPadding,
          hasTabBar && styles.contentWithTabBar,
          hasHeader && styles.contentWithHeader
        ]}>
          {children}
        </View>
      )}
    </View>
  );
};

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 120 : 90;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 120 : 90;

// Calculate responsive padding based on screen size
const getResponsivePadding = () => {
  // For larger devices (iPad, larger iPhones), use proportional padding
  if (screenWidth >= 428) { // iPhone 13/14 Pro Max width
    return Math.max(20, Math.min(32, screenWidth * 0.06)); // 6% of screen width
  } else if (screenWidth >= 414) { // iPhone 11 Pro Max, 12 Pro Max
    return Math.max(16, Math.min(28, screenWidth * 0.055)); // 5.5% of screen width
  }
  // For smaller devices, use fixed padding
  return 16;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: getResponsivePadding(),
  },
  contentWithTabBar: {
    paddingBottom: TAB_BAR_HEIGHT, // Add padding for tab bar
  },
  contentWithHeader: {
    paddingTop: HEADER_HEIGHT, // Add padding for header
  },
  scrollContent: {
    padding: getResponsivePadding(),
  },
  scrollContentWithTabBar: {
    paddingBottom: TAB_BAR_HEIGHT + 20, // Extra padding for scrollable content
  },
  scrollContentWithHeader: {
    paddingTop: HEADER_HEIGHT, // Add padding for header
  },
});

export default MainLayout;