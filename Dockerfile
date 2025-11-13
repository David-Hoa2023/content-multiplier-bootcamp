# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
COPY package.json ./

# Install dependencies
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci --only=production

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY start.sh ./start.sh
COPY Procfile ./Procfile

# Build frontend
RUN cd frontend && npm run build

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 4000

# Start command
CMD ["bash", "start.sh"]