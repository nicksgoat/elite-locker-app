import * as Haptics from 'expo-haptics';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';

// Types
export interface WorkoutShare {
  id: string;
  workoutId: string;
  workoutName: string;
  authorId: string;
  authorName: string;
  clubIds: string[];
  socialPlatforms: string[];
  message: string;
  stats: {
    duration: number;
    volume: number;
    exercises: number;
    personalRecords: string[];
  };
  visibility: 'public' | 'club' | 'private';
  sharedAt: Date;
  likes: number;
  comments: number;
  shares: number;
}

export interface SocialPost {
  id: string;
  type: 'workout' | 'program' | 'achievement' | 'story';
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  clubId?: string;
  clubName?: string;
  workoutData?: {
    name: string;
    duration: number;
    volume: number;
    exercises: number;
    personalRecords: string[];
  };
  imageUrls: string[];
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isJoined: boolean;
  isOwner: boolean;
  icon: string;
  color: string;
  bannerUrl?: string;
  avatarUrl?: string;
}

export interface ShareSettings {
  autoShareWorkouts: boolean;
  defaultClubs: string[];
  includeStats: boolean;
  shareToStory: boolean;
  notifications: {
    likes: boolean;
    comments: boolean;
    shares: boolean;
    followers: boolean;
  };
}

interface SocialContextType {
  // State
  posts: SocialPost[];
  clubs: Club[];
  workoutShares: WorkoutShare[];
  shareSettings: ShareSettings;
  isLoading: boolean;

  // Workout Sharing
  shareWorkout: (workoutData: any, settings: any) => Promise<WorkoutShare>;
  shareToClub: (workoutData: any, clubId: string, message?: string) => Promise<void>;
  shareToSocialMedia: (platform: string, workoutData: any) => Promise<void>;

