#!/bin/bash

# Content Multiplier - Production Deployment Script
# This script builds and deploys the application using PM2

set -e  # Exit on error

echo "==================================="
echo "Content Multiplier Deployment"
echo "==================================="

# Create log directories
echo "Creating log directories..."
mkdir -p backend/logs
mkdir -p frontend/logs

# Build backend
echo ""
echo "Building backend..."
cd backend
npm run build
cd ..

# Build frontend
echo ""
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Stop existing PM2 processes (if any)
echo ""
echo "Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

# Start applications with PM2
echo ""
echo "Starting applications with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 process list
echo ""
echo "Saving PM2 process list..."
pm2 save

# Display status
echo ""
echo "==================================="
echo "Deployment complete!"
echo "==================================="
pm2 list
echo ""
echo "Useful commands:"
echo "  pm2 logs              - View all logs"
echo "  pm2 monit             - Monitor processes"
echo "  pm2 restart all       - Restart all processes"
echo "  pm2 stop all          - Stop all processes"
echo ""
