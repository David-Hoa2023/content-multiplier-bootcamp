# syntax=docker/dockerfile:1.6
FROM node:18-alpine AS build

# Install bash (required for start.sh)
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# --- Backend deps (production only) ---
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# --- Frontend deps (including dev dependencies for build) ---
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

# Copy the rest of source code AFTER deps are cached
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY start.sh ./start.sh
COPY package.json ./

# Build frontend (needs dev deps like autoprefixer, postcss, tailwindcss)
RUN cd frontend && npm run build

# Clean up frontend node_modules - not needed after build for Next.js static export
RUN cd frontend && rm -rf node_modules

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 4000

# Start command
CMD ["bash", "start.sh"]