import { io, Socket } from 'socket.io-client';
import { 
  ServerToClientEvents, 
  ClientToServerEvents,
  WorkoutUpdate,
  SessionStats,
  StreamingSettings
} from '@elite-locker/shared-types';

interface OverlayConfig {
  socketUrl: string;
  apiUrl: string;
  reconnectionAttempts: number;
  reconnectionDelay: number;
}

export class OverlayManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private overlayUrl: string | null = null;
  private config: OverlayConfig;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 5;
  private isInitialized: boolean = false;

  constructor(config?: Partial<OverlayConfig>) {
    this.config = {
      socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config
    };
    
    this.maxReconnectionAttempts = this.config.reconnectionAttempts;
  }

  /**
   * Initialize the overlay manager with an overlay URL
   */
  public async initialize(overlayUrl: string): Promise<void> {
    if (this.isInitialized) {
      throw new Error('OverlayManager is already initialized');
    }

    this.overlayUrl = overlayUrl;
    
    try {
      // Fetch overlay settings from API
      await this.fetchOverlaySettings();
      
      // Connect to socket
      await this.connect();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize overlay manager:', error);
      throw error;
    }
  }

  /**
   * Connect to the streaming server
   */
  private async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    try {
      this.socket = io(`${this.config.socketUrl}/streaming`, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        forceNew: true
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

      // Join the stream room
      if (this.overlayUrl) {
        this.socket.emit('joinStream', { overlayUrl: this.overlayUrl });
      }

    } catch (error) {
      console.error('Error connecting to streaming server:', error);
      throw error;
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to streaming server');
      this.reconnectionAttempts = 0;
      this.emit('connected');
      
      // Request current data when connected
      if (this.overlayUrl) {
        this.socket!.emit('requestCurrentData', { overlayUrl: this.overlayUrl });
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from streaming server:', reason);
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleConnectionError(error);
    });

    this.socket.on('error', (error) => {
      console.error('Streaming error:', error);
      this.emit('error', error);
    });

    this.socket.on('workoutUpdate', (data: WorkoutUpdate) => {
      console.log('Received workout update:', data);
      this.emit('workoutUpdate', data);
    });

    this.socket.on('sessionStats', (data: SessionStats) => {
      console.log('Received session stats:', data);
      this.emit('sessionStats', data);
    });

    this.socket.on('userConnected', (data) => {
      console.log('User connected:', data);
      this.emit('userConnected', data);
    });

    this.socket.on('userDisconnected', (data) => {
      console.log('User disconnected:', data);
      this.emit('userDisconnected', data);
    });

    this.socket.on('connectionStatus', (data) => {
      console.log('Connection status:', data);
      this.emit('connectionStatus', data);
    });
  }

  /**
   * Handle connection errors with exponential backoff
   */
  private handleConnectionError(error: Error): void {
    this.reconnectionAttempts++;
    
    if (this.reconnectionAttempts <= this.maxReconnectionAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectionAttempts), 30000);
      console.log(`Reconnection attempt ${this.reconnectionAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.connect().catch(err => {
          console.error('Reconnection failed:', err);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('error', { 
        message: 'Failed to connect after multiple attempts',
        code: 'CONNECTION_FAILED'
      });
    }
  }

  /**
   * Fetch overlay settings from API
   */
  private async fetchOverlaySettings(): Promise<void> {
    if (!this.overlayUrl) {
      throw new Error('Overlay URL not set');
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/overlay/${this.overlayUrl}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch overlay settings');
      }
      
      // Emit settings update
      if (data.data.settings) {
        this.emit('settingsUpdate', data.data.settings);
      }
      
      // Emit initial data if available
      if (data.data.currentWorkout) {
        this.emit('workoutUpdate', data.data.currentWorkout);
      }
      
      if (data.data.sessionStats) {
        this.emit('sessionStats', data.data.sessionStats);
      }
      
    } catch (error) {
      console.error('Error fetching overlay settings:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    isConnected: boolean;
    isInitialized: boolean;
    overlayUrl: string | null;
  } {
    return {
      isConnected: this.socket?.connected || false,
      isInitialized: this.isInitialized,
      overlayUrl: this.overlayUrl
    };
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
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.socket) {
      // Leave the stream room before disconnecting
      if (this.overlayUrl) {
        this.socket.emit('leaveStream', { overlayUrl: this.overlayUrl });
      }
      
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.listeners.clear();
    this.isInitialized = false;
    this.overlayUrl = null;
    this.reconnectionAttempts = 0;
  }

  /**
   * Manually refresh overlay data
   */
  public refreshData(): void {
    if (this.socket?.connected && this.overlayUrl) {
      this.socket.emit('requestCurrentData', { overlayUrl: this.overlayUrl });
    }
  }
}
