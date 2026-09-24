import { Router } from 'express';
import * as controller from './permission.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';

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

export default router;