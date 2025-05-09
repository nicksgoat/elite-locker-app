import React from 'react';
import { StyleSheet, View } from 'react-native';
import MessageFloatingActionButton from '../ui/MessageFloatingActionButton';
import BottomNavBar from './BottomNavBar';

interface AppLayoutProps {
  children: React.ReactNode;
  hideNavBar?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  hideNavBar = false
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>

      {!hideNavBar ? (
        <BottomNavBar />
      ) : (
        // Show the iMessage-style floating action button when nav bar is hidden
        <MessageFloatingActionButton />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    // Add bottom padding to prevent content from being hidden behind the nav bar
    paddingBottom: 65, // Adjust based on navbar height
  },
});

export default AppLayout;