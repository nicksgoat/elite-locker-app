import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import IMessagePageWrapper from '../../../components/layout/iMessagePageWrapper';
import { feedService } from '../../../services/feedService';

interface PostDetailData {
  id: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
  club?: {
    id: string;
    name: string;
    profile_image_url?: string;
  };
  workout?: {
    id: string;
    title: string;
    duration?: number;
    total_volume?: number;
    personal_records?: number;
  };
  content?: string;
  image_urls?: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  is_liked?: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
  content: string;
  created_at: string;
  like_count: number;
  is_liked?: boolean;
}

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    if (!postId) return;

    try {
      setLoading(true);

      // Get the specific post using the dedicated getPost function
      const postData = await feedService.getPost(postId);

      // Transform the post data to our detail format
      const postDetail: PostDetailData = {
        id: postData.id,
        author: postData.author || {
          id: 'unknown',
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        },
        club: postData.club,
        workout: postData.workout,
        content: postData.content,
        image_urls: postData.image_urls,
        like_count: postData.like_count || 0,
        comment_count: postData.comment_count || 0,
        created_at: postData.created_at,
        is_liked: postData.is_liked || false
      };

      setPost(postDetail);

      // Load comments
      const postComments = await feedService.getComments(postId);
      setComments(postComments);
    } catch (error) {
      console.error('Error loading post details:', error);

      // Check if it's a "not found" error
      if (error.message?.includes('not found')) {
        Alert.alert('Post Not Found', 'This post may have been deleted or is no longer available.');
      } else {
        Alert.alert('Error', 'Failed to load post details. Please try again.');
      }

      // Set post to null so the error state is shown
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const wasLiked = post.is_liked;

      // Optimistic update
      setPost(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1
      } : null);

      // Call API
      if (wasLiked) {
        await feedService.unlikePost(post.id);
      } else {
        await feedService.likePost(post.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');

      // Revert optimistic update
      setPost(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        like_count: prev.is_liked ? prev.like_count + 1 : prev.like_count - 1
      } : null);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !post) return;

    try {
      setSubmittingComment(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      await feedService.addComment(post.id, commentText.trim());
      setCommentText('');

      // Reload comments
      const updatedComments = await feedService.getComments(post.id);
      setComments(updatedComments);

      // Update comment count
      setPost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUserPress = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/profile/${userId}`);
  };

  const handleClubPress = (clubId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/club/${clubId}`);
  };

  const handleWorkoutPress = (workoutId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/workout/detail/${workoutId}`);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <IMessagePageWrapper title="Post" subtitle="Loading...">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </IMessagePageWrapper>
    );
  }

  if (!post) {
    return (
      <IMessagePageWrapper title="Post" subtitle="Not found">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Post not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPostDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </IMessagePageWrapper>
    );
  }

  return (
    <IMessagePageWrapper
      title={post.author.full_name || post.author.username}
      subtitle="Post"
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Post Content */}
        <View style={styles.postContainer}>
          {/* Author Header */}
          <View style={styles.authorHeader}>
            <TouchableOpacity
              style={styles.authorInfo}
              onPress={() => handleUserPress(post.author.id)}
            >
              <Image
                source={{
                  uri: post.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.username)}&background=1C1C1E&color=FFFFFF`
                }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>
                  {post.author.full_name || post.author.username}
                </Text>
                {post.club && (
                  <TouchableOpacity onPress={() => handleClubPress(post.club!.id)}>
                    <Text style={styles.clubName}>in {post.club.name}</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.postTime}>{formatTimeAgo(post.created_at)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          {post.content && (
            <Text style={styles.postContent}>{post.content}</Text>
          )}

          {/* Post Images */}
          {post.image_urls && post.image_urls.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={styles.postImage}
              resizeMode="cover"
            />
          ))}

          {/* Workout Card */}
          {post.workout && (
            <TouchableOpacity
              style={styles.workoutCard}
              onPress={() => handleWorkoutPress(post.workout!.id)}
            >
              <BlurView intensity={20} tint="dark" style={styles.workoutCardBlur}>
                <View style={styles.workoutHeader}>
                  <Ionicons name="fitness" size={20} color="#0A84FF" />
                  <Text style={styles.workoutTitle}>{post.workout.title}</Text>
                </View>
                <View style={styles.workoutStats}>
                  {post.workout.duration && (
                    <Text style={styles.workoutStat}>
                      {Math.floor(post.workout.duration / 60)}min
                    </Text>
                  )}
                  {post.workout.total_volume && (
                    <Text style={styles.workoutStat}>
                      {post.workout.total_volume.toLocaleString()}lb
                    </Text>
                  )}
                  {post.workout.personal_records && post.workout.personal_records > 0 && (
                    <Text style={styles.workoutStat}>
                      {post.workout.personal_records} PR
                    </Text>
                  )}
                </View>
              </BlurView>
            </TouchableOpacity>
          )}

          {/* Post Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons
                name={post.is_liked ? "heart" : "heart-outline"}
                size={24}
                color={post.is_liked ? "#FF6B6B" : "#8E8E93"}
              />
              <Text style={[styles.actionText, post.is_liked && { color: '#FF6B6B' }]}>
                {post.like_count}
              </Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
              <Text style={styles.actionText}>{post.comment_count}</Text>
            </View>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={22} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>

          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#8E8E93"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                !commentText.trim() && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentContainer}>
              <TouchableOpacity onPress={() => handleUserPress(comment.author.id)}>
                <Image
                  source={{
                    uri: comment.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.username)}&background=1C1C1E&color=FFFFFF`
                  }}
                  style={styles.commentAvatar}
                />
              </TouchableOpacity>
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <TouchableOpacity onPress={() => handleUserPress(comment.author.id)}>
                    <Text style={styles.commentAuthor}>
                      {comment.author.full_name || comment.author.username}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.commentTime}>
                    {formatTimeAgo(comment.created_at)}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </IMessagePageWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  postContainer: {
    backgroundColor: '#1C1C1E',
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  authorHeader: {
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clubName: {
    fontSize: 14,
    color: '#0A84FF',
    marginTop: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  workoutCardBlur: {
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 12,
  },
  workoutStat: {
    fontSize: 14,
    color: '#8E8E93',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '600',
  },
  commentsSection: {
    margin: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    padding: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#333333',
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
});
