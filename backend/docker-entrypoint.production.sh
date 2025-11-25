#!/bin/bash
# ============================================
# ApraNova Backend - Production Entrypoint
# ============================================

set -e

echo "=========================================="
echo "ApraNova Backend - Production Mode"
echo "=========================================="

# Wait for database to be ready
echo "⏳ Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.5
done
echo "✅ Database is ready!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 0.5
done
echo "✅ Redis is ready!"

# Run database migrations
echo "🔄 Running database migrations..."
python manage.py migrate --noinput

# Collect static files (already done in Dockerfile, but run again for safety)
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create cache table if using database cache
echo "🗄️  Creating cache table..."
python manage.py createcachetable || true

# Populate curriculum data
echo "📚 Populating curriculum data..."
python manage.py populate_curriculum || true

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
python manage.py shell << END
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
    print(f'✅ Superuser created: {email}')
else:
    print(f'ℹ️  Superuser already exists: {email}')
END

# Check Docker availability
echo "🐳 Checking Docker availability..."
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker is available"
else
    echo "⚠️  Warning: Docker is not available. Workspace provisioning may not work."
fi

echo "=========================================="
echo "🚀 Starting Gunicorn server..."
echo "=========================================="

# Execute the main command
exec "$@"

