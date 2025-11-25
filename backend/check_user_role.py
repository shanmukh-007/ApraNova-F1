#!/usr/bin/env python
"""Quick script to check and update user roles"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser

print("\n=== Current Users ===")
users = CustomUser.objects.all()
for user in users:
    print(f"Email: {user.email}, Role: {user.role}, ID: {user.id}")

print("\n=== To make a user a trainer ===")
print("Run this in Django shell:")
print("from accounts.models import CustomUser")
print("user = CustomUser.objects.get(email='your-email@example.com')")
print("user.role = 'trainer'")
print("user.save()")
