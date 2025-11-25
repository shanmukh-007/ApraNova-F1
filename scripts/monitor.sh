#!/bin/bash
# ============================================
# ApraNova Production Monitoring Script
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

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

check_service() {
    local service=$1
    local container=$2
    
    if docker ps | grep -q "$container"; then
        print_success "$service is running"
        return 0
    else
        print_error "$service is not running"
        return 1
    fi
}

check_health() {
    local service=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        print_success "$service health check passed"
        return 0
    else
        print_error "$service health check failed"
        return 1
    fi
}

get_container_stats() {
    local container=$1
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | grep "$container"
}

print_header "ApraNova Production Monitoring"
echo "Timestamp: $(date)"
echo ""

# Check Docker
print_info "Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    print_error "Docker is not running!"
    exit 1
fi
print_success "Docker is running"
echo ""

# Check Services
print_info "Checking Services..."
check_service "Backend" "apranova_backend"
check_service "Frontend" "apranova_frontend"
check_service "Database" "apranova_db"
check_service "Redis" "apranova_redis"
check_service "Nginx" "apranova_nginx"
echo ""

# Health Checks
print_info "Running Health Checks..."
check_health "Backend" "${BACKEND_URL}/health"
check_health "Frontend" "${FRONTEND_URL}/api/health"
echo ""

# Container Stats
print_info "Container Resource Usage:"
echo ""
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | grep apranova
echo ""

# Disk Usage
print_info "Disk Usage:"
df -h | grep -E "Filesystem|/dev/"
echo ""

# Docker Disk Usage
print_info "Docker Disk Usage:"
docker system df
echo ""

# Database Status
print_info "Database Status:"
docker exec apranova_db psql -U ${POSTGRES_USER:-apranova_prod_user} -d ${POSTGRES_DB:-apranova_production} -c "SELECT version();" 2>/dev/null || print_error "Cannot connect to database"
echo ""

# Redis Status
print_info "Redis Status:"
docker exec apranova_redis redis-cli -a ${REDIS_PASSWORD} INFO server 2>/dev/null | grep redis_version || print_error "Cannot connect to Redis"
echo ""

# Recent Logs (last 10 lines)
print_info "Recent Backend Logs:"
docker logs apranova_backend --tail 10 2>&1 | tail -10
echo ""

print_info "Recent Frontend Logs:"
docker logs apranova_frontend --tail 10 2>&1 | tail -10
echo ""

# Check for errors in logs
print_info "Checking for errors in logs..."
BACKEND_ERRORS=$(docker logs apranova_backend --since 1h 2>&1 | grep -i error | wc -l)
FRONTEND_ERRORS=$(docker logs apranova_frontend --since 1h 2>&1 | grep -i error | wc -l)

if [ $BACKEND_ERRORS -gt 0 ]; then
    print_warning "Found $BACKEND_ERRORS errors in backend logs (last hour)"
else
    print_success "No errors in backend logs (last hour)"
fi

if [ $FRONTEND_ERRORS -gt 0 ]; then
    print_warning "Found $FRONTEND_ERRORS errors in frontend logs (last hour)"
else
    print_success "No errors in frontend logs (last hour)"
fi
echo ""

# Backup Status
print_info "Backup Status:"
if [ -d "backups" ]; then
    BACKUP_COUNT=$(ls -1 backups/*.sql.gz 2>/dev/null | wc -l)
    if [ $BACKUP_COUNT -gt 0 ]; then
        LATEST_BACKUP=$(ls -t backups/*.sql.gz 2>/dev/null | head -1)
        BACKUP_AGE=$(stat -c %Y "$LATEST_BACKUP" 2>/dev/null || stat -f %m "$LATEST_BACKUP" 2>/dev/null)
        CURRENT_TIME=$(date +%s)
        AGE_HOURS=$(( ($CURRENT_TIME - $BACKUP_AGE) / 3600 ))
        
        print_success "Found $BACKUP_COUNT backups"
        print_info "Latest backup: $(basename $LATEST_BACKUP) (${AGE_HOURS}h ago)"
        
        if [ $AGE_HOURS -gt 48 ]; then
            print_warning "Latest backup is more than 48 hours old!"
        fi
    else
        print_warning "No backups found!"
    fi
else
    print_warning "Backup directory not found!"
fi
echo ""

# SSL Certificate Status
print_info "SSL Certificate Status:"
if [ -d "certbot/conf/live" ]; then
    CERT_DIRS=$(ls -1 certbot/conf/live 2>/dev/null | wc -l)
    if [ $CERT_DIRS -gt 0 ]; then
        print_success "SSL certificates found"
        for domain in certbot/conf/live/*; do
            if [ -f "$domain/cert.pem" ]; then
                EXPIRY=$(openssl x509 -enddate -noout -in "$domain/cert.pem" 2>/dev/null | cut -d= -f2)
                print_info "$(basename $domain): Expires $EXPIRY"
            fi
        done
    else
        print_warning "No SSL certificates found!"
    fi
else
    print_warning "SSL certificate directory not found!"
fi
echo ""

# Summary
print_header "Monitoring Summary"

ALL_HEALTHY=true

# Check if all services are running
for container in apranova_backend apranova_frontend apranova_db apranova_redis apranova_nginx; do
    if ! docker ps | grep -q "$container"; then
        ALL_HEALTHY=false
        break
    fi
done

if $ALL_HEALTHY; then
    print_success "All services are healthy! 🎉"
else
    print_error "Some services are not healthy! Please investigate."
fi

echo ""
print_info "For detailed logs, run:"
echo "  docker-compose -f $COMPOSE_FILE logs -f"
echo ""

