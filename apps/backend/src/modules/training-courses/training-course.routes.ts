import { Router } from 'express';
import * as controller from './training-course.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import {
  createTrainingCourseSchema,
  updateTrainingCourseSchema,
  changeStatusSchema,
  listTrainingCoursesQuerySchema,
} from './training-course.schema.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  requirePermission('training-courses:read'),
  validate(listTrainingCoursesQuerySchema, 'query'),
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  requirePermission('training-courses:read'),
  asyncHandler(controller.getById)
);

router.post(
  '/',
  requirePermission('training-courses:write'),
  validate(createTrainingCourseSchema),
  asyncHandler(controller.create)
);

router.patch(
  '/:id',
  requirePermission('training-courses:write'),
  validate(updateTrainingCourseSchema),
  asyncHandler(controller.update)
);

router.patch(
  '/:id/status',
  requirePermission('training-courses:write'),
  validate(changeStatusSchema),
  asyncHandler(controller.changeStatus)
);

router.delete(
  '/:id',
  requirePermission('training-courses:delete'),
  asyncHandler(controller.remove)
);

export default router;