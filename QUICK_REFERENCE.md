# ApraNova - Quick Reference Guide

Quick command reference for common tasks on Windows and Linux.

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
# Start everything
.\start-all.ps1

# Or manually
docker-compose -f docker-compose.complete.yml up -d --build
```

### Linux/Mac (Bash)
```bash
# Start everything
chmod +x start-all.sh
./start-all.sh

# Or manually
docker-compose -f docker-compose.complete.yml up -d --build
```

## 📊 Service Management

### Start/Stop/Restart

| Action | Windows & Linux Command |
|--------|------------------------|
| Start all services | `docker-compose -f docker-compose.complete.yml up -d` |
| Stop all services | `docker-compose -f docker-compose.complete.yml down` |
| Restart all services | `docker-compose -f docker-compose.complete.yml restart` |
| Restart backend only | `docker-compose -f docker-compose.complete.yml restart backend` |
| Restart frontend only | `docker-compose -f docker-compose.complete.yml restart frontend` |
| View service status | `docker-compose -f docker-compose.complete.yml ps` |

### Rebuild Services

| Action | Command |
|--------|---------|
| Rebuild all | `docker-compose -f docker-compose.complete.yml up -d --build` |
| Rebuild backend | `docker-compose -f docker-compose.complete.yml up -d --build backend` |
| Rebuild frontend | `docker-compose -f docker-compose.complete.yml up -d --build frontend` |

## 📝 Logs

### View Logs

| What | Windows & Linux Command |
|------|------------------------|
| All logs (follow) | `docker-compose -f docker-compose.complete.yml logs -f` |
| Backend logs | `docker-compose -f docker-compose.complete.yml logs -f backend` |
| Frontend logs | `docker-compose -f docker-compose.complete.yml logs -f frontend` |
| Database logs | `docker-compose -f docker-compose.complete.yml logs -f db` |
| Redis logs | `docker-compose -f docker-compose.complete.yml logs -f redis` |

### View Last N Lines

**Windows (PowerShell)**
```powershell
docker logs apranova_backend --tail=50
docker logs apranova_frontend --tail=50
```

**Linux/Mac**
```bash
docker logs apranova_backend --tail 50
docker logs apranova_frontend --tail 50
```

## 🗄️ Database Commands

| Action | Command |
|--------|---------|
| Run migrations | `docker exec apranova_backend python manage.py migrate` |
| Create migrations | `docker exec apranova_backend python manage.py makemigrations` |
| Create superuser | `docker exec -it apranova_backend python manage.py createsuperuser` |
| Database shell | `docker exec -it apranova_db psql -U apranova_user -d apranova_db` |
| Django shell | `docker exec -it apranova_backend python manage.py shell` |

### Backup Database

**Windows (PowerShell)**
```powershell
docker exec apranova_db pg_dump -U apranova_user apranova_db > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

**Linux/Mac**
```bash
docker exec apranova_db pg_dump -U apranova_user apranova_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

**Windows & Linux**
```bash
docker exec -i apranova_db psql -U apranova_user -d apranova_db < backup_file.sql
```

## 🔧 Django Management

| Action | Command |
|--------|---------|
| Collect static files | `docker exec apranova_backend python manage.py collectstatic --noinput` |
| Run tests | `docker exec apranova_backend python manage.py test` |
| Create superuser | `docker exec -it apranova_backend python manage.py createsuperuser` |
| Shell access | `docker exec -it apranova_backend /bin/bash` |

## 💻 Workspace Management

### Build Code-Server Image

```bash
cd backend/apra-nova-code-server
docker build -t apra-nova-code-server:latest .
cd ../..
```

### Workspace Commands

| Action | Command |
|--------|---------|
| List all workspaces | `docker ps -a --filter "name=workspace_"` |
| Stop workspace | `docker stop workspace_<user_id>` |
| Remove workspace | `docker rm -f workspace_<user_id>` |
| View workspace logs | `docker logs workspace_<user_id>` |
| Remove all workspaces | `docker rm -f $(docker ps -a --filter "name=workspace_" -q)` |

### Verify Docker-in-Docker

```bash
docker exec apranova_backend docker ps
```

## 🌐 Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Admin Panel | http://localhost:8000/admin |
| API Docs | http://localhost:8000/swagger |

## 🧹 Cleanup Commands

| Action | Command |
|--------|---------|
| Stop containers | `docker-compose -f docker-compose.complete.yml down` |
| Stop + remove volumes | `docker-compose -f docker-compose.complete.yml down -v` |
| Stop + remove images | `docker-compose -f docker-compose.complete.yml down -v --rmi all` |
| Remove workspaces | `docker rm -f $(docker ps -a --filter "name=workspace_" -q)` |
| Clean Docker system | `docker system prune -af` |

## 🔍 Debugging

### Check Container Status

```bash
docker ps
docker-compose -f docker-compose.complete.yml ps
```

### Check Container Health

```bash
docker inspect apranova_backend --format='{{.State.Health.Status}}'
docker inspect apranova_frontend --format='{{.State.Health.Status}}'
```

### Execute Commands in Container

```bash
# Backend shell
docker exec -it apranova_backend /bin/bash

