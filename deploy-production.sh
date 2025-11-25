#!/bin/bash
# ============================================
# ApraNova Production Deployment Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}=========================================="
    echo -e "$1"
    echo -e "==========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for better security."
fi

print_header "ApraNova Production Deployment"

# Step 1: Check prerequisites
print_info "Step 1: Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi
print_success "Docker is installed"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
print_success "Docker Compose is installed"

# Step 2: Check environment file
print_info "Step 2: Checking environment configuration..."

if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    print_info "Please create .env.production from .env.production template"
    exit 1
fi
print_success ".env.production file found"

# Check for placeholder values
if grep -q "CHANGE_THIS" .env.production; then
    print_warning "Found placeholder values in .env.production"
    print_warning "Please update all CHANGE_THIS values before deploying"
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        exit 0
    fi
fi

# Step 3: Create necessary directories
print_info "Step 3: Creating necessary directories..."

mkdir -p backups
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx/conf.d

print_success "Directories created"

# Step 4: Pull latest code (optional)
print_info "Step 4: Pull latest code from repository..."
read -p "Pull latest code from git? (yes/no): " PULL_CODE

if [ "$PULL_CODE" == "yes" ]; then
    git pull origin main
    print_success "Code updated"
else
    print_info "Skipping git pull"
fi

# Step 5: Stop existing containers
print_info "Step 5: Stopping existing containers..."

docker-compose -f docker-compose.production.yml down || true
print_success "Existing containers stopped"

# Step 6: Build images
print_info "Step 6: Building Docker images..."

docker-compose -f docker-compose.production.yml build --no-cache
print_success "Images built successfully"

# Step 7: Start services
print_info "Step 7: Starting services..."

docker-compose -f docker-compose.production.yml up -d
print_success "Services started"

# Step 8: Wait for services to be healthy
print_info "Step 8: Waiting for services to be healthy..."

sleep 10

# Check backend health
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec apranova_backend curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Backend health check failed"
    print_info "Check logs: docker-compose -f docker-compose.production.yml logs backend"
    exit 1
fi

# Step 9: Run migrations
print_info "Step 9: Running database migrations..."

docker exec apranova_backend python manage.py migrate --noinput
print_success "Migrations completed"

# Step 10: Collect static files
print_info "Step 10: Collecting static files..."

docker exec apranova_backend python manage.py collectstatic --noinput --clear
print_success "Static files collected"

# Step 11: Create superuser (if needed)
print_info "Step 11: Creating superuser..."

docker exec apranova_backend python manage.py shell << END
from accounts.models import CustomUser
import os

email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@apranova.com')
username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')

if not CustomUser.objects.filter(email=email).exists():
    CustomUser.objects.create_superuser(
        email=email,
        username=username,
        password=password,
        role='superadmin'
    )
    print('Superuser created')
else:
    print('Superuser already exists')
END

print_success "Superuser check completed"

# Step 12: Run tests
print_info "Step 12: Running tests..."
read -p "Run tests before going live? (yes/no): " RUN_TESTS

if [ "$RUN_TESTS" == "yes" ]; then
    docker exec apranova_backend python manage.py test accounts payments curriculum --verbosity=2
    print_success "All tests passed"
else
    print_warning "Skipping tests"
fi

# Step 13: Setup SSL (Let's Encrypt)
print_info "Step 13: SSL Certificate Setup..."
read -p "Setup SSL certificates with Let's Encrypt? (yes/no): " SETUP_SSL

if [ "$SETUP_SSL" == "yes" ]; then
    read -p "Enter your domain name: " DOMAIN
    read -p "Enter your email: " EMAIL
    
    docker-compose -f docker-compose.production.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN -d www.$DOMAIN
    
    print_success "SSL certificates obtained"
    
    # Reload nginx
    docker-compose -f docker-compose.production.yml exec nginx nginx -s reload
    print_success "Nginx reloaded"
else
    print_warning "Skipping SSL setup"
fi

# Step 14: Display status
print_header "Deployment Complete!"

echo ""
print_success "All services are running!"
echo ""
print_info "Service Status:"
docker-compose -f docker-compose.production.yml ps
echo ""

print_info "Access URLs:"
echo "  Frontend: https://yourdomain.com"
echo "  Backend API: https://api.yourdomain.com"
echo "  Django Admin: https://yourdomain.com/admin"
echo ""

print_info "Useful Commands:"
echo "  View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  Stop services: docker-compose -f docker-compose.production.yml down"
echo "  Restart services: docker-compose -f docker-compose.production.yml restart"
echo "  Backup database: docker exec apranova_db_backup /backup.sh"
echo ""

print_warning "Important:"
echo "  1. Update DNS records to point to this server"
echo "  2. Configure firewall to allow ports 80 and 443"
echo "  3. Setup monitoring and alerting"
echo "  4. Schedule regular backups"
echo "  5. Review security settings"
echo ""

print_success "Deployment completed successfully! 🎉"

