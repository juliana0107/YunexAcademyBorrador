// Variables de entorno del frontend.
// En dev, /api se reenvía al backend vía el proxy de Vite.

export const ENV = {
  API_URL: '/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Yunex Academy',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;