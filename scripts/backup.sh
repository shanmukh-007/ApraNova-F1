#!/bin/bash
# ============================================
# ApraNova Database Backup Script
# ============================================

set -e

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/apranova_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Database credentials from environment
DB_HOST="${POSTGRES_HOST:-db}"
DB_NAME="${POSTGRES_DB}"
DB_USER="${POSTGRES_USER}"
DB_PASSWORD="${POSTGRES_PASSWORD}"

echo "=========================================="
echo "ApraNova Database Backup"
echo "=========================================="
echo "Timestamp: $(date)"
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}"
echo "=========================================="

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform backup
echo "📦 Creating backup..."
export PGPASSWORD="${DB_PASSWORD}"
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"

# Check if backup was successful
if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "✅ Backup created successfully!"
    echo "   File: ${BACKUP_FILE}"
    echo "   Size: ${BACKUP_SIZE}"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Remove old backups
echo "🗑️  Removing backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "apranova_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

# List recent backups
echo "📋 Recent backups:"
ls -lh "${BACKUP_DIR}" | tail -n 10

echo "=========================================="
echo "✅ Backup completed successfully!"
echo "=========================================="

