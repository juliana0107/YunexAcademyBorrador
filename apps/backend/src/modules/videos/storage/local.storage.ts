import { promises as fs, createReadStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { Readable } from 'node:stream';
import { env } from '../../../config/env.config.js';
import type { Storage, SaveResult, ReadRange } from './storage.interface.js';

const BASE_DIR = join(process.cwd(), env.UPLOAD_DIR);

export class LocalStorage implements Storage {
  private resolve(relativePath: string): string {
    return join(BASE_DIR, relativePath);
  }

  async save(buffer: Buffer, relativePath: string): Promise<SaveResult> {
    const absolutePath = this.resolve(relativePath);
    await fs.mkdir(dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);
    return { path: relativePath, size: buffer.length };
  }

  async read(relativePath: string): Promise<Buffer> {
    return fs.readFile(this.resolve(relativePath));
  }

  async readRange(relativePath: string, start?: number, end?: number): Promise<ReadRange> {
    const absolutePath = this.resolve(relativePath);
    const stat = await fs.stat(absolutePath);
    const totalSize = stat.size;

    const rangeStart = start ?? 0;
    const rangeEnd = end ?? totalSize - 1;

    const stream = createReadStream(absolutePath, { start: rangeStart, end: rangeEnd });
    return {
      stream: stream as unknown as Readable,
      start: rangeStart,
      end: rangeEnd,
      totalSize,
    };
  }

  async delete(relativePath: string): Promise<void> {
    try {
      await fs.unlink(this.resolve(relativePath));
    } catch (error) {
      // Ignorar si no existe
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(this.resolve(relativePath));
      return true;
    } catch {
      return false;
    }
  }

  async size(relativePath: string): Promise<number> {
    try {
      const stat = await fs.stat(this.resolve(relativePath));
      return stat.size;
    } catch {
      return -1;
    }
  }
}