import type { Request, Response } from 'express';
import * as service from './assessment.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list(req.query as never);
  res.status(200).json({ success: true, data: result });
}

export async function listByCourse(req: Request, res: Response): Promise<void> {
  const items = await service.listByCourse(req.params.courseId);
  res.status(200).json({ success: true, data: items });
}

export async function listBySubmodule(req: Request, res: Response): Promise<void> {
  const items = await service.listBySubmodule(req.params.submoduleId);
  res.status(200).json({ success: true, data: items });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const assessment = await service.getById(req.params.id);
  res.status(200).json({ success: true, data: assessment });
}

export async function create(req: Request, res: Response): Promise<void> {
  const assessment = await service.create(req.body);
  res.status(201).json({ success: true, data: assessment });
}

export async function update(req: Request, res: Response): Promise<void> {
  const assessment = await service.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: assessment });
}

export async function changeStatus(req: Request, res: Response): Promise<void> {
  const assessment = await service.changeStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: assessment });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id);
  res.status(204).send();
}