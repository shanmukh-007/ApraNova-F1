#!/bin/bash

# ============================================
# ApraNova Mac Setup Verification Script
# ============================================
# This script verifies your Mac is ready to run ApraNova
# ============================================

echo "============================================"
echo "  🍎 ApraNova Mac Setup Verification"
echo "============================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_CHECKS_PASSED=true

# ============================================
# Check 1: macOS Version
# ============================================
echo "[1/10] Checking macOS version..."
MACOS_VERSION=$(sw_vers -productVersion)
echo "  macOS version: $MACOS_VERSION"

if [[ "$MACOS_VERSION" > "10.15" ]]; then
    echo -e "  ${GREEN}✅ macOS version is compatible${NC}"
else
    echo -e "  ${RED}❌ macOS 10.15 or later required${NC}"
    ALL_CHECKS_PASSED=false
fi
echo ""

# ============================================
# Check 2: Docker Installation
# ============================================
echo "[2/10] Checking Docker installation..."

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "  $DOCKER_VERSION"
    echo -e "  ${GREEN}✅ Docker is installed${NC}"
else
    echo -e "  ${RED}❌ Docker is not installed${NC}"
    echo "  Install Rancher Desktop or Docker Desktop from:"
    echo "  - Rancher Desktop: https://rancherdesktop.io/"
    echo "  - Docker Desktop: https://www.docker.com/products/docker-desktop"
    ALL_CHECKS_PASSED=false
fi
echo ""

# ============================================
# Check 3: Docker Daemon Running
# ============================================
echo "[3/10] Checking if Docker daemon is running..."

if docker ps &> /dev/null; then
    echo -e "  ${GREEN}✅ Docker daemon is running${NC}"
    
    # Show current context
    CURRENT_CONTEXT=$(docker context show)
    echo "  Current context: $CURRENT_CONTEXT"
else
    echo -e "  ${RED}❌ Docker daemon is not running${NC}"
    echo ""
    echo "  Please start Docker:"
    echo "  1. Open Rancher Desktop or Docker Desktop"
    echo "  2. Wait for it to fully start"
    echo "  3. Run this script again"
    echo ""
    
    # Check available contexts
    echo "  Available Docker contexts:"
    docker context ls 2>/dev/null || echo "  (Cannot list contexts - Docker not running)"
    
    ALL_CHECKS_PASSED=false
fi
echo ""

# ============================================
# Check 4: Docker Compose
# ============================================
echo "[4/10] Checking Docker Compose..."

if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "  $COMPOSE_VERSION"
    echo -e "  ${GREEN}✅ Docker Compose is installed${NC}"
else
    echo -e "  ${RED}❌ Docker Compose is not installed${NC}"
    ALL_CHECKS_PASSED=false
fi
echo ""

# ============================================
# Check 5: Git Installation
# ============================================
echo "[5/10] Checking Git installation..."

if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "  $GIT_VERSION"
    echo -e "  ${GREEN}✅ Git is installed${NC}"
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    if [ -n "$CURRENT_BRANCH" ]; then
        echo "  Current branch: $CURRENT_BRANCH"
        
        # Check latest commit
        LATEST_COMMIT=$(git log -1 --oneline 2>/dev/null)
        echo "  Latest commit: $LATEST_COMMIT"
    fi
else
    echo -e "  ${YELLOW}⚠️  Git is not installed (optional)${NC}"
fi
echo ""

# ============================================
# Check 6: Environment File
# ============================================
echo "[6/10] Checking environment configuration..."

if [ -f ".env" ]; then
    echo -e "  ${GREEN}✅ .env file exists${NC}"
    
    # Check for critical variables
    if grep -q "DJANGO_SECRET_KEY" .env; then
        echo "  ✓ DJANGO_SECRET_KEY found"
    fi
    
    if grep -q "DB_PASSWORD" .env; then
        echo "  ✓ DB_PASSWORD found"
    fi
    
    if grep -q "DEBUG=True" .env; then
        echo "  ✓ Debug mode enabled (development)"
    fi
else
    echo -e "  ${YELLOW}⚠️  .env file not found${NC}"
    echo "  Creating .env from .env.example..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "  ${GREEN}✅ .env file created${NC}"
    else
        echo -e "  ${RED}❌ .env.example not found${NC}"
        ALL_CHECKS_PASSED=false
    fi
fi
echo ""

# ============================================
# Check 7: Required Ports
# ============================================
echo "[7/10] Checking if required ports are available..."

