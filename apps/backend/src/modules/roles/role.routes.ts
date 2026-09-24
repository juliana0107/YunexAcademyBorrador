import { Router } from 'express';
import * as controller from './role.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import { updateRolePermissionsSchema } from './role.schema.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  requirePermission('roles:read'),
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  requirePermission('roles:read'),
  asyncHandler(controller.getById)
);

router.put(
  '/:id/permissions',
  requirePermission('roles:write'),
  validate(updateRolePermissionsSchema),
  asyncHandler(controller.updatePermissions)
);

export default router;