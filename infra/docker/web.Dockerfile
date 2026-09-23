# Stage 1: Build con Vite

FROM node:20-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copiar manifiestos
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/frontend/package.json ./apps/frontend/

# Instalar deps
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY packages/shared-types ./packages/shared-types
COPY apps/frontend ./apps/frontend

# Build de producción
RUN pnpm --filter @yunexacademy/web build

# Stage 2: Nginx sirviendo el build

FROM nginx:alpine

# Copiar configuración personalizada
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build de Vite
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]