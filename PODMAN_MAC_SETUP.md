# ApraNova - Podman Setup for Mac

Complete guide for running ApraNova on macOS using Podman instead of Docker.

## 📋 Prerequisites

### 1. Install Podman

```bash
# Install Podman using Homebrew
brew install podman

# Verify installation
podman --version
```

### 2. Install Podman Compose

```bash
# Install podman-compose
brew install podman-compose

# Verify installation
podman-compose --version
```

### 3. Initialize Podman Machine

```bash
# Create and start a Podman machine
podman machine init

# Start the Podman machine
podman machine start

# Verify it's running
podman machine list
```

### 4. Configure Podman Machine (Optional but Recommended)

For better performance, you can configure the Podman machine with more resources:

```bash
# Stop the machine first
podman machine stop

# Remove the default machine
podman machine rm

# Create a new machine with custom resources
podman machine init --cpus 4 --memory 8192 --disk-size 50

# Start the machine
podman machine start
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ApraNova
```

### 2. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your settings
nano .env
```

### 3. Make Scripts Executable

```bash
chmod +x start-all-podman.sh
chmod +x podman-commands.sh
```

### 4. Start ApraNova

```bash
# Run the complete setup and startup script
./start-all-podman.sh
```

This script will:
- Clean up any existing containers and images
- Build all images (backend, frontend, code-server)
- Start all services (backend, frontend, database, redis)
- Run database migrations
- Create demo users
- Verify the setup

## 🛠️ Management Commands

Use the `podman-commands.sh` script for easy management:

### Setup & Start

```bash
# Start all services
./podman-commands.sh start

# Stop all services
./podman-commands.sh stop

# Restart all services
./podman-commands.sh restart

# Clean rebuild all services
./podman-commands.sh rebuild
```

### Logs & Monitoring

```bash
# View logs from all services
./podman-commands.sh logs

# View backend logs only
./podman-commands.sh logs-backend

# View frontend logs only
./podman-commands.sh logs-frontend

# View database logs only
./podman-commands.sh logs-db

# Show status of all containers
./podman-commands.sh status

# List all running containers
./podman-commands.sh ps
```

### Database Management

```bash
# Run database migrations
./podman-commands.sh migrate

# Create new migrations
./podman-commands.sh makemigrations

# Open PostgreSQL shell
./podman-commands.sh shell-db

# Backup database
./podman-commands.sh backup-db

# Restore database from backup
./podman-commands.sh restore-db backup_20240101_120000.sql
```

### Django Management

```bash
# Open Django shell
./podman-commands.sh shell

# Create Django superuser
./podman-commands.sh createsuperuser

# Create demo users
./podman-commands.sh create-demo

# Collect static files
./podman-commands.sh collectstatic

# Run all tests
./podman-commands.sh test

# Run specific app tests
./podman-commands.sh test-accounts
./podman-commands.sh test-payments
```

### Cleanup

```bash
# Remove all containers and volumes
./podman-commands.sh clean

# Remove all ApraNova images
./podman-commands.sh clean-images

# Complete cleanup (containers, volumes, images)
./podman-commands.sh clean-all

# Prune unused Podman resources
./podman-commands.sh prune
```

### Workspace Management

```bash
# List all workspace containers
./podman-commands.sh list-workspaces

# Remove all workspace containers
./podman-commands.sh clean-workspaces
```

### Info & Health

```bash
# Check health of all services
./podman-commands.sh health

# Show all access URLs
./podman-commands.sh urls

# Show help
./podman-commands.sh help
```

## 🌐 Access URLs

Once started, access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/swagger/
- **Admin Panel**: http://localhost:8000/admin
- **Database**: localhost:5433
- **Redis**: localhost:6380

## 👤 Demo User Credentials

```
Admin:    admin@apranova.com / Admin@123
Student:  student@apranova.com / Student@123
Teacher:  teacher@apranova.com / Teacher@123
```

## 🔧 Manual Podman Commands

If you prefer to use Podman commands directly:

### Start Services

```bash
podman-compose -f docker-compose.complete.yml up -d
```

### Stop Services

```bash
podman-compose -f docker-compose.complete.yml down
```

### View Logs

```bash
# All services
podman-compose -f docker-compose.complete.yml logs -f

# Specific service
podman logs -f apranova_backend
```

### Execute Commands in Containers

```bash
# Django shell
podman exec -it apranova_backend python manage.py shell

# Database shell
podman exec -it apranova_db psql -U apranova_user -d apranova_db

# Run migrations
podman exec apranova_backend python manage.py migrate

# Run tests
podman exec apranova_backend python manage.py test
```

### Build Images

```bash
# Build backend
podman build -t apranova-backend:latest ./backend

# Build frontend
podman build -t apranova-frontend:latest ./frontend

# Build code-server
podman build -t apra-nova-code-server:latest ./backend/apra-nova-code-server
```

## 🐛 Troubleshooting

### Podman Machine Not Running

```bash
# Check machine status
podman machine list

# Start the machine
podman machine start

# If issues persist, recreate the machine
podman machine stop
podman machine rm
podman machine init --cpus 4 --memory 8192
podman machine start
```

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in docker-compose.complete.yml
```

### Permission Issues

```bash
# Ensure scripts are executable
chmod +x start-all-podman.sh
chmod +x podman-commands.sh
```

### Container Won't Start

```bash
# Check logs
podman logs apranova_backend
podman logs apranova_frontend

# Check container status
podman ps -a

# Restart specific container
podman restart apranova_backend
```

### Database Connection Issues

```bash
# Check if database is running
podman ps | grep apranova_db

# Check database logs
podman logs apranova_db

# Test database connection
podman exec apranova_db pg_isready -U apranova_user
```

### Clean Start

If you encounter persistent issues, do a complete clean start:

```bash
# Stop everything
./podman-commands.sh stop

# Clean everything
./podman-commands.sh clean-all

# Rebuild from scratch
./start-all-podman.sh
```

## 📊 Resource Management

### Check Resource Usage

```bash
# View resource usage of all containers
podman stats

# View specific container
podman stats apranova_backend
```

### Adjust Podman Machine Resources

```bash
# Stop the machine
podman machine stop

# Remove it
podman machine rm

# Create with more resources
podman machine init --cpus 6 --memory 12288 --disk-size 100

# Start it
podman machine start
```

## 🔄 Updates and Maintenance

### Pull Latest Code

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
./podman-commands.sh rebuild
```

### Update Dependencies

```bash
# Backend dependencies
podman exec apranova_backend pip install -r requirements.txt

# Frontend dependencies
podman exec apranova_frontend npm install

# Or rebuild images
./podman-commands.sh rebuild
```

## 📝 Notes

1. **Podman vs Docker**: Podman is a drop-in replacement for Docker. Most Docker commands work with Podman by simply replacing `docker` with `podman`.

2. **Rootless**: Podman runs rootless by default, which is more secure than Docker.

3. **Podman Machine**: On macOS, Podman runs in a VM (Podman machine). Make sure it's running before using Podman commands.

4. **Performance**: Podman on Mac may have slightly different performance characteristics than Docker. Adjust machine resources as needed.

5. **Docker Socket**: The Docker socket mounting (`/var/run/docker.sock`) for workspace provisioning works with Podman's Docker-compatible socket.

## 🆘 Getting Help

```bash
# Show all available commands
./podman-commands.sh help

# Podman help
podman --help

# Podman-compose help
podman-compose --help
```

## 🔗 Useful Links

- [Podman Documentation](https://docs.podman.io/)
- [Podman Compose](https://github.com/containers/podman-compose)
- [Podman Desktop](https://podman-desktop.io/) - GUI for Podman

