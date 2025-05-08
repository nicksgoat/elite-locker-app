import React, { useContext, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Platform, SafeAreaView } from 'react-native';
import { ScrollContext } from '../../app/_layout';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
  },
  contentWithTabBar: {
    paddingBottom: TAB_BAR_HEIGHT, // Add padding for tab bar
  },
  contentWithHeader: {
    paddingTop: HEADER_HEIGHT, // Add padding for header
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: TAB_BAR_HEIGHT + 20, // Extra padding for scrollable content
  },
  scrollContentWithHeader: {
    paddingTop: HEADER_HEIGHT, // Add padding for header
  },
});

export default MainLayout; 