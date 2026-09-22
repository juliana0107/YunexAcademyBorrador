import { Router } from 'express';
import * as controller from './user.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/permission.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { asyncHandler } from '../../shared/utils/async-handler.util.js';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  changePasswordSchema,
  adminChangePasswordSchema,
} from './user.schema.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas del propio usuario (van antes para no chocar con /:id)
router.patch(
  '/me/password',
  validate(changePasswordSchema),
  asyncHandler(controller.changeOwnPassword)
);

// Listar usuarios
router.get(
  '/',
  requirePermission('users:read'),
  validate(listUsersQuerySchema, 'query'),
  asyncHandler(controller.list)
);

// Ver un usuario específico
router.get(
  '/:id',
  requirePermission('users:read'),
  asyncHandler(controller.getById)
);

// Crear usuario
router.post(
  '/',
  requirePermission('users:write'),
  validate(createUserSchema),
  asyncHandler(controller.create)
);

// Editar usuario
router.patch(
  '/:id',
  requirePermission('users:write'),
  validate(updateUserSchema),
  asyncHandler(controller.update)
);

// Cambiar contraseña de otro usuario (admin)
router.patch(
  '/:id/password',
  requirePermission('users:write'),
  validate(adminChangePasswordSchema),
  asyncHandler(controller.adminChangePassword)
);

// Eliminar usuario
router.delete(
  '/:id',
  requirePermission('users:delete'),
  asyncHandler(controller.remove)
);

export default router;