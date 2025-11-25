#!/usr/bin/env python
"""
Update admin@apranova.com password
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser

email = 'admin@apranova.com'
password = 'Admin@123'

try:
    admin = CustomUser.objects.get(email=email)
    admin.set_password(password)
    admin.is_staff = True
    admin.is_superuser = True
    admin.role = 'admin'
    admin.save()
    print(f"✓ Updated admin user: {email}")
except CustomUser.DoesNotExist:
    admin = CustomUser.objects.create_user(
        email=email,
        username='adminapranova',
        password=password,
        name='Admin User',
        role='admin',
        is_staff=True,
        is_superuser=True
    )
    print(f"✓ Created admin user: {email}")

print(f"\n📋 ADMIN LOGIN CREDENTIALS")
print(f"=" * 60)
print(f"Email:    {email}")
print(f"Password: {password}")
print(f"Role:     {admin.role}")
print(f"Staff:    {admin.is_staff}")
print(f"Superuser: {admin.is_superuser}")
print(f"=" * 60)
print(f"\n🌐 Login at: http://localhost:3001")
print(f"🔧 Django Admin: http://localhost:8000/admin")
