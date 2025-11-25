from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a new admin user'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email', default='admin@apranova.com')
        parser.add_argument('--password', type=str, help='Admin password', default='admin123')
        parser.add_argument('--username', type=str, help='Admin username', default='admin')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        username = options['username']
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'User with email {email} already exists'))
            return
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=True,
            is_superuser=True,
            role='admin'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created admin user!'))
        self.stdout.write(f'Username: {user.username}')
        self.stdout.write(f'Email: {user.email}')
        self.stdout.write(f'Password: {password}')
        self.stdout.write(f'Role: {user.role}')
        self.stdout.write(self.style.WARNING('\nYou can now login at /login with these credentials'))
