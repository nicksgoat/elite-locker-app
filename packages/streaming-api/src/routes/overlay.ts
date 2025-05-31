import { Router } from 'express';
import { optionalAuthMiddleware } from '../middleware/auth';
import { validateOverlayUrl } from '../utils/validation';
import { logger } from '../utils/logger';
import { ApiResponse, StreamingError } from '@elite-locker/shared-types';

const router = Router();

// Mock data storage (in production, use MongoDB)
const overlayData: any = {};

/**
 * GET /api/overlay/:overlayUrl
 * Get overlay data for public access
 */
router.get('/:overlayUrl', optionalAuthMiddleware, async (req, res) => {
  try {
    const { overlayUrl } = req.params;
    
    // Validate overlay URL
    const validationResult = validateOverlayUrl({ overlayUrl });
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid overlay URL: ${validationResult.errors.join(', ')}`,
          code: 'INVALID_OVERLAY_URL',
          details: validationResult.errors,
        },
      } as ApiResponse);
    }

    // Check if overlay exists
    const data = overlayData[overlayUrl];
    if (!data) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Overlay not found',
          code: 'OVERLAY_NOT_FOUND',
        },
      } as ApiResponse);
    }

    // Return overlay data
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: data.userId,
          username: data.username || 'Anonymous',
          displayName: data.displayName || 'Streamer',
        },
        settings: data.settings || {
          theme: 'default',
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
        currentWorkout: data.currentWorkout || null,
        sessionStats: data.sessionStats || null,
        isLive: data.isLive || false,
      },
    } as ApiResponse);

    logger.info(`Overlay data requested for: ${overlayUrl}`);
  } catch (error) {
    logger.error('Error getting overlay data:', error);
    
    if (error instanceof StreamingError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      } as ApiResponse);
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    } as ApiResponse);
  }
});

/**
 * POST /api/overlay/:overlayUrl/update
 * Update overlay data (for testing purposes)
 */
router.post('/:overlayUrl/update', optionalAuthMiddleware, async (req, res) => {
  try {
    const { overlayUrl } = req.params;
    const updateData = req.body;
    
    // Validate overlay URL
    const validationResult = validateOverlayUrl({ overlayUrl });
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Invalid overlay URL: ${validationResult.errors.join(', ')}`,
          code: 'INVALID_OVERLAY_URL',
          details: validationResult.errors,
        },
      } as ApiResponse);
    }

    // Initialize overlay data if it doesn't exist
    if (!overlayData[overlayUrl]) {
      overlayData[overlayUrl] = {
        userId: updateData.userId || 'demo-user',
        username: updateData.username || 'DemoStreamer',
        displayName: updateData.displayName || 'Demo Streamer',
        isLive: false,
      };
    }

    // Update overlay data
    if (updateData.currentWorkout) {
      overlayData[overlayUrl].currentWorkout = updateData.currentWorkout;
    }
    
    if (updateData.sessionStats) {
      overlayData[overlayUrl].sessionStats = updateData.sessionStats;
    }
    
    if (updateData.settings) {
      overlayData[overlayUrl].settings = { 
        ...overlayData[overlayUrl].settings, 
        ...updateData.settings 
      };
    }
    
    if (typeof updateData.isLive === 'boolean') {
      overlayData[overlayUrl].isLive = updateData.isLive;
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Overlay data updated successfully',
        overlayUrl,
      },
    } as ApiResponse);

    logger.info(`Overlay data updated for: ${overlayUrl}`);
  } catch (error) {
    logger.error('Error updating overlay data:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    } as ApiResponse);
  }
});

/**
 * GET /api/overlay/demo/create
 * Create a demo overlay for testing
 */
router.get('/demo/create', async (req, res) => {
  try {
    const demoOverlayUrl = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create demo overlay data
    overlayData[demoOverlayUrl] = {
      userId: 'demo-user-123',
      username: 'FitnessStreamer',
      displayName: 'Fitness Streamer',
      isLive: true,
      settings: {
        theme: 'default',
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
      currentWorkout: {
        sessionId: 'demo-session-123',
        userId: 'demo-user-123',
        currentExercise: {
          name: 'Bench Press',
          category: 'Chest',
          muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
        },
        currentSet: {
          setNumber: 3,
          reps: 8,
          weight: 185,
          restTime: 120,
          completed: false,
        },
        sessionProgress: {
          exercisesCompleted: 2,
          totalExercises: 5,
          timeElapsed: 1800, // 30 minutes
          estimatedTimeRemaining: 1200, // 20 minutes
        },
        timestamp: new Date(),
      },
      sessionStats: {
        sessionId: 'demo-session-123',
        userId: 'demo-user-123',
        totalTime: 1800,
        exercisesCompleted: 2,
        totalSets: 8,
        totalReps: 64,
        totalVolume: 8640, // total weight lifted
        caloriesBurned: 245,
        averageRestTime: 90,
        personalRecords: [
          {
            exerciseName: 'Bench Press',
            type: 'weight',
            value: 185,
            previousValue: 180,
            improvement: 5,
          },
        ],
        timestamp: new Date(),
      },
    };

    res.status(200).json({
      success: true,
      data: {
        overlayUrl: demoOverlayUrl,
        demoUrl: `http://localhost:3000/${demoOverlayUrl}`,
        message: 'Demo overlay created successfully',
      },
    } as ApiResponse);

    logger.info(`Demo overlay created: ${demoOverlayUrl}`);
  } catch (error) {
    logger.error('Error creating demo overlay:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    } as ApiResponse);
  }
});

export { router as overlayRoutes };
