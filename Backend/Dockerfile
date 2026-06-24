# ---- Stage 1: Install dependencies & generate Prisma client ----
FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack so pnpm is available
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifests first for layer-caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

# Skip lifecycle scripts here; we'll run prisma generate explicitly below
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate the Prisma client for the current (linux) platform
RUN npx prisma generate

# ---- Stage 2: Lean production image ----
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Bring in installed node_modules (includes generated Prisma client)
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY prisma ./prisma/
COPY src    ./src/
COPY server.js package.json ./

# Startup script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
