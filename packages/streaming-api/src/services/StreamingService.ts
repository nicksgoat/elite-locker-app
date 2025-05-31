import { StreamingError } from '@elite-locker/shared-types';
import { logger } from '../utils/logger';

export class StreamingService {
  private static instance: StreamingService;
  private activeStreams: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): StreamingService {
    if (!StreamingService.instance) {
      StreamingService.instance = new StreamingService();
    }
    return StreamingService.instance;
  }

  /**
   * Start a new streaming session
   */
  public async startStream(userId: string, streamData: any): Promise<any> {
    try {
      logger.info(`Starting stream for user: ${userId}`);

      // Check if user already has an active stream
      if (this.activeStreams.has(userId)) {
        throw new StreamingError('User already has an active stream', 'STREAM_ALREADY_ACTIVE', 409);
      }

      // Generate unique stream ID
      const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create stream session
      const streamSession = {
        streamId,
        userId,
        startTime: new Date(),
        status: 'active',
        overlayUrl: `overlay_${streamId}`,
        settings: streamData.settings || {
          dataSharing: {
            shareCurrentExercise: true,
            sharePersonalStats: true,
            shareGoals: true,
            shareProgressPhotos: false,
            shareWorkoutNotes: false,
            allowViewerInteraction: true,
          },
          overlayPosition: {
            x: 10,
            y: 10,
            width: 400,
            height: 300,
          },
          showPersonalStats: true,
          showGoals: true,
          showCurrentExercise: true,
          showSessionStats: true,
        },
        currentWorkout: null,
        sessionStats: null,
        viewerCount: 0,
        ...streamData,
      };

      // Store active stream
      this.activeStreams.set(userId, streamSession);

      logger.info(`Stream started successfully: ${streamId}`);

      return {
        success: true,
        data: streamSession,
      };
    } catch (error) {
      logger.error('Error starting stream:', error);
      throw error;
    }
  }

  /**
   * Stop a streaming session
   */
  public async stopStream(userId: string): Promise<any> {
    try {
      logger.info(`Stopping stream for user: ${userId}`);

      const streamSession = this.activeStreams.get(userId);
      if (!streamSession) {
        throw new StreamingError('No active stream found for user', 'STREAM_NOT_FOUND', 404);
      }

      // Update stream session
      streamSession.status = 'ended';
      streamSession.endTime = new Date();
      streamSession.duration = streamSession.endTime.getTime() - streamSession.startTime.getTime();

      // Remove from active streams
      this.activeStreams.delete(userId);

      logger.info(`Stream stopped successfully: ${streamSession.streamId}`);

      return {
        success: true,
        data: streamSession,
      };
    } catch (error) {
      logger.error('Error stopping stream:', error);
      throw error;
    }
  }

  /**
   * Get active stream for user
   */
  public getActiveStream(userId: string): any | null {
    return this.activeStreams.get(userId) || null;
  }

  /**
   * Update stream data
   */
  public async updateStream(userId: string, updateData: any): Promise<any> {
    try {
      const streamSession = this.activeStreams.get(userId);
      if (!streamSession) {
        throw new StreamingError('No active stream found for user', 'STREAM_NOT_FOUND', 404);
      }

      // Update stream data
      if (updateData.currentWorkout) {
        streamSession.currentWorkout = updateData.currentWorkout;
      }

      if (updateData.sessionStats) {
        streamSession.sessionStats = updateData.sessionStats;
      }

      if (updateData.settings) {
        streamSession.settings = { ...streamSession.settings, ...updateData.settings };
      }

      streamSession.lastUpdated = new Date();

      logger.info(`Stream updated: ${streamSession.streamId}`);

      return {
        success: true,
        data: streamSession,
      };
    } catch (error) {
      logger.error('Error updating stream:', error);
      throw error;
    }
  }

  /**
   * Get stream by overlay URL
   */
  public getStreamByOverlayUrl(overlayUrl: string): any | null {
    for (const [userId, stream] of this.activeStreams.entries()) {
      if (stream.overlayUrl === overlayUrl) {
        return stream;
      }
    }
    return null;
  }

  /**
   * Get all active streams
   */
  public getAllActiveStreams(): any[] {
    return Array.from(this.activeStreams.values());
  }

  /**
   * Update viewer count for stream
   */
  public updateViewerCount(userId: string, viewerCount: number): void {
    const streamSession = this.activeStreams.get(userId);
    if (streamSession) {
      streamSession.viewerCount = viewerCount;
      streamSession.lastUpdated = new Date();
    }
  }

  /**
   * Get stream statistics
   */
  public getStreamStats(userId: string): any {
    const streamSession = this.activeStreams.get(userId);
    if (!streamSession) {
      return null;
    }

    const now = new Date();
    const duration = now.getTime() - streamSession.startTime.getTime();

    return {
      streamId: streamSession.streamId,
      userId,
      duration,
      viewerCount: streamSession.viewerCount,
      status: streamSession.status,
      startTime: streamSession.startTime,
      lastUpdated: streamSession.lastUpdated,
      hasCurrentWorkout: !!streamSession.currentWorkout,
      hasSessionStats: !!streamSession.sessionStats,
    };
  }

  /**
   * Clean up inactive streams (called periodically)
   */
  public cleanupInactiveStreams(): void {
    const now = new Date();
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

    for (const [userId, stream] of this.activeStreams.entries()) {
      const lastActivity = stream.lastUpdated || stream.startTime;
      const inactiveTime = now.getTime() - lastActivity.getTime();

      if (inactiveTime > maxInactiveTime) {
        logger.info(`Cleaning up inactive stream: ${stream.streamId}`);
        this.activeStreams.delete(userId);
      }
    }
  }

  /**
   * Enable streaming for a user
   */
  public async enableStreaming(userId: string): Promise<any> {
    try {
      logger.info(`Enabling streaming for user: ${userId}`);

      // Check if user already has streaming enabled
      if (this.activeStreams.has(userId)) {
        const existingStream = this.activeStreams.get(userId);
        return {
          overlayUrl: existingStream?.overlayUrl,
          streamId: existingStream?.streamId,
          message: 'Streaming already enabled',
        };
      }

      // Generate unique overlay URL
      const overlayUrl = `overlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create streaming session
      const streamSession = {
        streamId: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        overlayUrl,
        enabled: true,
        createdAt: new Date(),
        settings: {
          dataSharing: {
            shareCurrentExercise: true,
            sharePersonalStats: true,
            shareGoals: true,
            shareProgressPhotos: false,
            shareWorkoutNotes: false,
            allowViewerInteraction: true,
          },
          overlayPosition: {
            x: 10,
            y: 10,
            width: 400,
            height: 300,
          },
          showPersonalStats: true,
          showGoals: true,
          showCurrentExercise: true,
          showSessionStats: true,
        },
      };

      // Store streaming session
      this.activeStreams.set(userId, streamSession);

      logger.info(`Streaming enabled successfully for user: ${userId}`);

      return {
        overlayUrl,
        streamId: streamSession.streamId,
        message: 'Streaming enabled successfully',
      };
    } catch (error) {
      logger.error('Error enabling streaming:', error);
      throw error;
    }
  }

  /**
   * Disable streaming for a user
   */
  public async disableStreaming(userId: string): Promise<void> {
    try {
      logger.info(`Disabling streaming for user: ${userId}`);

      const streamSession = this.activeStreams.get(userId);
      if (!streamSession) {
        throw new StreamingError('No streaming session found for user', 'STREAM_NOT_FOUND', 404);
      }

      // Remove streaming session
      this.activeStreams.delete(userId);

      logger.info(`Streaming disabled successfully for user: ${userId}`);
    } catch (error) {
      logger.error('Error disabling streaming:', error);
      throw error;
    }
  }

  /**
   * Get streaming settings for a user
   */
  public async getStreamingSettings(userId: string): Promise<any> {
    try {
      const streamSession = this.activeStreams.get(userId);
      if (!streamSession) {
        throw new StreamingError('No streaming session found for user', 'STREAM_NOT_FOUND', 404);
      }

      return {
        userId,
        enabled: streamSession.enabled,
        overlayUrl: streamSession.overlayUrl,
        settings: streamSession.settings,
      };
    } catch (error) {
      logger.error('Error getting streaming settings:', error);
      throw error;
    }
  }

  /**
   * Update streaming settings for a user
   */
  public async updateStreamingSettings(settingsData: any): Promise<any> {
    try {
      const { userId, ...settings } = settingsData;

      const streamSession = this.activeStreams.get(userId);
      if (!streamSession) {
        throw new StreamingError('No streaming session found for user', 'STREAM_NOT_FOUND', 404);
      }

      // Update settings
      streamSession.settings = { ...streamSession.settings, ...settings };
      streamSession.lastUpdated = new Date();

      logger.info(`Streaming settings updated for user: ${userId}`);

      return {
        userId,
        enabled: streamSession.enabled,
        overlayUrl: streamSession.overlayUrl,
        settings: streamSession.settings,
      };
    } catch (error) {
      logger.error('Error updating streaming settings:', error);
      throw error;
    }
  }

  /**
   * Get streaming status for a user
   */
  public async getStreamingStatus(userId: string): Promise<any> {
    try {
      const streamSession = this.activeStreams.get(userId);

      if (!streamSession) {
        return {
          userId,
          enabled: false,
          isLive: false,
          overlayUrl: null,
        };
      }

      return {
        userId,
        enabled: streamSession.enabled,
        isLive: !!streamSession.status && streamSession.status === 'active',
        overlayUrl: streamSession.overlayUrl,
        streamId: streamSession.streamId,
        createdAt: streamSession.createdAt,
        lastUpdated: streamSession.lastUpdated,
      };
    } catch (error) {
      logger.error('Error getting streaming status:', error);
      throw error;
    }
  }

  /**
   * Regenerate overlay URL for a user
   */
  public async regenerateOverlayUrl(userId: string): Promise<any> {
    try {
      const streamSession = this.activeStreams.get(userId);
      if (!streamSession) {
        throw new StreamingError('No streaming session found for user', 'STREAM_NOT_FOUND', 404);
      }

      // Generate new overlay URL
      const newOverlayUrl = `overlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Update session
      streamSession.overlayUrl = newOverlayUrl;
      streamSession.lastUpdated = new Date();

      logger.info(`Overlay URL regenerated for user: ${userId}`);

      return {
        overlayUrl: newOverlayUrl,
        streamId: streamSession.streamId,
        message: 'Overlay URL regenerated successfully',
      };
    } catch (error) {
      logger.error('Error regenerating overlay URL:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const streamingService = StreamingService.getInstance();
