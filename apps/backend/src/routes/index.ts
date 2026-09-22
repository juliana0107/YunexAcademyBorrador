import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import trainingCourseRoutes from '../modules/training-courses/training-course.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/training-courses', trainingCourseRoutes);

export default router;