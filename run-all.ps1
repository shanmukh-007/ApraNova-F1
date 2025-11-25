#!/usr/bin/env pwsh
# ApraNova Full Stack Runner
# Run both backend and frontend in separate terminals

Write-Host "🚀 Starting ApraNova Full Stack..." -ForegroundColor Cyan
Write-Host ""

# Get the current directory
$rootDir = Get-Location

# Start backend in new terminal
Write-Host "📦 Starting Backend..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; .\run-backend.ps1"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new terminal
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$rootDir'; .\run-frontend.ps1"

Write-Host ""
Write-Host "✅ Both servers starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Admin:    http://localhost:8000/admin" -ForegroundColor Cyan
Write-Host "📖 API Docs: http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the terminal windows to stop the servers" -ForegroundColor Yellow
