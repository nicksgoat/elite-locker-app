/**
 * Enhanced Feed Service with Real-time Updates and Performance Optimizations
 *
 * This service provides optimized feed functionality with real-time subscriptions,
 * caching, and performance improvements for the Elite Locker app.
 */

import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase-client';
import { feedService } from './feedService';

// Enhanced feed item types
export interface EnhancedFeedItem {
  id: string;
  type: 'workout_post' | 'general_post' | 'event_post' | 'progress_post';
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
  content: string;
  image_urls?: string[];
  workout?: {
    id: string;
    title: string;
    duration?: number;
    exercises_count?: number;
    total_volume?: number;
    personal_records?: number;
  };
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
}

export interface FeedSubscriptionCallback {
  onNewPost: (post: EnhancedFeedItem) => void;
  onPostUpdate: (post: EnhancedFeedItem) => void;
  onPostDelete: (postId: string) => void;
  onError: (error: Error) => void;
}

class EnhancedFeedService {
  private subscriptions: Map<string, any> = new Map();
  private cache: Map<string, { data: EnhancedFeedItem[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get enhanced feed with real-time capabilities
   */
  async getFeed({
    limit = 20,
    offset = 0,
    clubIds = [],
    includeFollowing = true,
    bypassCache = false
  }: {
    limit?: number;
    offset?: number;
    clubIds?: string[];
    includeFollowing?: boolean;
    bypassCache?: boolean;
  } = {}): Promise<EnhancedFeedItem[]> {
    const cacheKey = `feed_${limit}_${offset}_${clubIds.join(',')}_${includeFollowing}`;

    // Check cache first
    if (!bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }

    try {
      const user = await getCurrentUser();
      if (!user) {
        // Return mock data for unauthenticated users in development
        console.log('No authenticated user, returning mock feed data');
        return getMockFeedData();
      }

      // Build the query with proper joins and filters
      let query = supabase
        .from('posts')
        .select(`
          id,
          content,
          image_urls,
          workout_id,
          created_at,
          updated_at,
          like_count,
          comment_count,
          author:profiles(
            id,
            username,
            avatar_url,
            full_name
          ),
          club:clubs(
            id,
            name,
            profile_image_url
          ),
          workout:workouts(
            id,
            title,
            duration,
            total_volume,
            personal_records
          ),
          user_likes:post_likes(
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters based on parameters
      if (clubIds.length > 0) {
        query = query.in('club_id', clubIds);
      } else if (includeFollowing) {
        // Get posts from followed users and joined clubs
        const { data: followingData } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const { data: clubMemberships } = await supabase
          .from('club_members')
          .select('club_id')
          .eq('user_id', user.id);

        const followingIds = followingData?.map(f => f.following_id) || [];
        const memberClubIds = clubMemberships?.map(m => m.club_id) || [];

        if (followingIds.length > 0 || memberClubIds.length > 0) {
          query = query.or(
            `author_id.in.(${followingIds.join(',')}),club_id.in.(${memberClubIds.join(',')})`
          );
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to our enhanced format with null safety
      const enhancedItems: EnhancedFeedItem[] = (data || []).map(item => {
        // Add fallback author data if missing
        const author = item.author || {
          id: item.author_id || 'unknown',
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        };

        return {
          id: item.id,
          type: this.determinePostType(item),
          author,
          club: item.club,
          content: item.content,
          image_urls: item.image_urls,
          workout: item.workout ? {
            id: item.workout.id,
            title: item.workout.title,
            duration: item.workout.duration,
            total_volume: item.workout.total_volume,
            personal_records: item.workout.personal_records,
          } : undefined,
          like_count: item.like_count || 0,
          comment_count: item.comment_count || 0,
          created_at: item.created_at,
          updated_at: item.updated_at,
          is_liked: item.user_likes?.some((like: any) => like.user_id === user.id) || false,
        };
      });

      // Cache the results
      this.cache.set(cacheKey, {
        data: enhancedItems,
        timestamp: Date.now()
      });

      return enhancedItems;
    } catch (error) {
      console.error('Error fetching enhanced feed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time feed updates
   */
  subscribeToFeed(
    callback: FeedSubscriptionCallback,
    options: {
      clubIds?: string[];
      includeFollowing?: boolean;
    } = {}
  ): string {
    const subscriptionId = `feed_${Date.now()}_${Math.random()}`;

    try {
      // Subscribe to posts table changes
      const subscription = supabase
        .channel(`feed_${subscriptionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'posts'
          },
          async (payload) => {
            try {
              // Fetch the complete post data with joins
              const { data } = await supabase
                .from('posts')
                .select(`
                  id,
                  content,
                  image_urls,
                  workout_id,
                  created_at,
                  updated_at,
                  like_count,
                  comment_count,
                  author:profiles(
                    id,
                    username,
                    avatar_url,
                    full_name
                  ),
                  club:clubs(
                    id,
                    name,
                    profile_image_url
                  ),
                  workout:workouts(
                    id,
                    title,
                    duration,
                    total_volume,
                    personal_records
                  )
                `)
                .eq('id', payload.new.id)
                .single();

              if (data) {
                const enhancedItem: EnhancedFeedItem = {
                  id: data.id,
                  type: this.determinePostType(data),
                  author: data.author,
                  club: data.club,
                  content: data.content,
                  image_urls: data.image_urls,
                  workout: data.workout ? {
                    id: data.workout.id,
                    title: data.workout.title,
                    duration: data.workout.duration,
                    total_volume: data.workout.total_volume,
                    personal_records: data.workout.personal_records,
                  } : undefined,
                  like_count: data.like_count || 0,
                  comment_count: data.comment_count || 0,
                  created_at: data.created_at,
                  updated_at: data.updated_at,
                  is_liked: false,
                };

                callback.onNewPost(enhancedItem);
              }
            } catch (error) {
              callback.onError(error as Error);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'posts'
          },
          async (payload) => {
            // Handle post updates (like count, comment count changes)
            try {
              const { data } = await supabase
                .from('posts')
                .select(`
                  id,
                  content,
                  image_urls,
                  workout_id,
                  created_at,
                  updated_at,
                  like_count,
                  comment_count,
                  author:profiles(
                    id,
                    username,
                    avatar_url,
                    full_name
                  ),
                  club:clubs(
                    id,
                    name,
                    profile_image_url
                  ),
                  workout:workouts(
                    id,
                    title,
                    duration,
                    total_volume,
                    personal_records
                  )
                `)
                .eq('id', payload.new.id)
                .single();

              if (data) {
                const enhancedItem: EnhancedFeedItem = {
                  id: data.id,
                  type: this.determinePostType(data),
                  author: data.author,
                  club: data.club,
                  content: data.content,
                  image_urls: data.image_urls,
                  workout: data.workout ? {
                    id: data.workout.id,
                    title: data.workout.title,
                    duration: data.workout.duration,
                    total_volume: data.workout.total_volume,
                    personal_records: data.workout.personal_records,
                  } : undefined,
                  like_count: data.like_count || 0,
                  comment_count: data.comment_count || 0,
                  created_at: data.created_at,
                  updated_at: data.updated_at,
                  is_liked: false,
                };

                callback.onPostUpdate(enhancedItem);
              }
            } catch (error) {
              callback.onError(error as Error);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'posts'
          },
          (payload) => {
            callback.onPostDelete(payload.old.id);
          }
        )
        .subscribe();

      this.subscriptions.set(subscriptionId, subscription);
      return subscriptionId;
    } catch (error) {
      callback.onError(error as Error);
      return subscriptionId;
    }
  }

  /**
   * Unsubscribe from feed updates
   */
  unsubscribeFromFeed(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Create a new post with optimistic updates
   */
  async createPost(postData: {
    content: string;
    club_id?: string;
    workout_id?: string;
    image_urls?: string[];
    post_type?: string;
  }): Promise<EnhancedFeedItem> {
    try {
      // Use the existing feedService to create the post
      const post = await feedService.createPost(postData);

      // Clear relevant caches
      this.clearCache();

      // Return the created post in enhanced format
      return await this.getPostById(post.id);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  /**
   * Get a single post by ID
   */
  private async getPostById(postId: string): Promise<EnhancedFeedItem> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        image_urls,
        workout_id,
        created_at,
        updated_at,
        like_count,
        comment_count,
        author:profiles(
          id,
          username,
          avatar_url,
          full_name
        ),
        club:clubs(
          id,
          name,
          profile_image_url
        ),
        workout:workouts(
          id,
          title,
          duration,
          total_volume,
          personal_records
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      type: this.determinePostType(data),
      author: data.author,
      club: data.club,
      content: data.content,
      image_urls: data.image_urls,
      workout: data.workout ? {
        id: data.workout.id,
        title: data.workout.title,
        duration: data.workout.duration,
        total_volume: data.workout.total_volume,
        personal_records: data.workout.personal_records,
      } : undefined,
      like_count: data.like_count || 0,
      comment_count: data.comment_count || 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_liked: false,
    };
  }

  /**
   * Determine post type based on content
   */
  private determinePostType(post: any): EnhancedFeedItem['type'] {
    if (post.workout_id) {
      return 'workout_post';
    }
    if (post.content?.toLowerCase().includes('event')) {
      return 'event_post';
    }
    if (post.content?.toLowerCase().includes('progress') || post.content?.toLowerCase().includes('pr')) {
      return 'progress_post';
    }
    return 'general_post';
  }

  /**
   * Clear all caches
   */
  private clearCache(): void {
    this.cache.clear();
  }

  /**
   * Like or unlike a post
   */
  async likePost(postId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user has already liked this post
      const { data: existingLikes, error: fetchError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error checking existing likes:', fetchError);
        throw fetchError;
      }

      if (existingLikes && existingLikes.length > 0) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting like:', deleteError);
          throw deleteError;
        }

        // Decrement like count
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else {
        // Like the post - use upsert to prevent duplicates
        const { error: insertError } = await supabase
          .from('post_likes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            created_at: new Date().toISOString()
          }, {
            onConflict: 'post_id,user_id'
          });

        if (insertError) {
          console.error('Error inserting like:', insertError);
          // Don't throw if it's a duplicate key error - just log it
          if (insertError.code !== '23505') {
            throw insertError;
          }
        } else {
          // Only increment if insert was successful
          await supabase.rpc('increment_post_likes', { post_id: postId });
        }
      }

      // Clear cache to force refresh
      this.clearCache();
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      throw error;
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions.clear();
    this.clearCache();
  }
}

/**
 * Get mock feed data for unauthenticated users
 */
function getMockFeedData(): EnhancedFeedItem[] {
    return [
      {
        id: 'mock-1',
        type: 'workout_post',
        author: {
          id: 'user-1',
          username: 'devon_allen',
          avatar_url: 'https://pbs.twimg.com/profile_images/1234567890/devon.jpg',
          full_name: 'Devon Allen'
        },
        club: {
          id: 'club-1',
          name: 'Track & Field Elite',
          profile_image_url: 'https://via.placeholder.com/40x40'
        },
        content: 'Just crushed a 400m hurdles training session! 💪 New PR incoming!',
        image_urls: ['https://pbs.twimg.com/profile_banners/372145971/1465540138/1500x500'],
        workout: {
          id: 'workout-1',
          title: '400m Hurdles Training',
          duration: 90,
          total_volume: 2500,
          personal_records: 1
        },
        like_count: 24,
        comment_count: 8,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_liked: false
      },
      {
        id: 'mock-2',
        type: 'general_post',
        author: {
          id: 'user-2',
          username: 'coach_miller',
          avatar_url: 'https://via.placeholder.com/40x40',
          full_name: 'Coach Miller'
        },
        club: {
          id: 'club-2',
          name: 'Elite Fitness',
          profile_image_url: 'https://via.placeholder.com/40x40'
        },
        content: 'Remember: consistency beats perfection every time. Show up, do the work, trust the process. 🔥',
        like_count: 156,
        comment_count: 23,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        is_liked: true
      },
      {
        id: 'mock-3',
        type: 'progress_post',
        author: {
          id: 'user-3',
          username: 'alex_johnson',
          avatar_url: 'https://via.placeholder.com/40x40',
          full_name: 'Alex Johnson'
        },
        club: {
          id: 'club-1',
          name: 'Track & Field Elite',
          profile_image_url: 'https://via.placeholder.com/40x40'
        },
        content: '6 months of consistent training paying off! From 185lbs to 225lbs bench press 💪',
        image_urls: ['https://via.placeholder.com/400x300'],
        like_count: 89,
        comment_count: 15,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        is_liked: false
      }
    ];
}

// Export singleton instance
export const enhancedFeedService = new EnhancedFeedService();
