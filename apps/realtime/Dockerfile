# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY apps/realtime/package.json apps/realtime/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

FROM deps AS runner
COPY apps/realtime ./apps/realtime
WORKDIR /app/apps/realtime
EXPOSE 3001
CMD ["npm", "run", "start"]
