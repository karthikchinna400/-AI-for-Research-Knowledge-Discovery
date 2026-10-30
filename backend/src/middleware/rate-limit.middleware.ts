import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const standardRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 AI invocations per minute
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI request limit reached. Please wait a moment before sending more queries.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

