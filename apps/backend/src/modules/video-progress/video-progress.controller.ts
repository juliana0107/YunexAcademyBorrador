import type { Request, Response } from 'express';
import * as service from './video-progress.service.js';

export async function getByVideo(req: Request, res: Response): Promise<void> {
  const progress = await service.getByVideo(req.user!.id, req.params.videoId);
  res.status(200).json({ success: true, data: progress });
}

export async function upsert(req: Request, res: Response): Promise<void> {
  const progress = await service.upsertProgress(
    req.user!.id,
    req.params.videoId,
    req.body
  );
  res.status(200).json({ success: true, data: progress });
}

export async function getSubmoduleProgress(req: Request, res: Response): Promise<void> {
  const progress = await service.getSubmoduleProgress(
    req.user!.id,
    req.params.submoduleId
  );
  res.status(200).json({ success: true, data: progress });
}

export async function getOverview(req: Request, res: Response): Promise<void> {
  const overview = await service.getOverview(req.user!.id);
  res.status(200).json({ success: true, data: overview });
}