# ApraNova - Learning Management System

A comprehensive Learning Management System (LMS) built with Django REST Framework backend and Next.js frontend, featuring Docker-based workspace provisioning for students.

## 🚀 Features

- **User Management**: Multi-role authentication (Student, Trainer, Admin)
- **Workspace Provisioning**: 
  - Docker-based VS Code environments for Full Stack Development students
  - Apache Superset analytics platform for Data Professional students
- **Course Management**: Track-based learning (Data Professional, Full Stack Development)
- **Email Verification**: Secure account creation with email verification
- **JWT Authentication**: Token-based authentication with refresh tokens
- **Responsive UI**: Modern, mobile-friendly interface built with Next.js and Tailwind CSS
- **Docker-in-Docker**: Isolated development environments for students
- **Apache Superset Integration**: Professional data analytics and visualization for DP track

## 📋 Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **Ports Available**: 3000 (Frontend), 8000 (Backend), 5433 (PostgreSQL), 6380 (Redis)

### Windows Requirements
- Windows 10/11 with WSL2 enabled
- Docker Desktop for Windows
- PowerShell 5.1 or higher

### Linux Requirements
- Docker Engine installed
- Docker Compose plugin installed
- User added to docker group: `sudo usermod -aG docker $USER`

## 🛠️ Quick Start

