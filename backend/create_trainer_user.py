#!/usr/bin/env python
"""
Create 10 trainer users for testing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser

password = 'Trainer@123'

print(f"\n📋 CREATING 10 TRAINER USERS")
print(f"=" * 60)

for i in range(1, 11):
    email = f'trainer{i}@apranova.com'
    username = f'trainer{i}'
    name = f'Trainer {i}'
    
    try:
        trainer = CustomUser.objects.get(email=email)
        # Update payment status for existing trainers
        trainer.payment_verified = True
        trainer.enrollment_status = 'ENROLLED'
        trainer.save()
        print(f"✓ Trainer {i} already exists: {email}")
    except CustomUser.DoesNotExist:
        trainer = CustomUser.objects.create_user(
            email=email,
            username=username,
            password=password,
            name=name,
            role='trainer',
            is_staff=True,
            is_superuser=False
        )
        # Set payment verified for trainers (they don't need to pay)
        trainer.payment_verified = True
        trainer.enrollment_status = 'ENROLLED'
        trainer.save()
        print(f"✓ Created trainer {i}: {email}")

print(f"\n📋 TRAINER LOGIN CREDENTIALS")
print(f"=" * 60)
print(f"Email:    trainer1@apranova.com to trainer10@apranova.com")
print(f"Password: {password} (same for all)")
print(f"Role:     trainer")
print(f"=" * 60)
print(f"\n🌐 Login at: http://localhost:3001")
print(f"\nExample logins:")
for i in range(1, 4):
    print(f"  - trainer{i}@apranova.com / {password}")
