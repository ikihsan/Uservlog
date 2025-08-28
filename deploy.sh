#!/bin/bash

echo "🚀 Deploying Fathi.vlogs to Vercel..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Copy backend dependencies to api folder
echo "📋 Preparing API..."
cp -r backend/routes api/
cp -r backend/models api/
cp -r backend/middleware api/
cp -r backend/utils api/
cp backend/.env api/ 2>/dev/null || echo "No .env file found"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌟 Your site should be available at: https://fathi-vlogs.vercel.app"
