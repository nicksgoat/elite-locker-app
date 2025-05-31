/**
 * Elite Locker Services - Feed Service
 *
 * This file contains the feed service implementation using Supabase.
 */

import { mockPosts } from '../data/mockData'; // Fallback for development
import { deleteData, fetchData, insertData, uploadFile } from '../lib/api';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase-new';
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

      // First, get the user's following list and club memberships
      const [followingData, clubMembershipsData] = await Promise.all([
        supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id),
        supabase
          .from('club_members')
          .select('club_id')
          .eq('user_id', user.id)
      ]);

      // Extract IDs
      const followingIds = followingData.data?.map(f => f.following_id) || [];
      const clubIds = clubMembershipsData.data?.map(m => m.club_id) || [];

      // Include the user's own posts
      const authorIds = [...followingIds, user.id];

      console.log(`Feed query - Following ${followingIds.length} users, member of ${clubIds.length} clubs`);

      // Build the query conditions
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, username, avatar_url, full_name),
          club:clubs(id, name, profile_image_url)
        `);

      // Add filters for author IDs and club IDs
      if (authorIds.length > 0 && clubIds.length > 0) {
        query = query.or(`author_id.in.(${authorIds.join(',')}),club_id.in.(${clubIds.join(',')})`);
      } else if (authorIds.length > 0) {
        query = query.in('author_id', authorIds);
      } else if (clubIds.length > 0) {
        query = query.in('club_id', clubIds);
      } else {
        // If user follows no one and is in no clubs, just return their own posts
        query = query.eq('author_id', user.id);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      // Filter out posts with null authors and add fallback data
      const validPosts = (data || []).map(post => {
        if (!post.author) {
          // Create a fallback author if none exists
          post.author = {
            id: post.author_id || 'unknown',
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          };
        }
        return post;
      });

      return validPosts;
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

      // Add fallback author data if missing
      const validPosts = (data || []).map(post => {
        if (!post.author) {
          post.author = {
            id: post.author_id || userId,
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          };
        }
        return post;
      });

      return validPosts;
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

      // Handle images - support both images and image_urls fields
      const imageUrls: string[] = [];
      const imagesToProcess = postData.images || postData.image_urls || [];

      if (imagesToProcess && imagesToProcess.length > 0) {
        for (let i = 0; i < imagesToProcess.length; i++) {
          const image = imagesToProcess[i];
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
        club_id: postData.club_id || postData.clubId, // Support both naming conventions
        content: postData.content,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        workout_id: postData.workout_id,
        post_type: postData.post_type || 'general_post',
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
        console.log(`Post ${postId} already liked by user ${user.id}`);
        return existingLike[0];
      }

      // Create like using upsert to prevent duplicates
      try {
        const { data: like, error } = await supabase
          .from('post_likes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'post_id,user_id'
          })
          .select()
          .single();

        if (error) {
          // If it's a duplicate key error, just log and return
          if (error.code === '23505') {
            console.log(`Duplicate like prevented for post ${postId} by user ${user.id}`);
            return null;
          }
          throw error;
        }

        // Update post like count only if like was created
        if (like) {
          await supabase.rpc('increment_post_like_count', { post_id: postId });
        }

        return like;
      } catch (insertError) {
        console.error(`Error inserting like for post ${postId}:`, insertError);
        // If it's a duplicate, don't throw - just return null
        if (insertError.code === '23505') {
          return null;
        }
        throw insertError;
      }
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

  // Get a specific post by ID
  getPost: async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(id, username, avatar_url, full_name),
          club:clubs(id, name, profile_image_url),
          workout:workouts(id, title, duration, total_volume, personal_records),
          user_likes:post_likes(user_id)
        `)
        .eq('id', postId)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(`Post with ID ${postId} not found`);
      }

      // Add fallback author data if missing
      if (!data.author) {
        data.author = {
          id: data.author_id || 'unknown',
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        };
      }

      // Check if current user has liked this post
      const user = await getCurrentUser();
      data.is_liked = user ? data.user_likes?.some((like: any) => like.user_id === user.id) || false : false;

      return data;
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
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

      // Add fallback author data if missing
      const validComments = (data || []).map(comment => {
        if (!comment.author) {
          comment.author = {
            id: comment.author_id || 'unknown',
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          };
        }
        return comment;
      });

      return validComments;
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  }
};
