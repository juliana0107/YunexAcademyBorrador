import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './app-error.js';
import { ErrorCode } from './error-codes.js';
import { env } from '../../config/env.config.js';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Errores de validación de Zod
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
      },
    } satisfies ErrorResponse);
    return;
  }

  // 2. Errores operacionales de la app (AppError y subclases)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    } satisfies ErrorResponse);
    return;
  }

  // 3. Errores de Postgres (códigos conocidos)
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const pgError = err as { code: string; detail?: string; constraint?: string };

    // unique_violation
    if (pgError.code === '23505') {
      res.status(409).json({
        success: false,
        error: {
          code: ErrorCode.RESOURCE_CONFLICT,
          message: 'Resource already exists',
          details: { constraint: pgError.constraint },
        },
      } satisfies ErrorResponse);
      return;
    }

    // foreign_key_violation
    if (pgError.code === '23503') {
      res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Referenced resource does not exist',
          details: { constraint: pgError.constraint },
        },
      } satisfies ErrorResponse);
      return;
    }

    // check_violation
    if (pgError.code === '23514') {
      res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Value violates a database constraint',
          details: { constraint: pgError.constraint },
        },
      } satisfies ErrorResponse);
      return;
    }
  }

  // 4. Errores no controlados (bugs)
  console.error('🔥 Unhandled error:', err);

  const message =
    env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err instanceof Error
        ? err.message
        : String(err);

  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message,
    },
  } satisfies ErrorResponse);
}