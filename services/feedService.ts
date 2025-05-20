/**
 * Elite Locker Services - Feed Service
 *
 * This file contains the feed service implementation using Supabase.
 */

import { mockPosts } from '../data/mockData'; // Fallback for development
import { deleteData, fetchData, insertData, uploadFile } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase-client';
import { ApiError } from './types';

// Feed service implementation
export const feedService = {
  // Get feed posts
  getFeedPosts: async ({ limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get posts from users the current user follows and from clubs they're members of
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, username, avatar_url, full_name),
          club:clubs(id, name, profile_image_url)
        `)
        .or(`author_id.in.(${getFollowingSubquery(user.id)}),club_id.in.(${getClubMembershipsSubquery(user.id)})`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching feed posts:', error);
      // Fallback to mock data during development
      return mockPosts.slice(offset, offset + limit);
    }
  },

  // Get posts for a specific user
  getUserPosts: async (userId: string, { limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) => {
    try {
      const data = await fetchData('posts', {
        select: `
          *,
          author:profiles(id, username, avatar_url, full_name),
          club:clubs(id, name, profile_image_url)
        `,
        filters: { author_id: userId },
        order: { column: 'created_at', ascending: false },
        limit
      });

      return data || [];
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      // Fallback to mock data during development
      return mockPosts.filter(p => p.authorId === userId).slice(offset, offset + limit);
    }
  },

  // Create a post
  createPost: async (postData: any) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Upload images if provided
      const imageUrls: string[] = [];
      if (postData.images && postData.images.length > 0) {
        for (let i = 0; i < postData.images.length; i++) {
          const image = postData.images[i];
          if (typeof image !== 'string') {
            const imageUrl = await uploadFile(
              'post-images',
              `${user.id}/${Date.now()}-${i}`,
              image
            );
            imageUrls.push(imageUrl);
          } else {
            imageUrls.push(image);
          }
        }
      }

      // Create the post
      const post = await insertData('posts', {
        author_id: user.id,
        club_id: postData.clubId,
        content: postData.content,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        created_at: new Date(),
        updated_at: new Date()
      });

      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Delete a post
  deletePost: async (postId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get the post
      const post = await fetchData('posts', {
        select: '*',
        filters: { id: postId },
        single: true
      });

      if (!post) {
        throw new ApiError(`Post with ID ${postId} not found`, 404);
      }

      // Check if user is the author
      if (post.author_id !== user.id) {
        throw new ApiError('Not authorized to delete this post', 403);
      }

      // Delete the post
      await deleteData('posts', postId);

      return { success: true };
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error);
      throw error;
    }
  },

  // Like a post
  likePost: async (postId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Check if already liked
      const existingLike = await fetchData('post_likes', {
        select: '*',
        filters: { post_id: postId, user_id: user.id }
      });

      if (existingLike && existingLike.length > 0) {
        return existingLike[0];
      }

      // Create like
      const like = await insertData('post_likes', {
        post_id: postId,
        user_id: user.id,
        created_at: new Date()
      });

      // Update post like count
      await supabase.rpc('increment_post_like_count', { post_id: postId });

      return like;
    } catch (error) {
      console.error(`Error liking post ${postId}:`, error);
      throw error;
    }
  },

  // Unlike a post
  unlikePost: async (postId: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Get like
      const likes = await fetchData('post_likes', {
        select: '*',
        filters: { post_id: postId, user_id: user.id }
      });

      if (!likes || likes.length === 0) {
        throw new ApiError(`Not liked post ${postId}`, 404);
      }

      // Delete like
      await deleteData('post_likes', likes[0].id);

      // Update post like count
      await supabase.rpc('decrement_post_like_count', { post_id: postId });

      return { success: true };
    } catch (error) {
      console.error(`Error unliking post ${postId}:`, error);
      throw error;
    }
  },

  // Add a comment to a post
  addComment: async (postId: string, content: string) => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        throw new ApiError('User not authenticated', 401);
      }

      // Create comment
      const comment = await insertData('comments', {
        post_id: postId,
        author_id: user.id,
        content,
        created_at: new Date()
      });

      // Update post comment count
      await supabase.rpc('increment_post_comment_count', { post_id: postId });

      return comment;
    } catch (error) {
      console.error(`Error adding comment to post ${postId}:`, error);
      throw error;
    }
  },

  // Get comments for a post
  getComments: async (postId: string, { limit = 10, offset = 0 }: { limit?: number, offset?: number } = {}) => {
    try {
      const data = await fetchData('comments', {
        select: `
          *,
          author:profiles(id, username, avatar_url, full_name)
        `,
        filters: { post_id: postId },
        order: { column: 'created_at', ascending: true },
        limit
      });

      return data || [];
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  }
};

// Helper function to create a subquery for users the current user follows
function getFollowingSubquery(userId: string) {
  return `
    SELECT following_id FROM follows
    WHERE follower_id = '${userId}'
  `;
}

// Helper function to create a subquery for clubs the current user is a member of
function getClubMembershipsSubquery(userId: string) {
  return `
    SELECT club_id FROM club_members
    WHERE user_id = '${userId}'
  `;
}
