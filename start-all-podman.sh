#!/bin/bash
# ============================================
# ApraNova Complete Startup Script for Podman (Mac)
# ============================================
# This script builds and starts all services using Podman
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  ApraNova Complete Setup & Startup (Podman)${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Change to the ApraNova directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ============================================
# Step 0: Complete Cleanup (No Cache Issues!)
# ============================================
echo -e "${YELLOW}[0/9] Performing complete cleanup...${NC}"
echo -e "${NC}This ensures no cache issues on rebuild!${NC}"
echo ""

# Stop all containers using podman-compose
echo -e "  → Stopping all ApraNova containers...${NC}"
podman-compose -f docker-compose.complete.yml down 2>/dev/null || true

# Remove all workspace containers
echo -e "  → Removing all workspace containers...${NC}"
podman ps -a --filter "name=workspace_" --format "{{.Names}}" | xargs -r podman rm -f 2>/dev/null || true

# Remove all ApraNova images
echo -e "  → Removing all ApraNova images...${NC}"
podman rmi apranova-frontend:latest -f 2>/dev/null || true
podman rmi apranova-backend:latest -f 2>/dev/null || true
podman rmi apra-nova-code-server:latest -f 2>/dev/null || true

# Prune build cache
echo -e "  → Pruning Podman build cache...${NC}"
podman system prune -f 2>/dev/null || true

# Prune dangling images
echo -e "  → Pruning dangling images...${NC}"
podman image prune -f 2>/dev/null || true

echo -e "${GREEN}✅ Cleanup completed!${NC}"
echo ""

# ============================================
# Step 1: Build Code-Server Image
# ============================================
echo -e "${YELLOW}[1/9] Building Code-Server Image...${NC}"
echo -e "${NC}This may take 5-10 minutes on first run...${NC}"

podman build -t apra-nova-code-server:latest ./backend/apra-nova-code-server

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build code-server image!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Code-Server image built successfully!${NC}"
echo ""

# ============================================
# Step 2: Build Backend
# ============================================
echo -e "${YELLOW}[2/9] Building Backend...${NC}"
echo -e "${NC}Building with --no-cache to ensure fresh build...${NC}"

cd backend
podman build --no-cache --pull -t apranova-backend:latest .
BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -ne 0 ]; then
    echo -e "${RED}❌ Failed to build backend!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend built successfully!${NC}"
echo ""

# ============================================
# Step 3: Build Frontend
# ============================================
echo -e "${YELLOW}[3/9] Building Frontend...${NC}"
echo -e "${NC}Building with --no-cache to ensure fresh build...${NC}"

cd frontend
podman build --no-cache --pull -t apranova-frontend:latest .
BUILD_RESULT=$?
cd ..

if [ $BUILD_RESULT -ne 0 ]; then
    echo -e "${RED}❌ Failed to build frontend!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully!${NC}"
echo ""

# ============================================
# Step 4: Start all services
# ============================================
echo -e "${YELLOW}[4/9] Starting all services...${NC}"

podman-compose -f docker-compose.complete.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start services!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All services started!${NC}"
echo ""

# ============================================
# Step 5: Run Database Migrations
# ============================================
echo -e "${YELLOW}[5/9] Running database migrations...${NC}"

# Wait a bit for database to be ready
sleep 5

podman exec apranova_backend python manage.py migrate --noinput

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Migration failed, but continuing...${NC}"
fi

echo -e "${GREEN}✅ Migrations completed!${NC}"
echo ""

# ============================================
# Step 6: Create Demo Users
# ============================================
echo -e "${YELLOW}[6/9] Creating demo users...${NC}"

podman exec apranova_backend python manage.py create_demo_users

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Demo user creation failed, but continuing...${NC}"
fi

echo ""

# ============================================
# Step 7: Wait for services to be healthy
# ============================================
echo -e "${YELLOW}[7/9] Waiting for services to be healthy...${NC}"
echo -e "${NC}This may take 30-60 seconds...${NC}"

sleep 10

