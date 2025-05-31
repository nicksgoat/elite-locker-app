/**
 * Enhanced Feed Component - Simplified Version
 *
 * This component provides a basic feed experience for the Elite Locker app.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    View
} from 'react-native';

import { mockClubs, mockPosts, mockUsers } from '../../data/mockData';
import { Text } from '../design-system/primitives';
import ClubPostMessageBubble from '../ui/ClubPostMessageBubble';

interface EnhancedFeedComponentProps {
  clubIds?: string[];
  includeFollowing?: boolean;
  onPostPress?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  onClubPress?: (clubId: string) => void;
  style?: any;
}

// Simple feed item interface based on existing Post type
interface SimpleFeedItem {
  id: string;
  content: string;
  authorId: string;
  clubId?: string;
  imageUrls?: string[];
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  isLiked?: boolean;
}

const EnhancedFeedComponent: React.FC<EnhancedFeedComponentProps> = ({
  clubIds = [],
  includeFollowing = true,
  onPostPress,
  onUserPress,
  onClubPress,
  style,
}) => {
  // Simplified state management
  const [feedItems, setFeedItems] = useState<SimpleFeedItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadFeedData();
  }, [loadFeedData]);

  // Convert mock posts to simple feed items
  const loadFeedData = useCallback(() => {
    const simpleFeedItems: SimpleFeedItem[] = mockPosts.map(post => ({
      id: post.id,
      content: post.content,
      authorId: post.authorId,
      clubId: post.clubId,
      imageUrls: post.imageUrls,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      createdAt: post.createdAt,
      isLiked: post.isLiked
    }));
    setFeedItems(simpleFeedItems);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      loadFeedData();
      setIsRefreshing(false);
    }, 1000);
  }, [loadFeedData]);

  // Render feed item
  const renderFeedItem = useCallback(({ item }: { item: SimpleFeedItem }) => {
    const author = mockUsers.find(user => user.id === item.authorId);
    const club = item.clubId ? mockClubs.find(club => club.id === item.clubId) : null;

    return (
      <ClubPostMessageBubble
        id={item.id}
        clubId={item.clubId || ''}
        clubName={club?.name || 'Personal'}
        userName={author?.name || 'Unknown User'}
        userAvatar={author?.profileImageUrl}
        date={formatRelativeTime(item.createdAt.toISOString())}
        content={item.content}
        likes={item.likeCount}
        comments={item.commentCount}
        mediaUrl={item.imageUrls?.[0]}
      />
    );
  }, []);

  // Empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color="#666" />
      <Text style={styles.emptyTitle}>No posts yet</Text>
      <Text style={styles.emptySubtitle}>
        {clubIds.length > 0
          ? 'No posts in these clubs yet'
          : 'Follow some users or join clubs to see posts'
        }
      </Text>
    </View>
  ), [clubIds.length]);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#0A84FF"
            colors={['#0A84FF']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          feedItems.length === 0 && styles.emptyContentContainer
        ]}
      />
    </View>
  );
};

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  emptyContentContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default EnhancedFeedComponent;
