import type { Request, Response } from 'express';
import * as service from './attempt.service.js';
import type { RoleName } from '@yunexacademy/shared-types';

export async function startAttempt(req: Request, res: Response): Promise<void> {
  const result = await service.startAttempt(req.params.assessmentId, req.user!.id);
  res.status(201).json({ success: true, data: result });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const isAdmin = req.user!.roles.includes('ADMIN' as RoleName);
  const attempt = await service.getAttempt(req.params.id, req.user!.id, isAdmin);
  res.status(200).json({ success: true, data: attempt });
}

export async function saveAnswer(req: Request, res: Response): Promise<void> {
  await service.saveAnswer(
    req.params.id,
    req.user!.id,
    req.body.questionId,
    req.body.answer
  );
  res.status(204).send();
}

export async function submit(req: Request, res: Response): Promise<void> {
  const result = await service.submitAttempt(req.params.id, req.user!.id);
  res.status(200).json({ success: true, data: result });
}

export async function gradeOpenAnswer(req: Request, res: Response): Promise<void> {
  const isAdmin = req.user!.roles.includes('ADMIN' as RoleName);
  const attempt = await service.gradeOpenAnswer(
    req.params.id,
    req.params.questionId,
    isAdmin,
    req.user!.roles,
    req.body
  );
  res.status(200).json({ success: true, data: attempt });
}

export async function listMine(req: Request, res: Response): Promise<void> {
  const result = await service.listMyAttempts(req.user!.id, req.query as never);
  res.status(200).json({ success: true, data: result });
}

export async function listByAssessment(req: Request, res: Response): Promise<void> {
  const result = await service.listAssessmentAttempts(
    req.params.assessmentId,
    req.query as never
  );
  res.status(200).json({ success: true, data: result });
}