# Frontend shell
docker exec -it apranova_frontend /bin/sh

# Database shell
docker exec -it apranova_db psql -U apranova_user -d apranova_db

# Redis CLI
docker exec -it apranova_redis redis-cli -a redis_pass
```

### Check Port Usage

**Windows (PowerShell)**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5433
netstat -ano | findstr :6380
```

**Linux/Mac**
```bash
lsof -i :3000
lsof -i :8000
lsof -i :5433
lsof -i :6380
```

## 🧪 Testing

### Test Signup

**Windows**
```powershell
.\test_signup.ps1
```

**Linux/Mac**
```bash
chmod +x test_signup.sh
./test_signup.sh
```

### Manual API Testing

**Windows (PowerShell)**
```powershell
# Check backend health
Invoke-RestMethod -Uri "http://localhost:8000/health"

# Test signup
$body = @{
    username = "test@example.com"
    email = "test@example.com"
    password1 = "TestPass123!@#"
    password2 = "TestPass123!@#"
    name = "Test User"
    role = "student"
    track = "DP"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/auth/registration/" -Method POST -Body $body -ContentType "application/json"
```

**Linux/Mac**
```bash
# Check backend health
curl http://localhost:8000/health

# Test signup
curl -X POST http://localhost:8000/api/auth/registration/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "email": "test@example.com",
    "password1": "TestPass123!@#",
    "password2": "TestPass123!@#",
    "name": "Test User",
    "role": "student",
    "track": "DP"
  }'
```

## 📦 Environment Variables

Key variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | apranova_user | Database username |
| `POSTGRES_PASSWORD` | apranova_pass | Database password |
| `POSTGRES_DB` | apranova_db | Database name |
| `REDIS_PASSWORD` | redis_pass | Redis password |
| `DEBUG` | True | Django debug mode |
| `ALLOWED_HOSTS` | localhost,backend,... | Allowed hosts |
| `WORKSPACE_BASE_PATH` | /app/workspaces | Workspace storage path |

## 🚨 Common Issues

### Issue: Port already in use

**Solution:**
```bash
# Find and kill process using the port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Issue: Database connection failed

**Solution:**
```bash
# Restart database
docker-compose -f docker-compose.complete.yml restart db

# Check database logs
docker logs apranova_db
```

### Issue: Frontend build errors

**Solution:**
```bash
# Rebuild frontend
docker-compose -f docker-compose.complete.yml up -d --build frontend

# Check logs
docker logs apranova_frontend -f
```

### Issue: Workspace provisioning fails

**Solution:**
```bash
# Build code-server image
cd backend/apra-nova-code-server
docker build -t apra-nova-code-server:latest .

# Verify backend can access Docker
docker exec apranova_backend docker ps
```

## 📚 More Information

- Full documentation: `README.md`
- Workspace setup: `WORKSPACE_SETUP.md`
- Email verification: `EMAIL_VERIFICATION_SETUP.md`

---

**Quick Tip**: Bookmark this page for fast command lookup! 🔖

