import type { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env.config.js';

const ADMIN_EMAIL = 'admin@yunexacademy.com';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_FIRST_NAME = 'Admin';
const ADMIN_LAST_NAME = 'Yunex';

export async function run(pool: Pool): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificar si el admin ya existe
    const existing = await client.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    let adminId: string;

    if (existing.rows.length > 0) {
      adminId = existing.rows[0].id;
      console.log(`   ℹ️  Admin user already exists: ${ADMIN_EMAIL}`);
    } else {
      // 2. Hashear la contraseña
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, env.BCRYPT_ROUNDS);

      // 3. Insertar el usuario admin
      const result = await client.query<{ id: string }>(
        `INSERT INTO users (email, password_hash, first_name, last_name, status)
         VALUES ($1, $2, $3, $4, 'ACTIVE')
         RETURNING id`,
        [ADMIN_EMAIL, passwordHash, ADMIN_FIRST_NAME, ADMIN_LAST_NAME]
      );

      adminId = result.rows[0].id;
      console.log(`   ✅ Admin user created: ${ADMIN_EMAIL}`);
      console.log(`   🔑 Password: ${ADMIN_PASSWORD}`);
      console.log(`   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION`);
    }

    // 4. Asignar el rol ADMIN
    const roleResult = await client.query<{ id: string }>(
      'SELECT id FROM roles WHERE name = $1',
      ['ADMIN']
    );

    if (roleResult.rows.length === 0) {
      throw new Error('Role "ADMIN" not found. Did you run seed 001 first?');
    }

    const roleId = roleResult.rows[0].id;

    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [adminId, roleId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}