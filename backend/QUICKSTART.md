# 🚀 Apra Nova Backend - Quick Start Guide

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- Domain name (for production with SSL)

## 🏃 Quick Start (Development)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd apra-nova-backend-main

# Copy environment file
cp .env.example .env

# Edit .env with your settings (optional for development)
nano .env
```

### 2. Initialize APROVOVA Directory

```bash
# Run the initialization script
python scripts/init_aprovova.py
```

### 3. Start Development Environment

```bash
# Using Make (recommended)
make dev-up

# Or using Docker Compose directly
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Run Migrations

```bash
# Using Make
make migrate

# Or using Docker Compose
docker-compose exec web python manage.py migrate
```

### 5. Create Superuser

```bash
# Using Make
make createsuperuser

# Or using Docker Compose
docker-compose exec web python manage.py createsuperuser
```

### 6. Access the Application

- **API Root**: http://localhost:8000/
- **Admin Panel**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/swagger/
- **Health Check**: http://localhost:8000/health

## 🌐 Production Deployment

### 1. Configure Environment

```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

**Required Production Settings:**

```env
SECRET_KEY=<generate-secure-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
POSTGRES_PASSWORD=<secure-password>
REDIS_PASSWORD=<secure-password>
VIRTUAL_HOST=yourdomain.com
LETSENCRYPT_HOST=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
```

### 2. Update Nginx Configuration

Edit `nginx/conf.d/default.conf`:
- Replace `localhost` with your domain
- Uncomment SSL configuration lines

### 3. Deploy

```bash
# Build and start services
make build
make up

# Run migrations
make migrate

# Create superuser
make createsuperuser

# Collect static files
make collectstatic
```

### 4. Verify Deployment

```bash
# Check service status
make status

# View logs
make logs
```

## 📁 APROVOVA Reports Structure

All reports are stored in the centralized `APROVOVA` directory:

```
APROVOVA/
├── user_reports/
│   ├── csv/          # User reports in CSV format
│   ├── pdf/          # User reports in PDF format
│   └── json/         # User reports in JSON format
├── payment_reports/
│   ├── csv/          # Payment reports in CSV format
│   ├── pdf/          # Payment reports in PDF format
│   ├── json/         # Payment reports in JSON format
│   └── invoices/     # Payment invoices
├── batch_reports/
│   ├── csv/          # Batch reports in CSV format
│   ├── pdf/          # Batch reports in PDF format
│   └── json/         # Batch reports in JSON format
└── analytics_reports/
    ├── csv/          # Analytics reports in CSV format
    ├── pdf/          # Analytics reports in PDF format
    ├── json/         # Analytics reports in JSON format
    └── charts/       # Chart images and visualizations
```

## 🛠️ Common Commands

### Using Make (Recommended)

```bash
# Development
make dev-up          # Start development environment
make dev-down        # Stop development environment
make dev-logs        # View development logs

# Production
make up              # Start production services
make down            # Stop production services
make restart         # Restart services
make logs            # View all logs
make logs-web        # View web service logs

# Django
make shell           # Open Django shell
make migrate         # Run migrations
make makemigrations  # Create migrations
make createsuperuser # Create superuser
make collectstatic   # Collect static files

# Maintenance
make backup-db       # Backup database
make backup-reports  # Backup APROVOVA reports
make clean           # Clean containers and volumes
make update          # Update application
```

### Using Docker Compose Directly

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f

# Production
docker-compose up -d
docker-compose down
docker-compose logs -f
docker-compose exec web python manage.py <command>
```

## 🔧 Configuration Files

- **`.env`**: Environment variables (create from `.env.example`)
- **`docker-compose.yml`**: Production Docker Compose configuration
- **`docker-compose.dev.yml`**: Development Docker Compose configuration
- **`Dockerfile`**: Production Docker image configuration
- **`nginx/nginx.conf`**: Nginx main configuration
- **`nginx/conf.d/default.conf`**: Nginx server block configuration

## 📊 Using Report Generation

### In Your Django Code

```python
from core.report_utils import ReportGenerator

# Generate user report
generator = ReportGenerator('user')
users_data = [
    {'id': 1, 'name': 'John Doe', 'email': 'john@example.com'},
    {'id': 2, 'name': 'Jane Smith', 'email': 'jane@example.com'},
]

# Save as CSV
csv_path = generator.generate_csv(users_data)

# Save as JSON
json_path = generator.generate_json(users_data)

# Return as HTTP response for download
response = generator.get_csv_response(users_data, 'users_report.csv')
return response
```

### Convenience Functions

```python
from core.report_utils import (
    generate_user_report,
    generate_payment_report,
    generate_batch_report,
    generate_analytics_report
)

# Quick report generation
file_path = generate_user_report(data, format='csv')
file_path = generate_payment_report(data, format='json')
```

## 🔍 Monitoring and Logs

```bash
# View all logs
make logs

# View specific service logs
make logs-web
make logs-db
make logs-nginx

# Check service status
make status

# Monitor resource usage
docker stats
```

## 🔒 Security Checklist

- [ ] Change `SECRET_KEY` in `.env`
- [ ] Set `DEBUG=False` in production
- [ ] Use strong passwords for database and Redis
- [ ] Configure SSL/HTTPS with Let's Encrypt
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Configure OAuth credentials
- [ ] Set up Stripe API keys
- [ ] Never commit `.env` file to git

## 🐛 Troubleshooting

### Services won't start
```bash
docker-compose logs
docker-compose ps
```

### Database connection errors
```bash
# Check database is running
docker-compose ps db

# View database logs
docker-compose logs db
```

### Static files not loading
```bash
make collectstatic
docker-compose restart nginx
```

### Permission errors with APROVOVA directory
```bash
# Fix permissions
sudo chown -R $USER:$USER APROVOVA/
chmod -R 755 APROVOVA/
```

## 📚 Additional Resources

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **API Documentation**: http://localhost:8000/swagger/
- **Django Admin**: http://localhost:8000/admin/

## 🆘 Getting Help

- Check logs: `make logs`
- Review documentation: `/swagger/` or `/redoc/`
- Check GitHub issues
- Contact: support@apranova.dev

---

**Happy Coding! 🎉**

