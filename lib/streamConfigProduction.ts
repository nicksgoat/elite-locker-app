/**
 * Elite Locker - Production Stream Chat Configuration
 * 
 * This file provides production-ready Stream Chat configuration
 * with real API keys, secure tokens, and actual user data.
 */

import { StreamChat } from 'stream-chat';
import { createLogger } from '../utils/secureLogger';

const logger = createLogger('StreamConfigProduction');

// Production Stream configuration
export const STREAM_PRODUCTION_CONFIG = {
  // REQUIRED: Your actual Stream API key from https://getstream.io/dashboard/
  apiKey: process.env.STREAM_API_KEY || (() => {
    throw new Error('STREAM_API_KEY environment variable is required for production');
  })(),
  
  // REQUIRED: Your Stream app secret (server-side only)
  secret: process.env.STREAM_SECRET || (() => {
    throw new Error('STREAM_SECRET environment variable is required for production');
  })(),
  
  // App configuration
  appId: 'elite-locker-production',
  environment: process.env.NODE_ENV || 'production',
  
  // Production token provider - calls your backend
  tokenProvider: async (userId: string) => {
    try {
      // Call your backend API to generate secure JWT token
      const response = await fetch(`${process.env.API_BASE_URL}/auth/stream-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`, // Your app's auth token
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.statusText}`);
      }

      const { token } = await response.json();
      return token;
    } catch (error: any) {
      logger.error('Failed to generate Stream token', { error: error.message, userId });
      throw new Error(`Token generation failed: ${error.message}`);
    }
  },
  
  // Production channel configuration
  channelTypes: {
    messaging: 'messaging',
    social: 'social',
    workout: 'workout',
    community: 'community',
    support: 'support',
  },
  
  // Production channels
  defaultChannels: [
    {
      type: 'social',
      id: 'global-feed',
      name: 'Global Fitness Feed',
      description: 'Share your workouts with the global community',
      public: true,
    },
    {
      type: 'community',
      id: 'general-discussion',
      name: 'General Discussion',
      description: 'General fitness and wellness discussions',
      public: true,
    },
    {
      type: 'community',
      id: 'workout-tips',
      name: 'Workout Tips & Techniques',
      description: 'Share and discover workout tips',
      public: true,
    },
    {
      type: 'community',
      id: 'nutrition-advice',
      name: 'Nutrition & Diet',
      description: 'Nutrition tips and meal planning',
      public: true,
    },
    {
      type: 'support',
      id: 'customer-support',
      name: 'Customer Support',
      description: 'Get help from our support team',
      public: false,
    },
  ],
};

// Get authentication token from your app's auth system
const getAuthToken = async (): Promise<string> => {
  // This should integrate with your existing authentication system
  // For example, if using Supabase:
  // const { data: { session } } = await supabase.auth.getSession();
  // return session?.access_token;
  
  // Or if using AsyncStorage:
  // return await AsyncStorage.getItem('authToken');
  
  // Placeholder - replace with your auth implementation
  throw new Error('getAuthToken not implemented - integrate with your auth system');
};

// Production Stream Chat client
let productionStreamClient: StreamChat | null = null;

// Initialize production Stream Chat
export const initializeProductionStreamChat = async (
  userId: string,
  userProfile: {
    name: string;
    email: string;
    image?: string;
    role?: string;
    metadata?: Record<string, any>;
  }
): Promise<StreamChat> => {
  try {
    if (productionStreamClient) {
      logger.info('Production Stream Chat client already initialized');
      return productionStreamClient;
    }

    logger.info('Initializing production Stream Chat client', { userId });

    // Validate required configuration
    if (!STREAM_PRODUCTION_CONFIG.apiKey) {
      throw new Error('Stream API key not configured');
    }

    // Create Stream Chat client
    productionStreamClient = StreamChat.getInstance(STREAM_PRODUCTION_CONFIG.apiKey);

    // Generate secure token from backend
    const token = await STREAM_PRODUCTION_CONFIG.tokenProvider(userId);

    // Connect user with real profile data
    await productionStreamClient.connectUser(
      {
        id: userId,
        name: userProfile.name,
        email: userProfile.email,
        image: userProfile.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
        role: userProfile.role || 'user',
        ...userProfile.metadata,
      },
      token
    );

    // Create default channels
    await createProductionChannels();

    logger.info('Production Stream Chat client initialized successfully', { userId });
    return productionStreamClient;

  } catch (error: any) {
    logger.error('Failed to initialize production Stream Chat client', { 
      error: error.message, 
      userId 
    });
    throw new Error(`Production Stream Chat initialization failed: ${error.message}`);
  }
};

// Create production channels
export const createProductionChannels = async (): Promise<void> => {
  try {
    if (!productionStreamClient) {
      throw new Error('Production Stream Chat client not initialized');
    }

    for (const channelConfig of STREAM_PRODUCTION_CONFIG.defaultChannels) {
      const channel = productionStreamClient.channel(
        channelConfig.type,
        channelConfig.id,
        {
          name: channelConfig.name,
          description: channelConfig.description,
          public: channelConfig.public,
          created_by_id: productionStreamClient.userID,
        }
      );

      await channel.watch();
      logger.info('Production channel created', { 
        type: channelConfig.type, 
        id: channelConfig.id 
      });
    }

    logger.info('All production channels created successfully');

  } catch (error: any) {
    logger.error('Failed to create production channels', { error: error.message });
    throw error;
  }
};

// Share workout to production social feed
export const shareWorkoutToProductionFeed = async (
  workoutData: {
    id: string;
    name: string;
    duration: number;
    exercises: any[];
    stats: {
      totalSets: number;
      totalVolume: number;
      personalRecords: number;
    };
    location?: string;
    notes?: string;
  },
  message: string,
  imageUrls?: string[],
  privacy: 'public' | 'friends' | 'private' = 'public'
): Promise<void> => {
  try {
    if (!productionStreamClient) {
      throw new Error('Production Stream Chat client not initialized');
    }

    // Determine channel based on privacy setting
    const channelId = privacy === 'public' ? 'global-feed' : 'friends-feed';
    const socialChannel = productionStreamClient.channel('social', channelId);
    
    await socialChannel.sendMessage({
      text: message,
      attachments: [
        {
          type: 'workout',
          workout_data: workoutData,
          images: imageUrls || [],
          privacy,
        },
      ],
      custom: {
        type: 'workout_share',
        workout_id: workoutData.id,
        privacy,
        location: workoutData.location,
      },
    });

    logger.info('Workout shared to production social feed', { 
      workoutId: workoutData.id,
      privacy,
      channelId
    });

  } catch (error: any) {
    logger.error('Failed to share workout to production feed', { 
      error: error.message, 
      workoutId: workoutData.id 
    });
    throw error;
  }
};

// Create production direct message
export const createProductionDirectMessage = async (
  currentUserId: string,
  otherUserId: string,
  otherUserProfile?: {
    name: string;
    image?: string;
  }
): Promise<any> => {
  try {
    if (!productionStreamClient) {
      throw new Error('Production Stream Chat client not initialized');
    }

    // Check if other user exists and is valid
    const users = await productionStreamClient.queryUsers({ id: otherUserId });
    if (users.users.length === 0) {
      throw new Error(`User ${otherUserId} not found`);
    }

    const channelId = [currentUserId, otherUserId].sort().join('-');
    const channel = productionStreamClient.channel('messaging', channelId, {
      members: [currentUserId, otherUserId],
      created_by_id: currentUserId,
    });

    await channel.watch();
    logger.info('Production direct message channel created', { 
      channelId,
      members: [currentUserId, otherUserId]
    });
    
    return channel;

  } catch (error: any) {
    logger.error('Failed to create production direct message', { 
      error: error.message, 
      currentUserId, 
      otherUserId 
    });
    throw error;
  }
};

// Get production user channels with proper filtering
export const getProductionUserChannels = async (
  userId: string,
  channelType?: string
): Promise<any[]> => {
  try {
    if (!productionStreamClient) {
      throw new Error('Production Stream Chat client not initialized');
    }

    const filter: any = { members: { $in: [userId] } };
    if (channelType) {
      filter.type = channelType;
    }

    const sort = { last_message_at: -1 };
    const channels = await productionStreamClient.queryChannels(filter, sort, {
      limit: 50,
      presence: true,
    });

    return channels;

  } catch (error: any) {
    logger.error('Failed to get production user channels', { 
      error: error.message,
      userId,
      channelType
    });
    throw error;
  }
};

// Disconnect production Stream Chat
export const disconnectProductionStreamChat = async (): Promise<void> => {
  try {
    if (productionStreamClient) {
      await productionStreamClient.disconnectUser();
      productionStreamClient = null;
      logger.info('Production Stream Chat client disconnected');
    }
  } catch (error: any) {
    logger.error('Failed to disconnect production Stream Chat client', { 
      error: error.message 
    });
  }
};

// Get production Stream Chat client
export const getProductionStreamChatClient = (): StreamChat | null => {
  return productionStreamClient;
};

export default {
  initializeProductionStreamChat,
  createProductionChannels,
  shareWorkoutToProductionFeed,
  createProductionDirectMessage,
  getProductionUserChannels,
  disconnectProductionStreamChat,
  getProductionStreamChatClient,
  STREAM_PRODUCTION_CONFIG,
};
