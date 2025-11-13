#!/bin/bash

# Railway deployment start script
echo "Starting Full-Stack Idea Management Application..."

# Set environment variables
export NODE_ENV=production

# Database setup
echo "Checking database connection..."
if [ -f "database/init.sql" ]; then
  echo "Database initialization script found"
fi

# Install dependencies for all services
echo "Installing dependencies..."

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm ci --only=production
cd ..

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm ci --only=production

# Build frontend
echo "Building frontend..."
npm run build
cd ..

# Start services
echo "Starting services..."

# Start backend server in background
cd backend
echo "Starting backend server on port ${PORT:-4000}..."
npm start &
BACKEND_PID=$!
cd ..

# Start frontend server
cd frontend
echo "Starting frontend server on port 3000..."
PORT=3000 npm start &
FRONTEND_PID=$!
cd ..

# Wait for both processes
echo "Services started:"
echo "- Backend running on port ${PORT:-4000} (PID: $BACKEND_PID)"
echo "- Frontend running on port 3000 (PID: $FRONTEND_PID)"
echo "Application ready!"

# Keep the script running
wait $BACKEND_PID $FRONTEND_PID