import React from 'react';
import { StyleSheet, View } from 'react-native';
import MessageFeedLayout from './MessageFeedLayout';

interface iMessagePageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showComposeArea?: boolean;
  showHeader?: boolean;
  fullWidth?: boolean; // New prop to allow full width content
}

/**
 * A wrapper component to ensure consistent iMessage-style experience
 * across all pages in the app
 */
const iMessagePageWrapper: React.FC<iMessagePageWrapperProps> = ({
  children,
  title,
  subtitle,
  showComposeArea = false,
  showHeader = true,
  fullWidth = false
}) => {
  // Calculate responsive padding
  let horizontalPadding = 16; // Default padding for smaller screens

  // For larger devices (iPad, larger iPhones), use proportional padding
  const { width: screenWidth } = require('react-native').Dimensions.get('window');
  if (screenWidth >= 428) { // iPhone 13/14 Pro Max width
    horizontalPadding = Math.max(20, Math.min(32, screenWidth * 0.06)); // 6% of screen width
  } else if (screenWidth >= 414) { // iPhone 11 Pro Max, 12 Pro Max
    horizontalPadding = Math.max(16, Math.min(28, screenWidth * 0.055)); // 5.5% of screen width
  }

  return (
    <MessageFeedLayout
      title={title || 'Messages'}
      subtitle={subtitle}
      showComposeArea={showComposeArea}
      showHeader={showHeader}
    >
      <View style={[
        styles.content,
        { paddingHorizontal: fullWidth ? 0 : horizontalPadding }
      ]}>
        {children}
      </View>
    </MessageFeedLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  }
});

export default iMessagePageWrapper;