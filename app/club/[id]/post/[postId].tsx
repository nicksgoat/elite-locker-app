import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  TextInput,
  Keyboard
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import IMessagePageWrapper from '@/components/layout/iMessagePageWrapper';

// Types for the post detail interface
interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
  depth: number;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  timestamp: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  images?: string[];
  isStickied?: boolean;
  tags?: string[];
  videoUrl?: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
  comments: Comment[];
}

// Mock data for the post
const mockPostData: Post = {
  id: 'p2',
  title: 'Form Check: My 40-yard dash technique',
  content: 'I\'ve been working on my start position and first 10 yards. Would appreciate some feedback on my form!\n\nI\'ve been focusing on my drive phase angle and staying low through the first 10 yards, but I feel like I\'m still popping up too early. Coach suggested I need to be more patient and gradually rise instead of suddenly standing upright.\n\nAlso trying to improve my arm action - does it look efficient? Any drills you\'d recommend to help with this?',
  author: {
    name: 'SpeedSeeker23',
    avatar: 'https://i.pravatar.cc/150?img=12',
    isVerified: false
  },
  timestamp: '2023-05-12T09:45:00Z',
  upvotes: 28,
  downvotes: 2,
  commentCount: 8,
  videoUrl: 'https://example.com/video/dash.mp4',
  images: ['https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
  tags: ['Form Check', 'Sprint'],
  isUpvoted: true,
  comments: [
    {
      id: 'c1',
      author: {
        name: 'Coach Mike Johnson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        isVerified: true
      },
      content: 'Good start overall! I can see the work you\'ve put in. You\'re right that you\'re rising too quickly - try to maintain that forward lean through the first 10-15 yards. \n\nFor your arm action, focus on driving your elbows back more aggressively. I recommend doing some isolated arm action drills against a wall.',
      timestamp: '2023-05-12T10:15:00Z',
      upvotes: 12,
      downvotes: 0,
      depth: 0,
      isUpvoted: true
    },
    {
      id: 'c2',
      author: {
        name: 'TrackStar',
        avatar: 'https://i.pravatar.cc/150?img=23',
        isVerified: false
      },
      content: 'Try filming from the side next time too - it would be easier to see your body angle that way. But from what I can see, your first step looks good!',
      timestamp: '2023-05-12T11:30:00Z',
      upvotes: 5,
      downvotes: 0,
      depth: 0
    },
    {
      id: 'c3',
      author: {
        name: 'SprintCoach92',
        avatar: 'https://i.pravatar.cc/150?img=42',
        isVerified: false
      },
      content: 'Your starting position looks solid. One thing to work on: your first step seems to be slightly too long which is causing you to bounce a bit. Try focusing on a shorter, more powerful first step.',
      timestamp: '2023-05-12T13:45:00Z',
      upvotes: 8,
      downvotes: 1,
      depth: 0,
      replies: [
        {
          id: 'c3r1',
          author: {
            name: 'SpeedSeeker23',
            avatar: 'https://i.pravatar.cc/150?img=12',
            isVerified: false
          },
          content: 'Thanks for pointing that out! Do you have any drills you recommend for working on a shorter first step?',
          timestamp: '2023-05-12T14:20:00Z',
          upvotes: 2,
          downvotes: 0,
          depth: 1
        },
        {
          id: 'c3r2',
          author: {
            name: 'SprintCoach92',
            avatar: 'https://i.pravatar.cc/150?img=42',
            isVerified: false
          },
          content: 'Try doing some 3-point starts with a focus on stepping down rather than out. Also, place a marker about 12-15 inches in front of your starting position and try to hit that point with your first step.',
          timestamp: '2023-05-12T15:05:00Z',
          upvotes: 4,
          downvotes: 0,
          depth: 1
        }
      ]
    },
    {
      id: 'c4',
      author: {
        name: 'SpeedDemon',
        avatar: 'https://i.pravatar.cc/150?img=33',
        isVerified: false
      },
      content: 'What kind of surface are you running on? Looks like turf which could be affecting your grip. Have you tried different footwear?',
      timestamp: '2023-05-12T16:10:00Z',
      upvotes: 3,
      downvotes: 0,
      depth: 0
    }
  ]
};

// Format relative time like Reddit
const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  
  // Convert to minutes, hours, days
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    // Format as MM/DD/YYYY
    return date.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
  }
};

