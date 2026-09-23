import type { Request, Response } from 'express';
import * as service from './dashboard.service.js';

export async function getDashboard(req: Request, res: Response): Promise<void> {
  const data = await service.getDashboard(req.query as never);
  res.status(200).json({ success: true, data });
}

export async function invalidateCache(_req: Request, res: Response): Promise<void> {
  service.invalidateDashboardCache();
  res.status(204).send();
}