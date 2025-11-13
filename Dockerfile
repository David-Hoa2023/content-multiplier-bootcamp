# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Install bash (required for start.sh)
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY package.json ./

# Install dependencies
RUN cd backend && npm ci --omit=dev
RUN cd frontend && npm ci --omit=dev

# Copy source code
COPY backend/src/ ./backend/src/
COPY backend/tsconfig.json ./backend/
COPY frontend/ ./frontend/
COPY start.sh ./start.sh

# Build frontend
RUN cd frontend && npm run build

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 4000

# Start command
CMD ["bash", "start.sh"]