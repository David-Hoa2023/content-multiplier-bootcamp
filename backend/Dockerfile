# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# 1) Copy only manifests first for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts --no-audit --no-fund

# 2) Then bring in the rest of the source
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

# Set working directory
WORKDIR /app

# 1) Copy only manifests first
COPY package.json package-lock.json ./

# Install only production dependencies using the lockfile
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# 2) Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads/knowledge

# Expose port (Railway will set this via PORT environment variable)
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]