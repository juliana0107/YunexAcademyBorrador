import type { Request, Response } from 'express';
import * as service from './submodule.service.js';

export async function listByCourse(req: Request, res: Response): Promise<void> {
  const submodules = await service.listByCourse(req.params.courseId);
  res.status(200).json({ success: true, data: submodules });
}

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list(req.query as never);
  res.status(200).json({ success: true, data: result });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const submodule = await service.getById(req.params.id);
  res.status(200).json({ success: true, data: submodule });
}

export async function create(req: Request, res: Response): Promise<void> {
  const submodule = await service.create(req.body);
  res.status(201).json({ success: true, data: submodule });
}

export async function update(req: Request, res: Response): Promise<void> {
  const submodule = await service.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: submodule });
}

export async function changeOrder(req: Request, res: Response): Promise<void> {
  const submodule = await service.changeOrder(req.params.id, req.body.order);
  res.status(200).json({ success: true, data: submodule });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id);
  res.status(204).send();
}