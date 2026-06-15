import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      userId: (req as any).user?.id,
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again after 15 minutes.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
});

export const transactionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 transactions per minute
  message: 'Too many transactions, please try again later',
});
