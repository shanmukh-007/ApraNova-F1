#!/bin/bash

# Remove any git repo in frontend
rm -rf frontend/.git

# Initialize git in root if not exists
if [ ! -d .git ]; then
    git init
    git add .
    git commit -m "Initial commit: ApraNova LMS - Complete setup with fixed frontend build"
fi

# Add remote
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/shanmukh-007/ApraNova-F1.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main --force

echo "✅ Code pushed to GitHub successfully!"
