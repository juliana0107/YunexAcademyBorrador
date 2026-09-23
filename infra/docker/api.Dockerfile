# Stage único: la API corre con tsx (no compila)

FROM node:20-alpine

# Dependencias del sistema para desarrollo
RUN apk add --no-cache \
    curl \
    postgresql-client

# Habilitar pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copiar manifiestos del workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/backend/package.json ./apps/backend/

# Instalar todas las deps del monorepo (incluye el backend)
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY packages/shared-types ./packages/shared-types
COPY apps/backend ./apps/backend

# Crear carpeta de uploads
RUN mkdir -p /app/apps/backend/uploads

# Exponer el puerto de la API
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/health || exit 1

WORKDIR /app/apps/backend

# tsx sin watch (en Docker no necesitamos hot reload)
CMD ["pnpm", "exec", "tsx", "src/server.ts"]