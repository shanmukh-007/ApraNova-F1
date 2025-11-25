#!/usr/bin/env python
"""
Mark all existing users as paid (for testing/development)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser

print(f"\n📋 MARKING ALL USERS AS PAID")
print(f"=" * 60)

users = CustomUser.objects.all()

for user in users:
    user.payment_verified = True
    user.enrollment_status = 'ENROLLED'
    user.save()
    print(f"✓ Marked {user.email} as paid (role: {user.role})")

print(f"\n✓ Updated {users.count()} users")
print(f"=" * 60)
print(f"\nAll users can now access the platform without payment prompt!")
