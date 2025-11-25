# Apra Nova Backend - Production Deployment Guide

## 🚀 Overview

This guide covers the production deployment of the Apra Nova Backend using Docker and Docker Compose.

## 📁 Directory Structure

```
apra-nova-backend-main/
├── APROVOVA/                    # Centralized reports directory
│   ├── user_reports/           # User-related reports
│   ├── payment_reports/        # Payment reports
│   ├── batch_reports/          # Batch reports
│   └── analytics_reports/      # Analytics reports
├── nginx/                      # Nginx configuration
│   ├── nginx.conf             # Main nginx config
│   └── conf.d/
│       └── default.conf       # Server block configuration
├── core/                       # Django core settings
├── accounts/                   # User accounts app
├── payments/                   # Payments app
├── Dockerfile                  # Production Dockerfile
├── docker-compose.yml          # Production compose file
├── docker-compose.dev.yml      # Development compose file
├── .env.example               # Environment variables template
└── requirements.txt           # Python dependencies
```

## 🔧 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Domain name (for SSL/HTTPS)
- Minimum 2GB RAM, 2 CPU cores

## 📋 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd apra-nova-backend-main
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your production values
nano .env
```

**Important variables to configure:**

```env
# Django
SECRET_KEY=<generate-a-secure-random-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
POSTGRES_PASSWORD=<secure-password>

# Redis
REDIS_PASSWORD=<secure-password>

# OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>

# Stripe
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>

# SSL/Domain
VIRTUAL_HOST=yourdomain.com
LETSENCRYPT_HOST=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
```

### 3. Generate Django Secret Key

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### 4. Update Nginx Configuration

Edit `nginx/conf.d/default.conf` and replace `yourdomain.com` with your actual domain.

### 5. Build and Start Services

```bash
# Production deployment
docker-compose up -d --build

# Development deployment
docker-compose -f docker-compose.dev.yml up -d --build
```

### 6. Run Database Migrations

```bash
docker-compose exec web python manage.py migrate
```

### 7. Create Superuser

```bash
docker-compose exec web python manage.py createsuperuser
```

### 8. Collect Static Files

```bash
docker-compose exec web python manage.py collectstatic --noinput
```

## 🔒 SSL/HTTPS Configuration

The setup includes automatic SSL certificate generation using Let's Encrypt.

### Prerequisites:
1. Domain name pointing to your server's IP
2. Ports 80 and 443 open in firewall
3. Correct `LETSENCRYPT_HOST` and `LETSENCRYPT_EMAIL` in `.env`

The Let's Encrypt companion container will automatically:
- Generate SSL certificates
- Renew certificates before expiry
- Configure nginx for HTTPS

## 📊 APROVOVA Reports Directory

All reports are stored in the centralized `APROVOVA` directory:

- **user_reports/**: User-related reports (CSV, PDF, JSON)
- **payment_reports/**: Payment transaction reports
- **batch_reports/**: Batch processing reports
- **analytics_reports/**: Analytics and metrics reports

The directory is automatically created and mounted as a Docker volume for persistence.

## 🐳 Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f db
docker-compose logs -f nginx
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart web
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Execute Commands in Container
```bash
# Django shell
docker-compose exec web python manage.py shell

# Database shell
docker-compose exec db psql -U postgres -d apra_nova_db

# Redis CLI
docker-compose exec redis redis-cli -a redis_password
```

## 🔍 Health Checks

The application includes health check endpoints:

- **Backend Health**: `http://yourdomain.com/health`
- **API Root**: `http://yourdomain.com/`
- **API Documentation**: `http://yourdomain.com/swagger/`

## 📈 Monitoring

### Check Container Status
```bash
docker-compose ps
```

### Check Resource Usage
```bash
docker stats
```

### View Application Logs
```bash
docker-compose logs -f web
```

## 🔄 Updates and Maintenance

### Update Application Code
```bash
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py collectstatic --noinput
```

### Backup Database
```bash
docker-compose exec db pg_dump -U postgres apra_nova_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U postgres apra_nova_db < backup_file.sql
```

### Backup APROVOVA Reports
```bash
tar -czf aprovova_reports_$(date +%Y%m%d_%H%M%S).tar.gz APROVOVA/
```

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong passwords** for database and Redis
3. **Keep SECRET_KEY secure** and unique
4. **Enable DEBUG=False** in production
5. **Use HTTPS** for all production traffic
6. **Regularly update** Docker images and dependencies
7. **Monitor logs** for suspicious activity
8. **Backup regularly** - database and reports

## 🐛 Troubleshooting

### Container Won't Start
```bash
docker-compose logs web
docker-compose ps
```

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify DATABASE_URL in .env
```

### Static Files Not Loading
```bash
# Recollect static files
docker-compose exec web python manage.py collectstatic --noinput

# Check nginx logs
docker-compose logs nginx
```

### SSL Certificate Issues
```bash
# Check Let's Encrypt logs
docker-compose logs letsencrypt

# Verify domain DNS points to server
# Ensure ports 80 and 443 are accessible
```

## 📞 Support

For issues and questions:
- Check logs: `docker-compose logs -f`
- Review documentation: `/swagger/` or `/redoc/`
- Contact: support@apranova.dev

## 📝 License

MIT License - See LICENSE file for details

