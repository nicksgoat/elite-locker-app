import AsyncStorage from '@react-native-async-storage/async-storage';
// Note: In a real implementation, these types would be imported from the shared-types package
// For now, we'll define them locally to avoid import issues

// Conditional import for socket.io-client to prevent errors in React Native
let io: any = null;
let Socket: any = null;

// Check if we're in a React Native environment and socket.io-client is available
try {
  // Use dynamic import to avoid Metro bundler issues
  if (typeof require !== 'undefined') {
    const socketIO = require('socket.io-client');
    io = socketIO.io || socketIO.default?.io;
    Socket = socketIO.Socket || socketIO.default?.Socket;
  }
} catch (error) {
  console.warn('Socket.io-client not available, streaming features will be disabled');
}

interface WorkoutUpdate {
  sessionId: string;
  userId: string;
  currentExercise: {
    name: string;
    category: string;
    muscleGroups: string[];
  };
  currentSet: {
    setNumber: number;
    reps: number;
    weight: number;
    restTime?: number;
    completed: boolean;
  };
  sessionProgress: {
    exercisesCompleted: number;
    totalExercises: number;
    timeElapsed: number;
    estimatedTimeRemaining?: number;
  };
  timestamp: Date;
}

interface SessionStats {
  sessionId: string;
  userId: string;
  totalTime: number;
  exercisesCompleted: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  caloriesBurned?: number;
  averageRestTime?: number;
  personalRecords: any[];
  timestamp: Date;
}

interface StreamingSettings {
  userId: string;
  theme: 'default' | 'neon' | 'minimal' | 'gaming';
  dataSharing: {
    shareCurrentExercise: boolean;
    sharePersonalStats: boolean;
    shareGoals: boolean;
    shareProgressPhotos: boolean;
    shareWorkoutNotes: boolean;
    allowViewerInteraction: boolean;
  };
  overlayPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  showPersonalStats: boolean;
  showGoals: boolean;
  showCurrentExercise: boolean;
  showSessionStats: boolean;
}

type StreamingStatus = 'inactive' | 'starting' | 'active' | 'paused' | 'stopping';

interface ServerToClientEvents {
  workoutUpdate: (data: WorkoutUpdate) => void;
  sessionStats: (data: SessionStats) => void;
  userConnected: (data: { userId: string; username: string }) => void;
  userDisconnected: (data: { userId: string }) => void;
  error: (data: { message: string; code?: string }) => void;
  connectionStatus: (data: { status: 'connected' | 'disconnected' | 'reconnecting' }) => void;
}

interface ClientToServerEvents {
  joinStream: (data: { overlayUrl: string }) => void;
  leaveStream: (data: { overlayUrl: string }) => void;
  publishWorkoutUpdate: (data: WorkoutUpdate) => void;
  publishSessionStats: (data: SessionStats) => void;
  requestCurrentData: (data: { overlayUrl: string }) => void;
}

interface StreamingConfig {
  apiUrl: string;
  socketUrl: string;
  reconnectionAttempts: number;
  reconnectionDelay: number;
}

export class StreamingService {
  private socket: any = null; // Changed to any to handle conditional socket.io import
  private isConnected: boolean = false;
  private isStreaming: boolean = false;
  private currentUserId: string | null = null;
  private overlayUrl: string | null = null;
  private config: StreamingConfig;
  private reconnectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 5;
  private listeners: Map<string, Function[]> = new Map();
  private isSocketIOAvailable: boolean = false;

  constructor(config?: Partial<StreamingConfig>) {
    // Import API_CONFIG dynamically to avoid import issues
    const API_CONFIG = require('../config/api').API_CONFIG;

    this.config = {
      apiUrl: API_CONFIG.STREAMING_API_BASE,
      socketUrl: API_CONFIG.STREAMING_SOCKET_URL,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config
    };

    this.maxReconnectionAttempts = this.config.reconnectionAttempts;
    this.isSocketIOAvailable = io !== null && Socket !== null;

    if (!this.isSocketIOAvailable) {
      console.warn('StreamingService: Socket.io-client not available, streaming features will be disabled');
    }
  }

  /**
   * Initialize the streaming service
   */
  public async initialize(userId: string): Promise<void> {
    this.currentUserId = userId;

    // Load saved streaming settings
    await this.loadStreamingSettings();

    // Connect to socket if streaming is enabled
    if (this.isStreaming) {
      await this.connect();
    }
  }

  /**
   * Enable streaming for the current user
   */
  public async enableStreaming(): Promise<{ overlayUrl: string }> {
    if (!this.currentUserId) {
      throw new Error('User ID not set. Call initialize() first.');
    }

    if (!this.isSocketIOAvailable) {
      throw new Error('Socket.io-client not available. Streaming features are disabled.');
    }

    try {
      console.log('Attempting to enable streaming for user:', this.currentUserId);
      console.log('API URL:', `${this.config.apiUrl}/streaming/enable`);

      const response = await fetch(`${this.config.apiUrl}/streaming/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Authorization temporarily removed for testing
        },
        body: JSON.stringify({ userId: this.currentUserId })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);

      // Try to get response text first to see what we're actually receiving
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to enable streaming');
      }

      this.overlayUrl = data.data.overlayUrl;
      this.isStreaming = true;

      // Save settings
      await this.saveStreamingSettings();

      // Connect to socket
      await this.connect();

      this.emit('streamingEnabled', { overlayUrl: this.overlayUrl });

      return { overlayUrl: this.overlayUrl };
    } catch (error) {
      console.error('Error enabling streaming:', error);
      throw error;
    }
  }

  /**
   * Disable streaming for the current user
   */
  public async disableStreaming(): Promise<void> {
    if (!this.currentUserId) {
      throw new Error('User ID not set. Call initialize() first.');
    }

    try {
      await fetch(`${this.config.apiUrl}/streaming/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Authorization temporarily removed for testing
        },
        body: JSON.stringify({ userId: this.currentUserId })
      });

