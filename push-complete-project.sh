#!/bin/bash

cd ..

echo "🚀 Pushing complete ApraNova project to GitHub..."

# Remove any nested git repos
rm -rf frontend/.git
rm -rf backend/.git

# Initialize git in root
git init

# Add all files
git add .

# Commit
git commit -m "Complete ApraNova LMS: Backend (Django) + Frontend (Next.js) + Docker setup"

# Add remote
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/shanmukh-007/ApraNova-F1.git

# Rename to main
git branch -M main

# Force push
git push -u origin main --force

echo "✅ Complete project pushed successfully!"
echo "📦 Includes: Backend, Frontend, Docker configs, Documentation"
