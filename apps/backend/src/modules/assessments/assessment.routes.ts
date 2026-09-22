import { Router } from 'express';
import * as controller from './assessment.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import {
  createAssessmentSchema,
  updateAssessmentSchema,
  changeStatusSchema,
  listAssessmentsQuerySchema,
} from './assessment.schema.js';

// Router anidado: /training-courses/:courseId/assessments
export const courseAssessmentsRouter = Router({ mergeParams: true });
courseAssessmentsRouter.use(authMiddleware);

courseAssessmentsRouter.get(
  '/',
  requirePermission('assessments:read'),
  asyncHandler(controller.listByCourse)
);

courseAssessmentsRouter.post(
  '/',
  requirePermission('assessments:write'),
  (req, _res, next) => {
    req.body = { ...req.body, trainingCourseId: req.params.courseId };
    next();
  },
  validate(createAssessmentSchema),
  asyncHandler(controller.create)
);

// Router anidado: /submodules/:submoduleId/assessments
export const submoduleAssessmentsRouter = Router({ mergeParams: true });
submoduleAssessmentsRouter.use(authMiddleware);

submoduleAssessmentsRouter.get(
  '/',
  requirePermission('assessments:read'),
  asyncHandler(controller.listBySubmodule)
);

// Router plano: /assessments
const router = Router();
router.use(authMiddleware);

router.get(
  '/',
  requirePermission('assessments:read'),
  validate(listAssessmentsQuerySchema, 'query'),
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  requirePermission('assessments:read'),
  asyncHandler(controller.getById)
);

router.patch(
  '/:id',
  requirePermission('assessments:write'),
  validate(updateAssessmentSchema),
  asyncHandler(controller.update)
);

router.patch(
  '/:id/status',
  requirePermission('assessments:write'),
  validate(changeStatusSchema),
  asyncHandler(controller.changeStatus)
);

router.delete(
  '/:id',
  requirePermission('assessments:delete'),
  asyncHandler(controller.remove)
);

export default router;