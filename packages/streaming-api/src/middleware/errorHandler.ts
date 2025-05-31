import { Request, Response, NextFunction } from 'express';
import { StreamingError } from '@elite-locker/shared-types';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  if (error instanceof StreamingError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: error.message,
      },
    });
    return;
  }

  // Handle MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    res.status(500).json({
      success: false,
      error: {
        message: 'Database error',
        code: 'DATABASE_ERROR',
      },
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
      },
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 'INTERNAL_ERROR',
    },
  });
};
