# 🚀 ApraNova - Quick Start for Mac

## ✅ Your System is Ready!

All verification checks passed! Here's how to get started.

---

## 🎯 One-Command Setup

Run this single command to build and start everything:

```bash
./start-all.sh
```

**What happens:**
- ✅ Cleans up any previous installations
- ✅ Builds Code-Server image (VS Code in browser)
- ✅ Builds Backend (Django REST API)
- ✅ Builds Frontend (Next.js)
- ✅ Starts all services
- ✅ Runs database migrations
- ✅ Creates demo users
- ✅ Runs comprehensive tests

**Time:** 10-15 minutes on first run

---

## 🌐 Access the Application

After setup completes, open these URLs:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/swagger/ | Interactive API documentation |
| **Admin** | http://localhost:8000/admin | Django admin panel |

---

## 👤 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@apranova.com | Student@123 |
| **Teacher** | teacher@apranova.com | Teacher@123 |
| **Admin** | admin@apranova.com | Admin@123 |

---

## 🧪 Quick Test

### Test the Student Workspace Feature

1. **Login as Student**
   ```
   Email: student@apranova.com
   Password: Student@123
   ```

2. **Navigate to Workspace**
   - Click on "Workspace" in the navigation

3. **Launch Workspace**
   - Click "Launch Workspace" button
   - Wait 10-20 seconds for provisioning
   - VS Code opens in browser **without password!** 🎉

---

## 📊 Verify Everything is Running

```bash
# Check all services
docker-compose -f docker-compose.complete.yml ps

# Should show 4 services running:
# - apranova_backend
# - apranova_frontend
# - apranova_db
# - apranova_redis
```

---

## 🔍 View Logs

```bash
# All services
docker-compose -f docker-compose.complete.yml logs -f

# Specific service
docker logs apranova_backend -f
docker logs apranova_frontend -f
```

---

## 🛑 Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.complete.yml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.complete.yml down -v
```

---

## 🔄 Restart Services

```bash
# Restart all
docker-compose -f docker-compose.complete.yml restart

# Restart specific service
docker-compose -f docker-compose.complete.yml restart backend
```

---

## 🐛 Troubleshooting

### Services won't start?

```bash
# Check logs
docker-compose -f docker-compose.complete.yml logs

# Clean rebuild
docker-compose -f docker-compose.complete.yml down -v
./start-all.sh
```

### Port already in use?

```bash
# Find what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in docker-compose.complete.yml
```

### Workspace won't launch?

```bash
# Check code-server image
docker images | grep apra-nova-code-server

# Rebuild if missing
cd backend/apra-nova-code-server
docker build -t apra-nova-code-server:latest .
cd ../..
```

---

## 📚 Documentation

- **Full Setup Guide**: `MAC_SETUP_VERIFICATION.md`
- **Main README**: `README.md`
- **Quick Reference**: `QUICK_REFERENCE.md`
- **Backend Docs**: `backend/README.md`
- **Frontend Docs**: `frontend/README.md`

---

## ✅ System Verification

Your Mac setup:
- ✅ macOS 15.6 (Compatible)
- ✅ Docker 27.5.1-rd (Running)
- ✅ Docker Compose v2.33.0
- ✅ 32GB RAM (Excellent)
- ✅ 465GB free space (Excellent)
- ✅ All ports available
- ✅ All files present
- ✅ Environment configured

---

## 🎯 Next Steps

1. **Run the setup** (if you haven't already):
   ```bash
   ./start-all.sh
   ```

2. **Wait for completion** (10-15 minutes)

3. **Open browser** to http://localhost:3000

4. **Login** with demo credentials

5. **Test workspace** feature

6. **Explore** the application!

---

## 💡 Pro Tips

- **First build takes time**: Subsequent starts are much faster
- **Keep Docker running**: Rancher Desktop must be running
- **Check logs often**: `docker-compose logs -f` is your friend
- **Use demo accounts**: Pre-configured and ready to use
- **Workspace is passwordless**: No password needed for VS Code!

---

**🎉 You're all set! Happy coding with ApraNova!**

