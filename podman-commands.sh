#!/bin/bash
# ============================================
# ApraNova Podman Management Commands (Mac)
# ============================================
# Collection of useful Podman commands for managing ApraNova
# ============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# Helper Functions
# ============================================

show_help() {
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}  ApraNova Podman Management Commands${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo ""
    echo "Usage: ./podman-commands.sh [command]"
    echo ""
    echo "Available commands:"
    echo ""
    echo -e "${GREEN}Setup & Start:${NC}"
    echo "  start           - Start all services"
    echo "  stop            - Stop all services"
    echo "  restart         - Restart all services"
    echo "  rebuild         - Clean rebuild all services"
    echo ""
    echo -e "${GREEN}Logs & Monitoring:${NC}"
    echo "  logs            - View logs from all services"
    echo "  logs-backend    - View backend logs"
    echo "  logs-frontend   - View frontend logs"
    echo "  logs-db         - View database logs"
    echo "  status          - Show status of all containers"
    echo "  ps              - List all running containers"
    echo ""
    echo -e "${GREEN}Database:${NC}"
    echo "  migrate         - Run database migrations"
    echo "  makemigrations  - Create new migrations"
    echo "  shell-db        - Open PostgreSQL shell"
    echo "  backup-db       - Backup database"
    echo "  restore-db      - Restore database from backup"
    echo ""
    echo -e "${GREEN}Django Management:${NC}"
    echo "  shell           - Open Django shell"
    echo "  createsuperuser - Create Django superuser"
    echo "  create-demo     - Create demo users"
    echo "  collectstatic   - Collect static files"
    echo "  test            - Run all tests"
    echo "  test-accounts   - Run accounts app tests"
    echo "  test-advanced   - Run accounts advanced tests"
    echo "  test-workspace  - Run workspace tests"
    echo "  test-payments   - Run payments app tests"
    echo "  test-all        - Run all test suites with verbose output"
    echo ""
    echo -e "${GREEN}Cleanup:${NC}"
    echo "  clean           - Remove all containers and volumes"
    echo "  clean-images    - Remove all ApraNova images"
    echo "  clean-all       - Complete cleanup (containers, volumes, images)"
    echo "  prune           - Prune unused Podman resources"
    echo ""
    echo -e "${GREEN}Workspace Management:${NC}"
    echo "  list-workspaces - List all workspace containers"
    echo "  clean-workspaces - Remove all workspace containers"
    echo ""
    echo -e "${GREEN}Info:${NC}"
    echo "  health          - Check health of all services"
    echo "  urls            - Show all access URLs"
    echo "  help            - Show this help message"
    echo ""
}

# ============================================
# Setup & Start Commands
# ============================================

start_services() {
    echo -e "${CYAN}Starting all services...${NC}"
    podman-compose -f docker-compose.complete.yml up -d
    echo -e "${GREEN}✅ Services started!${NC}"
}

stop_services() {
    echo -e "${CYAN}Stopping all services...${NC}"
    podman-compose -f docker-compose.complete.yml down
    echo -e "${GREEN}✅ Services stopped!${NC}"
}

restart_services() {
    echo -e "${CYAN}Restarting all services...${NC}"
    podman-compose -f docker-compose.complete.yml restart
    echo -e "${GREEN}✅ Services restarted!${NC}"
}

rebuild_services() {
    echo -e "${CYAN}Rebuilding all services...${NC}"
    ./start-all-podman.sh
}

# ============================================
# Logs & Monitoring Commands
# ============================================

view_logs() {
    echo -e "${CYAN}Viewing logs from all services (Ctrl+C to exit)...${NC}"
    podman-compose -f docker-compose.complete.yml logs -f
}

view_backend_logs() {
    echo -e "${CYAN}Viewing backend logs (Ctrl+C to exit)...${NC}"
    podman logs -f apranova_backend
}

view_frontend_logs() {
    echo -e "${CYAN}Viewing frontend logs (Ctrl+C to exit)...${NC}"
    podman logs -f apranova_frontend
}

