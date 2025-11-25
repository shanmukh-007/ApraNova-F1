# ApraNova Platform - Distribution Guide

This guide explains how to create a distributable Docker package and deploy it on another machine.

---

## 📦 Creating the Distribution Package

### Step 1: Export Docker Images

On your development machine, run the export script:

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File .\export-docker-images.ps1
```

**Linux/Mac:**
```bash
chmod +x export-docker-images.sh
./export-docker-images.sh
```

This will:
- ✅ Build all Docker images (frontend, backend, code-server)
- ✅ Export images to `.tar` files
- ✅ Include PostgreSQL and Redis images
- ✅ Copy configuration files
- ✅ Create import scripts for the target machine
- ✅ Generate a README for distribution

### Step 2: Package Contents

After export, you'll have a folder `apranova-docker-export/` containing:

```
apranova-docker-export/
├── code-server.tar          (~2-3 GB)
├── backend.tar              (~500 MB)
├── frontend.tar             (~400 MB)
├── postgres.tar             (~100 MB)
├── redis.tar                (~50 MB)
├── docker-compose.yml       (Configuration)
├── .env.example             (Environment template)
├── import-and-run.ps1       (Windows import script)
├── import-and-run.sh        (Linux/Mac import script)
└── README.md                (User guide)
```

**Total Size:** ~3-4 GB

### Step 3: Transfer to Target Machine

Copy the entire `apranova-docker-export/` folder to the target machine using:
- USB drive
- Network share
- Cloud storage (Google Drive, Dropbox, etc.)
- SCP/SFTP

---

## 🚀 Installing on Target Machine

### Prerequisites

The target machine needs:
- ✅ Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- ✅ Docker Compose
- ✅ Minimum 8GB RAM
- ✅ 20GB free disk space
- ✅ Ports available: 3000, 8000, 5433, 6380

### Installation Steps

#### Windows

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

2. **Navigate to the export folder**
   ```powershell
   cd path\to\apranova-docker-export
   ```

3. **Run the import script**
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\import-and-run.ps1
   ```

#### Linux/Mac

1. **Install Docker and Docker Compose**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install docker.io docker-compose
   
   # Mac (using Homebrew)
   brew install docker docker-compose
   ```

2. **Navigate to the export folder**
   ```bash
   cd path/to/apranova-docker-export
   ```

3. **Run the import script**
   ```bash
   chmod +x import-and-run.sh
   ./import-and-run.sh
   ```

### What the Import Script Does

1. ✅ Checks if Docker is running
2. ✅ Imports all Docker images from `.tar` files
3. ✅ Creates `.env` file from example
4. ✅ Starts all services with docker-compose
5. ✅ Waits for services to be healthy
6. ✅ Shows service status

---

## 🌐 Accessing the Platform

After successful installation:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main user interface |
| **Backend API** | http://localhost:8000 | REST API |
| **Admin Panel** | http://localhost:8000/admin | Django admin |
| **API Docs** | http://localhost:8000/api/docs | API documentation |

---

## ⚙️ Configuration

### Environment Variables

Edit the `.env` file to customize:

```bash
# Database
POSTGRES_DB=apranova_db
POSTGRES_USER=apranova_user
POSTGRES_PASSWORD=change_this_password

# Redis
REDIS_PASSWORD=change_this_password

# Django
SECRET_KEY=change_this_secret_key
DEBUG=False  # Set to False for production
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Important:** Change passwords and secret keys for production use!

---

## 🔧 Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
docker-compose restart
```

### Check Status
```bash
docker-compose ps
```

### Create Superuser (Admin)
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Run Migrations
```bash
docker-compose exec backend python manage.py migrate
```

### Create Demo Users
```bash
docker-compose exec backend python manage.py create_demo_users
```

---

## 🐛 Troubleshooting

### Issue: Docker not running
**Solution:** Start Docker Desktop or Docker service
```bash
# Linux
sudo systemctl start docker

# Windows/Mac
Start Docker Desktop application
```

### Issue: Port already in use
**Solution:** Change ports in `docker-compose.yml`
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### Issue: Services not healthy
**Solution:** Check logs and wait longer
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Issue: Database connection error
**Solution:** Ensure database is healthy
```bash
docker-compose ps
docker-compose restart db
```

### Issue: Out of disk space
**Solution:** Clean up Docker
```bash
docker system prune -a
```

---

## 📊 System Requirements

### Minimum Requirements
- **CPU:** 2 cores
- **RAM:** 8 GB
- **Disk:** 20 GB free space
- **OS:** Windows 10/11, macOS 10.15+, Ubuntu 20.04+

### Recommended Requirements
- **CPU:** 4+ cores
- **RAM:** 16 GB
- **Disk:** 50 GB SSD
- **OS:** Latest stable version

---

## 🔒 Security Considerations

### For Production Deployment

1. **Change Default Passwords**
   - Update all passwords in `.env`
   - Use strong, unique passwords

2. **Disable Debug Mode**
   ```bash
   DEBUG=False
   ```

3. **Use HTTPS**
   - Set up SSL certificates
   - Configure reverse proxy (nginx)

4. **Update Allowed Hosts**
   ```bash
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

5. **Secure Database**
   - Don't expose database port publicly
   - Use strong passwords
   - Regular backups

6. **Regular Updates**
   - Keep Docker images updated
   - Apply security patches

---

## 📝 Backup and Restore

### Backup Data
```bash
# Backup database
docker-compose exec db pg_dump -U apranova_user apranova_db > backup.sql

# Backup volumes
docker run --rm -v apranova_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

### Restore Data
```bash
# Restore database
cat backup.sql | docker-compose exec -T db psql -U apranova_user apranova_db

# Restore volumes
docker run --rm -v apranova_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

---

## 🆘 Support

For issues and questions:
- Check logs: `docker-compose logs`
- Review this guide
- Contact ApraNova support team

---

## 📄 License

ApraNova Platform - All rights reserved

