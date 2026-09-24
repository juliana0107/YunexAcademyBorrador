import type { Request, Response } from 'express';
import * as service from './permission.service.js';

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await service.list();
  res.status(200).json({ success: true, data: items });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const item = await service.getById(req.params.id);
  res.status(200).json({ success: true, data: item });
}