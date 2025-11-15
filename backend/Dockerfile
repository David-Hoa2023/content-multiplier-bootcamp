# syntax=docker/dockerfile:1

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy only package manifests first for better caching
COPY package.json package-lock.json ./

# Install all dependencies (dev deps included for build)
RUN npm ci --ignore-scripts --no-audit --no-fund

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production runtime
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only package manifests first
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads/knowledge

# Expose port (Railway will set this via PORT environment variable)
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]