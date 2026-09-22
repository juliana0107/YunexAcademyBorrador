import type { Request, Response } from 'express';
import * as authService from './auth.service.js';

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getCurrentUser(req.user!.id);
  res.status(200).json({ success: true, data: user });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // JWT es stateless. El frontend borra el token.
  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
}