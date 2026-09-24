import pino from 'pino';
import { env } from './env.config.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: '@yunexacademy/api',
    env: env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname,service,env',
        singleLine: false,
      },
    },
  }),
});

export type Logger = typeof logger;