/**
 * Elite Locker - Stream Chat & Social Feed Configuration
 * 
 * This file configures Stream Chat for messaging and social feed functionality.
 */

import { StreamChat } from 'stream-chat';
import { createLogger } from '../utils/secureLogger';

const logger = createLogger('StreamConfig');

// Stream configuration
export const STREAM_CONFIG = {
  // Demo API key - Replace with your actual Stream API key
  apiKey: process.env.STREAM_API_KEY || 'mmhfdzb5evj2',
  
  // App configuration
  appId: 'elite-locker',
  
  // User token configuration
  tokenProvider: async (userId: string) => {
    // In production, this should call your backend to generate a secure token
    // For demo purposes, we'll use a development token
    return generateDevelopmentToken(userId);
  },
  
  // Channel types
  channelTypes: {
    messaging: 'messaging',
    social: 'social',
    workout: 'workout',
    community: 'community',
  },
  
  // Default channels
  defaultChannels: [
    {
      type: 'social',
      id: 'elite-locker-feed',
      name: 'Elite Locker Community',
      description: 'Share your workouts and connect with the community',
    },
    {
      type: 'community',
      id: 'general-chat',
      name: 'General Chat',
      description: 'General discussion about fitness and workouts',
    },
    {
      type: 'community',
      id: 'workout-tips',
      name: 'Workout Tips',
      description: 'Share and discover workout tips and techniques',
    },
  ],
};

// Stream Chat client instance
let streamChatClient: StreamChat | null = null;

// Initialize Stream Chat client
export const initializeStreamChat = async (userId: string, userToken?: string): Promise<StreamChat> => {
  try {
    if (streamChatClient) {
      logger.info('Stream Chat client already initialized');
      return streamChatClient;
    }

    logger.info('Initializing Stream Chat client', { userId });

    // Create Stream Chat client
    streamChatClient = StreamChat.getInstance(STREAM_CONFIG.apiKey);

    // Generate or use provided token
    const token = userToken || await STREAM_CONFIG.tokenProvider(userId);

    // Connect user
    await streamChatClient.connectUser(
      {
        id: userId,
        name: `User ${userId}`,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      },
      token
    );

    logger.info('Stream Chat client initialized successfully', { userId });
    return streamChatClient;

  } catch (error: any) {
    logger.error('Failed to initialize Stream Chat client', { 
      error: error.message, 
      userId 
    });
    throw new Error(`Stream Chat initialization failed: ${error.message}`);
  }
};

// Get Stream Chat client
export const getStreamChatClient = (): StreamChat | null => {
  return streamChatClient;
};

// Disconnect Stream Chat client
export const disconnectStreamChat = async (): Promise<void> => {
  try {
    if (streamChatClient) {
      await streamChatClient.disconnectUser();
      streamChatClient = null;
      logger.info('Stream Chat client disconnected');
    }
  } catch (error: any) {
    logger.error('Failed to disconnect Stream Chat client', { error: error.message });
  }
};

// Generate development token (for demo purposes only)
const generateDevelopmentToken = (userId: string): string => {
  // This is a simplified token generation for demo purposes
  // In production, use your backend to generate secure JWT tokens
  const payload = {
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days
  };
  
  // For demo, return a base64 encoded payload
  // In production, use proper JWT signing with your Stream secret
  return btoa(JSON.stringify(payload));
};

// Create or join a channel
export const createOrJoinChannel = async (
  type: string,
  id: string,
  name?: string,
  members?: string[]
): Promise<any> => {
  try {
    if (!streamChatClient) {
      throw new Error('Stream Chat client not initialized');
    }

    const channel = streamChatClient.channel(type, id, {
      name: name || id,
      members: members || [],
    });

    await channel.watch();
    logger.info('Channel created/joined successfully', { type, id, name });
    
    return channel;

  } catch (error: any) {
    logger.error('Failed to create/join channel', { 
      error: error.message, 
      type, 
      id 
    });
    throw error;
  }
};

// Create default channels
export const createDefaultChannels = async (): Promise<void> => {
  try {
    if (!streamChatClient) {
      throw new Error('Stream Chat client not initialized');
    }

    for (const channelConfig of STREAM_CONFIG.defaultChannels) {
      await createOrJoinChannel(
        channelConfig.type,
        channelConfig.id,
        channelConfig.name
      );
    }

    logger.info('Default channels created successfully');

  } catch (error: any) {
    logger.error('Failed to create default channels', { error: error.message });
    throw error;
  }
};