# Check backend health
MAX_ATTEMPTS=12
ATTEMPT=0
BACKEND_HEALTHY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ] && [ "$BACKEND_HEALTHY" = false ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo -e "  Checking backend health (attempt $ATTEMPT/$MAX_ATTEMPTS)...${NC}"
    
    if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
        BACKEND_HEALTHY=true
        echo -e "  ${GREEN}✅ Backend is healthy!${NC}"
    else
        sleep 5
    fi
done

if [ "$BACKEND_HEALTHY" = false ]; then
    echo -e "  ${YELLOW}⚠️  Backend health check timed out, but it may still be starting...${NC}"
fi

echo ""

# ============================================
# Step 8: Test Signup API
# ============================================
echo -e "${YELLOW}[8/9] Testing signup API...${NC}"

TEST_EMAIL="test_$(date +%s)@apranova.com"
TEST_PASSWORD="Test@12345"

SIGNUP_DATA=$(cat <<EOF
{
    "email": "$TEST_EMAIL",
    "password1": "$TEST_PASSWORD",
    "password2": "$TEST_PASSWORD",
    "first_name": "Test",
    "last_name": "User"
}
EOF
)

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "$SIGNUP_DATA" \
    http://localhost:8000/api/auth/registration/ 2>/dev/null || echo "000")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
    echo -e "  ${GREEN}✅ Signup API is working!${NC}"
    echo -e "  ${NC}Test account created: $TEST_EMAIL${NC}"
else
    echo -e "  ${YELLOW}⚠️  Signup API test failed (HTTP $HTTP_CODE), but continuing...${NC}"
fi

echo ""

# ============================================
# Step 9: Run All Tests
# ============================================
echo -e "${YELLOW}[9/10] Running all tests...${NC}"

echo -e "  ${CYAN}Running accounts app tests...${NC}"
podman exec apranova_backend python manage.py test accounts --verbosity=2

echo ""
echo -e "  ${CYAN}Running accounts advanced tests...${NC}"
podman exec apranova_backend python manage.py test accounts.test_advanced --verbosity=2

echo ""
echo -e "  ${CYAN}Running workspace tests...${NC}"
podman exec apranova_backend python manage.py test accounts.test_workspace --verbosity=2

echo ""
echo -e "  ${CYAN}Running payments app tests...${NC}"
podman exec apranova_backend python manage.py test payments --verbosity=2

echo ""
echo -e "  ${GREEN}✅ All tests completed!${NC}"

echo ""

# ============================================
# Step 10: Verify Workspace Configuration
# ============================================
echo -e "${YELLOW}[10/10] Verifying workspace configuration...${NC}"

WORKSPACE_VIEWS_PATH="backend/accounts/workspace_views.py"

if grep -q 'PASSWORD.*""' "$WORKSPACE_VIEWS_PATH" 2>/dev/null; then
    echo -e "  ${GREEN}✅ Workspace password is disabled (PASSWORD='')${NC}"
else
    echo -e "  ${YELLOW}⚠️  Warning: Workspace password configuration may not be correct${NC}"
fi

if grep -q '\-\-auth.*none' "$WORKSPACE_VIEWS_PATH" 2>/dev/null; then
    echo -e "  ${GREEN}✅ Workspace authentication is disabled (--auth none)${NC}"
else
    echo -e "  ${YELLOW}⚠️  Warning: Workspace auth configuration may not be correct${NC}"
fi

echo ""

# ============================================
# Display Service Status
# ============================================
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  Service Status${NC}"
echo -e "${CYAN}============================================${NC}"

podman-compose -f docker-compose.complete.yml ps

echo ""
echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  🌐 Access URLs${NC}"
echo -e "${CYAN}============================================${NC}"
echo -e "${GREEN}  Frontend:  http://localhost:3000${NC}"
echo -e "${GREEN}  Backend:   http://localhost:8000${NC}"
echo -e "${GREEN}  API Docs:  http://localhost:8000/swagger/${NC}"
echo -e "${GREEN}  Admin:     http://localhost:8000/admin${NC}"
echo -e "${GREEN}  Database:  localhost:5433${NC}"
echo -e "${GREEN}  Redis:     localhost:6380${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

echo -e "${YELLOW}============================================${NC}"
echo -e "${YELLOW}  👤 Demo User Credentials${NC}"
echo -e "${YELLOW}============================================${NC}"
echo -e "  Admin:    admin@apranova.com / Admin@123"
echo -e "  Student:  student@apranova.com / Student@123"
echo -e "  Teacher:  teacher@apranova.com / Teacher@123"
echo -e "${YELLOW}============================================${NC}"
echo ""

echo -e "${MAGENTA}============================================${NC}"
echo -e "${MAGENTA}  💻 Code-Server Workspace Access${NC}"
echo -e "${MAGENTA}============================================${NC}"
echo -e "  Students can launch their workspace from"
echo -e "${GREEN}  the dashboard without any password!${NC}"
echo ""
echo -e "${NC}  💡 Tip: Click 'Launch Workspace' button${NC}"
echo -e "${NC}          to access VS Code in the browser${NC}"
echo -e "${MAGENTA}============================================${NC}"
echo ""

echo -e "${GREEN}ApraNova is ready!${NC}"
echo ""
echo -e "${CYAN}Quick Start:${NC}"
echo -e "${NC}  1. Open http://localhost:3000${NC}"
echo -e "${NC}  2. Login with student@apranova.com / Student@123${NC}"
echo -e "${NC}  3. Go to Workspace and click Launch Workspace${NC}"
echo -e "${NC}  4. VS Code will open directly - no password needed!${NC}"
echo ""
echo -e "${NC}To view logs: podman-compose -f docker-compose.complete.yml logs -f${NC}"
echo -e "${NC}To stop: podman-compose -f docker-compose.complete.yml down${NC}"
echo ""

