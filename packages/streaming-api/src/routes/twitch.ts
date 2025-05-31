import { ApiResponse, StreamingError } from '@elite-locker/shared-types';
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth';
import { TwitchChatBot } from '../services/TwitchChatBot';
import { TwitchService } from '../services/TwitchService';
import { logger } from '../utils/logger';

const router = Router();
let twitchService: TwitchService | null = null;
const chatBots = new Map<string, TwitchChatBot>(); // userId -> chatBot

// Lazy initialization of TwitchService to ensure environment variables are loaded
function getTwitchService(): TwitchService {
  if (!twitchService) {
    twitchService = new TwitchService();
  }
  return twitchService;
}

/**
 * GET /api/twitch/auth-url
 * Get Twitch OAuth authorization URL
 * Note: No auth middleware needed for initial OAuth flow
 */
router.get('/auth-url', async (req, res) => {
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

    const state = uuidv4(); // Use this to verify the callback
    // TODO: Store state in database/cache with userId for verification

    const authUrl = getTwitchService().getAuthorizationUrl(state);

    res.status(200).json({
      success: true,
      data: {
        authUrl,
        state
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error generating Twitch auth URL:', error);

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
 * GET /api/twitch/callback
 * Handle Twitch OAuth callback (GET request from Twitch redirect)
 * Note: No auth middleware needed for OAuth callback
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Code and state are required',
          code: 'MISSING_PARAMETERS'
        }
      } as ApiResponse);
    }

    // TODO: Verify state matches what was stored for this user
    // For now, we'll proceed without user verification

    // Exchange code for tokens
    const tokens = await getTwitchService().exchangeCodeForTokens(code as string);

    // Get user information
    const twitchUser = await getTwitchService().getUser(tokens.accessToken);

    // TODO: Store tokens and user info in database
    // For now, we'll return a success page or redirect

    // Return a simple success page that can communicate back to the mobile app
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitch Connected Successfully</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #9146ff, #6441a5);
              color: white;
              text-align: center;
              padding: 40px 20px;
              margin: 0;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .container {
              max-width: 400px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              padding: 40px;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            h1 { margin-bottom: 20px; font-size: 24px; }
            p { margin-bottom: 15px; opacity: 0.9; }
            .user-info {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
            }
            .close-btn {
              background: #00ff88;
              color: #000;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Successfully Connected!</h1>
            <p>Your Twitch account has been linked to Elite Locker.</p>
            <div class="user-info">
              <strong>${twitchUser.displayName}</strong><br>
              <small>@${twitchUser.login}</small>
            </div>
            <p>You can now close this window and return to the app.</p>
            <button class="close-btn" onclick="window.close()">Close Window</button>
          </div>
          <script>
            // Try to communicate success back to the mobile app
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'TWITCH_AUTH_SUCCESS',
                data: {
                  twitchUser: ${JSON.stringify(twitchUser)},
                  message: 'Successfully connected to Twitch!'
                }
              }));
            }

            // Auto-close after 3 seconds
            setTimeout(() => {
              if (window.close) window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(successHtml);

    logger.info(`Successfully connected Twitch account: ${twitchUser.login}`);

  } catch (error) {
    logger.error('Error handling Twitch callback:', error);

    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitch Connection Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #ff4757, #c44569);
              color: white;
              text-align: center;
              padding: 40px 20px;
              margin: 0;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .container {
              max-width: 400px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              padding: 40px;
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            h1 { margin-bottom: 20px; font-size: 24px; }
            p { margin-bottom: 15px; opacity: 0.9; }
            .close-btn {
              background: #ff6b7a;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Connection Failed</h1>
            <p>There was an error connecting your Twitch account.</p>
            <p>Please try again from the app.</p>
            <button class="close-btn" onclick="window.close()">Close Window</button>
          </div>
          <script>
            // Try to communicate error back to the mobile app
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'TWITCH_AUTH_ERROR',
                error: 'Failed to connect Twitch account'
              }));
            }

            // Auto-close after 5 seconds
            setTimeout(() => {
              if (window.close) window.close();
            }, 5000);
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  }
});

/**
 * POST /api/twitch/callback
 * Handle Twitch OAuth callback (POST request for mobile app communication)
 * Note: No auth middleware needed for OAuth callback
 */
