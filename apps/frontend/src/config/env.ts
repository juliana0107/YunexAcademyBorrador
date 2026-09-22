// Configuración centralizada de variables de entorno.

export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  appName: import.meta.env.VITE_APP_NAME,
  appEnv: import.meta.env.VITE_APP_ENV,
  isDev: import.meta.env.VITE_APP_ENV === 'development',
  isProd: import.meta.env.VITE_APP_ENV === 'production',
} as const;

export type Env = typeof env;