import type { Request, Response } from 'express';
import * as service from './video.service.js';
import { getStorage } from './storage/storage.factory.js';
import { BadRequestError, UnauthorizedError } from '../../shared/errors/http-error.js';
import { issueTicket, validateTicket } from './stream-ticket.service.js';

export async function listBySubmodule(req: Request, res: Response): Promise<void> {
  const videos = await service.listBySubmodule(req.params.submoduleId);
  res.status(200).json({ success: true, data: videos });
}

export async function list(req: Request, res: Response): Promise<void> {
  const result = await service.list(req.query as never);
  res.status(200).json({ success: true, data: result });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const video = await service.getById(req.params.id);
  res.status(200).json({ success: true, data: video });
}

export async function upload(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw new BadRequestError('Video file is required');
  }

  const body = {
    ...req.body,
    submoduleId: req.params.submoduleId,
  };

  const video = await service.upload(body, req.file);
  res.status(201).json({ success: true, data: video });
}

export async function update(req: Request, res: Response): Promise<void> {
  const video = await service.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: video });
}

export async function changeOrder(req: Request, res: Response): Promise<void> {
  const video = await service.changeOrder(req.params.id, req.body.order);
  res.status(200).json({ success: true, data: video });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await service.remove(req.params.id);
  res.status(204).send();
}

export async function generateStreamTicket(req: Request, res: Response): Promise<void> {
  // Verifica que el video existe antes de dar un ticket
  const video = await service.getById(req.params.id);

  const { ticket, expiresIn } = issueTicket(req.user!.id, video.id);

  res.status(200).json({
    success: true,
    data: { ticket, expiresIn },
  });
}

export async function stream(req: Request, res: Response): Promise<void> {
  // Validar ticket desde query string
  const ticket = req.query.ticket as string | undefined;

  if (!ticket) {
    throw new UnauthorizedError('Missing stream ticket');
  }

  const validated = validateTicket(ticket, req.params.id);
  if (!validated) {
    throw new UnauthorizedError('Invalid or expired stream ticket');
  }

  const info = await service.getStreamInfo(req.params.id);
  const rangeHeader = req.headers.range;
  const storage = getStorage();

  if (!rangeHeader) {
    const buffer = await storage.read(info.storagePath);
    res.writeHead(200, {
      'Content-Length': buffer.length.toString(),
      'Content-Type': info.mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=0, must-revalidate',
    });
    res.end(buffer);
    return;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) {
    res.status(416).json({
      success: false,
      error: { code: 'INVALID_RANGE', message: 'Invalid Range header' },
    });
    return;
  }

  const startStr = match[1];
  const endStr = match[2];

  let start = startStr ? parseInt(startStr, 10) : 0;
  let end = endStr ? parseInt(endStr, 10) : info.size - 1;

  if (isNaN(start) || isNaN(end) || start > end || end >= info.size) {
    res.status(416).json({
      success: false,
      error: { code: 'INVALID_RANGE', message: 'Requested range not satisfiable' },
    });
    return;
  }

  if (!startStr && endStr) {
    start = Math.max(0, info.size - end);
    end = info.size - 1;
  }

  const chunkSize = end - start + 1;
  const { stream: rangeStream } = await storage.readRange(info.storagePath, start, end);

  res.writeHead(206, {
    'Content-Range': `bytes ${start}-${end}/${info.size}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': chunkSize.toString(),
    'Content-Type': info.mimeType,
    'Cache-Control': 'private, max-age=0, must-revalidate',
  });

  rangeStream.pipe(res);
}

export async function screenshotAttempt(req: Request, res: Response): Promise<void> {
  const userAgent = req.headers['user-agent'];
  await service.recordScreenshotAttempt(req.params.id, req.user!.id, userAgent);
  res.status(204).send();
}