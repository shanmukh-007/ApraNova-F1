# 🚀 ApraNova Production Deployment Guide

Complete guide for deploying ApraNova to production with Docker, SSL, monitoring, and backups.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Setup](#server-setup)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [SSL Setup](#ssl-setup)
6. [Monitoring](#monitoring)
7. [Backups](#backups)
8. [Maintenance](#maintenance)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Minimum Server Requirements

- **CPU**: 4 cores (8 recommended)
- **RAM**: 8 GB (16 GB recommended)
- **Storage**: 100 GB SSD
- **OS**: Ubuntu 22.04 LTS or similar
- **Network**: Static IP address
- **Domain**: Registered domain name with DNS access

### Required Software

- Docker 24.0+
- Docker Compose 2.20+
- Git
- Nginx (handled by Docker)
- Certbot (handled by Docker)

---

## 🖥️ Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

### 3. Install Docker Compose

```bash
# Docker Compose is included with Docker Desktop
# Verify installation
docker compose version
```

### 4. Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 5. Clone Repository

```bash
git clone https://github.com/prempp/ApraNova.git
cd ApraNova
```

---

## ⚙️ Configuration

### 1. Create Production Environment File

```bash
cp .env.production .env.production.local
```

### 2. Update Environment Variables

Edit `.env.production.local` and update the following:

#### **Critical Settings (MUST CHANGE)**

```bash
# Generate new secret key
SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')

# Database password
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)

# Domain
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

#### **OAuth Credentials**

- Google OAuth: https://console.cloud.google.com/
- GitHub OAuth: https://github.com/settings/developers

#### **Stripe Keys**

- Get production keys from: https://dashboard.stripe.com/

#### **Email Configuration**

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your-app-password
```

### 3. Update Nginx Configuration

Edit `nginx/nginx.prod.conf` and replace `yourdomain.com` with your actual domain.

---

## 🚀 Deployment

### Automated Deployment

```bash
# Make script executable
chmod +x deploy-production.sh

# Run deployment script
./deploy-production.sh
```

The script will:
1. ✅ Check prerequisites
2. ✅ Validate environment configuration
3. ✅ Create necessary directories
4. ✅ Build Docker images
5. ✅ Start all services
6. ✅ Run database migrations
7. ✅ Collect static files
8. ✅ Create superuser
9. ✅ Run tests (optional)
10. ✅ Setup SSL certificates (optional)

### Manual Deployment

If you prefer manual deployment:

```bash
# 1. Build images
docker-compose -f docker-compose.production.yml build --no-cache

# 2. Start services
docker-compose -f docker-compose.production.yml up -d

# 3. Run migrations
docker exec apranova_backend python manage.py migrate

# 4. Collect static files
docker exec apranova_backend python manage.py collectstatic --noinput

# 5. Create superuser
docker exec -it apranova_backend python manage.py createsuperuser

# 6. Run tests
docker exec apranova_backend python manage.py test
```

---

## 🔒 SSL Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Obtain SSL certificate
docker-compose -f docker-compose.production.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@yourdomain.com \
    --agree-tos \
    --no-eff-email \
    -d yourdomain.com \
    -d www.yourdomain.com \
    -d api.yourdomain.com

# Reload Nginx
docker-compose -f docker-compose.production.yml exec nginx nginx -s reload
```

### Option 2: Custom SSL Certificate

Place your SSL certificates in:
- `certbot/conf/live/yourdomain.com/fullchain.pem`
- `certbot/conf/live/yourdomain.com/privkey.pem`

---

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f nginx
```

### Check Service Status

```bash
docker-compose -f docker-compose.production.yml ps
```

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/health

# Frontend health
curl https://yourdomain.com/api/health
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

---

## 💾 Backups

### Automatic Backups

Backups run daily at 2 AM (configured in docker-compose.production.yml).

### Manual Backup

```bash
# Create backup
docker exec apranova_db_backup /backup.sh

# List backups
ls -lh backups/
```

### Restore from Backup

```bash
# Restore specific backup
docker exec -it apranova_db_backup /restore.sh /backups/apranova_backup_20240101_020000.sql.gz
```

### Backup to S3 (Optional)

```bash
# Install AWS CLI in backup container
docker exec apranova_db_backup apk add aws-cli

# Upload to S3
docker exec apranova_db_backup aws s3 cp /backups/ s3://your-bucket/apranova-backups/ --recursive
```

---

## 🔧 Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Run migrations
docker exec apranova_backend python manage.py migrate
```

### Scale Services

```bash
# Scale backend workers
docker-compose -f docker-compose.production.yml up -d --scale backend=3
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs

# Check container status
docker ps -a

# Restart services
docker-compose -f docker-compose.production.yml restart
```

### Database Connection Issues

```bash
# Check database logs
docker-compose -f docker-compose.production.yml logs db

# Connect to database
docker exec -it apranova_db psql -U apranova_prod_user -d apranova_production
```

### SSL Certificate Issues

```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443

# Renew certificate
docker-compose -f docker-compose.production.yml run --rm certbot renew
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Increase resources in docker-compose.production.yml
# Edit deploy.resources.limits section
```

---

## 📞 Support

For issues and questions:
- GitHub Issues: https://github.com/prempp/ApraNova/issues
- Documentation: https://github.com/prempp/ApraNova/docs

---

## 🔐 Security Checklist

- [ ] Changed all default passwords
- [ ] Updated SECRET_KEY
- [ ] Configured firewall (UFW)
- [ ] SSL certificates installed
- [ ] HTTPS redirect enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Log rotation configured
- [ ] Updated all OAuth credentials
- [ ] Stripe production keys configured
- [ ] Email SMTP configured

---

## 📈 Performance Optimization

1. **Database**: Enable connection pooling
2. **Redis**: Configure maxmemory policy
3. **Nginx**: Enable gzip compression
4. **Static Files**: Use CDN for static assets
5. **Images**: Optimize and compress images
6. **Caching**: Enable Django cache framework

---

**Last Updated**: 2025-01-08
**Version**: 1.0.0

