# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/

RUN pnpm install --frozen-lockfile --filter @yunexacademy/web...

COPY apps/frontend ./apps/frontend
COPY packages/shared-types ./packages/shared-types

WORKDIR /repo/apps/frontend
RUN pnpm build

FROM nginx:1.27-alpine AS runtime

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]