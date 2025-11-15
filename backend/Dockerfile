# syntax=docker/dockerfile:1

# Stage 1: Install dependencies
FROM node:18-alpine AS deps
WORKDIR /app/backend

# Copy backend package.json
COPY package.json ./

# Install all dependencies (dev deps included for build)
RUN npm install --ignore-scripts --no-audit --no-fund

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app/backend

# Copy node_modules from deps stage
COPY --from=deps /app/backend/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production runtime
FROM node:18-alpine AS runner
WORKDIR /app/backend

ENV NODE_ENV=production

# Copy package.json
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev --ignore-scripts --no-audit --no-fund

# Copy built files from builder stage
COPY --from=builder /app/backend/dist ./dist

# Create uploads directory
RUN mkdir -p uploads/knowledge

# Expose port (Railway will set this via PORT environment variable)
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]