#!/bin/bash
# Health check script for Apra Nova Backend

set -e

echo "=================================="
echo "Apra Nova Backend Health Check"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local service_name=$1
    local check_command=$2
    
    echo -n "Checking $service_name... "
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Check Docker
check_service "Docker" "docker --version"

# Check Docker Compose
check_service "Docker Compose" "docker-compose --version"

echo ""
echo "Checking running containers..."
echo ""

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Containers are running${NC}"
    docker-compose ps
else
    echo -e "${RED}✗ No containers running${NC}"
    echo "Run 'make up' or 'docker-compose up -d' to start services"
    exit 1
fi

echo ""
echo "Checking service health..."
echo ""

# Check web service
if docker-compose exec -T web python -c "import django; print('OK')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Django is accessible${NC}"
else
    echo -e "${RED}✗ Django is not accessible${NC}"
fi

# Check database
if docker-compose exec -T db pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not ready${NC}"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is responding${NC}"
else
    echo -e "${RED}✗ Redis is not responding${NC}"
fi

echo ""
echo "Checking APROVOVA directory..."
echo ""

# Check APROVOVA directory structure
if [ -d "APROVOVA" ]; then
    echo -e "${GREEN}✓ APROVOVA directory exists${NC}"
    
    # Check subdirectories
    for dir in user_reports payment_reports batch_reports analytics_reports; do
        if [ -d "APROVOVA/$dir" ]; then
            echo -e "  ${GREEN}✓${NC} $dir/"
        else
            echo -e "  ${YELLOW}⚠${NC} $dir/ missing (run: python scripts/init_aprovova.py)"
        fi
    done
else
    echo -e "${RED}✗ APROVOVA directory not found${NC}"
    echo "  Run: python scripts/init_aprovova.py"
fi

echo ""
echo "Checking environment configuration..."
echo ""

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Check critical variables
    if grep -q "SECRET_KEY=" .env && ! grep -q "SECRET_KEY=your-secret-key" .env; then
        echo -e "  ${GREEN}✓${NC} SECRET_KEY is configured"
    else
        echo -e "  ${YELLOW}⚠${NC} SECRET_KEY needs to be set"
    fi
    
    if grep -q "DEBUG=False" .env; then
        echo -e "  ${GREEN}✓${NC} DEBUG is set to False (production)"
    else
        echo -e "  ${YELLOW}⚠${NC} DEBUG is not False (development mode)"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo "  Run: cp .env.example .env"
fi

echo ""
echo "Checking API endpoints..."
echo ""

# Check if web service is accessible
if docker-compose ps web | grep -q "Up"; then
    # Try to access health endpoint
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Health endpoint is accessible${NC}"
    else
        echo -e "${YELLOW}⚠${NC} Health endpoint not accessible (service may still be starting)"
    fi
    
    # Try to access API root
    if curl -f http://localhost:8000/ > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API root is accessible${NC}"
    else
        echo -e "${YELLOW}⚠${NC} API root not accessible (service may still be starting)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Web service is not running"
fi

echo ""
echo "=================================="
echo "Health Check Complete"
echo "=================================="
echo ""
echo "Access points:"
echo "  - API Root:     http://localhost:8000/"
echo "  - Admin Panel:  http://localhost:8000/admin/"
echo "  - Swagger:      http://localhost:8000/swagger/"
echo "  - Health Check: http://localhost:8000/health"
echo ""

