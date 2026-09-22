import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { pool } from '../config/database.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(__dirname, 'migrations');

interface MigrationRecord {
  name: string;
  applied_at: Date;
}

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await pool.query<MigrationRecord>('SELECT name FROM _migrations ORDER BY name');
  return new Set(result.rows.map((r) => r.name));
}

function getMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

async function applyMigration(name: string, sql: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log(`   ✅ ${name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`   ❌ ${name} FAILED`);
    throw error;
  } finally {
    client.release();
  }
}

async function run(): Promise<void> {
  console.log('🔄 Running migrations...\n');

  try {
    await ensureMigrationsTable();

    const applied = await getAppliedMigrations();
    const files = getMigrationFiles();

    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log('✨ No pending migrations. Database is up to date.\n');
      return;
    }

    console.log(`📋 ${pending.length} pending migration(s):\n`);

    for (const file of pending) {
      const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
      await applyMigration(file, sql);
    }

    console.log(`\n✅ All migrations applied successfully.\n`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();