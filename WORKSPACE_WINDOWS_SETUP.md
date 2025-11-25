# Workspace Provisioning - Windows Development Setup

## Issue

When running the Django backend directly on Windows (not in Docker), you may get this error:
```
Docker is not accessible from the backend container. 
This feature requires Docker-in-Docker configuration with proper permissions.
```

## Solution

You have two options to enable workspace provisioning on Windows:

---

## Option 1: Enable Docker Desktop API Access (Recommended for Development)

### Step 1: Ensure Docker Desktop is Running

1. Open **Docker Desktop**
2. Wait for it to fully start (whale icon in system tray should be steady)
3. Verify Docker is running:
   ```powershell
   docker ps
   ```

### Step 2: Install Docker Python Package

Make sure the Docker Python package is installed in your virtual environment:

```powershell
# Activate your virtual environment first
cd backend
pip install docker
```

### Step 3: Test Docker Connection

```powershell
# Test if Python can connect to Docker
python -c "import docker; client = docker.from_env(); print(client.ping())"
```

If this works, you should see `True`. If not, continue to Step 4.

### Step 4: Enable Docker API (Development Only)

⚠️ **WARNING**: Only do this in development, not in production!

1. Open **Docker Desktop**
2. Go to **Settings** (gear icon)
3. Go to **General**
4. Check ✅ **"Expose daemon on tcp://localhost:2375 without TLS"**
5. Click **"Apply & Restart"**

### Step 5: Restart Django Server

```powershell
# Stop the Django server (Ctrl+C)
# Start it again
python manage.py runserver
```

### Step 6: Test Workspace Provisioning

1. Login as a Data Professional student
2. Go to Workspace page
3. Click "Launch Superset"
4. Should work now! ✅

---

## Option 2: Run Everything in Docker (Recommended for Production)

Instead of running Django directly, run everything in Docker:

### Step 1: Stop Django Server

Stop your local Django server (Ctrl+C)

### Step 2: Start with Docker Compose

```powershell
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### Step 3: Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Superset**: http://localhost:8088

### Step 4: Test Workspace

1. Login as a Data Professional student
2. Go to Workspace page
3. Click "Launch Superset"
4. Should work! ✅

---

## Troubleshooting

### Error: "Cannot connect to Docker daemon"

**Solution 1**: Make sure Docker Desktop is running
```powershell
docker ps
```

**Solution 2**: Restart Docker Desktop
- Right-click Docker Desktop icon in system tray
- Click "Restart"

**Solution 3**: Check Docker Desktop settings
- Settings → General → Expose daemon on tcp://localhost:2375

### Error: "Permission denied"

**Solution**: Run PowerShell as Administrator
```powershell
# Right-click PowerShell
# Select "Run as Administrator"
```

### Error: "Module 'docker' not found"

**Solution**: Install docker package
```powershell
pip install docker
```

### Error: "Port already in use"

**Solution**: Check what's using the port
```powershell
# Check port 8000
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <process_id> /F
```

### Workspace provisioning still not working

**Check Docker connection in Python**:
```powershell
python
>>> import docker
>>> client = docker.DockerClient(base_url='npipe:////./pipe/docker_engine')
>>> client.ping()
True
>>> exit()
```

If this returns `True`, Docker is accessible.

---

## Development Workflow

### Daily Development (Option 1 - Direct)

```powershell
# 1. Start Docker Desktop
# 2. Activate virtual environment
cd backend
.\venv\Scripts\Activate.ps1

# 3. Start Django
python manage.py runserver

# 4. In another terminal, start frontend
cd frontend
npm run dev
```

### Daily Development (Option 2 - Docker)

```powershell
# 1. Start all services
docker-compose up -d

# 2. View logs
docker-compose logs -f

# 3. Stop services when done
docker-compose down
```

---

## Which Option Should I Choose?

### Choose Option 1 (Direct) if:
- ✅ You want faster development iteration
- ✅ You want to use your IDE debugger
- ✅ You want hot-reload for Python code
- ✅ You're comfortable with local setup

### Choose Option 2 (Docker) if:
- ✅ You want production-like environment
- ✅ You want consistent setup across team
- ✅ You want to avoid local configuration
- ✅ You're deploying with Docker

---

## Security Notes

### Development
- ✅ Exposing Docker API on localhost is OK
- ✅ Only accessible from your machine
- ✅ No external network access

### Production
- ❌ Never expose Docker API without TLS
- ❌ Never use tcp://localhost:2375 in production
- ✅ Use Docker socket with proper permissions
- ✅ Run in Docker Compose or Kubernetes

---

## Quick Reference

### Check Docker Status
```powershell
docker ps
docker info
```

### Test Docker Connection
```powershell
python -c "import docker; print(docker.from_env().ping())"
```

### Restart Django
```powershell
# Ctrl+C to stop
python manage.py runserver
```

### View Django Logs
```powershell
# Logs are in terminal where you ran runserver
```

### Check Running Containers
```powershell
docker ps
```

### Stop All Containers
```powershell
docker stop $(docker ps -q)
```

---

## Additional Resources

- [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- [Docker Python SDK](https://docker-py.readthedocs.io/)
- [Django Development Server](https://docs.djangoproject.com/en/4.2/ref/django-admin/#runserver)

---

## Still Having Issues?

1. **Check Docker Desktop is running**: Look for whale icon in system tray
2. **Restart Docker Desktop**: Right-click icon → Restart
3. **Restart Django server**: Ctrl+C and run again
4. **Check Python can import docker**: `python -c "import docker"`
5. **Check logs**: Look for "Docker client connected successfully" message
6. **Try Docker Compose**: Use Option 2 instead

If none of these work, check the error message carefully and search for the specific error online.

---

**Last Updated**: November 20, 2025  
**Tested On**: Windows 10/11 with Docker Desktop