> **💡 Alternative:** Want to deploy without Git? See [Docker Distribution Package](#-docker-distribution-package) for a portable, one-command installation!

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ApraNova
```

### 2. Environment Setup

The `.env` file is already configured with default values. Review and modify if needed:

```bash
# Windows
notepad .env

# Linux
nano .env
```

Key environment variables:
- `POSTGRES_USER`: Database username (default: apranova_user)
- `POSTGRES_PASSWORD`: Database password (default: apranova_pass)
- `POSTGRES_DB`: Database name (default: apranova_db)
- `REDIS_PASSWORD`: Redis password (default: redis_pass)
- `DEBUG`: Debug mode (default: True)

### 3. Start All Services

#### Windows (PowerShell)

```powershell
# Option 1: Using the startup script (Recommended)
.\start-all.ps1

# Option 2: Manual startup
docker-compose -f docker-compose.complete.yml up -d --build
```

#### Linux/Mac (Bash)

```bash
# Option 1: Using the startup script (Recommended)
chmod +x start-all.sh
./start-all.sh

# Option 2: Manual startup
docker-compose -f docker-compose.complete.yml up -d --build
```

### 4. Wait for Services to Start

The startup script will automatically wait for all services to be healthy. If starting manually, wait 30-60 seconds for all containers to initialize.

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/swagger

## 📦 Project Structure

```
ApraNova/
├── backend/                    # Django REST Framework backend
│   ├── accounts/              # User authentication & workspace management
│   ├── core/                  # Django settings and configuration
│   ├── payments/              # Payment processing
│   ├── apra-nova-code-server/ # Code-server Docker image
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
├── frontend/                   # Next.js frontend
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── lib/                   # Utility functions
│   ├── services/              # API service layer
│   └── package.json           # Node.js dependencies
├── docker-compose.complete.yml # Main Docker Compose file
├── .env                       # Environment variables
├── start-all.ps1              # Windows startup script
└── start-all.sh               # Linux/Mac startup script
```

## 🐳 Docker Commands

### Service Management

#### Start Services
```bash
# Windows
docker-compose -f docker-compose.complete.yml up -d

# Linux/Mac
docker-compose -f docker-compose.complete.yml up -d
```

#### Stop Services
```bash
# Windows & Linux
docker-compose -f docker-compose.complete.yml down
```

#### Restart Services
```bash
# Restart all services
docker-compose -f docker-compose.complete.yml restart

# Restart specific service
docker-compose -f docker-compose.complete.yml restart backend
docker-compose -f docker-compose.complete.yml restart frontend
```

#### View Service Status
```bash
docker-compose -f docker-compose.complete.yml ps
```

### Logs and Debugging

#### View All Logs
```bash
docker-compose -f docker-compose.complete.yml logs -f
```

#### View Specific Service Logs
```bash
# Backend logs
docker-compose -f docker-compose.complete.yml logs -f backend

# Frontend logs
docker-compose -f docker-compose.complete.yml logs -f frontend

# Database logs
docker-compose -f docker-compose.complete.yml logs -f db

# Redis logs
docker-compose -f docker-compose.complete.yml logs -f redis
```

#### View Last N Lines
```bash
# Windows PowerShell
docker logs apranova_backend --tail=50

# Linux/Mac
docker logs apranova_backend --tail 50
```

### Database Management

#### Run Migrations
```bash
docker exec apranova_backend python manage.py migrate
```

#### Create Migrations
```bash
docker exec apranova_backend python manage.py makemigrations
```

#### Create Superuser
```bash
docker exec -it apranova_backend python manage.py createsuperuser
```

#### Access Database Shell
```bash
docker exec -it apranova_db psql -U apranova_user -d apranova_db
```

#### Backup Database
```bash
# Windows PowerShell
docker exec apranova_db pg_dump -U apranova_user apranova_db > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Linux/Mac
docker exec apranova_db pg_dump -U apranova_user apranova_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Django Management

#### Open Django Shell
```bash
docker exec -it apranova_backend python manage.py shell
```

#### Collect Static Files
```bash
docker exec apranova_backend python manage.py collectstatic --noinput
```

#### Run Tests
```bash
docker exec apranova_backend python manage.py test
```

### Frontend Management

#### Access Frontend Shell
```bash
docker exec -it apranova_frontend /bin/sh
```

#### Install Dependencies
```bash
docker exec apranova_frontend npm install
```

#### Rebuild Frontend
```bash
docker-compose -f docker-compose.complete.yml up -d --build frontend
```

## 🔧 Workspace Provisioning

The workspace feature provides isolated Docker-based VS Code environments for students.

### Build Code-Server Image

```bash
# Navigate to code-server directory
cd backend/apra-nova-code-server

# Build the image
docker build -t apra-nova-code-server:latest .

# Return to root
cd ../..
```

### Verify Workspace Setup

```bash
# Check if backend can access Docker
docker exec apranova_backend docker ps

# View workspace containers
docker ps --filter "name=workspace_"
```

### Workspace Access

#### Code-Server - No Password Required! 🎉

Students can now launch their workspace **without any password**!

**How it works:**
1. Student logs in to ApraNova
2. Navigates to Workspace section
3. Clicks "Launch Workspace" button
4. VS Code opens directly in the browser - no password prompt!

**Benefits:**
- ✅ Faster access - no password to remember
- ✅ Better user experience - instant coding
- ✅ Still secure - authentication through ApraNova login
- ✅ Isolated workspaces - each student has their own environment

**For Administrators:**
```bash
# Check workspace status
docker ps --filter "name=workspace_"

# View workspace logs
docker logs workspace_<user_id>

# Access Django shell to check user info
docker exec -it apranova_backend python manage.py shell
```

### Workspace Management

#### List All Workspaces
```bash
docker ps -a --filter "name=workspace_"
```

#### Stop a Workspace
```bash
docker stop workspace_<user_id>
```

#### Remove a Workspace
```bash
docker rm -f workspace_<user_id>
```

#### View Workspace Logs
```bash
docker logs workspace_<user_id>
```

#### Access a Specific Workspace
```bash
# Get workspace URL (no password needed!)
# User ID: 1
# URL: http://localhost:<dynamic_port>

# Find the port for a specific workspace
docker port workspace_1 8080
```

## 🧪 Testing

### Test Signup Flow

#### Windows
```powershell
.\test_signup.ps1
```

#### Linux/Mac
```bash
chmod +x test_signup.sh
./test_signup.sh
```

### Manual Testing

1. **Signup**: http://localhost:3000/signup
   - Create a student account
   - Verify email (check backend logs for verification link)

2. **Login**: http://localhost:3000/login
   - Login with created credentials

3. **Workspace**: http://localhost:3000/student/workspace
   - Click "Launch Workspace"
   - Wait for provisioning
   - VS Code should open in new tab

## 🔍 Troubleshooting

### Services Not Starting

```bash
# Check service status
docker-compose -f docker-compose.complete.yml ps

# Check logs for errors
docker-compose -f docker-compose.complete.yml logs

# Restart services
docker-compose -f docker-compose.complete.yml restart
```

### Database Connection Issues

```bash
# Check database is running
docker ps --filter "name=apranova_db"

# Check database logs
docker logs apranova_db

# Restart database
docker-compose -f docker-compose.complete.yml restart db
```

### Frontend Build Errors

```bash
# Rebuild frontend
docker-compose -f docker-compose.complete.yml up -d --build frontend

# Check frontend logs
docker logs apranova_frontend -f
```

### Workspace Provisioning Fails

```bash
# Verify code-server image exists
docker images | grep apra-nova-code-server

# Check backend can access Docker
docker exec apranova_backend docker ps

# Check backend logs
docker logs apranova_backend --tail=50
```

### Port Already in Use

```bash
# Windows - Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Linux/Mac - Find process using port
lsof -i :3000
lsof -i :8000

# Kill the process or change ports in docker-compose.complete.yml
```

## 📦 Docker Distribution Package

### Create a Portable Distribution Package

You can create a complete, portable Docker package to deploy ApraNova on **any other machine** without needing Git or building images!

#### What is the Distribution Package?

A self-contained package (~1.3 GB) that includes:
- ✅ All Docker images (frontend, backend, code-server, database, cache)
- ✅ Configuration files
- ✅ One-command installer scripts for Windows/Linux/Mac
- ✅ Complete documentation

#### Creating the Distribution Package

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File .\export-docker-images.ps1
```

**Linux/Mac:**
```bash
chmod +x export-docker-images.sh
./export-docker-images.sh
```

This will create a folder `apranova-docker-export/` containing:
- `code-server.tar` (968 MB) - VS Code in browser
- `backend.tar` (125 MB) - Django backend
- `frontend.tar` (88 MB) - Next.js frontend
- `postgres.tar` (104 MB) - PostgreSQL database
- `redis.tar` (16 MB) - Redis cache
- `docker-compose.yml` - Service configuration
- `.env.example` - Environment template
- `import-and-run.ps1` - Windows installer
- `import-and-run.sh` - Linux/Mac installer
- `README.md` - User guide

**Total Size:** ~1.27 GB

#### Using the Distribution Package on Another Machine

1. **Transfer the Package**
   - Copy the entire `apranova-docker-export/` folder to the target machine
   - Use USB drive, network share, or cloud storage

2. **Install on Target Machine**

   **Windows:**
   ```powershell
   cd apranova-docker-export
   powershell -ExecutionPolicy Bypass -File .\import-and-run.ps1
   ```

   **Linux/Mac:**
   ```bash
   cd apranova-docker-export
   chmod +x import-and-run.sh
   ./import-and-run.sh
   ```

3. **Access the Platform**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Admin: http://localhost:8000/admin

#### What the Import Script Does

The import script automatically:
1. ✅ Checks if Docker is running
2. ✅ Imports all Docker images from .tar files
3. ✅ Creates .env configuration
4. ✅ Starts all services with docker-compose
5. ✅ Verifies services are healthy
6. ✅ Shows access URLs

**No manual configuration needed!**

#### Benefits

**For Deployment:**
- ✅ No Git repository needed
- ✅ No image building required (pre-built)
- ✅ Offline installation (no internet after transfer)
- ✅ Consistent deployment across machines
- ✅ One-command installation

**For Users:**
- ✅ Simple installation process
- ✅ No technical knowledge required
- ✅ Works on Windows, Linux, and Mac
- ✅ Complete platform in one package

#### System Requirements for Target Machine

**Minimum:**
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- 8 GB RAM
- 20 GB free disk space
- Ports available: 3000, 8000, 5433, 6380

**Recommended:**
- 16 GB RAM
- 50 GB SSD
- 4+ CPU cores

#### Use Cases

1. **Classroom Deployment** - Install on all classroom computers from USB
2. **Demo/Presentation** - Run on laptop without internet
3. **Development Team** - Share identical environment with team
4. **Production Deployment** - Deploy to servers without build process

For complete documentation, see `DISTRIBUTION_GUIDE.md`.

## 🧹 Cleanup

### Stop and Remove Containers

```bash
docker-compose -f docker-compose.complete.yml down
```

### Remove Containers and Volumes

```bash
docker-compose -f docker-compose.complete.yml down -v
```

### Complete Cleanup (Including Images)

```bash
# Stop and remove everything
docker-compose -f docker-compose.complete.yml down -v --rmi all

# Remove workspace containers
docker rm -f $(docker ps -a --filter "name=workspace_" -q)

# Clean Docker system
docker system prune -af
```

## 📚 Complete Documentation

### 📖 Online Documentation (GitHub Pages)

Visit our comprehensive documentation site: **[ApraNova Documentation](https://your-org.github.io/apranova/)**

The documentation includes:
- **System Architecture** - Complete system design and component interactions
- **Authentication Flow** - User authentication and authorization diagrams
- **Workspace Provisioning** - Docker-based workspace creation flow
- **API Documentation** - Complete REST API reference
- **Database Schema** - Database design and relationships
- **Payment Processing** - Stripe integration flow

### 📄 Additional Documentation Files

- `docs/` - Complete documentation source (GitHub Pages)
- `WORKSPACE_SETUP.md` - Detailed workspace provisioning guide
- `EMAIL_VERIFICATION_SETUP.md` - Email verification configuration
- `QUICK_REFERENCE.md` - Quick command reference guide
- `SUPERSET_INTEGRATION_GUIDE.md` - **Apache Superset integration for Data Professional track**
- `SUPERSET_SETUP.md` - Superset configuration and usage guide
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation

## 🚀 Workspace Integration - Both Tracks

Students get different workspace environments based on their track:

### 📊 Data Professional Track → Apache Superset

**Access**: http://localhost:8088 | **Login**: admin/admin

```bash
# Start Superset
.\start-superset.ps1  # Windows
./start-superset.sh   # Mac/Linux
```

**Features**:
- Interactive Dashboards
- SQL Lab Editor
- 40+ Chart Types
- Database Connections
- Pre-loaded Examples

### 💻 Full Stack Development Track → VS Code IDE

**Access**: http://localhost:8080 | **Password**: password123

```bash
# Start VS Code
.\start-code-server.ps1  # Windows
./start-code-server.sh   # Mac/Linux
```

**Features**:
- Full VS Code IDE
- Extensions Support
- Built-in Terminal
- Git Integration
- File Management

### Quick Start Both

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Documentation

- `WORKSPACE_COMPLETE_INTEGRATION.md` - Complete integration guide
- `SUPERSET_INTEGRATION_GUIDE.md` - Superset setup
- `CODE_SERVER_SETUP.md` - VS Code setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation in the repository
- Review Docker logs for error messages

## 🔐 Security Notes

- Change default passwords in `.env` before production deployment
- Never commit `.env` file to version control
- Use strong passwords for database and Redis
- Enable HTTPS in production
- Review and update ALLOWED_HOSTS and CORS settings for production

---

**Built with ❤️ using Django, Next.js, and Docker**

