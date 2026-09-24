import type { Request, Response } from 'express';
import * as service from './role.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const roles = await service.list();
  res.status(200).json({ success: true, data: roles });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const role = await service.getById(req.params.id);
  res.status(200).json({ success: true, data: role });
}

export async function updatePermissions(
  req: Request,
  res: Response
): Promise<void> {
  const role = await service.updatePermissions(
    req.params.id,
    req.body.permissions
  );
  res.status(200).json({ success: true, data: role });
}