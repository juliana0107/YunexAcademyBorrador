import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import trainingCourseRoutes from '../modules/training-courses/training-course.routes.js';
import submoduleRoutes, {
  courseSubmodulesRouter,
} from '../modules/submodules/submodule.routes.js';
import videoRoutes, {
  submoduleVideosRouter,
} from '../modules/videos/video.routes.js';
import {
  videoProgressRouter,
  submoduleProgressRouter,
  meProgressRouter,
} from '../modules/video-progress/video-progress.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/training-courses', trainingCourseRoutes);
router.use('/training-courses/:courseId/submodules', courseSubmodulesRouter);
router.use('/submodules', submoduleRoutes);
router.use('/submodules/:submoduleId/videos', submoduleVideosRouter);
router.use('/submodules/:submoduleId/progress', submoduleProgressRouter);
router.use('/videos', videoRoutes);
router.use('/videos/:videoId/progress', videoProgressRouter);
router.use('/me/progress', meProgressRouter);

export default router;