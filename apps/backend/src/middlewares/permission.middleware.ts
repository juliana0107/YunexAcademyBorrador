import type { Request, Response, NextFunction } from 'express';
import type { PermissionName } from '@yunexacademy/shared-types';
import { ForbiddenError } from '../shared/errors/http-error.js';
import { pool } from '../config/database.config.js';

export function requirePermission(...requiredPermissions: PermissionName[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new ForbiddenError('Authentication required'));
      }

      // Si el usuario tiene al menos uno de los permisos requeridos, pasa
      const result = await pool.query<{ name: string }>(
        `SELECT DISTINCT p.name
         FROM permissions p
         INNER JOIN role_permissions rp ON rp.permission_id = p.id
         INNER JOIN user_roles ur ON ur.role_id = rp.role_id
         WHERE ur.user_id = $1`,
        [req.user.id]
      );

      const userPermissions = new Set(result.rows.map((r) => r.name));
      const hasPermission = requiredPermissions.some((perm) => userPermissions.has(perm));

      if (!hasPermission) {
        return next(
          new ForbiddenError(
            `Missing required permission: ${requiredPermissions.join(' or ')}`
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}