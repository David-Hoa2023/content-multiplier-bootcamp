# syntax=docker/dockerfile:1.6
FROM node:18-alpine AS deps

# Install bash (required for start.sh)
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# --- Backend deps ---
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# --- Frontend deps ---
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci --omit=dev

# Copy the rest of source code AFTER deps are cached
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY start.sh ./start.sh
COPY package.json ./

# Build frontend
RUN cd frontend && npm run build

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 4000

# Start command
CMD ["bash", "start.sh"]