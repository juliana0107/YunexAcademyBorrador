import { env } from '../../../config/env.config.js';
import type { DashboardData } from '../dashboard.types.js';

interface CacheEntry {
  data: DashboardData;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

const TTL_MS = env.DASHBOARD_CACHE_TTL * 1000;

export function get(key: string): DashboardData | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function set(key: string, data: DashboardData): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function invalidate(key: string): void {
  cache.delete(key);
}

export function invalidateAll(): void {
  cache.clear();
}

// Limpieza periódica de entradas expiradas (cada 60s)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt < now) {
      cache.delete(key);
    }
  }
}, 60_000).unref();