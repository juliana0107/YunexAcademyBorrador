import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../shared/errors/http-error.js';
import { ErrorCode } from '../shared/errors/error-codes.js';
import { verifyToken } from '../modules/auth/auth.service.js';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing authorization token', ErrorCode.AUTH_TOKEN_MISSING));
  }

  const token = header.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
    next();
  } catch (error) {
    next(error);
  }
}