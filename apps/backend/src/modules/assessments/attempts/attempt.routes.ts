import { Router } from 'express';
import * as controller from './attempt.controller.js';
import { authMiddleware } from '../../../middlewares/auth.middleware.js';
import { requirePermission } from '../../../middlewares/permission.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../../shared/utils/async-handler.util.js';
import {
  saveAnswerSchema,
  gradeOpenAnswerSchema,
  listMyAttemptsQuerySchema,
  listAssessmentAttemptsQuerySchema,
} from './attempt.schema.js';

//  Router anidado en assessments: /assessments/:assessmentId/attempts
export const assessmentAttemptsRouter = Router({ mergeParams: true });
assessmentAttemptsRouter.use(authMiddleware);

assessmentAttemptsRouter.post(
  '/',
  requirePermission('attempts:write'),
  asyncHandler(controller.startAttempt)
);

assessmentAttemptsRouter.get(
  '/',
  requirePermission('attempts:read'),
  validate(listAssessmentAttemptsQuerySchema, 'query'),
  asyncHandler(controller.listByAssessment)
);

//  Router plano: /attempts/:id
const router = Router();
router.use(authMiddleware);

router.get(
  '/:id',
  requirePermission('attempts:read'),
  asyncHandler(controller.getById)
);

router.put(
  '/:id/answers',
  requirePermission('attempts:write'),
  validate(saveAnswerSchema),
  asyncHandler(controller.saveAnswer)
);

router.post(
  '/:id/submit',
  requirePermission('attempts:write'),
  asyncHandler(controller.submit)
);

router.patch(
  '/:id/answers/:questionId/grade',
  requirePermission('attempts:write'),
  validate(gradeOpenAnswerSchema),
  asyncHandler(controller.gradeOpenAnswer)
);

export default router;

//  Router plano: /me/attempts
export const meAttemptsRouter = Router();
meAttemptsRouter.use(authMiddleware);

meAttemptsRouter.get(
  '/',
  validate(listMyAttemptsQuerySchema, 'query'),
  asyncHandler(controller.listMine)
);