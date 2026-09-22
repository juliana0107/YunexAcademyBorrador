
 // Variables de entorno del frontend.
 //Vite solo expone variables con prefijo VITE_.

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'Yunex Academy',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;