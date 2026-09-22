import { LocalStorage } from './local.storage.js';
import type { Storage } from './storage.interface.js';

let instance: Storage | null = null;

export function getStorage(): Storage {
  if (!instance) {
    // Hoy solo tenemos LocalStorage.
    // Mañana: leer env.STORAGE_DRIVER y devolver S3Storage o LocalStorage.
    instance = new LocalStorage();
  }
  return instance;
}

/**
 * Útil para tests o para cambiar el driver en runtime.
 */
export function setStorage(storage: Storage): void {
  instance = storage;
}