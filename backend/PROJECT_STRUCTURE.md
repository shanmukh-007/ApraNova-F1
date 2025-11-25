# 🏗️ ApraNova Project Structure

## Overview

The ApraNova project consists of both backend and frontend applications organized under a single root directory.

## 📁 Recommended Directory Structure

```
ApraNova/                           # Root project directory
├── backend/                        # Django Backend (this repository)
│   ├── APROVOVA/                  # Centralized reports directory
│   │   ├── user_reports/
│   │   ├── payment_reports/
│   │   ├── batch_reports/
│   │   └── analytics_reports/
│   ├── core/                      # Django core settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── report_utils.py
│   ├── accounts/                  # User management app
│   ├── payments/                  # Payment processing app
│   ├── nginx/                     # Nginx configuration
│   ├── scripts/                   # Utility scripts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   ├── manage.py
│   └── README.md
│
├── frontend/                       # Frontend Application (React/Vue/Angular)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml             # Root docker-compose (orchestrates both)
├── .env                           # Environment variables for both apps
├── .gitignore                     # Git ignore for entire project
├── README.md                      # Main project documentation
└── Makefile                       # Commands for entire project

```

## 🔄 Migration Steps

### Step 1: Create Root Directory Structure

```bash
# Navigate to parent directory
cd c:\Users\Admin\Desktop\frontend

# Create root ApraNova directory
mkdir ApraNova

# Move backend into ApraNova
move apra-nova-backend-main ApraNova\backend

# Create frontend directory (if not exists)
mkdir ApraNova\frontend
```

### Step 2: Update Backend Configuration

The backend is already configured and ready. No changes needed to backend code.

### Step 3: Create Root docker-compose.yml

Create `ApraNova/docker-compose.yml` to orchestrate both backend and frontend:

```yaml
version: '3.8'

services:
  # Backend services
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: apranova_backend
    volumes:
      - ./backend:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
      - aprovova_reports:/app/APROVOVA
    env_file:
      - .env
    depends_on:
      - db
      - redis
    networks:
      - apranova_network

  # Frontend service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: apranova_frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    env_file:
      - .env
    depends_on:
      - backend
    networks:
      - apranova_network

  # Database
  db:
    image: postgres:14-alpine
    container_name: apranova_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    env_file:
      - .env
    networks:
      - apranova_network

  # Redis
  redis:
    image: redis:7-alpine
    container_name: apranova_redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - apranova_network

  # Nginx (serves both frontend and backend)
  nginx:
    image: nginx:alpine
    container_name: apranova_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - static_volume:/app/staticfiles
      - media_volume:/app/media
      - ./frontend/build:/usr/share/nginx/html
    depends_on:
      - backend
      - frontend
    networks:
      - apranova_network

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
  aprovova_reports:

networks:
  apranova_network:
    driver: bridge
```

### Step 4: Create Root .env File

Create `ApraNova/.env`:

```env
# Project
PROJECT_NAME=ApraNova
COMPOSE_PROJECT_NAME=apranova

# Backend
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Database
POSTGRES_DB=apranova_db
POSTGRES_USER=apranova_user
POSTGRES_PASSWORD=secure_password_here
DATABASE_URL=postgresql://apranova_user:secure_password_here@db:5432/apranova_db

# Redis
REDIS_PASSWORD=redis_password_here
REDIS_URL=redis://:redis_password_here@redis:6379/0

# Frontend
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_BACKEND_URL=http://localhost:8000

# Domain (for production)
VIRTUAL_HOST=yourdomain.com
LETSENCRYPT_HOST=yourdomain.com
LETSENCRYPT_EMAIL=admin@yourdomain.com
```

### Step 5: Create Root Makefile

Create `ApraNova/Makefile`:

```makefile
.PHONY: help build up down restart logs clean

help:
	@echo "ApraNova Project Commands"
	@echo "========================="
	@echo "make build          - Build all containers"
	@echo "make up             - Start all services"
	@echo "make down           - Stop all services"
	@echo "make restart        - Restart all services"
	@echo "make logs           - View all logs"
	@echo "make logs-backend   - View backend logs"
	@echo "make logs-frontend  - View frontend logs"
	@echo "make clean          - Clean all containers and volumes"
	@echo "make migrate        - Run backend migrations"
	@echo "make shell          - Open backend Django shell"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

clean:
	docker-compose down -v
	docker system prune -f

migrate:
	docker-compose exec backend python manage.py migrate

shell:
	docker-compose exec backend python manage.py shell

collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput
```

### Step 6: Create Root README.md

Create `ApraNova/README.md`:

```markdown
# 🚀 ApraNova - Learning Management System

Full-stack Learning Management System with Django backend and modern frontend.

## 📁 Project Structure

- **backend/** - Django REST API
- **frontend/** - Frontend application
- **nginx/** - Nginx configuration

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Setup

1. Clone the repository
2. Navigate to project root
3. Copy environment file:
   ```bash
   cp .env.example .env
   ```
4. Start all services:
   ```bash
   make up
   ```
5. Run migrations:
   ```bash
   make migrate
   ```

### Access

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Admin Panel**: http://localhost/admin
- **API Docs**: http://localhost/api/swagger

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Deployment Guide](./backend/DEPLOYMENT.md)

## 🛠️ Development

See individual README files in backend/ and frontend/ directories.
```

## 📝 Commands After Migration

```bash
# Navigate to ApraNova root
cd ApraNova

# Start entire project
make up

# View logs
make logs

# Stop everything
make down
```

## 🔧 Backend-Specific Commands

```bash
# Navigate to backend
cd ApraNova/backend

# Use backend-specific commands
make dev-up
make migrate
make createsuperuser
```

## 🎨 Frontend-Specific Commands

```bash
# Navigate to frontend
cd ApraNova/frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🌐 Production Deployment

For production, use the root `docker-compose.yml` which orchestrates both backend and frontend with proper networking and volumes.

## 📊 APROVOVA Reports

All reports are stored in `backend/APROVOVA/` directory and are accessible to both backend and frontend through the API.

## 🔒 Security

- Keep `.env` file secure and never commit it
- Use strong passwords for database and Redis
- Configure SSL/HTTPS for production
- Update `ALLOWED_HOSTS` and CORS settings

## 🆘 Support

- Backend Issues: See `backend/README.md`
- Frontend Issues: See `frontend/README.md`
- General Issues: Create GitHub issue

---

**Built with ❤️ for ApraNova Learning Management System**
```

## ✅ Final Structure

After migration, your structure will be:

```
c:\Users\Admin\Desktop\frontend\
└── ApraNova/                      # Root directory
    ├── backend/                   # Current apra-nova-backend-main
    ├── frontend/                  # Your frontend app
    ├── docker-compose.yml         # Orchestrates both
    ├── .env                       # Shared environment
    ├── Makefile                   # Root commands
    └── README.md                  # Main documentation
```

## 🎯 Benefits

1. **Organized Structure** - Clear separation of concerns
2. **Unified Deployment** - Single docker-compose for everything
3. **Shared Configuration** - One .env file for both apps
4. **Easy Development** - Simple commands to run entire stack
5. **Production Ready** - Proper orchestration and networking

## 📌 Next Steps

1. Create the ApraNova root directory
2. Move backend into `ApraNova/backend`
3. Move/create frontend in `ApraNova/frontend`
4. Create root configuration files
5. Test with `make up`

