#!/bin/bash

# 🚀 Quick Deployment Script for PawPoint Find a Vet

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Run linting
echo "🔍 Running linter..."
npm run lint

# Step 3: Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📂 Build files are in the 'dist' directory"
    echo ""
    echo "🌐 Ready to deploy to:"
    echo "   - Vercel: vercel --prod"
    echo "   - Netlify: netlify deploy --prod --dir=dist"
    echo "   - GitHub Pages: npm run deploy"
    echo ""
    echo "🔗 GitHub Repository: https://github.com/vetcaresupabase-spec/pawpoint-find-a-vet"
    echo ""
    echo "✅ Deployment preparation complete!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

