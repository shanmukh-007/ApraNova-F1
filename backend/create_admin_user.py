#!/usr/bin/env python
"""
Create admin user
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser

email = 'admin@gmail.com'
password = 'Admin@123'

try:
    admin = CustomUser.objects.get(email=email)
    print(f"✓ Admin user already exists: {email}")
    # Update password in case it changed
    admin.set_password(password)
    admin.save()
    print(f"✓ Password updated for: {email}")
except CustomUser.DoesNotExist:
    admin = CustomUser.objects.create_user(
        email=email,
        username='admin',
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
print(f"Role:     admin")
print(f"Staff:    Yes")
print(f"Superuser: Yes")
print(f"=" * 60)
print(f"\n🌐 Login at: http://localhost:3001")
print(f"🔧 Django Admin: http://localhost:8000/admin")
