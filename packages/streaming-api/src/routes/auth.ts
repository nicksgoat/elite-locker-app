import { ApiResponse, StreamingError } from '@elite-locker/shared-types';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { validateUserLogin, validateUserRegistration } from '../utils/validation';

const router = Router();

// Mock user storage (in production, use MongoDB)
const users: any[] = [];

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;

    // Validate input
    const validationResult = validateUserRegistration(userData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Validation error: ${validationResult.errors.join(', ')}`,
          code: 'VALIDATION_ERROR',
          details: validationResult.errors,
        },
      } as ApiResponse);
    }

    const { username, email, password, displayName } = userData;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'User already exists',
          code: 'USER_EXISTS',
        },
      } as ApiResponse);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      displayName,
      password: hashedPassword,
      createdAt: new Date(),
      streamingEnabled: false,
    };

    users.push(newUser);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new StreamingError('JWT secret not configured', 'CONFIG_ERROR', 500);
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      jwtSecret
    );

    // Return user data (without password)
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    } as ApiResponse);

    logger.info(`New user registered: ${username} (${email})`);
  } catch (error) {
    logger.error('Error registering user:', error);

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
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const loginData = req.body;

    // Validate input
    const validationResult = validateUserLogin(loginData);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Validation error: ${validationResult.errors.join(', ')}`,
          code: 'VALIDATION_ERROR',
          details: validationResult.errors,
        },
      } as ApiResponse);
    }

    const { email, password } = loginData;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      } as ApiResponse);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      } as ApiResponse);
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new StreamingError('JWT secret not configured', 'CONFIG_ERROR', 500);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      jwtSecret
    );

    // Return user data (without password)
    const { password: _, ...userResponse } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    } as ApiResponse);

    logger.info(`User logged in: ${user.username} (${user.email})`);
  } catch (error) {
    logger.error('Error logging in user:', error);

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
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', (req, res) => {
  // This would typically use auth middleware
  res.status(200).json({
    success: true,
    data: {
      message: 'Authentication endpoint working',
      timestamp: new Date().toISOString(),
    },
  } as ApiResponse);
});

export { router as authRoutes };

