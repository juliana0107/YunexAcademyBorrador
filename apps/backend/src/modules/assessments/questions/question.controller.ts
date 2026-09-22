import type { Request, Response } from 'express';
import * as service from './question.service.js';

export async function listByAssessment(req: Request, res: Response): Promise<void> {
  const items = await service.listByAssessment(req.params.assessmentId);
  res.status(200).json({ success: true, data: items });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const question = await service.getById(req.params.id);
  res.status(200).json({ success: true, data: question });
}

export async function create(req: Request, res: Response): Promise<void> {
  const question = await service.create(req.params.assessmentId, req.body);
  res.status(201).json({ success: true, data: question });
}

export async function update(req: Request, res: Response): Promise<void> {
  const question = await service.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: question });
}

export async function reorder(req: Request, res: Response): Promise<void> {
  const question = await service.reorder(req.params.id, req.body.order);
  res.status(200).json({ success: true, data: question });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id);
  res.status(204).send();
}