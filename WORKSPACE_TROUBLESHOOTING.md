# Workspace Provisioning Troubleshooting Guide

## Common Error: "Docker is not accessible"

### Full Error Message
```
Docker is not accessible from the backend container. 
This feature requires Docker-in-Docker configuration with proper permissions.
```

### What This Means

The Django backend cannot connect to Docker to create workspace containers. This happens when:
1. Docker Desktop is not running
2. The backend is running directly (not in Docker) and can't access Docker
3. Docker permissions are not configured correctly

---

## Quick Fix (Choose One)

### Option A: Run Test Script (Recommended)

```powershell
# Navigate to backend directory
cd backend

# Run the Docker connection test
python test_docker_connection.py
```

This will:
- ✅ Test Docker connectivity
- ✅ Show exactly what's wrong
- ✅ Provide specific solutions
- ✅ Verify everything works

### Option B: Enable Docker Desktop API

1. **Open Docker Desktop**
2. **Go to Settings** (gear icon)
3. **Go to General**
4. **Check** ✅ "Expose daemon on tcp://localhost:2375 without TLS"
5. **Click "Apply & Restart"**
6. **Restart Django server**

### Option C: Run Everything in Docker

```powershell
# Stop Django if running
# Ctrl+C

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

---

## Detailed Troubleshooting

### Step 1: Verify Docker Desktop is Running

```powershell
# Check Docker is running
docker ps
```

**Expected**: List of containers (or empty list)  
**If Error**: Docker Desktop is not running

**Solution**:
1. Open Docker Desktop
2. Wait for it to start (whale icon steady in system tray)
3. Try `docker ps` again

### Step 2: Verify Docker Python Package

```powershell
# Check if docker package is installed
python -c "import docker; print('Docker package installed')"
```

**Expected**: "Docker package installed"  
**If Error**: "No module named 'docker'"

**Solution**:
```powershell
pip install docker
```

### Step 3: Test Docker Connection

```powershell
# Test Docker connection
python -c "import docker; client = docker.from_env(); print(client.ping())"
```

**Expected**: `True`  
**If Error**: Connection failed

**Solution**: See "Enable Docker Desktop API" above

### Step 4: Check Django Can Connect

```powershell
# Run the test script
cd backend
python test_docker_connection.py
```

**Expected**: "ALL TESTS PASSED!"  
**If Failed**: Follow the specific instructions shown

### Step 5: Restart Django Server

```powershell
# Stop Django (Ctrl+C)
# Start again
python manage.py runserver
```

Look for this message in the output:
```
✓ Docker client connected successfully
```

### Step 6: Test Workspace Provisioning

1. Login as a Data Professional student
2. Go to Workspace page
3. Click "Launch Superset"
4. Should work now! ✅

---

## Platform-Specific Solutions

### Windows

#### Issue: Named Pipe Connection Failed

**Error**: `Failed to connect via named pipe`

**Solution 1**: Enable Docker API
1. Docker Desktop → Settings → General
2. Check "Expose daemon on tcp://localhost:2375 without TLS"
3. Apply & Restart

**Solution 2**: Run as Administrator
```powershell
# Right-click PowerShell
# Select "Run as Administrator"
python manage.py runserver
```

#### Issue: Docker Desktop Not Starting

**Solution**:
1. Restart Docker Desktop
2. Check Windows Services (services.msc)
3. Ensure "Docker Desktop Service" is running
4. Restart computer if needed

### Linux

#### Issue: Permission Denied

**Error**: `Permission denied while trying to connect to the Docker daemon socket`

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again
# Or restart terminal

# Verify
docker ps
```

### Mac

#### Issue: Docker Socket Not Found

**Error**: `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`

**Solution**:
```bash
# Check Docker Desktop is running
docker ps

# If not, start Docker Desktop
open -a Docker

# Wait for it to start
```

---

## Error Messages Explained

### "Docker not available: [Errno 2] No such file or directory"

**Meaning**: Docker socket file not found  
**Cause**: Docker Desktop not running  
**Solution**: Start Docker Desktop

