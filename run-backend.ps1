#!/usr/bin/env pwsh
# ApraNova Backend Runner
# Run Django backend server

Write-Host "🚀 Starting ApraNova Backend..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "backend"

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Check if .env exists
if (-not (Test-Path "../.env")) {
    Write-Host "⚠️  Warning: .env file not found!" -ForegroundColor Red
    Write-Host "📝 Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item "../.env.example" "../.env"
    Write-Host "✏️  Please edit .env file with your configuration" -ForegroundColor Yellow
    Read-Host "Press Enter to continue after editing .env"
}

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
python manage.py makemigrations
python manage.py migrate

# Create superuser if needed (optional)
Write-Host ""
$createSuperuser = Read-Host "Create superuser? (y/n)"
if ($createSuperuser -eq "y") {
    python manage.py createsuperuser
}

# Collect static files
Write-Host "📦 Collecting static files..." -ForegroundColor Yellow
python manage.py collectstatic --noinput

# Start server
Write-Host ""
Write-Host "Backend ready!" -ForegroundColor Green
Write-Host "Starting Django server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "Admin panel: http://localhost:8000/admin" -ForegroundColor Cyan
Write-Host "API docs: http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python manage.py runserver 0.0.0.0:8000
