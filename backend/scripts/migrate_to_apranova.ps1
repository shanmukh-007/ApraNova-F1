# PowerShell script to migrate project to ApraNova structure
# Run this from the current backend directory

Write-Host "=================================="
Write-Host "ApraNova Project Structure Setup"
Write-Host "=================================="
Write-Host ""

# Get current directory
$currentDir = Get-Location
$parentDir = Split-Path -Parent $currentDir
$aproNavaRoot = Join-Path $parentDir "ApraNova"

Write-Host "Current directory: $currentDir"
Write-Host "Parent directory: $parentDir"
Write-Host "ApraNova root will be: $aproNavaRoot"
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to create the ApraNova structure? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Operation cancelled."
    exit
}

Write-Host ""
Write-Host "Creating ApraNova directory structure..."
Write-Host ""

# Create ApraNova root directory
if (-not (Test-Path $aproNavaRoot)) {
    New-Item -ItemType Directory -Path $aproNavaRoot | Out-Null
    Write-Host "✓ Created ApraNova root directory"
} else {
    Write-Host "✓ ApraNova directory already exists"
}

# Create backend directory
$backendDir = Join-Path $aproNavaRoot "backend"
if (-not (Test-Path $backendDir)) {
    New-Item -ItemType Directory -Path $backendDir | Out-Null
    Write-Host "✓ Created backend directory"
}

# Create frontend directory
$frontendDir = Join-Path $aproNavaRoot "frontend"
if (-not (Test-Path $frontendDir)) {
    New-Item -ItemType Directory -Path $frontendDir | Out-Null
    Write-Host "✓ Created frontend directory"
    Write-Host "  (You'll need to add your frontend code here)"
}

Write-Host ""
Write-Host "Copying backend files..."
Write-Host ""

# Copy all files from current directory to backend directory
$excludeDirs = @('.git', 'venv', 'env', '__pycache__', 'node_modules', '.venv')
Get-ChildItem -Path $currentDir | Where-Object {
    $_.Name -notin $excludeDirs
} | ForEach-Object {
    $dest = Join-Path $backendDir $_.Name
    if (Test-Path $dest) {
        Write-Host "  Skipping $($_.Name) (already exists)"
    } else {
        Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
        Write-Host "  ✓ Copied $($_.Name)"
    }
}

Write-Host ""
Write-Host "Creating root configuration files..."
Write-Host ""

# Create root docker-compose.yml
$rootDockerCompose = @"
version: '3.8'

