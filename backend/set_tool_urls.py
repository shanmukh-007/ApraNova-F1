#!/usr/bin/env python
"""Set tool URLs for test user"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Get test user
user = User.objects.get(email="test@gmail.com")
print(f"✅ Found user: {user.email}")

# Set tool URLs (using localhost for development)
user.jupyter_url = "http://localhost:8888"
user.superset_url = "http://localhost:8088"
user.prefect_url = "http://localhost:4200"
user.save()

print(f"\n✅ Tool URLs updated!")
print(f"   Jupyter: {user.jupyter_url}")
print(f"   Superset: {user.superset_url}")
print(f"   Prefect: {user.prefect_url}")
print(f"\n💡 Now refresh your dashboard - tools will show as 'Active'")
print(f"\n⚠️  Note: You need to actually run these services:")
print(f"   - Jupyter: jupyter notebook --port=8888")
print(f"   - Superset: docker-compose up superset")
print(f"   - Prefect: docker-compose up prefect")