// Send workout post to social feed
export const shareWorkoutToFeed = async (
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
  },
  message: string,
  imageUrls?: string[]
): Promise<void> => {
  try {
    if (!streamChatClient) {
      throw new Error('Stream Chat client not initialized');
    }

    const socialChannel = streamChatClient.channel('social', 'elite-locker-feed');
    
    await socialChannel.sendMessage({
      text: message,
      attachments: [
        {
          type: 'workout',
          workout_data: workoutData,
          images: imageUrls || [],
        },
      ],
      custom: {
        type: 'workout_share',
        workout_id: workoutData.id,
      },
    });

    logger.info('Workout shared to social feed', { workoutId: workoutData.id });

  } catch (error: any) {
    logger.error('Failed to share workout to feed', { 
      error: error.message, 
      workoutId: workoutData.id 
    });
    throw error;
  }
};

// Get social feed messages
export const getSocialFeedMessages = async (limit: number = 20): Promise<any[]> => {
  try {
    if (!streamChatClient) {
      throw new Error('Stream Chat client not initialized');
    }

    const socialChannel = streamChatClient.channel('social', 'elite-locker-feed');
    const response = await socialChannel.query({
      messages: { limit },
    });

    return response.messages || [];

  } catch (error: any) {
    logger.error('Failed to get social feed messages', { error: error.message });
    throw error;
  }
};

// Create direct message channel
export const createDirectMessageChannel = async (
  currentUserId: string,
  otherUserId: string
): Promise<any> => {
  try {
    if (!streamChatClient) {
      throw new Error('Stream Chat client not initialized');
    }

    const channelId = [currentUserId, otherUserId].sort().join('-');
    const channel = streamChatClient.channel('messaging', channelId, {
      members: [currentUserId, otherUserId],
    });

    await channel.watch();
    logger.info('Direct message channel created', { channelId });
    
    return channel;

  } catch (error: any) {
    logger.error('Failed to create direct message channel', { 
      error: error.message, 
      currentUserId, 
      otherUserId 
    });
    throw error;
  }
};

// Get user's channels
export const getUserChannels = async (): Promise<any[]> => {
  try {
    if (!streamChatClient) {
      throw new Error('Stream Chat client not initialized');
    }

    const filter = { members: { $in: [streamChatClient.userID] } };
    const sort = { last_message_at: -1 };
    const channels = await streamChatClient.queryChannels(filter, sort);

    return channels;

  } catch (error: any) {
    logger.error('Failed to get user channels', { error: error.message });
    throw error;
  }
};

// Stream Chat event handlers
export const setupStreamEventHandlers = (
  onNewMessage?: (message: any) => void,
  onChannelUpdate?: (channel: any) => void,
  onUserPresence?: (user: any) => void
): void => {
  if (!streamChatClient) {
    logger.warn('Cannot setup event handlers - Stream Chat client not initialized');
    return;
  }

  // New message handler
  if (onNewMessage) {
    streamChatClient.on('message.new', (event) => {
      onNewMessage(event.message);
    });
  }

  // Channel update handler
  if (onChannelUpdate) {
    streamChatClient.on('channel.updated', (event) => {
      onChannelUpdate(event.channel);
    });
  }

  // User presence handler
  if (onUserPresence) {
    streamChatClient.on('user.presence.changed', (event) => {
      onUserPresence(event.user);
    });
  }

  logger.info('Stream event handlers setup successfully');
};

// Cleanup event handlers
export const cleanupStreamEventHandlers = (): void => {
  if (streamChatClient) {
    streamChatClient.off();
    logger.info('Stream event handlers cleaned up');
  }
};

export default {
  initializeStreamChat,
  getStreamChatClient,
  disconnectStreamChat,
  createOrJoinChannel,
  createDefaultChannels,
  shareWorkoutToFeed,
  getSocialFeedMessages,
  createDirectMessageChannel,
  getUserChannels,
  setupStreamEventHandlers,
  cleanupStreamEventHandlers,
};