      this.isStreaming = false;
      this.overlayUrl = null;

      // Disconnect socket
      this.disconnect();

      // Clear saved settings
      await AsyncStorage.removeItem('streaming_settings');

      this.emit('streamingDisabled');
    } catch (error) {
      console.error('Error disabling streaming:', error);
      throw error;
    }
  }

  /**
   * Publish workout update to stream
   */
  public publishWorkoutUpdate(workoutUpdate: WorkoutUpdate): void {
    if (!this.isSocketIOAvailable) {
      console.warn('Socket.io-client not available, cannot publish workout update');
      return;
    }

    if (!this.isConnected || !this.socket) {
      console.warn('Not connected to streaming server');
      return;
    }

    if (!this.isStreaming) {
      console.warn('Streaming is not enabled');
      return;
    }

    this.socket.emit('publishWorkoutUpdate', workoutUpdate);
  }

  /**
   * Publish session stats to stream
   */
  public publishSessionStats(sessionStats: SessionStats): void {
    if (!this.isSocketIOAvailable) {
      console.warn('Socket.io-client not available, cannot publish session stats');
      return;
    }

    if (!this.isConnected || !this.socket) {
      console.warn('Not connected to streaming server');
      return;
    }

    if (!this.isStreaming) {
      console.warn('Streaming is not enabled');
      return;
    }

    this.socket.emit('publishSessionStats', sessionStats);
  }

  /**
   * Get current streaming status
   */
  public getStreamingStatus(): {
    isStreaming: boolean;
    isConnected: boolean;
    overlayUrl: string | null;
    userId: string | null;
  } {
    return {
      isStreaming: this.isStreaming,
      isConnected: this.isConnected,
      overlayUrl: this.overlayUrl,
      userId: this.currentUserId
    };
  }

  /**
   * Connect to the streaming server
   */
  private async connect(): Promise<void> {
    if (!this.isSocketIOAvailable) {
      throw new Error('Socket.io-client not available. Streaming features are disabled.');
    }

    if (this.socket && this.isConnected) {
      return;
    }

    try {
      this.socket = io(`${this.config.socketUrl}/streaming`, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        auth: {
          token: await this.getAuthToken()
        }
      });

      this.setupSocketListeners();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

    } catch (error) {
      console.error('Error connecting to streaming server:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the streaming server
   */
  private disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectionAttempts = 0;
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to streaming server');
      this.isConnected = true;
      this.reconnectionAttempts = 0;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from streaming server:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      this.emit('connectionError', { error: error.message });
    });

    this.socket.on('error', (error) => {
      console.error('Streaming error:', error);
      this.emit('error', error);
    });

    this.socket.on('connectionStatus', (data) => {
      this.emit('connectionStatus', data);
    });
  }

  /**
   * Load streaming settings from storage
   */
  private async loadStreamingSettings(): Promise<void> {
    try {
      const settings = await AsyncStorage.getItem('streaming_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.isStreaming = parsed.isStreaming || false;
        this.overlayUrl = parsed.overlayUrl || null;
      }
    } catch (error) {
      console.error('Error loading streaming settings:', error);
    }
  }

  /**
   * Save streaming settings to storage
   */
  private async saveStreamingSettings(): Promise<void> {
    try {
      const settings = {
        isStreaming: this.isStreaming,
        overlayUrl: this.overlayUrl,
        userId: this.currentUserId
      };
      await AsyncStorage.setItem('streaming_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving streaming settings:', error);
    }
  }

  /**
   * Get authentication token
   */
  private async getAuthToken(): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }

  /**
   * Event listener management
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.disconnect();
    this.listeners.clear();
  }
}

// Create a factory function to safely create the streaming service
function createStreamingService() {
  try {
    return new StreamingService();
  } catch (error) {
    console.error('Failed to create StreamingService instance:', error);
    // Return a mock service that doesn't do anything
    return {
      initialize: async () => Promise.resolve(),
      enableStreaming: async () => Promise.reject(new Error('Streaming service not available')),
      disableStreaming: async () => Promise.resolve(),
      publishWorkoutUpdate: () => {},
      publishSessionStats: () => {},
      getStreamingStatus: () => ({
        isStreaming: false,
        isConnected: false,
        overlayUrl: null,
        userId: null
      }),
      on: () => {},
      off: () => {},
      cleanup: () => {}
    } as any;
  }
}

// Export singleton instance with lazy initialization
let streamingServiceInstance: any = null;

export const streamingService = {
  get instance() {
    if (!streamingServiceInstance) {
      streamingServiceInstance = createStreamingService();
    }
    return streamingServiceInstance;
  },

  // Proxy all methods to the instance
  initialize: async (userId: string) => streamingService.instance.initialize(userId),
  enableStreaming: async () => streamingService.instance.enableStreaming(),
  disableStreaming: async () => streamingService.instance.disableStreaming(),
  publishWorkoutUpdate: (data: any) => streamingService.instance.publishWorkoutUpdate(data),
  publishSessionStats: (data: any) => streamingService.instance.publishSessionStats(data),
  getStreamingStatus: () => streamingService.instance.getStreamingStatus(),
  on: (event: string, callback: Function) => streamingService.instance.on(event, callback),
  off: (event: string, callback?: Function) => streamingService.instance.off(event, callback),
  cleanup: () => streamingService.instance.cleanup()
};