PORTS_TO_CHECK=(3000 8000 5433 6380)
PORTS_IN_USE=()

for PORT in "${PORTS_TO_CHECK[@]}"; do
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PORTS_IN_USE+=($PORT)
        echo -e "  ${YELLOW}⚠️  Port $PORT is in use${NC}"
    else
        echo -e "  ${GREEN}✓${NC} Port $PORT is available"
    fi
done

if [ ${#PORTS_IN_USE[@]} -eq 0 ]; then
    echo -e "  ${GREEN}✅ All required ports are available${NC}"
else
    echo ""
    echo -e "  ${YELLOW}⚠️  Some ports are in use. You may need to:${NC}"
    echo "  1. Stop services using these ports, or"
    echo "  2. Modify docker-compose.complete.yml to use different ports"
fi
echo ""

# ============================================
# Check 8: Disk Space
# ============================================
echo "[8/10] Checking available disk space..."

AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo "  Available space: $AVAILABLE_SPACE"

# Extract numeric value (rough check)
SPACE_GB=$(df -g . | awk 'NR==2 {print $4}')

if [ "$SPACE_GB" -ge 20 ]; then
    echo -e "  ${GREEN}✅ Sufficient disk space available${NC}"
else
    echo -e "  ${YELLOW}⚠️  Low disk space (20GB+ recommended)${NC}"
fi
echo ""

# ============================================
# Check 9: Memory
# ============================================
echo "[9/10] Checking system memory..."

TOTAL_MEM=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024}')
echo "  Total memory: ${TOTAL_MEM}GB"

if (( $(echo "$TOTAL_MEM >= 8" | bc -l) )); then
    echo -e "  ${GREEN}✅ Sufficient memory available${NC}"
else
    echo -e "  ${YELLOW}⚠️  8GB+ RAM recommended${NC}"
fi
echo ""

# ============================================
# Check 10: Project Files
# ============================================
echo "[10/10] Checking project structure..."

REQUIRED_FILES=(
    "docker-compose.complete.yml"
    "start-all.sh"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "backend/apra-nova-code-server/Dockerfile"
)

MISSING_FILES=()

for FILE in "${REQUIRED_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        echo -e "  ${GREEN}✓${NC} $FILE"
    else
        echo -e "  ${RED}✗${NC} $FILE (missing)"
        MISSING_FILES+=("$FILE")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "  ${GREEN}✅ All required files present${NC}"
else
    echo -e "  ${RED}❌ Some required files are missing${NC}"
    ALL_CHECKS_PASSED=false
fi
echo ""

# ============================================
# Summary
# ============================================
echo "============================================"
echo "  📊 Verification Summary"
echo "============================================"
echo ""

if [ "$ALL_CHECKS_PASSED" = true ] && docker ps &> /dev/null; then
    echo -e "${GREEN}✅ All checks passed! Your Mac is ready to run ApraNova.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Make the startup script executable:"
    echo "     chmod +x start-all.sh"
    echo ""
    echo "  2. Run the complete setup:"
    echo "     ./start-all.sh"
    echo ""
    echo "  3. Wait 10-15 minutes for first-time build"
    echo ""
    echo "  4. Access the application:"
    echo "     Frontend:  http://localhost:3000"
    echo "     Backend:   http://localhost:8000"
    echo "     API Docs:  http://localhost:8000/swagger/"
    echo ""
else
    echo -e "${YELLOW}⚠️  Some issues need to be resolved:${NC}"
    echo ""
    
    if ! docker ps &> /dev/null; then
        echo "  🔴 Docker daemon is not running"
        echo "     → Open Rancher Desktop or Docker Desktop"
        echo ""
    fi
    
    if [ ${#PORTS_IN_USE[@]} -gt 0 ]; then
        echo "  🟡 Ports in use: ${PORTS_IN_USE[*]}"
        echo "     → Stop services or change ports in docker-compose.complete.yml"
        echo ""
    fi
    
    if [ ${#MISSING_FILES[@]} -gt 0 ]; then
        echo "  🔴 Missing files: ${MISSING_FILES[*]}"
        echo "     → Ensure you're in the correct directory"
        echo ""
    fi
    
    echo "After resolving issues, run this script again:"
    echo "  ./verify-mac-setup.sh"
    echo ""
fi

echo "============================================"
echo ""

# Exit with appropriate code
if [ "$ALL_CHECKS_PASSED" = true ] && docker ps &> /dev/null; then
    exit 0
else
    exit 1
fi

