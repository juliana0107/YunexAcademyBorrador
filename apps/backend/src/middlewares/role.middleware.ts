import type { Request, Response, NextFunction } from 'express';
import type { RoleName } from '@yunexacademy/shared-types';
import { ForbiddenError } from '../shared/errors/http-error.js';

export function requireRole(...requiredRoles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    const hasRole = requiredRoles.some((role) => req.user!.roles.includes(role));

    if (!hasRole) {
      return next(new ForbiddenError(`Requires one of: ${requiredRoles.join(', ')}`));
    }

    next();
  };
}