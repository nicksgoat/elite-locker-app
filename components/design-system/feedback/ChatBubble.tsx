/**
 * Elite Locker Design System - ChatBubble Component
 * 
 * A component for displaying chat messages in a bubble format.
 */

import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Text } from '../primitives/Text';
import { useTheme } from '../ThemeProvider';

// Sender interface
export interface ChatSender {
  id: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
}

// Action button interface
export interface ChatActionButton {
  id: string;
  icon: string;
  label: string;
  color: string;
  onPress?: () => void;
}

// ChatBubble props
export interface ChatBubbleProps {
  id: string;
  type?: 'sent' | 'received';
  message: string;
  timestamp?: string;
  sender?: ChatSender;
  unread?: boolean;
  mediaUrl?: string;
  actionButtons?: ChatActionButton[];
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
}

const { width } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = width * 0.8;

/**
 * ChatBubble component
 * 
 * A component for displaying chat messages in a bubble format.
 * 
 * @example
 * ```tsx
 * <ChatBubble 
 *   id="1"
 *   type="sent"
 *   message="Hello, how are you?"
 *   timestamp="10:30 AM"
 *   onPress={() => console.log('Message pressed')}
 * />
 * ```
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({
  id,
  type = 'received',
  message,
  timestamp,
  sender,
  unread = false,
  mediaUrl,
  actionButtons,
  onPress,
  onLongPress,
  style,
}) => {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const isSent = type === 'sent';
  
  // Handle haptic feedback
  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  // Handle sender profile press
  const handleSenderProfilePress = () => {
    if (sender?.id) {
      handleHapticFeedback();
      router.push(`/profile/${sender.id}`);
    }
  };
  
  // Handle message press
  const handlePress = () => {
    if (onPress) {
      handleHapticFeedback();
      onPress();
    }
  };
  
  // Handle message long press
  const handleLongPress = () => {
    if (onLongPress) {
      handleHapticFeedback();
      onLongPress();
    }
  };
  
  return (
    <View style={[
      styles.container,
      isSent ? styles.sentContainer : styles.receivedContainer,
      style,
    ]}>
      {/* Sender avatar (only for received messages) */}
      {!isSent && sender?.avatar && (
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={handleSenderProfilePress}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: sender.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          {sender.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons 
                name="checkmark-circle" 
                size={12} 
                color={colors.palette.blue500} 
              />
            </View>
          )}
        </TouchableOpacity>
      )}
      
      <View style={styles.bubbleWrapper}>
        {/* Sender name (only for received messages) */}
        {!isSent && sender?.name && (
          <TouchableOpacity 
            onPress={handleSenderProfilePress}
            activeOpacity={0.8}
          >
            <Text 
              variant="bodySmall" 
              color="secondary" 
              style={styles.senderName}
            >
              {sender.name}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Message bubble */}
        <TouchableOpacity
          style={[
            styles.bubble,
            isSent ? {
              borderColor: colors.palette.blue500 + '4D', // 30% opacity
              backgroundColor: colors.palette.blue500 + '1A', // 10% opacity
            } : {
              borderColor: colors.palette.gray900 + '4D', // 30% opacity
              backgroundColor: colors.palette.gray900 + '99', // 60% opacity
            },
            unread && {
              borderColor: colors.palette.green500 + '66', // 40% opacity
            },
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.9}
        >
          <BlurView intensity={25} tint="dark" style={styles.blurContent}>
            {/* Media content if present */}
            {mediaUrl && (
              <Image
                source={{ uri: mediaUrl }}
                style={styles.media}
                contentFit="cover"
              />
            )}
            
            {/* Message text */}
            <Text variant="body" color="primary">
              {message}
            </Text>
            
            {/* Timestamp */}
            {timestamp && (
              <Text 
                variant="labelSmall" 
                color="secondary" 
                style={styles.timestamp}
              >
                {timestamp}
              </Text>
            )}
          </BlurView>
        </TouchableOpacity>
        
        {/* Action buttons */}
        {actionButtons && actionButtons.length > 0 && (
          <View style={styles.actionsContainer}>
            {actionButtons.map((button) => (
              <TouchableOpacity
                key={button.id}
                style={styles.actionButton}
                onPress={() => {
                  if (button.onPress) {
                    handleHapticFeedback();
                    button.onPress();
                  }
                }}
                activeOpacity={0.7}
              >
                <BlurView intensity={30} tint="dark" style={styles.actionButtonBlur}>
                  <Ionicons
                    name={button.icon as any}
                    size={16}
                    color={button.color}
                  />
                  <Text 
                    variant="labelSmall" 
                    style={[styles.actionButtonLabel, { color: button.color }]}
                  >
                    {button.label}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Unread indicator */}
        {unread && (
          <View style={[
            styles.unreadIndicator, 
            { backgroundColor: colors.palette.green500 }
          ]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sentContainer: {
    justifyContent: 'flex-end',
  },
  receivedContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginTop: 24, // Align with message bubble
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#000',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  bubbleWrapper: {
    maxWidth: MAX_BUBBLE_WIDTH,
    alignItems: 'flex-start',
  },
  senderName: {
    marginLeft: 12,
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  blurContent: {
    padding: 12,
  },
  media: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  timestamp: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 8,
  },
  actionButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionButtonLabel: {
    marginLeft: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 4,
    right: 4,
  },
});

export default ChatBubble;
