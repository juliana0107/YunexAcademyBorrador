import type { Request, Response } from 'express';
import { ErrorCode } from '../shared/errors/error-codes.js';

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.RESOURCE_NOT_FOUND,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}