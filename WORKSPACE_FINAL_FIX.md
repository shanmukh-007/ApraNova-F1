# Workspace "Site Can't Be Reached" - Final Fix

## Problem

When clicking "Launch Workspace", you get "This site can't be reached" error.

## Root Cause

You're running everything in Docker now, and the workspace feature needs proper configuration.

## Solution

### Step 1: Verify Superset is Running

```powershell
# Check all containers
docker-compose ps

# Should show:
# - apranova_backend (Up, healthy)
# - apranova_superset (Up, healthy)
# - apranova_db (Up, healthy)
# - apranova_redis (Up, healthy)
```

### Step 2: Test Superset Directly

```powershell
# Open Superset in browser
Start-Process "http://localhost:8088"
```

**If this works**: Superset is accessible, issue is with the workspace integration.  
**If this doesn't work**: Superset is not accessible, see troubleshooting below.

### Step 3: Restart Backend

```powershell
# Restart backend to pick up code changes
docker-compose restart backend

# Check logs
docker-compose logs -f backend
```

### Step 4: Test Workspace Feature

1. **Login** to your application at http://localhost:3000
2. Make sure you're logged in as a **Data Professional** student (track = "DP")
3. Go to **Workspace** page
4. Click **"Launch Superset"**
5. Should open http://localhost:8088 in new tab

## If Superset Doesn't Open

### Test the API Directly

Open `test-workspace-endpoint.html` in your browser:

```powershell
Start-Process "test-workspace-endpoint.html"
```

Then:
1. Enter your credentials
2. Click "Login"
3. Click "Test Workspace Endpoint"
4. Check the response
5. Click "Open Superset"

This will show you exactly what the API is returning.

## Troubleshooting

### Issue 1: Superset Container Not Running

```powershell
# Check status
docker-compose ps superset

# If not running, start it
docker-compose up -d superset

# Wait for healthy status (30-60 seconds)
docker-compose logs -f superset
```

### Issue 2: Port 8088 Not Accessible

```powershell
# Check if port is listening
netstat -ano | findstr :8088

# Should show something like:
# TCP    0.0.0.0:8088    0.0.0.0:0    LISTENING    <PID>
```

**If not listening**:
```powershell
# Restart Superset
docker-compose restart superset
```

### Issue 3: User Track Not Set to "DP"

```powershell
# Access Django admin
Start-Process "http://localhost:8000/admin"

# Login with admin credentials
# Go to Users
# Find your user
# Set Track = "DP"
# Save
```

### Issue 4: Backend Not Returning Correct URL

```powershell
# Check backend logs
docker-compose logs backend | Select-String "workspace"

# Should see workspace API calls
```

### Issue 5: CORS Issues

If you see CORS errors in browser console (F12):

Edit `.env`:
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,http://localhost:8088
```

Then restart:
```powershell
docker-compose restart backend
```

## Complete Reset

If nothing works, do a complete reset:

```powershell
# Stop all containers
docker-compose down

# Remove volumes (WARNING: Deletes data!)
docker volume prune -f

# Start fresh
docker-compose up -d

# Wait for all services to be healthy
docker-compose ps

# Check logs
docker-compose logs -f
```

## Verify Everything is Working

### 1. Check All Services

```powershell
docker-compose ps
```

All should show "Up" and "healthy".

### 2. Test Each Service

```powershell
# Backend
curl http://localhost:8000

# Superset
curl http://localhost:8088/health

# Frontend (if running)
curl http://localhost:3000
```

### 3. Test Superset Login

1. Open http://localhost:8088
2. Login with:
   - Username: `admin`
   - Password: `admin`
3. Should see Superset dashboard

### 4. Test Workspace Feature

1. Login to app at http://localhost:3000
2. Go to Workspace
3. Click "Launch Superset"
4. Should open Superset

## Debug Mode

### Enable Verbose Logging

Edit `docker-compose.yml` for backend:
```yaml
backend:
  environment:
    - DEBUG=True
    - DJANGO_LOG_LEVEL=DEBUG
```

Restart:
```powershell
docker-compose restart backend
docker-compose logs -f backend
```

### Check Browser Console

1. Press `F12` to open Developer Tools
2. Go to "Console" tab
3. Try launching workspace
4. Look for errors (red text)
5. Share the error message

### Check Network Tab

1. Press `F12`
2. Go to "Network" tab
3. Click "Launch Workspace"
4. Look for the API call to `/users/workspace/create/`
5. Check the response

## Common Error Messages

### "This site can't be reached"

**Cause**: Superset not running or port not accessible  
**Fix**: Start Superset: `docker-compose up -d superset`

### "Connection refused"

**Cause**: Service not listening on port  
**Fix**: Restart service: `docker-compose restart superset`

### "502 Bad Gateway"

**Cause**: Service crashed or not responding  
**Fix**: Check logs: `docker-compose logs superset`

### "CORS error"

**Cause**: CORS not configured  
**Fix**: Add to CORS_ALLOWED_ORIGINS in `.env`

### "Unauthorized"

**Cause**: Not logged in or token expired  
**Fix**: Login again

## Still Not Working?

### Collect Debug Information

```powershell
# 1. Container status
docker-compose ps > debug-containers.txt

# 2. Backend logs
docker-compose logs backend > debug-backend.txt

# 3. Superset logs
docker-compose logs superset > debug-superset.txt

# 4. Network check
netstat -ano | findstr ":8088" > debug-network.txt

# 5. Test Superset directly
curl http://localhost:8088/health > debug-superset-health.txt
```

### Contact Support

Email: support@apranova.com

Include:
- What you're trying to do
- What error you're seeing
- Browser console errors (F12 → Console)
- Debug files from above
- Screenshots

## Quick Reference

### Start Everything
```powershell
docker-compose up -d
```

### Stop Everything
```powershell
docker-compose down
```

### Restart Backend
```powershell
docker-compose restart backend
```

### Restart Superset
```powershell
docker-compose restart superset
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f superset
docker-compose logs -f backend
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Superset**: http://localhost:8088
- **Django Admin**: http://localhost:8000/admin

### Superset Login
- **Username**: admin
- **Password**: admin

---

**Last Updated**: November 20, 2025  
**Status**: Fixed - Workspace should now open Superset correctly