### "Docker not available: Error while fetching server API version"

**Meaning**: Can't connect to Docker API  
**Cause**: Docker not accessible  
**Solution**: Enable Docker API (see above)

### "Permission denied"

**Meaning**: No permission to access Docker  
**Cause**: User not in docker group (Linux) or not admin (Windows)  
**Solution**: Add to docker group or run as admin

### "Connection refused"

**Meaning**: Docker API not listening  
**Cause**: Docker Desktop not fully started  
**Solution**: Wait for Docker Desktop to fully start

---

## Alternative: Run in Docker

If you can't get Docker access working from the host, run everything in Docker:

### Step 1: Create docker-compose.dev.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    volumes:
      - ./backend:/app
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
    command: python manage.py runserver 0.0.0.0:8000

  frontend:
    build: ./frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    command: npm run dev
```

### Step 2: Start Services

```powershell
docker-compose -f docker-compose.dev.yml up
```

### Step 3: Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

---

## Verification Checklist

Use this checklist to verify everything is working:

- [ ] Docker Desktop is running
- [ ] `docker ps` works without errors
- [ ] `python -c "import docker"` works
- [ ] `python test_docker_connection.py` passes all tests
- [ ] Django server shows "Docker client connected successfully"
- [ ] Can login to application
- [ ] Can navigate to Workspace page
- [ ] Can click "Launch Superset"
- [ ] Workspace provisions successfully
- [ ] Superset opens in new tab

---

## Still Not Working?

### Collect Information

```powershell
# 1. Docker version
docker --version

# 2. Docker info
docker info

# 3. Python version
python --version

# 4. Django version
python -c "import django; print(django.get_version())"

# 5. Docker package version
python -c "import docker; print(docker.__version__)"

# 6. Test connection
python backend/test_docker_connection.py
```

### Check Logs

```powershell
# Django logs (in terminal where you ran runserver)
# Look for Docker-related errors

# Docker Desktop logs
# Docker Desktop → Troubleshoot → View logs
```

### Get Help

1. **Check Documentation**:
   - `WORKSPACE_WINDOWS_SETUP.md` - Windows-specific setup
   - `SUPERSET_INTEGRATION_GUIDE.md` - Complete guide
   - `SUPERSET_QUICK_REFERENCE.md` - Quick commands

2. **Run Diagnostics**:
   ```powershell
   python backend/test_docker_connection.py
   ```

3. **Contact Support**:
   - Email: support@apranova.com
   - Include: Error message, platform, Docker version
   - Attach: Output of test_docker_connection.py

---

## Prevention

### Daily Workflow

```powershell
# 1. Start Docker Desktop first
# Wait for it to fully start

# 2. Verify Docker is running
docker ps

# 3. Start Django
cd backend
python manage.py runserver

# 4. Start Frontend (in another terminal)
cd frontend
npm run dev
```

### Before Deploying

```powershell
# Test Docker connection
python backend/test_docker_connection.py

# Verify workspace provisioning
# Login as DP student and test
```

---

## FAQ

### Q: Do I need Docker Desktop?
**A**: Yes, for Windows and Mac. Linux can use Docker Engine.

### Q: Can I use Docker Toolbox?
**A**: No, Docker Desktop is required for named pipe support.

### Q: Is it safe to expose Docker API?
**A**: Only in development on localhost. Never in production.

### Q: Can I run without Docker?
**A**: No, workspace provisioning requires Docker.

### Q: Why not use Docker Compose?
**A**: You can! It's actually recommended for production.

### Q: Will this work in production?
**A**: Yes, but use Docker Compose, not direct Docker API.

---

## Summary

**Most Common Issue**: Docker Desktop not running or API not accessible

**Quick Fix**: 
1. Start Docker Desktop
2. Enable API: Settings → General → Expose daemon
3. Restart Django server

**Best Solution**: Run everything in Docker with docker-compose

**Need Help**: Run `python backend/test_docker_connection.py`

---

**Last Updated**: November 20, 2025  
**Tested On**: Windows 10/11, Docker Desktop 4.x
