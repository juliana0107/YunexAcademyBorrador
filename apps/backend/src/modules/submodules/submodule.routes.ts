import { Router } from 'express';
import * as controller from './submodule.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import {
  createSubmoduleSchema,
  updateSubmoduleSchema,
  changeOrderSchema,
  listSubmodulesQuerySchema,
} from './submodule.schema.js';

// Router anidado: /training-courses/:courseId/submodules
export const courseSubmodulesRouter = Router({ mergeParams: true });

courseSubmodulesRouter.use(authMiddleware);

courseSubmodulesRouter.get(
  '/',
  requirePermission('submodules:read'),
  asyncHandler(controller.listByCourse)
);

courseSubmodulesRouter.post(
  '/',
  requirePermission('submodules:write'),
  (req, _res, next) => {
    // Inyecta el courseId de la URL en el body para reusar el schema
    req.body = { ...req.body, trainingCourseId: req.params.courseId };
    next();
  },
  validate(createSubmoduleSchema),
  asyncHandler(controller.create)
);

// Router plano: /submodules/...
const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  requirePermission('submodules:read'),
  validate(listSubmodulesQuerySchema, 'query'),
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  requirePermission('submodules:read'),
  asyncHandler(controller.getById)
);

router.patch(
  '/:id',
  requirePermission('submodules:write'),
  validate(updateSubmoduleSchema),
  asyncHandler(controller.update)
);

router.patch(
  '/:id/order',
  requirePermission('submodules:write'),
  validate(changeOrderSchema),
  asyncHandler(controller.changeOrder)
);

router.delete(
  '/:id',
  requirePermission('submodules:delete'),
  asyncHandler(controller.remove)
);

export default router;