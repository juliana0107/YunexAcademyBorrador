import type { Pool } from 'pg';

const ROLES = [
  { name: 'ADMIN', description: 'Acceso total al sistema' },
  { name: 'INSTRUCTOR', description: 'Crea y gestiona cursos, videos y evaluaciones' },
  { name: 'STUDENT', description: 'Consume contenido y realiza evaluaciones' },
];

const PERMISSIONS = [
  { name: 'users:read', description: 'Ver usuarios' },
  { name: 'users:write', description: 'Crear y editar usuarios' },
  { name: 'users:delete', description: 'Eliminar usuarios' },
  { name: 'roles:read', description: 'Ver roles' },
  { name: 'roles:write', description: 'Crear y editar roles' },
  { name: 'training-courses:read', description: 'Ver cursos' },
  { name: 'training-courses:write', description: 'Crear y editar cursos' },
  { name: 'training-courses:delete', description: 'Eliminar cursos' },
  { name: 'submodules:read', description: 'Ver submódulos' },
  { name: 'submodules:write', description: 'Crear y editar submódulos' },
  { name: 'submodules:delete', description: 'Eliminar submódulos' },
  { name: 'videos:read', description: 'Ver videos' },
  { name: 'videos:write', description: 'Subir y editar videos' },
  { name: 'videos:delete', description: 'Eliminar videos' },
  { name: 'assessments:read', description: 'Ver evaluaciones' },
  { name: 'assessments:write', description: 'Crear y editar evaluaciones' },
  { name: 'assessments:delete', description: 'Eliminar evaluaciones' },
  { name: 'attempts:read', description: 'Ver intentos de evaluación' },
  { name: 'attempts:write', description: 'Registrar intentos' },
  { name: 'dashboard:read', description: 'Ver dashboard administrativo' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: PERMISSIONS.map((p) => p.name),
  INSTRUCTOR: [
    'training-courses:read',
    'training-courses:write',
    'submodules:read',
    'submodules:write',
    'videos:read',
    'videos:write',
    'assessments:read',
    'assessments:write',
    'attempts:read',
    'dashboard:read',
  ],
  STUDENT: [
    'training-courses:read',
    'submodules:read',
    'videos:read',
    'assessments:read',
    'attempts:read',
    'attempts:write',
  ],
};

export async function run(pool: Pool): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insertar roles
    for (const role of ROLES) {
      await client.query(
        `INSERT INTO roles (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [role.name, role.description]
      );
    }

    // 2. Insertar permisos
    for (const permission of PERMISSIONS) {
      await client.query(
        `INSERT INTO permissions (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [permission.name, permission.description]
      );
    }

    // 3. Asignar permisos a roles
    for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
      const roleResult = await client.query<{ id: string }>(
        'SELECT id FROM roles WHERE name = $1',
        [roleName]
      );

      if (roleResult.rows.length === 0) {
        throw new Error(`Role "${roleName}" not found after insert.`);
      }

      const roleId = roleResult.rows[0].id;

      for (const permissionName of permissionNames) {
        const permResult = await client.query<{ id: string }>(
          'SELECT id FROM permissions WHERE name = $1',
          [permissionName]
        );

        if (permResult.rows.length === 0) {
          throw new Error(`Permission "${permissionName}" not found after insert.`);
        }

        const permissionId = permResult.rows[0].id;

        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [roleId, permissionId]
        );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}