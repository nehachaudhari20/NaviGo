#!/bin/bash

# Deployment script for NaviGo Frontend
# This script builds and deploys the Next.js app to Firebase Hosting

set -e

echo "🚀 NaviGo Frontend Deployment Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from frontend/vehicle-care-2 directory"
  exit 1
fi

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo "❌ Error: Firebase CLI not found. Please install it:"
  echo "   npm install -g firebase-tools"
  echo "   firebase login"
  exit 1
fi

# Step 1: Build the Next.js app
echo "📦 Step 1: Building Next.js app..."
pnpm build

if [ ! -d "out" ]; then
  echo "❌ Error: Build failed - 'out' directory not found"
  exit 1
fi

if [ ! -f "out/index.html" ]; then
  echo "❌ Error: Build failed - index.html not found in out directory"
  exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Check Firebase configuration
echo "🔍 Step 2: Checking Firebase configuration..."
if [ ! -f "firebase.json" ]; then
  echo "❌ Error: firebase.json not found"
  exit 1
fi

if [ ! -f ".firebaserc" ]; then
  echo "❌ Error: .firebaserc not found"
  exit 1
fi

echo "✅ Firebase configuration found"
echo ""

# Step 3: Deploy to Firebase Hosting
echo "🚀 Step 3: Deploying to Firebase Hosting..."
echo ""
firebase deploy --only hosting

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be live at:"
echo "   https://navigo-27206.web.app"
echo "   or"
echo "   https://navigo-27206.firebaseapp.com"

