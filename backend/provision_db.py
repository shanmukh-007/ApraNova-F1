#!/usr/bin/env python
"""Provision PostgreSQL schema for test user"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.postgres_provisioning import PostgresProvisioningService

User = get_user_model()

# Get test user
user = User.objects.get(email="test@gmail.com")
print(f"✅ Found user: {user.email}")

try:
    # Provision PostgreSQL schema
    credentials = PostgresProvisioningService.provision_schema_for_student(user)
    
    print(f"\n✅ PostgreSQL schema provisioned!")
    print(f"\n📊 Database Credentials:")
    print(f"   Host: {credentials['host']}")
    print(f"   Port: {credentials['port']}")
    print(f"   Database: {credentials['database']}")
    print(f"   Schema: {credentials['schema']}")
    print(f"   Username: {credentials['username']}")
    print(f"   Password: {credentials['password']}")
    print(f"\n🔗 Connection String:")
    print(f"   {credentials['connection_string']}")
    print(f"\n💡 Use this in Jupyter to connect:")
    print(f"   import psycopg2")
    print(f"   conn = psycopg2.connect('{credentials['connection_string']}')")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
