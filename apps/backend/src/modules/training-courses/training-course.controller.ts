import type { Request, Response } from 'express';
import * as service from './training-course.service.js';

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list(req.query as never);
  res.status(200).json({ success: true, data: result });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const course = await service.getById(req.params.id);
  res.status(200).json({ success: true, data: course });
}

export async function create(req: Request, res: Response): Promise<void> {
  const course = await service.create(req.body, req.user!.id);
  res.status(201).json({ success: true, data: course });
}

export async function update(req: Request, res: Response): Promise<void> {
  const course = await service.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: course });
}

export async function changeStatus(req: Request, res: Response): Promise<void> {
  const course = await service.changeStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: course });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id);
  res.status(204).send();
}