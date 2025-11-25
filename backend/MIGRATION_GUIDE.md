# 🔄 Migration Guide: Organizing Backend and Frontend under ApraNova

## Current Situation

You currently have:
```
c:\Users\Admin\Desktop\frontend\
└── apra-nova-backend-main\    (current backend)
```

## Target Structure

We want to create:
```
c:\Users\Admin\Desktop\frontend\
└── ApraNova\                   (root directory)
    ├── backend\                (Django backend)
    ├── frontend\               (Your frontend app)
    ├── docker-compose.yml      (Orchestrates both)
    ├── .env                    (Shared configuration)
    ├── Makefile                (Commands)
    └── README.md               (Main docs)
```

## 📋 Migration Steps

### Option 1: Automated Migration (Recommended)

Run the PowerShell migration script:

```powershell
# From current directory (apra-nova-backend-main)
.\scripts\migrate_to_apranova.ps1
```

This will:
- Create `ApraNova` directory in parent folder
- Copy backend files to `ApraNova/backend`
- Create `ApraNova/frontend` directory
- Generate root configuration files
- Set up docker-compose for both apps

### Option 2: Manual Migration

#### Step 1: Create Directory Structure

```powershell
# Navigate to parent directory
cd c:\Users\Admin\Desktop\frontend

# Create ApraNova root
mkdir ApraNova
cd ApraNova

# Create subdirectories
mkdir backend
mkdir frontend
```

#### Step 2: Move Backend

```powershell
# Copy backend files
xcopy c:\Users\Admin\Desktop\frontend\apra-nova-backend-main backend\ /E /I /H

# Or move (if you want to remove original)
# move c:\Users\Admin\Desktop\frontend\apra-nova-backend-main backend
```

#### Step 3: Create Root docker-compose.yml

Create `ApraNova/docker-compose.yml`:

```yaml
version: '3.8'

services:
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
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
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

  db:
    image: postgres:14-alpine
    container_name: apranova_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - apranova_network

  redis:
    image: redis:7-alpine
    container_name: apranova_redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - apranova_network

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
  aprovova_reports:

networks:
  apranova_network:
    driver: bridge
```

#### Step 4: Create Root .env

```powershell
# Copy from backend example
cp backend\.env.example .env

# Edit with your values
notepad .env
```

#### Step 5: Create Root Makefile

Create `ApraNova/Makefile`:

```makefile
.PHONY: help build up down logs migrate shell

help:
	@echo "ApraNova Commands"
	@echo "================="
	@echo "make up              - Start all services"
	@echo "make down            - Stop all services"
	@echo "make logs            - View logs"
	@echo "make migrate         - Run migrations"
	@echo "make shell           - Django shell"
	@echo "make createsuperuser - Create admin user"

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

migrate:
	docker-compose exec backend python manage.py migrate

shell:
	docker-compose exec backend python manage.py shell

createsuperuser:
	docker-compose exec backend python manage.py createsuperuser
```

#### Step 6: Create Root README.md

Create `ApraNova/README.md`:

```markdown
# ApraNova - Learning Management System

## Quick Start

1. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env
   ```

2. Start services:
   ```bash
   make up
   ```

3. Run migrations:
   ```bash
   make migrate
   ```

4. Create admin user:
   ```bash
   make createsuperuser
   ```

## Access

- Backend API: http://localhost:8000/
- Admin: http://localhost:8000/admin/
- Swagger: http://localhost:8000/swagger/

## Documentation

- [Backend Docs](./backend/README.md)
- [Deployment Guide](./backend/DEPLOYMENT.md)
```

## 🚀 After Migration

### 1. Navigate to ApraNova

```powershell
cd c:\Users\Admin\Desktop\frontend\ApraNova
```

### 2. Configure Environment

```powershell
# Copy environment template
cp .env.example .env

# Edit configuration
notepad .env
```

### 3. Start Services

```powershell
# Using Make (if available)
make up

# Or using docker-compose directly
docker-compose up -d
```

### 4. Initialize Backend

```powershell
# Run migrations
make migrate

# Create superuser
make createsuperuser

# Initialize APROVOVA
docker-compose exec backend python scripts/init_aprovova.py
```

### 5. Verify Everything Works

```powershell
# Check running containers
docker-compose ps

# View logs
make logs

# Test backend
curl http://localhost:8000/health
```

## 📁 Working with the New Structure

### Backend Development

```powershell
# Navigate to backend
cd ApraNova\backend

# Use backend-specific commands
python manage.py runserver
python manage.py migrate
python manage.py createsuperuser
```

### Frontend Development

```powershell
# Navigate to frontend
cd ApraNova\frontend

# Install dependencies
npm install

# Start dev server
npm start
```

### Full Stack Development

```powershell
# From ApraNova root
make up          # Start all services
make logs        # View all logs
make down        # Stop all services
```

## 🔧 Configuration Files

### Root Level (.env)

Shared configuration for both backend and frontend:
- Database credentials
- Redis configuration
- API URLs
- Domain settings

### Backend Level (backend/.env)

Backend-specific overrides (optional):
- Django settings
- OAuth credentials
- Stripe keys

## 📊 APROVOVA Reports

Reports remain in `backend/APROVOVA/` and are accessible:
- Via Docker volume: `aprovova_reports`
- Via API endpoints
- Via admin panel

## 🐳 Docker Commands

```powershell
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f db

# Execute commands in backend
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py shell

# Rebuild after changes
docker-compose build
docker-compose up -d
```

## ✅ Verification Checklist

After migration, verify:

- [ ] ApraNova directory created
- [ ] Backend files in `ApraNova/backend`
- [ ] Frontend directory created at `ApraNova/frontend`
- [ ] Root `docker-compose.yml` exists
- [ ] Root `.env` configured
- [ ] Root `Makefile` exists
- [ ] Root `README.md` exists
- [ ] Can start services with `make up`
- [ ] Backend accessible at http://localhost:8000
- [ ] Database connected
- [ ] APROVOVA directory accessible

## 🆘 Troubleshooting

### Services won't start

```powershell
# Check logs
docker-compose logs

# Check .env file
cat .env

# Rebuild
docker-compose build --no-cache
```

### Port conflicts

```powershell
# Check what's using port 8000
netstat -ano | findstr :8000

# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Use 8001 instead
```

### Permission issues

```powershell
# Run as administrator
# Or fix permissions
icacls ApraNova /grant Everyone:F /t
```

## 📚 Additional Resources

- [Backend Documentation](./backend/README.md)
- [Quick Start Guide](./backend/QUICKSTART.md)
- [Deployment Guide](./backend/DEPLOYMENT.md)
- [Project Structure](./backend/PROJECT_STRUCTURE.md)

## 🎉 Success!

Once migration is complete, you'll have:
- ✅ Organized project structure
- ✅ Both backend and frontend under one root
- ✅ Unified docker-compose orchestration
- ✅ Shared configuration
- ✅ Easy development workflow

---

**Ready to build ApraNova! 🚀**

