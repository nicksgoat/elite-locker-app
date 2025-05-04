import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Platform, SafeAreaView } from 'react-native';

interface MainLayoutProps {
  children: ReactNode;
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

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 70; 

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
    paddingTop: 16, // Add some padding because the header already pushes content down
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: TAB_BAR_HEIGHT + 20, // Extra padding for scrollable content
  },
  scrollContentWithHeader: {
    paddingTop: 16, // Add some padding because the header already pushes content down
  },
});

export default MainLayout; 