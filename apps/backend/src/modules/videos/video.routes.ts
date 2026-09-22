import { Router } from 'express';
import multer from 'multer';
import * as controller from './video.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import { env } from '../../config/env.config.js';
import {
  createVideoSchema,
  updateVideoSchema,
  changeVideoOrderSchema,
  listVideosQuerySchema,
} from './video.schema.js';

// Multer en memoria: guardamos el buffer y luego lo pasamos al Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_VIDEO_SIZE_MB * 1024 * 1024 },
});

// Router anidado: /submodules/:submoduleId/videos
export const submoduleVideosRouter = Router({ mergeParams: true });

submoduleVideosRouter.use(authMiddleware);

submoduleVideosRouter.get(
  '/',
  requirePermission('videos:read'),
  asyncHandler(controller.listBySubmodule)
);

submoduleVideosRouter.post(
  '/',
  requirePermission('videos:write'),
  upload.single('file'),
  (req, _res, next) => {
    // Inyecta el submoduleId de la URL en el body
    req.body = { ...req.body, submoduleId: req.params.submoduleId };
    next();
  },
  validate(createVideoSchema),
  asyncHandler(controller.upload)
);

// Router plano: /videos/...
const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  requirePermission('videos:read'),
  validate(listVideosQuerySchema, 'query'),
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  requirePermission('videos:read'),
  asyncHandler(controller.getById)
);

router.get(
  '/:id/stream',
  requirePermission('videos:read'),
  asyncHandler(controller.stream)
);

router.patch(
  '/:id',
  requirePermission('videos:write'),
  validate(updateVideoSchema),
  asyncHandler(controller.update)
);

router.patch(
  '/:id/order',
  requirePermission('videos:write'),
  validate(changeVideoOrderSchema),
  asyncHandler(controller.changeOrder)
);

router.post(
  '/:id/screenshot-attempt',
  requirePermission('videos:read'),
  asyncHandler(controller.screenshotAttempt)
);

router.delete(
  '/:id',
  requirePermission('videos:delete'),
  asyncHandler(controller.remove)
);

export default router;