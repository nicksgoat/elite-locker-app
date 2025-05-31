import { ApiResponse, StreamingError } from '@elite-locker/shared-types';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { streamingService } from '../services/StreamingService';
import { logger } from '../utils/logger';
import { validateStreamingSettings } from '../utils/validation';

const router = Router();

/**
 * POST /api/streaming/enable
 * Enable streaming for a user and generate overlay URL
 * Note: Auth middleware temporarily disabled for testing
 */
router.post('/enable', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User ID is required',
          code: 'MISSING_USER_ID'
        }
      } as ApiResponse);
    }

    const result = await streamingService.enableStreaming(userId);

    res.status(200).json({
      success: true,
      data: result
    } as ApiResponse);

    logger.info(`Streaming enabled for user: ${userId}`);
  } catch (error) {
    logger.error('Error enabling streaming:', error);

    if (error instanceof StreamingError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    } as ApiResponse);
  }
});

/**
 * POST /api/streaming/disable
 * Disable streaming for a user
 * Note: Auth middleware temporarily disabled for testing
 */
router.post('/disable', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User ID is required',
          code: 'MISSING_USER_ID'
        }
      } as ApiResponse);
    }

    await streamingService.disableStreaming(userId);

    res.status(200).json({
      success: true,
      data: { message: 'Streaming disabled successfully' }
    } as ApiResponse);

    logger.info(`Streaming disabled for user: ${userId}`);
  } catch (error) {
    logger.error('Error disabling streaming:', error);

    if (error instanceof StreamingError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    } as ApiResponse);
  }
});

/**
 * GET /api/streaming/settings
 * Get streaming settings for a user
 */
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User ID is required',
          code: 'MISSING_USER_ID'
        }
      } as ApiResponse);
    }

    const settings = await streamingService.getStreamingSettings(userId);

    res.status(200).json({
      success: true,
      data: settings
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting streaming settings:', error);

    if (error instanceof StreamingError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    } as ApiResponse);
  }
});

/**
 * PUT /api/streaming/settings
 * Update streaming settings for a user
 */
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const settingsData = req.body;

    // Validate the settings data
    const validationResult = validateStreamingSettings(settingsData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Validation error: ${validationResult.errors.join(', ')}`,
          code: 'VALIDATION_ERROR',
          details: validationResult.errors
        }
      } as ApiResponse);
    }

    const updatedSettings = await streamingService.updateStreamingSettings(settingsData);

    res.status(200).json({
      success: true,
      data: updatedSettings
    } as ApiResponse);

    logger.info(`Streaming settings updated for user: ${settingsData.userId}`);
  } catch (error) {
    logger.error('Error updating streaming settings:', error);

    if (error instanceof StreamingError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    } as ApiResponse);
  }
});

/**
 * GET /api/streaming/status/:userId
 * Get streaming status for a user
 */
router.get('/status/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const status = await streamingService.getStreamingStatus(userId);

    res.status(200).json({
      success: true,
      data: status
    } as ApiResponse);
  } catch (error) {
    logger.error('Error getting streaming status:', error);

    if (error instanceof StreamingError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    } as ApiResponse);
  }
});

/**
 * POST /api/streaming/regenerate-url
 * Regenerate overlay URL for a user
 */
router.post('/regenerate-url', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User ID is required',
          code: 'MISSING_USER_ID'
        }
      } as ApiResponse);
    }

    const result = await streamingService.regenerateOverlayUrl(userId);

    res.status(200).json({
      success: true,
      data: result
    } as ApiResponse);

    logger.info(`Overlay URL regenerated for user: ${userId}`);
  } catch (error) {
    logger.error('Error regenerating overlay URL:', error);

    if (error instanceof StreamingError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      } as ApiResponse);
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    } as ApiResponse);
  }
});

export { router as streamingRoutes };