  // Social Interactions
  likePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, comment: string) => Promise<void>;
  sharePost: (postId: string) => Promise<void>;
  bookmarkPost: (postId: string) => Promise<void>;

  // Club Management
  joinClub: (clubId: string) => Promise<void>;
  leaveClub: (clubId: string) => Promise<void>;
  createClub: (clubData: Partial<Club>) => Promise<Club>;

  // Feed Management
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;

  // Settings
  updateShareSettings: (settings: Partial<ShareSettings>) => Promise<void>;

  // Analytics
  getWorkoutShareAnalytics: (workoutId: string) => Promise<any>;
  getSocialAnalytics: () => Promise<any>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = (): SocialContextType => {
  const context = useContext(SocialContext);
  if (!context) {
    console.warn('useSocial used outside of SocialProvider, returning default values');
    // Return default values instead of throwing an error
    return {
      posts: [],
      clubs: [],
      workoutShares: [],
      shareSettings: {
        autoShareWorkouts: false,
        defaultClubs: [],
        includeStats: true,
        shareToStory: false,
        notifications: {
          likes: true,
          comments: true,
          shares: true,
          followers: true,
        },
      },
      isLoading: false,
      shareWorkout: async () => ({} as any),
      shareToClub: async () => {},
      shareToSocialMedia: async () => {},
      likePost: async () => {},
      commentOnPost: async () => {},
      sharePost: async () => {},
      bookmarkPost: async () => {},
      joinClub: async () => {},
      leaveClub: async () => {},
      createClub: async () => ({} as any),
      refreshFeed: async () => {},
      loadMorePosts: async () => {},
      updateShareSettings: async () => {},
      getWorkoutShareAnalytics: async () => null,
      getSocialAnalytics: async () => null,
    };
  }
  return context;
};

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  // State
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [workoutShares, setWorkoutShares] = useState<WorkoutShare[]>([]);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    autoShareWorkouts: false,
    defaultClubs: [],
    includeStats: true,
    shareToStory: false,
    notifications: {
      likes: true,
      comments: true,
      shares: true,
      followers: true,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize mock data
  React.useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock clubs
    setClubs([
      {
        id: '1',
        name: 'Elite Fitness',
        description: 'Premium fitness community for serious athletes',
        memberCount: 1247,
        isJoined: true,
        isOwner: false,
        icon: 'fitness-outline',
        color: '#0A84FF',
        bannerUrl: 'https://via.placeholder.com/400x200',
        avatarUrl: 'https://via.placeholder.com/80x80'
      },
      {
        id: '2',
        name: 'Track & Field Elite',
        description: 'Olympic-level track and field training',
        memberCount: 856,
        isJoined: true,
        isOwner: true,
        icon: 'medal-outline',
        color: '#FF9F0A',
        bannerUrl: 'https://via.placeholder.com/400x200',
        avatarUrl: 'https://via.placeholder.com/80x80'
      },
      {
        id: '3',
        name: 'Powerlifting Club',
        description: 'Strength training and powerlifting focused',
        memberCount: 2134,
        isJoined: false,
        isOwner: false,
        icon: 'barbell-outline',
        color: '#FF2D55',
        bannerUrl: 'https://via.placeholder.com/400x200',
        avatarUrl: 'https://via.placeholder.com/80x80'
      },
    ]);

    // Mock posts
    setPosts([
      {
        id: '1',
        type: 'workout',
        content: 'Just crushed an amazing chest and triceps session! New PR on bench press 💪',
        authorId: 'user1',
        authorName: 'Nick McKenzie',
        authorAvatar: 'https://via.placeholder.com/40x40',
        clubId: '1',
        clubName: 'Elite Fitness',
        workoutData: {
          name: 'Chest & Triceps Blast',
          duration: 68,
          volume: 11260,
          exercises: 4,
          personalRecords: ['Bench Press']
        },
        imageUrls: ['https://via.placeholder.com/400x300'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 23,
        comments: 5,
        shares: 2,
        isLiked: false,
        isBookmarked: false
      },
      {
        id: '2',
        type: 'achievement',
        content: 'Week 4 of my training program complete! Feeling stronger every day 🔥',
        authorId: 'user2',
        authorName: 'Devon Allen',
        authorAvatar: 'https://via.placeholder.com/40x40',
        clubId: '2',
        clubName: 'Track & Field Elite',
        imageUrls: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 45,
        comments: 12,
        shares: 8,
        isLiked: true,
        isBookmarked: false
      },
    ]);
  };

  // Workout Sharing Functions
  const shareWorkout = useCallback(async (workoutData: any, settings: any): Promise<WorkoutShare> => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const workoutShare: WorkoutShare = {
        id: Date.now().toString(),
        workoutId: workoutData.id,
        workoutName: workoutData.name,
        authorId: 'current-user',
        authorName: 'Nick McKenzie',
        clubIds: settings.shareToClubs || [],
        socialPlatforms: settings.socialPlatforms || [],
        message: settings.message || '',
        stats: {
          duration: workoutData.duration,
          volume: workoutData.totalVolume,
          exercises: workoutData.exercises.length,
          personalRecords: workoutData.personalRecords || []
        },
        visibility: settings.visibility || 'public',
        sharedAt: new Date(),
        likes: 0,
        comments: 0,
        shares: 0
      };

      setWorkoutShares(prev => [workoutShare, ...prev]);

      // Create social post if sharing to clubs
      if (settings.shareToClubs && settings.shareToClubs.length > 0) {
        const newPost: SocialPost = {
          id: Date.now().toString(),
          type: 'workout',
          content: settings.message,
          authorId: 'current-user',
          authorName: 'Nick McKenzie',
          authorAvatar: 'https://via.placeholder.com/40x40',
          clubId: settings.shareToClubs[0],
          clubName: clubs.find(c => c.id === settings.shareToClubs[0])?.name || 'Club',
          workoutData: {
            name: workoutData.name,
            duration: workoutData.duration,
            volume: workoutData.totalVolume,
            exercises: workoutData.exercises.length,
            personalRecords: workoutData.personalRecords || []
          },
          imageUrls: settings.imageUrls || [],
          createdAt: new Date(),
          likes: 0,
          comments: 0,
          shares: 0,
          isLiked: false,
          isBookmarked: false
        };

        setPosts(prev => [newPost, ...prev]);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return workoutShare;

    } catch (error) {
      console.error('Error sharing workout:', error);
      Alert.alert('Error', 'Failed to share workout');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clubs]);

  const shareToClub = useCallback(async (workoutData: any, clubId: string, message?: string): Promise<void> => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const club = clubs.find(c => c.id === clubId);
      if (!club) {
        throw new Error('Club not found');
      }

      const newPost: SocialPost = {
        id: Date.now().toString(),
        type: 'workout',
        content: message || `Shared my workout: ${workoutData.name}`,
        authorId: 'current-user',
        authorName: 'Nick McKenzie',
        authorAvatar: 'https://via.placeholder.com/40x40',
        clubId: clubId,
        clubName: club.name,
        workoutData: {
          name: workoutData.name,
          duration: workoutData.duration,
          volume: workoutData.totalVolume,
          exercises: workoutData.exercises?.length || 0,
          personalRecords: workoutData.personalRecords || []
        },
        imageUrls: [],
        createdAt: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isBookmarked: false
      };

      setPosts(prev => [newPost, ...prev]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      console.error('Error sharing to club:', error);
      Alert.alert('Error', 'Failed to share to club');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [clubs]);

  const shareToSocialMedia = useCallback(async (platform: string, workoutData: any): Promise<void> => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Platform-specific sharing logic would go here
      await new Promise(resolve => setTimeout(resolve, 500));

      Alert.alert('Success', `Shared to ${platform}!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      Alert.alert('Error', `Failed to share to ${platform}`);
      throw error;
    }
  }, []);

  // Social Interaction Functions
  const likePost = useCallback(async (postId: string): Promise<void> => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      ));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  }, []);

  const commentOnPost = useCallback(async (postId: string, comment: string): Promise<void> => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      ));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('Error commenting on post:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  }, []);

  const sharePost = useCallback(async (postId: string): Promise<void> => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, shares: post.shares + 1 }
          : post
      ));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      Alert.alert('Success', 'Post shared!');

    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Error', 'Failed to share post');
    }
  }, []);

  const bookmarkPost = useCallback(async (postId: string): Promise<void> => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      ));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error('Error bookmarking post:', error);
      Alert.alert('Error', 'Failed to bookmark post');
    }
  }, []);

  // Club Management Functions
  const joinClub = useCallback(async (clubId: string): Promise<void> => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      setClubs(prev => prev.map(club =>
        club.id === clubId
          ? { ...club, isJoined: true, memberCount: club.memberCount + 1 }
          : club
      ));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    } catch (error) {
      console.error('Error joining club:', error);
      Alert.alert('Error', 'Failed to join club');
    }
  }, []);

  const leaveClub = useCallback(async (clubId: string): Promise<void> => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setClubs(prev => prev.map(club =>
        club.id === clubId
          ? { ...club, isJoined: false, memberCount: Math.max(0, club.memberCount - 1) }
          : club
      ));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('Error leaving club:', error);
      Alert.alert('Error', 'Failed to leave club');
    }
  }, []);

  const createClub = useCallback(async (clubData: Partial<Club>): Promise<Club> => {
    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newClub: Club = {
        id: Date.now().toString(),
        name: clubData.name || 'New Club',
        description: clubData.description || '',
        memberCount: 1,
        isJoined: true,
        isOwner: true,
        icon: clubData.icon || 'people-outline',
        color: clubData.color || '#0A84FF',
        bannerUrl: clubData.bannerUrl,
        avatarUrl: clubData.avatarUrl,
      };

      setClubs(prev => [...prev, newClub]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return newClub;

    } catch (error) {
      console.error('Error creating club:', error);
      Alert.alert('Error', 'Failed to create club');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Feed Management Functions
  const refreshFeed = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would fetch fresh data from the server
      initializeMockData();

    } catch (error) {
      console.error('Error refreshing feed:', error);
      Alert.alert('Error', 'Failed to refresh feed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMorePosts = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would fetch more posts
      // For now, we'll just log it
      console.log('Loading more posts...');

    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Settings Functions
  const updateShareSettings = useCallback(async (newSettings: Partial<ShareSettings>): Promise<void> => {
    try {
      setShareSettings(prev => ({ ...prev, ...newSettings }));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error('Error updating share settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    }
  }, []);

  // Analytics Functions
  const getWorkoutShareAnalytics = useCallback(async (workoutId: string): Promise<any> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const share = workoutShares.find(s => s.workoutId === workoutId);

      return {
        totalViews: Math.floor(Math.random() * 1000),
        likes: share?.likes || 0,
        comments: share?.comments || 0,
        shares: share?.shares || 0,
        clubReach: share?.clubIds.length || 0,
        engagementRate: Math.floor(Math.random() * 100),
      };

    } catch (error) {
      console.error('Error getting workout share analytics:', error);
      return null;
    }
  }, [workoutShares]);

  const getSocialAnalytics = useCallback(async (): Promise<any> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        totalPosts: posts.length,
        totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
        totalComments: posts.reduce((sum, post) => sum + post.comments, 0),
        totalShares: posts.reduce((sum, post) => sum + post.shares, 0),
        followers: Math.floor(Math.random() * 1000),
        engagement: Math.floor(Math.random() * 100),
      };

    } catch (error) {
      console.error('Error getting social analytics:', error);
      return null;
    }
  }, [posts]);

  const contextValue: SocialContextType = {
    // State
    posts,
    clubs,
    workoutShares,
    shareSettings,
    isLoading,

    // Workout Sharing
    shareWorkout,
    shareToClub,
    shareToSocialMedia,

    // Social Interactions
    likePost,
    commentOnPost,
    sharePost,
    bookmarkPost,

    // Club Management
    joinClub,
    leaveClub,
    createClub,

    // Feed Management
    refreshFeed,
    loadMorePosts,

    // Settings
    updateShareSettings,

    // Analytics
    getWorkoutShareAnalytics,
    getSocialAnalytics,
  };

  return (
    <SocialContext.Provider value={contextValue}>
      {children}
    </SocialContext.Provider>
  );
};