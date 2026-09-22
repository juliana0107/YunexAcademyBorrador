import type { Readable } from 'node:stream';

export interface SaveResult {
  path: string;
  size: number;
}

export interface ReadRange {
  stream: Readable;
  start: number;
  end: number;
  totalSize: number;
}

export interface Storage {
  /**
   * Guarda un archivo y devuelve la ruta relativa + tamaño.
   */
  save(buffer: Buffer, relativePath: string): Promise<SaveResult>;

  /**
   * Lee un archivo completo.
   */
  read(relativePath: string): Promise<Buffer>;

  /**
   * Lee un rango específico del archivo (para streaming con Range headers).
   * Si no se especifica start/end, lee todo.
   */
  readRange(relativePath: string, start?: number, end?: number): Promise<ReadRange>;

  /**
   * Elimina un archivo. No falla si no existe.
   */
  delete(relativePath: string): Promise<void>;

  /**
   * Verifica si el archivo existe.
   */
  exists(relativePath: string): Promise<boolean>;

  /**
   * Devuelve el tamaño del archivo en bytes, o -1 si no existe.
   */
  size(relativePath: string): Promise<number>;
}