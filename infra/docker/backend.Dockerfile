FROM node:20-alpine AS base
RUN apk add --no-cache ffmpeg
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api
RUN pnpm --filter @school-of-training/api build

WORKDIR /app/apps/api
EXPOSE 4000
CMD ["node", "dist/server.js"]