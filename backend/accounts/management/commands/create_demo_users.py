"""
Django management command to create demo users for testing
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()


class Command(BaseCommand):
    help = 'Create demo users for testing'

    def handle(self, *args, **options):
        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("  Creating Demo Users for ApraNova LMS"))
        self.stdout.write("=" * 80 + "\n")

        # Demo users configuration
        demo_users = [
            {
                'email': 'admin@apranova.com',
                'username': 'admin',
                'password': 'Admin@123',
                'name': 'Admin User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'email': 'student@apranova.com',
                'username': 'student',
                'password': 'Student@123',
                'name': 'Demo Student',
                'role': 'student',
                'is_staff': False,
                'is_superuser': False,
            },
            {
                'email': 'teacher@apranova.com',
                'username': 'teacher',
                'password': 'Teacher@123',
                'name': 'Demo Teacher',
                'role': 'teacher',
                'is_staff': True,
                'is_superuser': False,
            },
        ]

        created_users = []

        for user_data in demo_users:
            email = user_data['email']
            try:
                # Check if user already exists
                if User.objects.filter(email=email).exists():
                    user = User.objects.get(email=email)
                    self.stdout.write(
                        self.style.WARNING(f"  ⚠️  User already exists: {email}")
                    )
                else:
                    # Create user
                    user = User.objects.create_user(
                        email=user_data['email'],
                        username=user_data['username'],
                        password=user_data['password'],
                        name=user_data['name'],
                        role=user_data['role'],
                        is_staff=user_data['is_staff'],
                        is_superuser=user_data['is_superuser'],
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"  ✅ Created user: {email}")
                    )
                
                created_users.append({
                    'user': user,
                    'password': user_data['password'],
                    'role': user_data['role'],
                })

            except IntegrityError as e:
                self.stdout.write(
                    self.style.ERROR(f"  ❌ Error creating {email}: {str(e)}")
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"  ❌ Unexpected error for {email}: {str(e)}")
                )

        # Display credentials
        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("  📋 DEMO USER CREDENTIALS"))
        self.stdout.write("=" * 80 + "\n")

        for user_info in created_users:
            user = user_info['user']
            password = user_info['password']
            role = user_info['role']

            self.stdout.write(f"\n  👤 {role.upper()} ACCOUNT")
            self.stdout.write("  " + "-" * 76)
            self.stdout.write(f"  Email:    {user.email}")
            self.stdout.write(f"  Password: {password}")
            self.stdout.write(f"  User ID:  {user.id}")
            self.stdout.write(f"  Role:     {user.role}")

            if role == 'student':
                self.stdout.write(f"\n  💻 WORKSPACE ACCESS (Code-Server)")
                self.stdout.write(f"  Status:   No password required! 🎉")
                self.stdout.write(f"  Note:     Click 'Launch Workspace' to access VS Code instantly")

        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("  🌐 ACCESS URLS"))
        self.stdout.write("=" * 80 + "\n")
        self.stdout.write("  Frontend:  http://localhost:3000")
        self.stdout.write("  Backend:   http://localhost:8000")
        self.stdout.write("  Admin:     http://localhost:8000/admin")
        self.stdout.write("  Swagger:   http://localhost:8000/swagger")
        self.stdout.write("  Health:    http://localhost:8000/health")

        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("  📝 QUICK START GUIDE"))
        self.stdout.write("=" * 80 + "\n")
        self.stdout.write("  1. Open http://localhost:3000 in your browser")
        self.stdout.write("  2. Click 'Login' and use one of the credentials above")
        self.stdout.write("  3. For students: Go to Workspace and click 'Launch Workspace'")
        self.stdout.write("  4. VS Code will open directly in your browser - no password needed! 🎉")
        self.stdout.write("  5. Start coding immediately with pre-installed tools")

        self.stdout.write("\n" + "=" * 80)
        self.stdout.write(self.style.SUCCESS("  ✅ Setup Complete!"))
        self.stdout.write("=" * 80 + "\n")

