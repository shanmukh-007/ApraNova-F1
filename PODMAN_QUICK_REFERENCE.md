# ApraNova Podman - Quick Reference Card

## 🚀 Initial Setup (One-time)

```bash
# 1. Install Podman and podman-compose
brew install podman podman-compose

# 2. Initialize Podman machine
podman machine init --cpus 4 --memory 8192 --disk-size 50
podman machine start

# 3. Make scripts executable
chmod +x start-all-podman.sh podman-commands.sh

# 4. Create .env file
cp .env.example .env

# 5. Start ApraNova
./start-all-podman.sh
```

## 📋 Daily Commands

### Start/Stop

```bash
./podman-commands.sh start      # Start all services
./podman-commands.sh stop       # Stop all services
./podman-commands.sh restart    # Restart all services
./podman-commands.sh status     # Check status
```

### Logs

```bash
./podman-commands.sh logs              # All logs
./podman-commands.sh logs-backend      # Backend only
./podman-commands.sh logs-frontend     # Frontend only
```

### Database

```bash
./podman-commands.sh migrate           # Run migrations
./podman-commands.sh shell-db          # Open DB shell
./podman-commands.sh backup-db         # Backup database
```

### Testing

```bash
./podman-commands.sh test              # Run all tests
./podman-commands.sh test-accounts     # Test accounts app
./podman-commands.sh test-payments     # Test payments app
```

### Cleanup

```bash
./podman-commands.sh clean             # Remove containers/volumes
./podman-commands.sh clean-all         # Complete cleanup
./podman-commands.sh rebuild           # Clean rebuild
```

## 🌐 Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/swagger/ |
| Admin Panel | http://localhost:8000/admin |

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@apranova.com | Admin@123 |
| Student | student@apranova.com | Student@123 |
| Teacher | teacher@apranova.com | Teacher@123 |

## 🔧 Troubleshooting

### Podman machine not running
```bash
podman machine start
```

### Services won't start
```bash
./podman-commands.sh clean-all
./start-all-podman.sh
```

### Check health
```bash
./podman-commands.sh health
```

### View all commands
```bash
./podman-commands.sh help
```

## 📊 Useful Podman Commands

```bash
# List containers
podman ps -a

# View resource usage
podman stats

# Execute command in container
podman exec -it apranova_backend bash

# View container logs
podman logs -f apranova_backend

# Restart specific container
podman restart apranova_backend

# Remove specific container
podman rm -f apranova_backend
```

## 🔄 Update Workflow

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild everything
./podman-commands.sh rebuild

# 3. Run migrations
./podman-commands.sh migrate

# 4. Check health
./podman-commands.sh health
```

## 💡 Pro Tips

1. **Always check Podman machine is running**: `podman machine list`
2. **Use the management script**: `./podman-commands.sh` for common tasks
3. **Check logs first**: When debugging, always check logs
4. **Clean rebuild**: If issues persist, do a clean rebuild
5. **Resource monitoring**: Use `podman stats` to monitor resource usage

## 🆘 Emergency Commands

```bash
# Stop everything immediately
podman stop $(podman ps -aq)

# Remove all containers
podman rm -f $(podman ps -aq)

# Remove all volumes
podman volume prune -f

# Complete system cleanup
podman system prune -af --volumes

# Restart Podman machine
podman machine stop && podman machine start
```

## 📞 Getting Help

```bash
# Show all management commands
./podman-commands.sh help

# Podman help
podman --help

# Check Podman version
podman --version

# Check machine info
podman machine info
```

