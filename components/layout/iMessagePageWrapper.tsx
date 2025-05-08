import React from 'react';
import { View, StyleSheet } from 'react-native';
import MessageFeedLayout from './MessageFeedLayout';

interface iMessagePageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showComposeArea?: boolean;
  showHeader?: boolean;
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
  showHeader = true
}) => {
  return (
    <MessageFeedLayout
      title={title || 'Messages'}
      subtitle={subtitle}
      showComposeArea={showComposeArea}
      showHeader={showHeader}
    >
      <View style={styles.content}>
        {children}
      </View>
    </MessageFeedLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 12,
  }
});

export default iMessagePageWrapper; 