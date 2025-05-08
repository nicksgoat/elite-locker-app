import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

interface ChatBubbleProps {
  id: string;
  type?: 'sent' | 'received';
  message: string;
  timestamp?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    isVerified?: boolean;
  };
  unread?: boolean;
  mediaUrl?: string;
  actionButtons?: Array<{
    id: string;
    icon: string;
    label: string;
    color: string;
    onPress?: () => void;
  }>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const { width } = Dimensions.get('window');
const MAX_BUBBLE_WIDTH = width * 0.8;

const ChatBubble: React.FC<ChatBubbleProps> = ({
  id,
  type = 'received',
  message,
  timestamp,
  sender,
  unread = false,
  mediaUrl,
  actionButtons,
  onPress,
  onLongPress
}) => {
  const router = useRouter();
  const isSent = type === 'sent';
  
  const handleSenderProfilePress = () => {
    if (sender?.id) {
      router.push(`/profile/${sender.id}`);
    }
  };
  
  return (
    <View style={[
      styles.container,
      isSent ? styles.sentContainer : styles.receivedContainer
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
              <Ionicons name="checkmark-circle" size={12} color="#0A84FF" />
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
            <Text style={styles.senderName}>{sender.name}</Text>
          </TouchableOpacity>
        )}
        
        {/* Message bubble */}
        <TouchableOpacity
          style={[
            styles.bubble,
            isSent ? styles.sentBubble : styles.receivedBubble,
            unread && styles.unreadBubble
          ]}
          onPress={onPress}
          onLongPress={onLongPress}
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
            <Text style={styles.message}>{message}</Text>
            
            {/* Timestamp */}
            {timestamp && (
              <Text style={styles.timestamp}>{timestamp}</Text>
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
                onPress={button.onPress}
                activeOpacity={0.7}
              >
                <BlurView intensity={30} tint="dark" style={styles.actionButtonBlur}>
                  <Ionicons
                    name={button.icon as any}
                    size={16}
                    color={button.color}
                  />
                  <Text style={[styles.actionButtonLabel, { color: button.color }]}>
                    {button.label}
                  </Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Unread indicator */}
        {unread && (
          <View style={styles.unreadIndicator} />
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
    color: '#8E8E93',
    fontSize: 12,
    marginLeft: 12,
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  sentBubble: {
    borderColor: 'rgba(10, 132, 255, 0.3)',
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
  },
  receivedBubble: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(58, 58, 60, 0.6)',
  },
  unreadBubble: {
    borderColor: 'rgba(52, 199, 89, 0.4)',
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
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    color: '#8E8E93',
    fontSize: 11,
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
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    position: 'absolute',
    top: 4,
    right: 4,
  },
});

export default ChatBubble; 