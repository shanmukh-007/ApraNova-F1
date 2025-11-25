from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'List all admin users'

    def handle(self, *args, **options):
        admins = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True) | User.objects.filter(role='admin')
        admins = admins.distinct()
        
        if not admins.exists():
            self.stdout.write(self.style.WARNING('No admin users found'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'Found {admins.count()} admin user(s):\n'))
        
        for user in admins:
            self.stdout.write('─' * 50)
            self.stdout.write(f'Username: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Role: {user.role}')
            self.stdout.write(f'Is Staff: {user.is_staff}')
            self.stdout.write(f'Is Superuser: {user.is_superuser}')
            self.stdout.write('')
