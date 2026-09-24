import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { env } from './config/env.config.js';
import { logger } from './config/logger.config.js';
import routes from './routes/index.js';
import { errorHandler } from './shared/errors/error-handler.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { globalLimiter } from './middlewares/rate-limit.middleware.js';

export function createApp(): Express {
  const app = express();

  // Confiar en proxies (nginx) para que req.ip sea correcto
  app.set('trust proxy', 1);

  // Seguridad
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Performance
  app.use(compression());

  // Logging HTTP estructurado
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/api/health',
      },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check (público, sin rate limit)
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    });
  });

  // Rate limit global (aplica a todas las rutas /api/*)
  app.use('/api', globalLimiter);

  // Rutas
  app.use('/api', routes);

  // 404 y error handler SIEMPRE al final
  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
}