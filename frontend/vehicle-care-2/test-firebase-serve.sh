#!/bin/bash
# Test script to verify Firebase Hosting serves JS files correctly locally

echo "🧪 Testing Firebase Hosting locally..."
echo ""

cd "$(dirname "$0")"

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

# Check if build exists
if [ ! -d "out" ]; then
    echo "❌ Build output not found. Run: pnpm build"
    exit 1
fi

# Check if _next files exist
if [ ! -d "out/_next/static" ]; then
    echo "❌ _next/static directory not found in build"
    exit 1
fi

JS_COUNT=$(find out/_next/static -name "*.js" | wc -l)
echo "✅ Found $JS_COUNT JS files in build"
echo ""

# Start Firebase serve
echo "🚀 Starting Firebase Hosting server..."
echo "Visit: http://localhost:5000"
echo "Press Ctrl+C to stop"
echo ""

firebase serve --only hosting --port 5000

