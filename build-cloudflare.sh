#!/bin/bash
# Cloudflare Pages Build Script for Monorepo
set -e

echo "Building frontend for Cloudflare Pages..."

# Install dependencies for the workspace
npm ci

# Navigate to frontend and build
cd frontend
npm run build

echo "Build completed successfully!"
