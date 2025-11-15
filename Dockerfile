# syntax=docker/dockerfile:1

# Stage 1: Backend dependencies
FROM node:18-alpine AS backend-deps
WORKDIR /app/backend

# Copy backend package manifests
COPY backend/package.json backend/package-lock.json ./

# Install backend production dependencies
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# Stage 2: Frontend dependencies and build
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend package manifests
COPY frontend/package.json frontend/package-lock.json ./

# Install all frontend dependencies (dev deps needed for build)
RUN npm ci --ignore-scripts --no-audit --no-fund

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 3: Production runtime
FROM node:18-alpine AS runner

# Install bash (required for start.sh)
RUN apk add --no-cache bash

WORKDIR /app

ENV NODE_ENV=production

# --- Backend setup ---
# Copy backend source and production node_modules
COPY backend/ ./backend/
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

# --- Frontend setup ---
# Copy frontend package manifests
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY frontend/next.config.js ./frontend/next.config.js

# Copy built frontend from builder
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Install frontend production dependencies
WORKDIR /app/frontend
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# Go back to app root
WORKDIR /app

# Copy start script and make it executable
COPY start.sh ./start.sh
COPY package.json ./package.json
RUN chmod +x start.sh

# Expose port
EXPOSE 4000

# Start command
CMD ["bash", "start.sh"]