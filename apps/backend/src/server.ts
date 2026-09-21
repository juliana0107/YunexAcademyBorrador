import { createApp } from './app.js';
import { env } from './config/env.config.js';
import { checkDatabaseConnection, closePool } from './config/database.config.js';

async function bootstrap(): Promise<void> {
  // 1. Verificar conexión a la base de datos
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    console.error('❌ Cannot connect to the database. Is Postgres running?');
    process.exit(1);
  }
  console.log('✅ Database connection established');

  // 2. Crear la app
  const app = createApp();

  // 3. Arrancar el servidor
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 API running on http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Health check: http://localhost:${env.PORT}/api/health`);
  });

  // 4. Manejar apagado limpio
  const shutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await closePool();
      console.log('Server closed. Bye.');
      process.exit(0);
    });

    // Forzar salida si tarda más de 10s
    setTimeout(() => {
      console.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});