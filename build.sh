#!/bin/bash
# Build Script for Render
set -e

echo "Building frontend..."
cd frontend || exit 1
npm install
npm run build
cd .. || exit 1

echo "Copying build files to root..."
cp -r frontend/build/* ./

echo "Installing API dependencies..."
cd api || exit 1
npm install
cd .. || exit 1

echo "Build completed!"
