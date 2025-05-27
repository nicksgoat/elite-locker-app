import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

export default function MessagesScreen() {
  const router = useRouter();

  const conversations = [
    {
      id: 1,
      name: 'Alex Johnson',
      lastMessage: 'Great workout today! 💪',
      time: '2m ago',
      unread: true,
      avatar: null,
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      lastMessage: 'Thanks for the program recommendation',
      time: '1h ago',
      unread: false,
      avatar: null,
    },
    {
      id: 3,
      name: 'Elite Locker Team',
      lastMessage: 'Welcome to Elite Locker! 🎉',
      time: '2d ago',
      unread: false,
      avatar: null,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.composeButton}>
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {conversations.map((conversation) => (
          <BlurView key={conversation.id} intensity={20} tint="dark" style={styles.conversationCard}>
            <TouchableOpacity style={styles.conversationContent}>
              <View style={styles.avatarContainer}>
                {conversation.avatar ? (
                  <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color="#8E8E93" />
                  </View>
                )}
                {conversation.unread && <View style={styles.unreadIndicator} />}
              </View>
              
              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <Text style={styles.contactName}>{conversation.name}</Text>
                  <Text style={styles.messageTime}>{conversation.time}</Text>
                </View>
                <Text style={[
                  styles.lastMessage,
                  conversation.unread && styles.lastMessageUnread
                ]}>
                  {conversation.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          </BlurView>
        ))}

        {/* Empty State */}
        {conversations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>No Messages Yet</Text>
            <Text style={styles.emptyStateText}>
              Start a conversation with other Elite Locker members
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  composeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  conversationCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D3D3D3',
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  lastMessageUnread: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
}); 