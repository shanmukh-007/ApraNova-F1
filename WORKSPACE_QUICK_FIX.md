# Workspace Quick Fix - Using Shared Superset

## What Changed

Instead of trying to provision individual Superset containers for each user (which requires Docker-in-Docker), we're now using the **shared Superset instance** that's already running in docker-compose.

This is perfect for development and works great when running Django directly!

## How It Works Now

```
Data Professional Student
    ↓
Click "Launch Workspace"
    ↓
Backend returns: http://localhost:8088
    ↓
Opens shared Superset instance
    ↓
Student logs in with admin/admin
    ↓
Start analyzing data!
```

## Setup (One Time)

### Step 1: Make Sure Superset is Running

```powershell
# Check if running
docker-compose ps superset

# If not running, start it
docker-compose up -d superset

# Wait for it to be healthy (30-60 seconds)
docker-compose logs -f superset
```

### Step 2: Verify Configuration

Your `.env` file should have:
```env
USE_SHARED_SUPERSET=true
SUPERSET_URL=http://localhost:8088
```

✅ Already configured!

### Step 3: Restart Django

```powershell
# Stop Django (Ctrl+C)
# Start again
cd backend
python manage.py runserver
```

## Testing

### Step 1: Run Test Script

```powershell
.\test-workspace-api.ps1
```

This checks if both Django and Superset are running.

### Step 2: Create/Login as DP Student

1. Go to http://localhost:3000/signup
2. Create account with:
   - Track: **Data Professional (DP)**
   - Fill in other details
3. Or login if you already have a DP account

### Step 3: Test Workspace

1. Login to the application
2. Click **"Workspace"** in sidebar
3. You should see:
   - Purple theme
   - "Launch Superset" button
   - Superset-specific features
4. Click **"Launch Superset"**
5. Should open http://localhost:8088 in new tab
6. Login with:
   - Username: `admin`
   - Password: `admin`

## Troubleshooting

### Issue: "Docker is not accessible"

**Solution**: This is now bypassed! The shared Superset mode doesn't need Docker access from Django.

### Issue: Workspace doesn't open

**Check**:
```powershell
# 1. Is Superset running?
docker-compose ps superset

# 2. Can you access it directly?
Start-Process "http://localhost:8088"

# 3. Check Django logs for errors
# Look in terminal where Django is running
```

### Issue: Wrong workspace type (shows VS Code instead of Superset)

**Check user track**:
1. Login to Django admin: http://localhost:8000/admin
2. Go to Users
3. Find your user
4. Check "Track" field = "DP"

### Issue: Superset not loading

See `SUPERSET_NOT_LOADING_FIX.md` for detailed troubleshooting.

## For Production

For production, you have two options:

### Option 1: Shared Superset (Current Setup)
- All DP students use the same Superset instance
- Simple and works well for small teams
- Students share the same login (admin/admin)

**Pros**:
- Simple setup
- No Docker-in-Docker needed
- Works with any deployment

**Cons**:
- Students share the same workspace
- No isolation between students

### Option 2: Per-User Containers (Original Plan)
- Each student gets their own Superset container
- Full isolation
- Requires Docker-in-Docker

**To enable**:
```env
USE_SHARED_SUPERSET=false
```

Then run everything in Docker:
```powershell
docker-compose up -d
```

## Quick Commands

### Start Everything
```powershell
# Start Superset
docker-compose up -d superset

# Start Django (in another terminal)
cd backend
python manage.py runserver

# Start Frontend (in another terminal)
cd frontend
npm run dev
```

### Check Status
```powershell
# Superset
docker-compose ps superset

# Django
# Check terminal where it's running

# Frontend
# Check terminal where it's running
```

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Superset**: http://localhost:8088

### Superset Login
- **Username**: admin
- **Password**: admin

## Summary

✅ **Fixed**: No more Docker access errors!  
✅ **Simple**: Uses shared Superset instance  
✅ **Works**: Perfect for development  
✅ **Fast**: No container provisioning delay  

Just make sure:
1. Superset is running: `docker-compose up -d superset`
2. Django is running: `python manage.py runserver`
3. User track is "DP"
4. Click "Launch Workspace"
5. Enjoy Superset! 🎉

---

**Need Help?**
- Run: `.\test-workspace-api.ps1`
- Check: `SUPERSET_NOT_LOADING_FIX.md`
- Logs: `docker-compose logs superset`
