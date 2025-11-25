#!/usr/bin/env pwsh
# ApraNova Frontend Runner
# Run Next.js frontend server

Write-Host "🚀 Starting ApraNova Frontend..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local file not found!" -ForegroundColor Red
    Write-Host "📝 Creating .env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=ApraNova
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✅ Created .env.local with default values" -ForegroundColor Green
}

# Start development server
Write-Host ""
Write-Host "✅ Frontend ready!" -ForegroundColor Green
Write-Host "🌐 Starting Next.js server on http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
