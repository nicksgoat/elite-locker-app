/**
 * Elite Locker - Stream Mode Toggle
 * 
 * This utility allows switching between demo and production Stream Chat modes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '../utils/secureLogger';

const logger = createLogger('StreamModeToggle');

export type StreamMode = 'demo' | 'production';

const STREAM_MODE_KEY = 'stream_chat_mode';

// Get current Stream mode
export const getStreamMode = async (): Promise<StreamMode> => {
  try {
    const mode = await AsyncStorage.getItem(STREAM_MODE_KEY);
    
    // Default to demo mode for safety
    if (mode === 'production' && isProductionConfigured()) {
      return 'production';
    }
    
    return 'demo';
  } catch (error: any) {
    logger.error('Failed to get Stream mode', { error: error.message });
    return 'demo';
  }
};

// Set Stream mode
export const setStreamMode = async (mode: StreamMode): Promise<void> => {
  try {
    if (mode === 'production' && !isProductionConfigured()) {
      throw new Error('Production mode not properly configured. Please check environment variables.');
    }
    
    await AsyncStorage.setItem(STREAM_MODE_KEY, mode);
    logger.info('Stream mode updated', { mode });
  } catch (error: any) {
    logger.error('Failed to set Stream mode', { error: error.message, mode });
    throw error;
  }
};

// Check if production is properly configured
export const isProductionConfigured = (): boolean => {
  const requiredEnvVars = [
    process.env.STREAM_API_KEY,
    process.env.STREAM_SECRET,
    process.env.API_BASE_URL,
  ];
  
  const isConfigured = requiredEnvVars.every(envVar => 
    envVar && envVar !== 'your_actual_api_key_here' && envVar !== 'your_actual_secret_here'
  );
  
  return isConfigured;
};

// Get Stream configuration based on current mode
export const getStreamConfig = async () => {
  const mode = await getStreamMode();
  
  if (mode === 'production') {
    // Import production config
    const { STREAM_PRODUCTION_CONFIG } = await import('./streamConfigProduction');
    return {
      mode: 'production' as const,
      config: STREAM_PRODUCTION_CONFIG,
    };
  } else {
    // Import demo config
    const { STREAM_CONFIG } = await import('./streamConfig');
    return {
      mode: 'demo' as const,
      config: STREAM_CONFIG,
    };
  }
};

// Initialize Stream Chat based on current mode
export const initializeStreamChatByMode = async (
  userId: string,
  userProfile?: {
    name: string;
    email: string;
    image?: string;
    role?: string;
    metadata?: Record<string, any>;
  }
) => {
  const mode = await getStreamMode();
  
  if (mode === 'production' && userProfile) {
    const { initializeProductionStreamChat } = await import('./streamConfigProduction');
    return await initializeProductionStreamChat(userId, userProfile);
  } else {
    const { initializeStreamChat } = await import('./streamConfig');
    return await initializeStreamChat(userId);
  }
};

// Share workout based on current mode
export const shareWorkoutByMode = async (
  workoutData: any,
  message: string,
  imageUrls?: string[],
  privacy?: 'public' | 'friends' | 'private'
) => {
  const mode = await getStreamMode();
  
  if (mode === 'production') {
    const { shareWorkoutToProductionFeed } = await import('./streamConfigProduction');
    return await shareWorkoutToProductionFeed(workoutData, message, imageUrls, privacy);
  } else {
    const { shareWorkoutToFeed } = await import('./streamConfig');
    return await shareWorkoutToFeed(workoutData, message, imageUrls);
  }
};

// Create direct message based on current mode
export const createDirectMessageByMode = async (
  currentUserId: string,
  otherUserId: string,
  otherUserProfile?: {
    name: string;
    image?: string;
  }
) => {
  const mode = await getStreamMode();
  
  if (mode === 'production') {
    const { createProductionDirectMessage } = await import('./streamConfigProduction');
    return await createProductionDirectMessage(currentUserId, otherUserId, otherUserProfile);
  } else {
    const { createDirectMessageChannel } = await import('./streamConfig');
    return await createDirectMessageChannel(currentUserId, otherUserId);
  }
};

// Get user channels based on current mode
export const getUserChannelsByMode = async (
  userId: string,
  channelType?: string
) => {
  const mode = await getStreamMode();
  
  if (mode === 'production') {
    const { getProductionUserChannels } = await import('./streamConfigProduction');
    return await getProductionUserChannels(userId, channelType);
  } else {
    const { getUserChannels } = await import('./streamConfig');
    return await getUserChannels();
  }
};

// Disconnect Stream Chat based on current mode
export const disconnectStreamChatByMode = async () => {
  const mode = await getStreamMode();
  
  if (mode === 'production') {
    const { disconnectProductionStreamChat } = await import('./streamConfigProduction');
    return await disconnectProductionStreamChat();
  } else {
    const { disconnectStreamChat } = await import('./streamConfig');
    return await disconnectStreamChat();
  }
};

// Get Stream client based on current mode
export const getStreamClientByMode = async () => {
  const mode = await getStreamMode();
  
  if (mode === 'production') {
    const { getProductionStreamChatClient } = await import('./streamConfigProduction');
    return getProductionStreamChatClient();
  } else {
    const { getStreamChatClient } = await import('./streamConfig');
    return getStreamChatClient();
  }
};

// Mode information for UI display
export const getStreamModeInfo = async () => {
  const mode = await getStreamMode();
  const isProductionReady = isProductionConfigured();
  
  return {
    currentMode: mode,
    isProductionReady,
    canSwitchToProduction: isProductionReady,
    description: mode === 'production' 
      ? 'Using real Stream Chat with secure tokens and real user data'
      : 'Using demo Stream Chat with test data and demo users',
    features: mode === 'production'
      ? [
          'Real user authentication',
          'Secure JWT tokens',
          'Production channels',
          'Real user profiles',
          'Enterprise security',
        ]
      : [
          'Demo users (demo-user-1, etc.)',
          'Test channels',
          'Development tokens',
          'Placeholder profiles',
          'Demo data only',
        ],
  };
};

export default {
  getStreamMode,
  setStreamMode,
  isProductionConfigured,
  getStreamConfig,
  initializeStreamChatByMode,
  shareWorkoutByMode,
  createDirectMessageByMode,
  getUserChannelsByMode,
  disconnectStreamChatByMode,
  getStreamClientByMode,
  getStreamModeInfo,
};
