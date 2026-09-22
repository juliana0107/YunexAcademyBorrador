import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env.config.js';
import routes from './routes/index.js';
import { errorHandler } from './shared/errors/error-handler.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

  app.use('/api', routes);

  // 404 y error handler SIEMPRE al final
  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
}