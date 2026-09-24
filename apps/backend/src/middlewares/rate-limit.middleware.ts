import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config.js';

const isDev = env.NODE_ENV === 'development';

/**
 * Limiter global: 100 req / 15 min por IP.
 * En desarrollo es más laxo para no bloquear durante el testing.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10_000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

/**
 * Limiter para login: 5 intentos / 15 min por IP.
 * `skipSuccessfulRequests` hace que solo cuente los fallos.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1_000 : 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again later.',
    },
  },
});