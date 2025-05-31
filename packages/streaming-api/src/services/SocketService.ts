import { Server as SocketIOServer, Socket } from 'socket.io';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  WorkoutUpdate, 
  SessionStats,
  StreamingError 
} from '@elite-locker/shared-types';
import { logger } from '../utils/logger';
import { validateWorkoutUpdate, validateSessionStats } from '../utils/validation';
import { RateLimiter } from '../utils/rateLimiter';

interface StreamingSocket extends Socket<ClientToServerEvents, ServerToClientEvents> {
  userId?: string;
  overlayUrl?: string;
  isStreamer?: boolean;
}

export class StreamingNamespace {
  private io: SocketIOServer;
  private streamingNamespace: any;
  private activeStreams: Map<string, Set<string>> = new Map(); // overlayUrl -> Set of socket IDs
  private socketToStream: Map<string, string> = new Map(); // socket ID -> overlayUrl
  private rateLimiter: RateLimiter;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.rateLimiter = new RateLimiter();
    this.setupNamespace();
  }

  private setupNamespace() {
    this.streamingNamespace = this.io.of('/streaming');
    
    this.streamingNamespace.on('connection', (socket: StreamingSocket) => {
      logger.info(`Socket connected: ${socket.id}`);
      
      // Set up event handlers
      this.setupSocketHandlers(socket);
      
      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });
    });
  }

  private setupSocketHandlers(socket: StreamingSocket) {
    // Join a stream room (for viewers)
    socket.on('joinStream', async (data) => {
      try {
        await this.handleJoinStream(socket, data);
      } catch (error) {
        this.handleSocketError(socket, error as Error, 'joinStream');
      }
    });

    // Leave a stream room
    socket.on('leaveStream', async (data) => {
      try {
        await this.handleLeaveStream(socket, data);
      } catch (error) {
        this.handleSocketError(socket, error as Error, 'leaveStream');
      }
    });

    // Publish workout update (from streamer)
    socket.on('publishWorkoutUpdate', async (data) => {
      try {
        await this.handleWorkoutUpdate(socket, data);
      } catch (error) {
        this.handleSocketError(socket, error as Error, 'publishWorkoutUpdate');
      }
    });

    // Publish session stats (from streamer)
    socket.on('publishSessionStats', async (data) => {
      try {
        await this.handleSessionStats(socket, data);
      } catch (error) {
        this.handleSocketError(socket, error as Error, 'publishSessionStats');
      }
    });

    // Request current data (for new viewers)
    socket.on('requestCurrentData', async (data) => {
      try {
        await this.handleRequestCurrentData(socket, data);
      } catch (error) {
        this.handleSocketError(socket, error as Error, 'requestCurrentData');
      }
    });
  }

  private async handleJoinStream(socket: StreamingSocket, data: { overlayUrl: string }) {
    const { overlayUrl } = data;
    
    if (!overlayUrl) {
      throw new StreamingError('Overlay URL is required', 'MISSING_OVERLAY_URL', 400);
    }

    // Rate limiting check
    if (!this.rateLimiter.checkLimit(socket.id, 'joinStream')) {
      throw new StreamingError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Join the room
    await socket.join(overlayUrl);
    
    // Track the connection
    if (!this.activeStreams.has(overlayUrl)) {
      this.activeStreams.set(overlayUrl, new Set());
    }
    this.activeStreams.get(overlayUrl)!.add(socket.id);
    this.socketToStream.set(socket.id, overlayUrl);
    
    socket.overlayUrl = overlayUrl;
    
    // Notify about successful connection
    socket.emit('connectionStatus', { status: 'connected' });
    
    // Notify other viewers about new viewer (optional)
    socket.to(overlayUrl).emit('userConnected', { 
      userId: socket.userId || 'anonymous', 
      username: 'Viewer' 
    });
    
    logger.info(`Socket ${socket.id} joined stream: ${overlayUrl}`);
  }

  private async handleLeaveStream(socket: StreamingSocket, data: { overlayUrl: string }) {
    const { overlayUrl } = data;
    
    if (!overlayUrl) {
      throw new StreamingError('Overlay URL is required', 'MISSING_OVERLAY_URL', 400);
    }

    await this.removeSocketFromStream(socket, overlayUrl);
    
    logger.info(`Socket ${socket.id} left stream: ${overlayUrl}`);
  }

  private async handleWorkoutUpdate(socket: StreamingSocket, data: WorkoutUpdate) {
    // Validate the workout update data
    const validationResult = validateWorkoutUpdate(data);
    if (!validationResult.isValid) {
      throw new StreamingError(
        `Invalid workout update: ${validationResult.errors.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    // Rate limiting check
    if (!this.rateLimiter.checkLimit(socket.id, 'publishWorkoutUpdate', 10, 60000)) { // 10 per minute
      throw new StreamingError('Rate limit exceeded for workout updates', 'RATE_LIMIT_EXCEEDED', 429);
    }

    const overlayUrl = socket.overlayUrl;
    if (!overlayUrl) {
      throw new StreamingError('Socket not connected to any stream', 'NOT_IN_STREAM', 400);
    }

    // Mark socket as streamer
    socket.isStreamer = true;
    socket.userId = data.userId;

    // Broadcast to all viewers in the room
    socket.to(overlayUrl).emit('workoutUpdate', data);
    
    logger.info(`Workout update broadcasted to stream ${overlayUrl} by user ${data.userId}`);
  }

  private async handleSessionStats(socket: StreamingSocket, data: SessionStats) {
    // Validate the session stats data
    const validationResult = validateSessionStats(data);
    if (!validationResult.isValid) {
      throw new StreamingError(
        `Invalid session stats: ${validationResult.errors.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }

    // Rate limiting check
    if (!this.rateLimiter.checkLimit(socket.id, 'publishSessionStats', 5, 60000)) { // 5 per minute
      throw new StreamingError('Rate limit exceeded for session stats', 'RATE_LIMIT_EXCEEDED', 429);
    }

    const overlayUrl = socket.overlayUrl;
    if (!overlayUrl) {
      throw new StreamingError('Socket not connected to any stream', 'NOT_IN_STREAM', 400);
    }

    // Mark socket as streamer
    socket.isStreamer = true;
    socket.userId = data.userId;

    // Broadcast to all viewers in the room
    socket.to(overlayUrl).emit('sessionStats', data);
    
    logger.info(`Session stats broadcasted to stream ${overlayUrl} by user ${data.userId}`);
  }

  private async handleRequestCurrentData(socket: StreamingSocket, data: { overlayUrl: string }) {
    const { overlayUrl } = data;
    
    if (!overlayUrl) {
      throw new StreamingError('Overlay URL is required', 'MISSING_OVERLAY_URL', 400);
    }

    // Rate limiting check
    if (!this.rateLimiter.checkLimit(socket.id, 'requestCurrentData', 5, 60000)) { // 5 per minute
      throw new StreamingError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // TODO: Implement fetching current workout data from database
    // For now, we'll just acknowledge the request
    socket.emit('connectionStatus', { status: 'connected' });
    
    logger.info(`Current data requested for stream: ${overlayUrl}`);
  }

  private async removeSocketFromStream(socket: StreamingSocket, overlayUrl: string) {
    await socket.leave(overlayUrl);
    
    // Remove from tracking
    if (this.activeStreams.has(overlayUrl)) {
      this.activeStreams.get(overlayUrl)!.delete(socket.id);
      
      // Clean up empty stream
      if (this.activeStreams.get(overlayUrl)!.size === 0) {
        this.activeStreams.delete(overlayUrl);
      }
    }
    
    this.socketToStream.delete(socket.id);
    socket.overlayUrl = undefined;
    
    // Notify other viewers about disconnection
    if (socket.userId) {
      socket.to(overlayUrl).emit('userDisconnected', { userId: socket.userId });
    }
  }

  private handleDisconnection(socket: StreamingSocket, reason: string) {
    logger.info(`Socket ${socket.id} disconnected: ${reason}`);
    
    // Clean up if socket was in a stream
    const overlayUrl = this.socketToStream.get(socket.id);
    if (overlayUrl) {
      this.removeSocketFromStream(socket, overlayUrl);
    }
    
    // Clean up rate limiter
    this.rateLimiter.cleanup(socket.id);
  }

  private handleSocketError(socket: StreamingSocket, error: Error, event: string) {
    logger.error(`Socket error in ${event}:`, error);
    
    const errorResponse = {
      message: error.message,
      code: error instanceof StreamingError ? error.code : 'INTERNAL_ERROR'
    };
    
    socket.emit('error', errorResponse);
  }

  // Public methods for external use
  public getActiveStreams(): Map<string, number> {
    const streamCounts = new Map<string, number>();
    for (const [overlayUrl, sockets] of this.activeStreams) {
      streamCounts.set(overlayUrl, sockets.size);
    }
    return streamCounts;
  }

  public getStreamViewerCount(overlayUrl: string): number {
    return this.activeStreams.get(overlayUrl)?.size || 0;
  }

  public broadcastToStream(overlayUrl: string, event: keyof ServerToClientEvents, data: any) {
    this.streamingNamespace.to(overlayUrl).emit(event, data);
  }
}
