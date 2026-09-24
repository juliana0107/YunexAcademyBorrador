import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import { pool } from '../config/database.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEEDS_DIR = join(__dirname, 'seeds');

interface SeedModule {
  run: (pool: Pool) => Promise<void>;
}

async function run(): Promise<void> {
  console.log('Running seeds...\n');

  try {
    const files = readdirSync(SEEDS_DIR)
      .filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
      .sort();

    if (files.length === 0) {
      console.log('No seed files found.\n');
      return;
    }

    for (const file of files) {
      const filePath = join(SEEDS_DIR, file);
      const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
      const module = (await import(fileUrl)) as SeedModule;

      if (typeof module.run !== 'function') {
        console.warn(`   ${file} does not export a "run" function. Skipping.`);
        continue;
      }

      console.log(`   ${file}`);
      await module.run(pool);
      console.log(`   OK: ${file}`);
    }

    console.log('\nAll seeds executed successfully.\n');
  } catch (error) {
    console.error('\nError running seeds:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void run();