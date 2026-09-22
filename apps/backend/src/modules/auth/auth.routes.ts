import { Router } from 'express';
import * as controller from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import { loginSchema } from './auth.schema.js';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(controller.login));
router.get('/me', authMiddleware, asyncHandler(controller.me));
router.post('/logout', authMiddleware, asyncHandler(controller.logout));

export default router;