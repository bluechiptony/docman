# # Multi-stage build for Next.js
# FROM node:20-alpine AS builder

# WORKDIR /app

# # Copy package files
# COPY package.json pnpm-lock.yaml ./

# # Install pnpm globally and set store location
# RUN npm install -g pnpm && \
#     pnpm config set store-dir /app/.pnpm-store && \
#     pnpm install --frozen-lockfile

# # Copy source code
# COPY . .

# # Build Next.js application
# RUN pnpm run build

# # Production stage
# FROM node:20-alpine

# WORKDIR /app

# # Install pnpm and set store location
# RUN npm install -g pnpm && \
#     pnpm config set store-dir /app/.pnpm-store

# # Copy package files
# COPY package.json pnpm-lock.yaml ./

# # Install production dependencies only
# RUN pnpm install --prod --frozen-lockfile

# # Copy built application
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.ts ./next.config.ts

# # Expose port
# EXPOSE 3000

# # Start application
# CMD ["pnpm", "start"]



# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# only copy production output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "start"]
