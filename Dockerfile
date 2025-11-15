# syntax=docker/dockerfile:1.6

# Stage 1: Install dependencies and build
FROM node:18-alpine AS build

# Install bash (required for start.sh)
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# --- Backend dependencies ---
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# --- Frontend dependencies (including dev dependencies for build) ---
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY start.sh ./start.sh
COPY package.json ./

# Build frontend (requires dev dependencies)
RUN cd frontend && npm run build

# Stage 2: Production runtime
FROM node:18-alpine AS production

# Install bash (required for start.sh)
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy backend with its node_modules (already production-only)
COPY --from=build /app/backend ./backend

# Copy frontend build output and package files
COPY --from=build /app/frontend/.next ./frontend/.next
COPY --from=build /app/frontend/package.json ./frontend/package.json
COPY --from=build /app/frontend/package-lock.json ./frontend/package-lock.json
COPY --from=build /app/frontend/next.config.js ./frontend/next.config.js

# Create empty public directory (Next.js expects it)
RUN mkdir -p ./frontend/public

# Install only production dependencies for frontend
WORKDIR /app/frontend
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# Go back to app root
WORKDIR /app

# Copy start script and make it executable
COPY --from=build /app/start.sh ./start.sh
COPY --from=build /app/package.json ./package.json
RUN chmod +x start.sh

# Expose port
EXPOSE 4000

# Start command
CMD ["bash", "start.sh"]