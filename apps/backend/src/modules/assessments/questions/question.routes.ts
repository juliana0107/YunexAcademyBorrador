import { Router } from 'express';
import * as controller from './question.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requirePermission } from '../../../middlewares/permission.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  reorderQuestionSchema,
} from './question.schema.js';

// Router anidado: /assessments/:assessmentId/questions
export const assessmentQuestionsRouter = Router({ mergeParams: true });
assessmentQuestionsRouter.use(authMiddleware);

assessmentQuestionsRouter.get(
  '/',
  requirePermission('assessments:read'),
  asyncHandler(controller.listByAssessment)
);

assessmentQuestionsRouter.post(
  '/',
  requirePermission('assessments:write'),
  validate(createQuestionSchema),
  asyncHandler(controller.create)
);

// Router plano: /questions/:id
const router = Router();
router.use(authMiddleware);

router.get(
  '/:id',
  requirePermission('assessments:read'),
  asyncHandler(controller.getById)
);

router.patch(
  '/:id',
  requirePermission('assessments:write'),
  validate(updateQuestionSchema),
  asyncHandler(controller.update)
);

router.patch(
  '/:id/order',
  requirePermission('assessments:write'),
  validate(reorderQuestionSchema),
  asyncHandler(controller.reorder)
);

router.delete(
  '/:id',
  requirePermission('assessments:delete'),
  asyncHandler(controller.remove)
);

export default router;