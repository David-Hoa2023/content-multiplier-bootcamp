# syntax=docker/dockerfile:1

# Stage 1: Install all workspace dependencies
FROM node:18-alpine AS deps

# Install bash (required for start.sh)
RUN apk add --no-cache bash

WORKDIR /app

# Copy root workspace manifests first for better caching
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Install all workspace dependencies
RUN npm ci --ignore-scripts --no-audit --no-fund

# Stage 2: Build frontend
FROM node:18-alpine AS frontend-builder
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
FROM node:18-alpine AS runner

# Install bash (required for start.sh)
RUN apk add --no-cache bash

WORKDIR /app

ENV NODE_ENV=production

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Install only production dependencies for all workspaces
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

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