services:
  # Backend services
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: apranova_backend
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
      - aprovova_reports:/app/APROVOVA
    environment:
      - DATABASE_URL=postgresql://`${POSTGRES_USER}:`${POSTGRES_PASSWORD}@db:5432/`${POSTGRES_DB}
      - REDIS_URL=redis://:`${REDIS_PASSWORD}@redis:6379/0
    env_file:
      - .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - apranova_network
    ports:
      - "8000:8000"

  # Database
  db:
    image: postgres:14-alpine
    container_name: apranova_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=`${POSTGRES_DB}
      - POSTGRES_USER=`${POSTGRES_USER}
      - POSTGRES_PASSWORD=`${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U `${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - apranova_network

  # Redis
  redis:
    image: redis:7-alpine
    container_name: apranova_redis
    command: redis-server --requirepass `${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - apranova_network

  # Nginx (optional - for production)
  nginx:
    image: nginx:alpine
    container_name: apranova_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./backend/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./backend/nginx/conf.d:/etc/nginx/conf.d:ro
      - static_volume:/app/staticfiles:ro
      - media_volume:/app/media:ro
    depends_on:
      - backend
    networks:
      - apranova_network
    profiles:
      - production

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
  aprovova_reports:

networks:
  apranova_network:
    driver: bridge
"@

$dockerComposeFile = Join-Path $aproNavaRoot "docker-compose.yml"
if (-not (Test-Path $dockerComposeFile)) {
    $rootDockerCompose | Out-File -FilePath $dockerComposeFile -Encoding UTF8
    Write-Host "✓ Created root docker-compose.yml"
} else {
    Write-Host "  Skipping docker-compose.yml (already exists)"
}

# Create root .env.example
$rootEnvExample = @"
# ApraNova Project Configuration

# Project
PROJECT_NAME=ApraNova
COMPOSE_PROJECT_NAME=apranova

# Django Backend
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Database
POSTGRES_DB=apranova_db
POSTGRES_USER=apranova_user
POSTGRES_PASSWORD=change_this_password
DATABASE_URL=postgresql://apranova_user:change_this_password@db:5432/apranova_db

# Redis
REDIS_PASSWORD=change_this_redis_password
REDIS_URL=redis://:change_this_redis_password@redis:6379/0

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth (GitHub)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password

# Frontend
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000

# Domain (Production)
VIRTUAL_HOST=yourdomain.com
LETSENCRYPT_HOST=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80
"@

$envExampleFile = Join-Path $aproNavaRoot ".env.example"
if (-not (Test-Path $envExampleFile)) {
    $rootEnvExample | Out-File -FilePath $envExampleFile -Encoding UTF8
    Write-Host "✓ Created root .env.example"
} else {
    Write-Host "  Skipping .env.example (already exists)"
}

# Create root Makefile
$rootMakefile = @"
.PHONY: help build up down restart logs clean migrate shell

help:
	@echo "ApraNova Project Commands"
	@echo "========================="
	@echo "make build          - Build all containers"
	@echo "make up             - Start all services"
	@echo "make down           - Stop all services"
	@echo "make restart        - Restart all services"
	@echo "make logs           - View all logs"
	@echo "make logs-backend   - View backend logs"
	@echo "make clean          - Clean all containers and volumes"
	@echo "make migrate        - Run backend migrations"
	@echo "make shell          - Open backend Django shell"
	@echo "make createsuperuser - Create Django superuser"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-db:
	docker-compose logs -f db

clean:
	docker-compose down -v
	docker system prune -f

migrate:
	docker-compose exec backend python manage.py migrate

shell:
	docker-compose exec backend python manage.py shell

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

backup-db:
	docker-compose exec db pg_dump -U apranova_user apranova_db > backup_`$(date +%Y%m%d_%H%M%S).sql
"@

$makefileFile = Join-Path $aproNavaRoot "Makefile"
if (-not (Test-Path $makefileFile)) {
    $rootMakefile | Out-File -FilePath $makefileFile -Encoding UTF8
    Write-Host "✓ Created root Makefile"
} else {
    Write-Host "  Skipping Makefile (already exists)"
}

# Create root README.md
$rootReadme = @"
# 🚀 ApraNova - Learning Management System

Full-stack Learning Management System with Django backend and modern frontend.

## 📁 Project Structure

``````
ApraNova/
├── backend/          - Django REST API
├── frontend/         - Frontend application
├── docker-compose.yml - Orchestrates all services
├── .env              - Environment configuration
└── Makefile          - Convenient commands
``````

## 🚀 Quick Start

1. Copy environment file:
   ``````bash
   cp .env.example .env
   ``````

2. Edit .env with your configuration

3. Start all services:
   ``````bash
   make up
   ``````

4. Run migrations:
   ``````bash
   make migrate
   ``````

5. Create superuser:
   ``````bash
   make createsuperuser
   ``````

## 🌐 Access

- **Backend API**: http://localhost:8000/
- **Admin Panel**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/swagger/

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Quick Start Guide](./backend/QUICKSTART.md)
- [Deployment Guide](./backend/DEPLOYMENT.md)

## 🛠️ Commands

See ``make help`` for all available commands.

---

**Built with ❤️ for ApraNova Learning Management System**
"@

$readmeFile = Join-Path $aproNavaRoot "README.md"
if (-not (Test-Path $readmeFile)) {
    $rootReadme | Out-File -FilePath $readmeFile -Encoding UTF8
    Write-Host "✓ Created root README.md"
} else {
    Write-Host "  Skipping README.md (already exists)"
}

Write-Host ""
Write-Host "=================================="
Write-Host "✓ Migration Complete!"
Write-Host "=================================="
Write-Host ""
Write-Host "ApraNova structure created at: $aproNavaRoot"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. cd $aproNavaRoot"
Write-Host "2. cp .env.example .env"
Write-Host "3. Edit .env with your configuration"
Write-Host "4. make up"
Write-Host "5. make migrate"
Write-Host ""
Write-Host "Your backend code is in: $backendDir"
Write-Host "Add your frontend code to: $frontendDir"
Write-Host ""

