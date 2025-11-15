# syntax=docker/dockerfile:1

# Stage 1: Install all workspace dependencies
FROM node:22-bullseye AS deps

# Install bash and canvas system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root workspace manifests first for better caching
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Install all workspace dependencies
RUN npm ci --no-audit --no-fund

# Stage 2: Build frontend
FROM node:22-bullseye AS frontend-builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy frontend source
COPY frontend/ ./frontend/

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Stage 3: Production runtime
FROM node:22-bullseye-slim AS runner

# Install bash and runtime canvas dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Install only production dependencies for all workspaces
RUN npm ci --omit=dev --no-audit --no-fund

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend from builder
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/next.config.js ./frontend/next.config.js

# Copy start script and make it executable
COPY start.sh ./start.sh
RUN chmod +x start.sh

# Expose port
EXPOSE 4000

# Start command
CMD ["bash", "start.sh"]