router.post('/callback', async (req, res) => {
  try {
    const { code, state, userId } = req.body;

    if (!code || !state || !userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Code, state, and user ID are required',
          code: 'MISSING_PARAMETERS'
        }
      } as ApiResponse);
    }

    // TODO: Verify state matches what was stored for this user

    // Exchange code for tokens
    const tokens = await getTwitchService().exchangeCodeForTokens(code);

    // Get user information
    const twitchUser = await getTwitchService().getUser(tokens.accessToken);

    // TODO: Store tokens and user info in database
    // For now, we'll return them to the client

    res.status(200).json({
      success: true,
      data: {
        tokens,
        twitchUser,
        message: 'Successfully connected to Twitch!'
      }
    } as ApiResponse);

    logger.info(`User ${userId} successfully connected Twitch account: ${twitchUser.login}`);

  } catch (error) {
    logger.error('Error handling Twitch callback:', error);

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
 * POST /api/twitch/disconnect
 * Disconnect Twitch integration
 */
router.post('/disconnect', authMiddleware, async (req, res) => {
  try {
    const { userId, accessToken } = req.body;

    if (!userId || !accessToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User ID and access token are required',
          code: 'MISSING_PARAMETERS'
        }
      } as ApiResponse);
    }

    // Disconnect chat bot if running
    const chatBot = chatBots.get(userId);
    if (chatBot) {
      await chatBot.disconnect();
      chatBots.delete(userId);
    }

    // Revoke Twitch token
    await getTwitchService().revokeToken(accessToken);

    // TODO: Remove tokens and settings from database

    res.status(200).json({
      success: true,
      data: {
        message: 'Successfully disconnected from Twitch'
      }
    } as ApiResponse);

    logger.info(`User ${userId} disconnected Twitch integration`);

  } catch (error) {
    logger.error('Error disconnecting Twitch:', error);

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
 * GET /api/twitch/stream-status
 * Get current stream status
 */
router.get('/stream-status', authMiddleware, async (req, res) => {
  try {
    const { twitchUserId } = req.query;

    if (!twitchUserId || typeof twitchUserId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Twitch user ID is required',
          code: 'MISSING_TWITCH_USER_ID'
        }
      } as ApiResponse);
    }

    const stream = await getTwitchService().getStream(twitchUserId);

    res.status(200).json({
      success: true,
      data: {
        isLive: !!stream,
        stream
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting stream status:', error);

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
 * POST /api/twitch/update-stream
 * Update stream title and category
 */
router.post('/update-stream', authMiddleware, async (req, res) => {
  try {
    const { accessToken, twitchUserId, title, categoryId } = req.body;

    if (!accessToken || !twitchUserId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Access token and Twitch user ID are required',
          code: 'MISSING_PARAMETERS'
        }
      } as ApiResponse);
    }

    await getTwitchService().updateStream(accessToken, twitchUserId, title, categoryId);

    res.status(200).json({
      success: true,
      data: {
        message: 'Stream updated successfully'
      }
    } as ApiResponse);

    logger.info(`Updated stream for user ${twitchUserId}`, { title, categoryId });

  } catch (error) {
    logger.error('Error updating stream:', error);

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
 * POST /api/twitch/chat-bot/start
 * Start the chat bot for a user
 */
router.post('/chat-bot/start', authMiddleware, async (req, res) => {
  try {
    const { userId, accessToken, twitchUsername, channels } = req.body;

    if (!userId || !accessToken || !twitchUsername || !channels) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User ID, access token, username, and channels are required',
          code: 'MISSING_PARAMETERS'
        }
      } as ApiResponse);
    }

    // Stop existing chat bot if running
    const existingBot = chatBots.get(userId);
    if (existingBot) {
      await existingBot.disconnect();
    }

    // Create and start new chat bot
    const chatBot = new TwitchChatBot();
    await chatBot.connect({
      username: twitchUsername,
      accessToken,
      channels: Array.isArray(channels) ? channels : [channels]
    });

    chatBots.set(userId, chatBot);

    res.status(200).json({
      success: true,
      data: {
        message: 'Chat bot started successfully',
        status: chatBot.getStatus()
      }
    } as ApiResponse);

    logger.info(`Started chat bot for user ${userId} on channels: ${channels}`);

  } catch (error) {
    logger.error('Error starting chat bot:', error);

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
 * POST /api/twitch/chat-bot/stop
 * Stop the chat bot for a user
 */
router.post('/chat-bot/stop', authMiddleware, async (req, res) => {
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

    const chatBot = chatBots.get(userId);
    if (!chatBot) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Chat bot not found or not running',
          code: 'CHAT_BOT_NOT_FOUND'
        }
      } as ApiResponse);
    }

    await chatBot.disconnect();
    chatBots.delete(userId);

    res.status(200).json({
      success: true,
      data: {
        message: 'Chat bot stopped successfully'
      }
    } as ApiResponse);

    logger.info(`Stopped chat bot for user ${userId}`);

  } catch (error) {
    logger.error('Error stopping chat bot:', error);

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
 * GET /api/twitch/chat-bot/status
 * Get chat bot status
 */
router.get('/chat-bot/status', authMiddleware, async (req, res) => {
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

    const chatBot = chatBots.get(userId);
    const status = chatBot ? chatBot.getStatus() : {
      isConnected: false,
      channels: [],
      commandCount: 0,
      activeChallenges: 0
    };

    res.status(200).json({
      success: true,
      data: status
    } as ApiResponse);

  } catch (error) {
    logger.error('Error getting chat bot status:', error);

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }
    } as ApiResponse);
  }
});

// Export the chat bots map for use in other services
export { chatBots, router as twitchRoutes };

