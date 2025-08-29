#!/bin/bash
# Build Script for Render
set -e

echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "Building frontend..."
cd frontend || exit 1
echo "Frontend directory contents:"
ls -la
npm ci
npm run build
cd .. || exit 1

echo "Copying build files to root..."
cp -r frontend/build/* ./

echo "Installing API dependencies..."
cd api || exit 1
npm ci
cd .. || exit 1

echo "Build completed!"
echo "Final root directory contents:"
ls -la
