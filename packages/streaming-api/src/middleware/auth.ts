import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authorization header is required',
          code: 'MISSING_AUTH_HEADER',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token is required',
          code: 'MISSING_TOKEN',
        },
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not configured');
      res.status(500).json({
        success: false,
        error: {
          message: 'Server configuration error',
          code: 'CONFIG_ERROR',
        },
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        },
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'AUTH_ERROR',
      },
    });
  }
};

// Optional auth middleware - doesn't fail if no token provided
export const optionalAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    // For optional auth, we just continue without setting user
    next();
  }
};
