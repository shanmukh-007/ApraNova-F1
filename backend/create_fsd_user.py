#!/usr/bin/env python
"""Create FSD test user account"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.crypto import get_random_string

User = get_user_model()

# User details for FSD track
email = "fsd@gmail.com"
name = "FSD Student"
track = "FSD"

# Check if user already exists
if User.objects.filter(email=email).exists():
    print(f"❌ User with email {email} already exists!")
    user = User.objects.get(email=email)
    print(f"✅ Found existing user: {user.username}")
else:
    # Generate username from email
    username = email.split('@')[0]
    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    # Generate random password
    password = get_random_string(16)
    
    # Create user
    user = User.objects.create_user(
        email=email,
        username=username,
        password=password,
        name=name,
        role='student',
        track=track,
        enrollment_status='ENROLLED',
        payment_verified=True,
        enrolled_at=timezone.now(),
        privacy_accepted=True,
        privacy_accepted_at=timezone.now(),
        privacy_version='1.0',
    )
    
    print(f"✅ Created FSD user account!")
    print(f"   Email: {email}")
    print(f"   Username: {username}")
    print(f"   Password: {password}")
    print(f"   Track: {track}")
    print(f"\n🔑 Login credentials:")
    print(f"   Username/Email: {email}")
    print(f"   Password: {password}")
    print(f"\n⚠️  Save this password! You'll need it to login.")

# Set tool URLs for FSD track
user.workspace_url = "http://localhost:8080"  # CodeServer
user.tools_provisioned = True
user.provisioned_at = timezone.now()
user.save()

print(f"\n✅ Tools provisioned!")
print(f"   CodeServer: {user.workspace_url}")
print(f"   GitHub: https://github.com")
print(f"   Discord: https://discord.gg/apranova")
print(f"\n🎉 FSD account setup complete! You can now login at http://localhost:3000/login")
