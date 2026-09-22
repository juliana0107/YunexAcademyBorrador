import { randomBytes } from 'node:crypto';

interface TicketData {
  userId: string;
  videoId: string;
  expiresAt: number;
}

const TICKET_TTL_MS = 60_000; // 60 segundos

// Map en memoria: ticket -> data
const tickets = new Map<string, TicketData>();

// Limpieza periódica de tickets expirados (cada 30s)
setInterval(() => {
  const now = Date.now();
  for (const [ticket, data] of tickets.entries()) {
    if (data.expiresAt < now) {
      tickets.delete(ticket);
    }
  }
}, 30_000).unref();

export interface IssuedTicket {
  ticket: string;
  expiresIn: number;
}

export function issueTicket(userId: string, videoId: string): IssuedTicket {
  const ticket = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TICKET_TTL_MS;

  tickets.set(ticket, {
    userId,
    videoId,
    expiresAt,
  });

  return {
    ticket,
    expiresIn: Math.floor(TICKET_TTL_MS / 1000),
  };
}

export interface ValidatedTicket {
  userId: string;
  videoId: string;
}

export function validateTicket(ticket: string, videoId: string): ValidatedTicket | null {
  const data = tickets.get(ticket);
  if (!data) return null;

  if (data.expiresAt < Date.now()) {
    tickets.delete(ticket);
    return null;
  }

  if (data.videoId !== videoId) {
    return null; // Ticket válido pero para otro video
  }

  return {
    userId: data.userId,
    videoId: data.videoId,
  };
}

export function consumeTicket(ticket: string): void {
  // Opcional: no consumir porque el player puede pedir múltiples ranges
  // del mismo video con el mismo ticket. Solo expira por tiempo.
  // tickets.delete(ticket);
}