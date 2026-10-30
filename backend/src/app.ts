import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { v1Router } from './routes/v1.js';
import { standardRateLimiter } from './middleware/rate-limit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { NotFoundError } from './utils/errors.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // 2. CORS configuration
  const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps, curl, or server-to-server
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // 3. Body parsers
  app.use(express.json({ limit: `${env.MAX_FILE_SIZE_MB}mb` }));
  app.use(express.urlencoded({ extended: true, limit: `${env.MAX_FILE_SIZE_MB}mb` }));

  // 4. Rate Limiting
  app.use('/api/', standardRateLimiter);

  // 5. Root Health Checks
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AI Research Copilot Backend',
      environment: env.NODE_ENV
    });
  });

  // 6. API v1 Routes
  app.use('/api/v1', v1Router);

  // 7. 404 Handler
  app.use((_req: Request, _res: Response, next) => {
    next(new NotFoundError('The requested API route'));
  });

  // 8. Global Error Handler
  app.use(errorHandler);

  return app;
}

