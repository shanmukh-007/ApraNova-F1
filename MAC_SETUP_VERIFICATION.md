# 🍎 ApraNova - Mac Setup & Verification Guide

## ✅ Current Status

Your Mac setup has been verified:

- ✅ **Repository Cloned**: Latest code (commit: `d3643a8`)
- ✅ **Docker Installed**: Rancher Desktop (Docker v27.5.1-rd)
- ✅ **Docker Compose**: v2.33.0
- ✅ **Environment File**: `.env` created from template
- ⚠️ **Docker Daemon**: Not running (needs to be started)

---

## 🚀 Quick Start Guide

### Step 1: Start Docker Desktop (Rancher Desktop)

**You need to start Rancher Desktop first:**

1. Open **Rancher Desktop** application from your Applications folder
2. Wait for it to fully start (you'll see the whale icon in your menu bar)
3. Verify it's running:

```bash
docker ps
```

You should see an empty list or running containers (not an error).

---

### Step 2: Verify Docker Context

Make sure you're using the correct Docker context:

```bash
# Check current context
docker context ls

# Should show rancher-desktop with an asterisk (*)
# If not, switch to it:
docker context use rancher-desktop
```

---

### Step 3: Verify Environment Configuration

Your `.env` file has been created. Review and update if needed:

```bash
# View the environment file
cat .env

# Edit if you want to change any settings
nano .env
```

**Key settings to verify:**
- `DEBUG=True` (for development)
- `DB_PASSWORD` (change from default for security)
- `DJANGO_SECRET_KEY` (change for production)

---

### Step 4: Run the Setup Script

Once Docker is running, execute the startup script:

```bash
# Make the script executable
chmod +x start-all.sh

# Run the complete setup
./start-all.sh
```

**What this script does:**
1. ✅ Cleans up any previous installations
2. ✅ Builds the Code-Server image (VS Code in browser)
3. ✅ Builds the Backend (Django REST API)
4. ✅ Builds the Frontend (Next.js)
5. ✅ Starts all services (Backend, Frontend, Database, Redis)
6. ✅ Runs database migrations
7. ✅ Creates demo users
8. ✅ Runs comprehensive tests
9. ✅ Verifies workspace configuration

**Expected time:** 10-15 minutes on first run

---

### Step 5: Verify Services Are Running

After the script completes, check service status:

```bash
# View all running containers
docker-compose -f docker-compose.complete.yml ps

# Should show:
# - apranova_backend (running)
# - apranova_frontend (running)
# - apranova_db (running)
# - apranova_redis (running)
```

---

### Step 6: Access the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/swagger/
- **Admin Panel**: http://localhost:8000/admin

---

## 👤 Demo User Credentials

The setup script creates these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@apranova.com | Admin@123 |
| **Student** | student@apranova.com | Student@123 |
| **Teacher** | teacher@apranova.com | Teacher@123 |

---

## 🧪 Testing the Application

### Test 1: Login as Student

1. Go to http://localhost:3000
2. Click "Login"
3. Use: `student@apranova.com` / `Student@123`
4. You should see the student dashboard

### Test 2: Launch Workspace (VS Code in Browser)

1. After logging in as student
2. Navigate to "Workspace" section
3. Click "Launch Workspace" button
4. Wait 10-20 seconds for provisioning
5. VS Code should open in a new tab **without password prompt**

### Test 3: API Health Check

```bash
# Check backend health
curl http://localhost:8000/health

# Should return: {"status": "healthy"}
```

### Test 4: Run Backend Tests

```bash
# Run all tests
docker exec apranova_backend python manage.py test

# Run specific test suite
docker exec apranova_backend python manage.py test accounts
docker exec apranova_backend python manage.py test payments
```

---

## 🔍 Verification Commands

### Check Docker Status

```bash
# List all containers
docker ps -a

# Check specific service logs
docker logs apranova_backend --tail 50
docker logs apranova_frontend --tail 50
docker logs apranova_db --tail 50

# Follow logs in real-time
docker-compose -f docker-compose.complete.yml logs -f
```

### Check Service Health

```bash
# Backend health
curl http://localhost:8000/health

# Frontend (should return HTML)
curl http://localhost:3000

# Database connection
docker exec apranova_backend python manage.py dbshell
```

### Check Workspace Containers

```bash
# List all workspace containers
docker ps --filter "name=workspace_"

# View workspace logs
docker logs workspace_<user_id>
```

---

## 🐛 Troubleshooting

### Issue 1: Docker Daemon Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
1. Open Rancher Desktop application
2. Wait for it to fully start
3. Verify with: `docker ps`

### Issue 2: Port Already in Use

**Error:** `port is already allocated`

**Solution:**
```bash
# Find what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in docker-compose.complete.yml
```

### Issue 3: Build Failures

**Error:** Build fails during `./start-all.sh`

**Solution:**
```bash
# Clean everything and rebuild
docker-compose -f docker-compose.complete.yml down -v
docker system prune -af
./start-all.sh
```

### Issue 4: Services Not Healthy

**Error:** Services start but health checks fail

**Solution:**
```bash
# Check logs for specific service
docker logs apranova_backend --tail 100

# Restart the service
docker-compose -f docker-compose.complete.yml restart backend

# Check database connection
docker exec apranova_backend python manage.py migrate
```

### Issue 5: Workspace Won't Launch

**Error:** Workspace provisioning fails

**Solution:**
```bash
# Verify code-server image exists
docker images | grep apra-nova-code-server

# Rebuild code-server image
cd backend/apra-nova-code-server
docker build -t apra-nova-code-server:latest .
cd ../..

# Check backend can access Docker
docker exec apranova_backend docker ps
```

---

## 📊 System Requirements

**Minimum:**
- macOS 10.15 (Catalina) or later
- 8 GB RAM
- 20 GB free disk space
- Docker Desktop or Rancher Desktop

**Recommended:**
- macOS 12 (Monterey) or later
- 16 GB RAM
- 50 GB SSD
- 4+ CPU cores

---

## 🛠️ Useful Commands

### Service Management

```bash
# Start all services
docker-compose -f docker-compose.complete.yml up -d

# Stop all services
docker-compose -f docker-compose.complete.yml down

# Restart a specific service
docker-compose -f docker-compose.complete.yml restart backend

# View service status
docker-compose -f docker-compose.complete.yml ps
```

### Database Management

```bash
# Run migrations
docker exec apranova_backend python manage.py migrate

# Create superuser
docker exec -it apranova_backend python manage.py createsuperuser

# Access database shell
docker exec -it apranova_db psql -U apranova_user -d apranova_db

# Backup database
docker exec apranova_db pg_dump -U apranova_user apranova_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Development

```bash
# Access backend shell
docker exec -it apranova_backend /bin/bash

# Access Django shell
docker exec -it apranova_backend python manage.py shell

# Access frontend shell
docker exec -it apranova_frontend /bin/sh

# View real-time logs
docker-compose -f docker-compose.complete.yml logs -f backend
```

---

## 🔄 Next Steps

After successful verification:

1. ✅ **Explore the Application**: Login and test all features
2. ✅ **Review Documentation**: Check `README.md` for detailed info
3. ✅ **Test Workspace Feature**: Launch a student workspace
4. ✅ **Review Code**: Explore backend and frontend code
5. ✅ **Run Tests**: Execute the test suite
6. ✅ **Customize**: Modify settings in `.env` as needed

---

## 📚 Additional Resources

- **Main README**: `README.md` - Complete project documentation
- **Quick Reference**: `QUICK_REFERENCE.md` - Command cheat sheet
- **Backend Docs**: `backend/README.md` - Backend-specific info
- **Frontend Docs**: `frontend/README.md` - Frontend-specific info
- **API Docs**: http://localhost:8000/swagger/ - Interactive API documentation

---

## ✅ Verification Checklist

Use this checklist to verify your setup:

- [ ] Rancher Desktop is running
- [ ] Docker context is set to `rancher-desktop`
- [ ] `.env` file exists and is configured
- [ ] `./start-all.sh` completed successfully
- [ ] All 4 services are running (backend, frontend, db, redis)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8000
- [ ] Can login with demo credentials
- [ ] Can launch student workspace
- [ ] VS Code opens in browser without password
- [ ] All tests pass

---

**🎉 Once all items are checked, your ApraNova LMS is ready to use!**