view_db_logs() {
    echo -e "${CYAN}Viewing database logs (Ctrl+C to exit)...${NC}"
    podman logs -f apranova_db
}

show_status() {
    echo -e "${CYAN}Service Status:${NC}"
    podman-compose -f docker-compose.complete.yml ps
}

list_containers() {
    echo -e "${CYAN}Running Containers:${NC}"
    podman ps -a
}

# ============================================
# Database Commands
# ============================================

run_migrations() {
    echo -e "${CYAN}Running database migrations...${NC}"
    podman exec apranova_backend python manage.py migrate
    echo -e "${GREEN}✅ Migrations completed!${NC}"
}

make_migrations() {
    echo -e "${CYAN}Creating new migrations...${NC}"
    podman exec apranova_backend python manage.py makemigrations
    echo -e "${GREEN}✅ Migrations created!${NC}"
}

open_db_shell() {
    echo -e "${CYAN}Opening PostgreSQL shell...${NC}"
    podman exec -it apranova_db psql -U apranova_user -d apranova_db
}

backup_database() {
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${CYAN}Backing up database to $BACKUP_FILE...${NC}"
    podman exec apranova_db pg_dump -U apranova_user apranova_db > "$BACKUP_FILE"
    echo -e "${GREEN}✅ Database backed up to $BACKUP_FILE${NC}"
}

restore_database() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Please provide backup file: ./podman-commands.sh restore-db backup.sql${NC}"
        exit 1
    fi
    echo -e "${CYAN}Restoring database from $1...${NC}"
    cat "$1" | podman exec -i apranova_db psql -U apranova_user apranova_db
    echo -e "${GREEN}✅ Database restored!${NC}"
}

# ============================================
# Django Management Commands
# ============================================

open_django_shell() {
    echo -e "${CYAN}Opening Django shell...${NC}"
    podman exec -it apranova_backend python manage.py shell
}

create_superuser() {
    echo -e "${CYAN}Creating Django superuser...${NC}"
    podman exec -it apranova_backend python manage.py createsuperuser
}

create_demo_users() {
    echo -e "${CYAN}Creating demo users...${NC}"
    podman exec apranova_backend python manage.py create_demo_users
    echo -e "${GREEN}✅ Demo users created!${NC}"
}

collect_static() {
    echo -e "${CYAN}Collecting static files...${NC}"
    podman exec apranova_backend python manage.py collectstatic --noinput
    echo -e "${GREEN}✅ Static files collected!${NC}"
}

run_tests() {
    echo -e "${CYAN}Running all tests...${NC}"
    podman exec apranova_backend python manage.py test
}

run_accounts_tests() {
    echo -e "${CYAN}Running accounts app tests...${NC}"
    podman exec apranova_backend python manage.py test accounts --verbosity=2
}

run_advanced_tests() {
    echo -e "${CYAN}Running accounts advanced tests...${NC}"
    podman exec apranova_backend python manage.py test accounts.test_advanced --verbosity=2
}

run_workspace_tests() {
    echo -e "${CYAN}Running workspace tests...${NC}"
    podman exec apranova_backend python manage.py test accounts.test_workspace --verbosity=2
}

run_payments_tests() {
    echo -e "${CYAN}Running payments app tests...${NC}"
    podman exec apranova_backend python manage.py test payments --verbosity=2
}

run_all_tests() {
    echo -e "${CYAN}Running all test suites...${NC}"
    echo ""
    echo -e "${YELLOW}[1/4] Accounts app tests${NC}"
    podman exec apranova_backend python manage.py test accounts --verbosity=2
    echo ""
    echo -e "${YELLOW}[2/4] Accounts advanced tests${NC}"
    podman exec apranova_backend python manage.py test accounts.test_advanced --verbosity=2
    echo ""
    echo -e "${YELLOW}[3/4] Workspace tests${NC}"
    podman exec apranova_backend python manage.py test accounts.test_workspace --verbosity=2
    echo ""
    echo -e "${YELLOW}[4/4] Payments app tests${NC}"
    podman exec apranova_backend python manage.py test payments --verbosity=2
    echo ""
    echo -e "${GREEN}✅ All test suites completed!${NC}"
}