export default function PostDetailScreen() {
  const { id, postId } = useLocalSearchParams();
  const router = useRouter();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // In a real app, we'd fetch post data based on the postId
  const post = mockPostData;
  
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  const handleVote = (type: 'post' | 'comment', id: string, isUpvote: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // This would update the vote count in a real app
  };
  
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // This would submit the comment in a real app
    setCommentText('');
    setReplyingTo(null);
    Keyboard.dismiss();
  };

  const handleReply = (commentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };
  
  const renderComment = (comment: Comment) => {
    const isReplying = replyingTo === comment.id;
    
    return (
      <View 
        key={comment.id} 
        style={[
          styles.commentContainer,
          { marginLeft: comment.depth * 16 }
        ]}
      >
        <View style={styles.commentHeader}>
          <Image source={{ uri: comment.author.avatar }} style={styles.commentAuthorAvatar} contentFit="cover" />
          <Text style={styles.commentAuthor}>
            {comment.author.name}
            {comment.author.isVerified && 
              <Ionicons name="checkmark-circle" size={14} color="#0A84FF" style={{ marginLeft: 4 }} />
            }
          </Text>
          <Text style={styles.commentTime}>{formatRelativeTime(comment.timestamp)}</Text>
        </View>
        
        <Text style={styles.commentContent}>{comment.content}</Text>
        
        <View style={styles.commentActions}>
          <View style={styles.voteContainer}>
            <TouchableOpacity 
              style={styles.voteButton}
              onPress={() => handleVote('comment', comment.id, true)}
            >
              <Ionicons 
                name={comment.isUpvoted ? "arrow-up-circle" : "arrow-up-circle-outline"} 
                size={18} 
                color={comment.isUpvoted ? "#FF6B3D" : "#A0A0A0"} 
              />
            </TouchableOpacity>
            <Text style={styles.voteCount}>{comment.upvotes - comment.downvotes}</Text>
            <TouchableOpacity 
              style={styles.voteButton}
              onPress={() => handleVote('comment', comment.id, false)}
            >
              <Ionicons 
                name={comment.isDownvoted ? "arrow-down-circle" : "arrow-down-circle-outline"} 
                size={18} 
                color={comment.isDownvoted ? "#9575CD" : "#A0A0A0"} 
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.commentButton, isReplying && styles.activeCommentButton]}
            onPress={() => handleReply(comment.id)}
          >
            <Ionicons 
              name="chatbubble-outline" 
              size={16} 
              color={isReplying ? "#0A84FF" : "#A0A0A0"} 
            />
            <Text style={[styles.replyText, isReplying && styles.activeReplyText]}>
              {isReplying ? "Cancel" : "Reply"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.commentButton}>
            <Ionicons name="share-outline" size={16} color="#A0A0A0" />
            <Text style={styles.replyText}>Share</Text>
          </TouchableOpacity>
        </View>
        
        {/* Reply Input */}
        {isReplying && (
          <View style={styles.replyInputContainer}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=7' }} 
              style={styles.userAvatar} 
              contentFit="cover"
            />
            <TextInput 
              style={styles.replyInput}
              placeholder={`Reply to ${comment.author.name}...`}
              placeholderTextColor="#A0A0A0"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
            />
            <TouchableOpacity 
              style={[
                styles.postCommentButton,
                !commentText.trim() && styles.postCommentButtonDisabled
              ]}
              onPress={handleSubmitComment}
              disabled={!commentText.trim()}
            >
              <Ionicons 
                name="send" 
                size={18} 
                color={commentText.trim() ? "#FFFFFF" : "#666666"} 
              />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Render nested replies */}
        {comment.replies?.map(reply => renderComment(reply))}
      </View>
    );
  };
  
  return (
    <IMessagePageWrapper 
      title={`${post.author.name}'s Post`}
      subtitle={post.title.length > 25 ? post.title.substring(0, 25) + '...' : post.title}
    >
      {/* Post Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.postContainer}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            {post.isStickied && (
              <View style={styles.stickiedBadge}>
                <Ionicons name="pin" size={12} color="#FFFFFF" />
                <Text style={styles.stickiedText}>Stickied post</Text>
              </View>
            )}
            <View style={styles.postMeta}>
              <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} contentFit="cover" />
              <Text style={styles.postAuthor}>
                {post.author.name}
                {post.author.isVerified && 
                  <Ionicons name="checkmark-circle" size={14} color="#0A84FF" />
                }
              </Text>
              <Text style={styles.postTime}>{formatRelativeTime(post.timestamp)}</Text>
            </View>
            {post.tags && post.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {post.tags.map((tag, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          {/* Post Title & Content */}
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          
          {/* Post Images */}
          {post.images && post.images.map((image, index) => (
            <Image 
              key={index}
              source={{ uri: image }} 
              style={styles.postImage}
              contentFit="cover"
            />
          ))}
          
          {/* Video indicator if post has video */}
          {post.videoUrl && (
            <TouchableOpacity style={styles.videoContainer}>
              <Image 
                source={{ uri: post.images?.[0] || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5' }} 
                style={styles.videoThumbnail}
                contentFit="cover"
              />
              <View style={styles.videoPlayButton}>
                <Ionicons name="play-circle" size={60} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}
          
          {/* Post Footer with Actions */}
          <View style={styles.postFooter}>
            <View style={styles.voteContainer}>
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={() => handleVote('post', post.id, true)}
              >
                <Ionicons 
                  name={post.isUpvoted ? "arrow-up-circle" : "arrow-up-circle-outline"} 
                  size={24} 
                  color={post.isUpvoted ? "#FF6B3D" : "#FFFFFF"} 
                />
              </TouchableOpacity>
              <Text style={styles.voteCount}>{post.upvotes - post.downvotes}</Text>
              <TouchableOpacity 
                style={styles.voteButton}
                onPress={() => handleVote('post', post.id, false)}
              >
                <Ionicons 
                  name={post.isDownvoted ? "arrow-down-circle" : "arrow-down-circle-outline"} 
                  size={24} 
                  color={post.isDownvoted ? "#9575CD" : "#FFFFFF"} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.postActionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
              <Text style={styles.postActionText}>{post.commentCount} comments</Text>
            </View>
            
            <TouchableOpacity style={styles.postActionButton}>
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text style={styles.postActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>
          
          {/* Comment Input - Only show if not replying to a specific comment */}
          {!replyingTo && (
            <View style={styles.commentInputContainer}>
              <Image 
                source={{ uri: 'https://i.pravatar.cc/150?img=7' }} 
                style={styles.userAvatar} 
                contentFit="cover"
              />
              <TextInput 
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#A0A0A0"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity 
                style={[
                  styles.postCommentButton,
                  !commentText.trim() && styles.postCommentButtonDisabled
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={commentText.trim() ? "#FFFFFF" : "#666666"} 
                />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Comment List */}
          <View style={styles.commentsList}>
            {post.comments.map(comment => (
              renderComment(comment)
            ))}
          </View>
        </View>
      </ScrollView>
    </IMessagePageWrapper>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#1C1C1E',
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  postHeader: {
    padding: 12,
    paddingBottom: 6,
  },
  stickiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stickiedText: {
    fontSize: 12,
    color: '#FF6B3D',
    marginLeft: 4,
    fontWeight: '500',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  postAuthor: {
    fontSize: 13,
    color: '#FFFFFF',
    marginRight: 8,
  },
  postTime: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 132, 255, 0.2)',
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0A84FF',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 15,
    color: '#E0E0E0',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    marginBottom: 8,
  },
  videoContainer: {
    width: '100%',
    height: 250,
    marginBottom: 8,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  voteButton: {
    padding: 6,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 4,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    marginRight: 16,
  },
  postActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  commentsSection: {
    padding: 12,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 36,
    maxHeight: 100,
  },
  postCommentButton: {
    padding: 8,
    backgroundColor: '#0A84FF',
    borderRadius: 15,
    marginLeft: 8,
  },
  postCommentButtonDisabled: {
    backgroundColor: '#333333',
  },
  commentsList: {
    marginBottom: 24,
  },
  commentContainer: {
    padding: 12,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  commentTime: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  commentContent: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginLeft: 16,
  },
  replyText: {
    fontSize: 12,
    color: '#A0A0A0',
    marginLeft: 4,
  },
  activeCommentButton: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  activeReplyText: {
    color: '#0A84FF',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(44, 44, 46, 0.8)',
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 36,
    maxHeight: 100,
  },
}); 