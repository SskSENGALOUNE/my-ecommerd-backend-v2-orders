# syntax=docker/dockerfile:1.7

# ---------- deps (all, for build) ----------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate


# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .
RUN npm run build


# ---------- prod deps only ----------
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate && npm cache clean --force


# ---------- runtime ----------
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Bangkok
ENV PORT=3000

RUN apk add --no-cache dumb-init curl

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

# Run as non-root
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT}/api/health/liveness" || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
