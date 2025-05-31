import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { overlayRoutes } from './routes/overlay';
import { streamingRoutes } from './routes/streaming';
import { twitchRoutes } from './routes/twitch';
import { StreamingNamespace } from './services/SocketService';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// CORS configuration - Allow all origins for development
const corsOptions = {
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/overlay', overlayRoutes);
app.use('/api/twitch', twitchRoutes);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true,
});

// Initialize streaming namespace
const streamingNamespace = new StreamingNamespace(io);

// Error handling middleware
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/elite-locker-streaming';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');

  server.close(() => {
    logger.info('HTTP server closed');

    mongoose.connection.close().then(() => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    }).catch((error) => {
      logger.error('Error closing MongoDB connection:', error);
      process.exit(1);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Temporarily disable MongoDB for testing
    // await connectDB();
    logger.info('MongoDB connection disabled for testing');

    server.listen(PORT, () => {
      logger.info(`Elite Locker Streaming API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Socket.IO enabled with CORS origins: ${JSON.stringify(corsOptions.origin)}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, io, server };

