import { Router } from 'express';
import * as controller from './video-progress.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import { upsertProgressSchema } from './video-progress.schema.js';

// Router anidado en videos: /videos/:videoId/progress
export const videoProgressRouter = Router({ mergeParams: true });

videoProgressRouter.use(authMiddleware);

videoProgressRouter.get('/', asyncHandler(controller.getByVideo));
videoProgressRouter.put(
  '/',
  validate(upsertProgressSchema),
  asyncHandler(controller.upsert)
);

// Router anidado en submodules: /submodules/:submoduleId/progress
export const submoduleProgressRouter = Router({ mergeParams: true });

submoduleProgressRouter.use(authMiddleware);

submoduleProgressRouter.get('/', asyncHandler(controller.getSubmoduleProgress));

// Router plano: /me/progress
const meRouter = Router();

meRouter.use(authMiddleware);
meRouter.get('/', asyncHandler(controller.getOverview));

export { meRouter as meProgressRouter };