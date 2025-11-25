#!/bin/bash
# ============================================
# ApraNova Database Restore Script
# ============================================

set -e

# Configuration
BACKUP_DIR="/backups"

# Database credentials from environment
DB_HOST="${POSTGRES_HOST:-db}"
DB_NAME="${POSTGRES_DB}"
DB_USER="${POSTGRES_USER}"
DB_PASSWORD="${POSTGRES_PASSWORD}"

echo "=========================================="
echo "ApraNova Database Restore"
echo "=========================================="

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "❌ Error: No backup file specified!"
    echo ""
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "Timestamp: $(date)"
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}"
echo "Backup file: ${BACKUP_FILE}"
echo "=========================================="

# Confirm restore
read -p "⚠️  This will REPLACE the current database. Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled."
    exit 0
fi

# Perform restore
echo "📦 Restoring database..."
export PGPASSWORD="${DB_PASSWORD}"

# Drop existing connections
psql -h "${DB_HOST}" -U "${DB_USER}" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}';" || true

# Drop and recreate database
psql -h "${DB_HOST}" -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
psql -h "${DB_HOST}" -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};"

# Restore from backup
gunzip -c "${BACKUP_FILE}" | psql -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}"

echo "=========================================="
echo "✅ Database restored successfully!"
echo "=========================================="

