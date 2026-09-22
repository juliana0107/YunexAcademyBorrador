import type { Request, Response } from 'express';
import * as service from './user.service.js';
import type { RoleName } from '@yunexacademy/shared-types';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list(req.query as never);
  res.status(200).json({ success: true, data: result });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const user = await service.getById(req.params.id);
  res.status(200).json({ success: true, data: user });
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = await service.create(req.body);
  res.status(201).json({ success: true, data: user });
}

export async function update(req: Request, res: Response): Promise<void> {
  const user = await service.update(req.params.id, req.body, req.user!.id);
  res.status(200).json({ success: true, data: user });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id, req.user!.id);
  res.status(204).send();
}

export async function changeOwnPassword(req: Request, res: Response): Promise<void> {
  await service.changeOwnPassword(req.user!.id, req.body);
  res.status(200).json({ success: true, data: { message: 'Password updated' } });
}

export async function adminChangePassword(req: Request, res: Response): Promise<void> {
  await service.adminChangePassword(req.params.id, req.body.newPassword);
  res.status(200).json({ success: true, data: { message: 'Password updated' } });
}

// Silencia el warning de "declared but not used" con este export
export type _UnusedRoleName = RoleName;