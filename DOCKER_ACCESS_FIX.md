# Docker Access Fix - Quick Guide

## Problem

Getting this error when launching workspace:
```
Docker is not accessible from the backend container. 
This feature requires Docker-in-Docker configuration with proper permissions.
```

## Root Cause

You're running Django backend directly on Windows (not in Docker), and it can't connect to Docker Desktop.

## Quick Solution (3 Steps)

### Step 1: Run Test Script

```powershell
cd backend
python test_docker_connection.py
```

This will tell you exactly what's wrong.

### Step 2: Enable Docker API

1. Open **Docker Desktop**
2. Go to **Settings** (gear icon)
3. Go to **General** tab
4. Check ✅ **"Expose daemon on tcp://localhost:2375 without TLS"**
5. Click **"Apply & Restart"**

⚠️ **Note**: This is for development only, not production!

### Step 3: Restart Django

```powershell
# Stop Django (Ctrl+C)
# Start again
python manage.py runserver
```

Look for this message:
```
✓ Docker client connected successfully
```

## Test It

1. Login as a Data Professional student
2. Go to Workspace page
3. Click "Launch Superset"
4. Should work! ✅

## Alternative: Use Docker Compose

Instead of running Django directly, run everything in Docker:

```powershell
# Stop Django server (Ctrl+C)

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

This is actually the recommended approach for production!

## Files Created

I've created several files to help you:

1. **backend/test_docker_connection.py** - Test Docker connectivity
2. **WORKSPACE_WINDOWS_SETUP.md** - Complete Windows setup guide
3. **WORKSPACE_TROUBLESHOOTING.md** - Detailed troubleshooting
4. **DOCKER_ACCESS_FIX.md** - This file (quick reference)

## Code Changes

I've updated the backend to:
- ✅ Better detect Windows Docker Desktop
- ✅ Try named pipe connection first
- ✅ Provide helpful error messages with instructions
- ✅ Show platform-specific solutions

## What to Do Now

**Option 1: Quick Fix (5 minutes)**
1. Run test script
2. Enable Docker API
3. Restart Django
4. Test workspace

**Option 2: Docker Compose (Recommended)**
1. Stop Django
2. Run `docker-compose up -d`
3. Access at http://localhost:3000
4. Everything works!

## Need Help?

Run the test script first:
```powershell
python backend/test_docker_connection.py
```

It will tell you exactly what to do!

---

**Quick Links:**
- [Windows Setup Guide](WORKSPACE_WINDOWS_SETUP.md)
- [Troubleshooting Guide](WORKSPACE_TROUBLESHOOTING.md)
- [Superset Integration](SUPERSET_INTEGRATION_GUIDE.md)
