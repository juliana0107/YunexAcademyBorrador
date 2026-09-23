import { Router } from 'express';
import * as controller from './dashboard.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import { dashboardQuerySchema } from './dashboard.schema.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  requirePermission('dashboard:read'),
  validate(dashboardQuerySchema, 'query'),
  asyncHandler(controller.getDashboard)
);

// Endpoint para invalidar el cache manualmente (útil en desarrollo)
router.post('/invalidate-cache', asyncHandler(controller.invalidateCache));

export default router;