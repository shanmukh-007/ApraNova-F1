#!/bin/bash
# ============================================
# Django Backend Entrypoint Script
# ============================================
# This script runs before starting the Django application
# It handles database migrations and other setup tasks
# ============================================

set -e

echo "============================================"
echo "  Django Backend Initialization"
echo "============================================"

# Wait for database to be ready
echo "Waiting for database to be ready..."
until python -c "import psycopg2; import os; psycopg2.connect(os.environ.get('DATABASE_URL'))" 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "⚠️  Migrations failed, but continuing..."
fi

# Collect static files (if needed)
echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "✅ Initialization complete!"
echo "============================================"
echo ""

# Execute the main command (gunicorn)
exec "$@"

