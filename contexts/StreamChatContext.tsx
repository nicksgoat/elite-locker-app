/**
 * Elite Locker - Stream Chat Context Provider
 * 
 * This context provides Stream Chat functionality throughout the app.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-react-native';
import {
  initializeStreamChat,
  getStreamChatClient,
  disconnectStreamChat,
  createDefaultChannels,
  shareWorkoutToFeed,
  getSocialFeedMessages,
  createDirectMessageChannel,
  getUserChannels,
  setupStreamEventHandlers,
  cleanupStreamEventHandlers,
} from '../lib/streamConfig';
import { createLogger } from '../utils/secureLogger';

const logger = createLogger('StreamChatContext');

// Context interface
interface StreamChatContextType {
  // Client state
  client: StreamChat | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User info
  currentUser: any | null;
  
  // Connection methods
  connectUser: (userId: string, userToken?: string) => Promise<void>;
  disconnectUser: () => Promise<void>;
  
  // Channel methods
  createChannel: (type: string, id: string, name?: string, members?: string[]) => Promise<any>;
  getChannels: () => Promise<any[]>;
  createDirectMessage: (otherUserId: string) => Promise<any>;
  
  // Social feed methods
  shareWorkout: (workoutData: any, message: string, imageUrls?: string[]) => Promise<void>;
  getFeedMessages: (limit?: number) => Promise<any[]>;
  
  // Event handlers
  onNewMessage: ((message: any) => void) | null;
  setOnNewMessage: (handler: (message: any) => void) => void;
  
  // Utility methods
  clearError: () => void;
  refreshConnection: () => Promise<void>;
}

// Create context
const StreamChatContext = createContext<StreamChatContextType | null>(null);

// Provider component
export const StreamChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [onNewMessage, setOnNewMessage] = useState<((message: any) => void) | null>(null);

  // Connect user to Stream Chat
  const connectUser = useCallback(async (userId: string, userToken?: string) => {
    if (isConnected && client) {
      logger.info('User already connected to Stream Chat');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info('Connecting user to Stream Chat', { userId });

      const streamClient = await initializeStreamChat(userId, userToken);
      setClient(streamClient);
      setCurrentUser(streamClient.user);
      setIsConnected(true);

      // Create default channels
      await createDefaultChannels();

      // Setup event handlers
      setupStreamEventHandlers(
        onNewMessage || undefined,
        (channel) => {
          logger.info('Channel updated', { channelId: channel.id });
        },
        (user) => {
          logger.info('User presence changed', { userId: user.id, online: user.online });
        }
      );

      logger.info('User connected to Stream Chat successfully', { userId });

    } catch (error: any) {
      const errorMessage = `Failed to connect to Stream Chat: ${error.message}`;
      logger.error('Stream Chat connection failed', { error: error.message, userId });
      setError(errorMessage);
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, client, onNewMessage]);

  // Disconnect user from Stream Chat
  const disconnectUser = useCallback(async () => {
    if (!isConnected || !client) {
      logger.info('User not connected to Stream Chat');
      return;
    }

    setIsLoading(true);

    try {
      logger.info('Disconnecting user from Stream Chat');

      cleanupStreamEventHandlers();
      await disconnectStreamChat();
      
      setClient(null);
      setCurrentUser(null);
      setIsConnected(false);
      setError(null);

      logger.info('User disconnected from Stream Chat successfully');

    } catch (error: any) {
      logger.error('Failed to disconnect from Stream Chat', { error: error.message });
      setError(`Failed to disconnect: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, client]);

  // Create or join channel
  const createChannel = useCallback(async (
    type: string,
    id: string,
    name?: string,
    members?: string[]
  ) => {
    if (!client) {
      throw new Error('Stream Chat client not connected');
    }

    try {
      const channel = client.channel(type, id, {
        name: name || id,
        members: members || [],
      });

      await channel.watch();
      logger.info('Channel created/joined', { type, id, name });
      
      return channel;

    } catch (error: any) {
      logger.error('Failed to create/join channel', { error: error.message, type, id });
      throw error;
    }
  }, [client]);

  // Get user's channels
  const getChannels = useCallback(async () => {
    if (!client) {
      throw new Error('Stream Chat client not connected');
    }

    try {
      return await getUserChannels();
    } catch (error: any) {
      logger.error('Failed to get channels', { error: error.message });
      throw error;
    }
  }, [client]);

  // Create direct message channel
  const createDirectMessage = useCallback(async (otherUserId: string) => {
    if (!client || !currentUser) {
      throw new Error('Stream Chat client not connected');
    }

    try {
      return await createDirectMessageChannel(currentUser.id, otherUserId);
    } catch (error: any) {
      logger.error('Failed to create direct message', { error: error.message, otherUserId });
      throw error;
    }
  }, [client, currentUser]);

  // Share workout to social feed
  const shareWorkout = useCallback(async (
    workoutData: any,
    message: string,
    imageUrls?: string[]
  ) => {
    if (!client) {
      throw new Error('Stream Chat client not connected');
    }

    try {
      await shareWorkoutToFeed(workoutData, message, imageUrls);
      logger.info('Workout shared successfully', { workoutId: workoutData.id });
    } catch (error: any) {
      logger.error('Failed to share workout', { error: error.message, workoutId: workoutData.id });
      throw error;
    }
  }, [client]);

  // Get social feed messages
  const getFeedMessages = useCallback(async (limit: number = 20) => {
    if (!client) {
      throw new Error('Stream Chat client not connected');
    }

    try {
      return await getSocialFeedMessages(limit);
    } catch (error: any) {
      logger.error('Failed to get feed messages', { error: error.message });
      throw error;
    }
  }, [client]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh connection
  const refreshConnection = useCallback(async () => {
    if (currentUser) {
      await disconnectUser();
      await connectUser(currentUser.id);
    }
  }, [currentUser, disconnectUser, connectUser]);

  // Auto-connect demo user on mount
  useEffect(() => {
    const autoConnect = async () => {
      if (!isConnected && !isLoading) {
        try {
          // Auto-connect with demo user
          await connectUser('demo-user-1');
        } catch (error) {
          logger.error('Auto-connect failed', { error: error.message });
        }
      }
    };

    autoConnect();
  }, [isConnected, isLoading, connectUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnectUser();
      }
    };
  }, []);

  const contextValue: StreamChatContextType = {
    client,
    isConnected,
    isLoading,
    error,
    currentUser,
    connectUser,
    disconnectUser,
    createChannel,
    getChannels,
    createDirectMessage,
    shareWorkout,
    getFeedMessages,
    onNewMessage,
    setOnNewMessage,
    clearError,
    refreshConnection,
  };

  // Render with Stream Chat providers
  if (client && isConnected) {
    return (
      <StreamChatContext.Provider value={contextValue}>
        <OverlayProvider>
          <Chat client={client}>
            {children}
          </Chat>
        </OverlayProvider>
      </StreamChatContext.Provider>
    );
  }

  // Render without Stream Chat providers when not connected
  return (
    <StreamChatContext.Provider value={contextValue}>
      {children}
    </StreamChatContext.Provider>
  );
};

// Hook to use Stream Chat context
export const useStreamChat = (): StreamChatContextType => {
  const context = useContext(StreamChatContext);
  if (!context) {
    throw new Error('useStreamChat must be used within a StreamChatProvider');
  }
  return context;
};

export default StreamChatContext;
