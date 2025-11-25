# 🚀 Apra Nova Backend - Django API Platform

[![Django](https://img.shields.io/badge/Django-5.2.7-green.svg)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.10-blue.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready Django REST API backend for the Apra Nova Learning Management System with centralized report generation, OAuth authentication, payment processing, and Docker deployment.

## ✨ Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - OAuth 2.0 (Google, GitHub)
  - Role-based access control (Student, Trainer, Admin)

- 💳 **Payment Integration**
  - Stripe payment processing
  - Payment tracking and reporting

- 📊 **Centralized Report Generation (APROVOVA)**
  - User reports (CSV, JSON, PDF)
  - Payment reports with invoices
  - Batch processing reports
  - Analytics and metrics reports

- 🐳 **Production-Ready Docker Setup**
  - Multi-stage Dockerfile
  - Docker Compose for orchestration
  - Nginx reverse proxy
  - Let's Encrypt SSL automation
  - PostgreSQL database
  - Redis caching

- 📚 **API Documentation**
  - Swagger/OpenAPI documentation
  - ReDoc alternative documentation
  - Interactive API testing

- 🔒 **Security**
  - HTTPS/SSL support
  - CORS configuration
  - Security headers
  - Non-root Docker containers
  - Environment-based secrets

## 🏗️ Architecture

```
┌─────────────────┐
│   Nginx Proxy   │ ← SSL/HTTPS, Static Files
└────────┬────────┘
         │
┌────────▼────────┐
│  Django/Gunicorn│ ← REST API, Business Logic
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ PostgreSQL│  │ Redis │
└──────┘  └──────┘
```

## 📁 Project Structure

```
ApraNova/
├── APROVOVA/                    # Centralized reports directory
│   ├── user_reports/           # User-related reports
│   ├── payment_reports/        # Payment reports & invoices
│   ├── batch_reports/          # Batch processing reports
│   └── analytics_reports/      # Analytics & metrics
├── core/                       # Django core settings
│   ├── settings.py            # Main settings
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI config
│   └── report_utils.py        # Report generation utilities
├── accounts/                   # User management app
├── payments/                   # Payment processing app
├── nginx/                      # Nginx configuration
│   ├── nginx.conf             # Main nginx config
│   └── conf.d/                # Server blocks
├── scripts/                    # Utility scripts
│   └── init_aprovova.py       # Initialize APROVOVA structure
├── Dockerfile                  # Production Docker image
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose
├── requirements.txt            # Python dependencies
├── Makefile                    # Convenience commands
├── .env.example               # Environment template
├── QUICKSTART.md              # Quick start guide
└── DEPLOYMENT.md              # Deployment guide
```

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Python 3.10+ (for local development)

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd ApraNova

# Copy environment file
cp .env.example .env

# Initialize APROVOVA directory structure
python scripts/init_aprovova.py

# Start development environment
make dev-up

# Run migrations
make migrate

# Create superuser
make createsuperuser
```

Access the application:
- **API**: http://localhost:8000/
- **Admin**: http://localhost:8000/admin/
- **Swagger**: http://localhost:8000/swagger/
- **Health**: http://localhost:8000/health

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment instructions.

```bash
# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Build and deploy
make build
make up
make migrate
make createsuperuser
make collectstatic
```

## 📊 APROVOVA Reports System

The APROVOVA directory provides centralized storage for all generated reports:

### Directory Structure

```
APROVOVA/
├── user_reports/
│   ├── csv/          # User data exports
│   ├── pdf/          # User reports in PDF
│   └── json/         # User data in JSON
├── payment_reports/
│   ├── csv/          # Payment transactions
│   ├── pdf/          # Payment summaries
│   ├── json/         # Payment data
│   └── invoices/     # Generated invoices
├── batch_reports/
│   ├── csv/          # Batch processing logs
│   ├── pdf/          # Batch summaries
│   └── json/         # Batch data
└── analytics_reports/
    ├── csv/          # Analytics data
    ├── pdf/          # Analytics reports
    ├── json/         # Metrics data
    └── charts/       # Visualizations
```

### Usage Example

```python
from core.report_utils import ReportGenerator

# Generate user report
generator = ReportGenerator('user')
users_data = User.objects.all().values('id', 'name', 'email')

# Save as CSV
csv_path = generator.generate_csv(list(users_data))

# Return as download
response = generator.get_csv_response(list(users_data), 'users.csv')
return response
```

## 🛠️ Available Commands

### Using Make (Recommended)

```bash
# Development
make dev-up          # Start development
make dev-down        # Stop development
make dev-logs        # View logs

# Production
make up              # Start services
make down            # Stop services
make restart         # Restart services
make logs            # View logs

# Django
make shell           # Django shell
make migrate         # Run migrations
make makemigrations  # Create migrations
make createsuperuser # Create admin user
make collectstatic   # Collect static files

# Maintenance
make backup-db       # Backup database
make backup-reports  # Backup reports
make clean           # Clean containers
make update          # Update application
```

See `make help` for all available commands.

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@db:5432/dbname

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# SSL/Domain
VIRTUAL_HOST=yourdomain.com
LETSENCRYPT_HOST=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
```

## 📚 API Documentation

### Endpoints

- **Authentication**: `/api/auth/`
  - Login, Logout, Register
  - OAuth (Google, GitHub)
  - Token refresh/verify

- **Users**: `/api/users/`
  - User management
  - Profile updates
  - Role management

- **Payments**: `/api/payments/`
  - Payment processing
  - Transaction history
  - Invoice generation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/
- **OpenAPI JSON**: http://localhost:8000/swagger.json

## 🔒 Security

- ✅ HTTPS/SSL with Let's Encrypt
- ✅ JWT authentication
- ✅ CORS configuration
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ Non-root Docker containers
- ✅ Environment-based secrets
- ✅ SQL injection protection
- ✅ Rate limiting ready

## 🧪 Testing

```bash
# Run tests
make test

# Or with Docker Compose
docker-compose exec web python manage.py test
```

## 📈 Monitoring

```bash
# View logs
make logs

# Check status
make status

# Monitor resources
docker stats
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See [QUICKSTART.md](QUICKSTART.md) and [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Docs**: http://localhost:8000/swagger/
- **Issues**: GitHub Issues
- **Email**: support@apranova.dev

## 🙏 Acknowledgments

- Django REST Framework
- Docker & Docker Compose
- PostgreSQL
- Redis
- Nginx
- Let's Encrypt

---

**Built with ❤️ for Apra Nova Learning Management System**