# ============================================
# Cleanup Commands
# ============================================

clean_containers() {
    echo -e "${CYAN}Removing all containers and volumes...${NC}"
    podman-compose -f docker-compose.complete.yml down -v
    echo -e "${GREEN}✅ Containers and volumes removed!${NC}"
}

clean_images() {
    echo -e "${CYAN}Removing all ApraNova images...${NC}"
    podman rmi apranova-frontend:latest -f 2>/dev/null || true
    podman rmi apranova-backend:latest -f 2>/dev/null || true
    podman rmi apra-nova-code-server:latest -f 2>/dev/null || true
    echo -e "${GREEN}✅ Images removed!${NC}"
}

clean_all() {
    echo -e "${CYAN}Performing complete cleanup...${NC}"
    clean_containers
    clean_images
    podman system prune -f
    echo -e "${GREEN}✅ Complete cleanup done!${NC}"
}

prune_system() {
    echo -e "${CYAN}Pruning unused Podman resources...${NC}"
    podman system prune -f
    echo -e "${GREEN}✅ System pruned!${NC}"
}

# ============================================
# Workspace Management Commands
# ============================================

list_workspaces() {
    echo -e "${CYAN}Workspace Containers:${NC}"
    podman ps -a --filter "name=workspace_"
}

clean_workspaces() {
    echo -e "${CYAN}Removing all workspace containers...${NC}"
    podman ps -a --filter "name=workspace_" --format "{{.Names}}" | xargs -r podman rm -f
    echo -e "${GREEN}✅ Workspace containers removed!${NC}"
}

# ============================================
# Info Commands
# ============================================

check_health() {
    echo -e "${CYAN}Checking service health...${NC}"
    echo ""
    
    echo -e "${YELLOW}Backend:${NC}"
    if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
    else
        echo -e "${RED}❌ Backend is not responding${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Frontend:${NC}"
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy${NC}"
    else
        echo -e "${RED}❌ Frontend is not responding${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Database:${NC}"
    if podman exec apranova_db pg_isready -U apranova_user > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is healthy${NC}"
    else
        echo -e "${RED}❌ Database is not responding${NC}"
    fi
}

show_urls() {
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
}

# ============================================
# Main Command Router
# ============================================

case "$1" in
    # Setup & Start
    start) start_services ;;
    stop) stop_services ;;
    restart) restart_services ;;
    rebuild) rebuild_services ;;
    
    # Logs & Monitoring
    logs) view_logs ;;
    logs-backend) view_backend_logs ;;
    logs-frontend) view_frontend_logs ;;
    logs-db) view_db_logs ;;
    status) show_status ;;
    ps) list_containers ;;
    
    # Database
    migrate) run_migrations ;;
    makemigrations) make_migrations ;;
    shell-db) open_db_shell ;;
    backup-db) backup_database ;;
    restore-db) restore_database "$2" ;;
    
    # Django Management
    shell) open_django_shell ;;
    createsuperuser) create_superuser ;;
    create-demo) create_demo_users ;;
    collectstatic) collect_static ;;
    test) run_tests ;;
    test-accounts) run_accounts_tests ;;
    test-advanced) run_advanced_tests ;;
    test-workspace) run_workspace_tests ;;
    test-payments) run_payments_tests ;;
    test-all) run_all_tests ;;

    # Cleanup
    clean) clean_containers ;;
    clean-images) clean_images ;;
    clean-all) clean_all ;;
    prune) prune_system ;;
    
    # Workspace Management
    list-workspaces) list_workspaces ;;
    clean-workspaces) clean_workspaces ;;
    
    # Info
    health) check_health ;;
    urls) show_urls ;;
    help|--help|-h) show_help ;;
    
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

