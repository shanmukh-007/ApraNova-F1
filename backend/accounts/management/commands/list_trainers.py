from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'List all trainer users'

    def handle(self, *args, **options):
        trainers = User.objects.filter(role='trainer')
        
        if not trainers.exists():
            self.stdout.write(self.style.WARNING('No trainer users found'))
            return
        
        self.stdout.write(self.style.SUCCESS(f'Found {trainers.count()} trainer user(s):\n'))
        
        for user in trainers:
            self.stdout.write('─' * 50)
            self.stdout.write(f'Username: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Role: {user.role}')
            self.stdout.write(f'Is Staff: {user.is_staff}')
            self.stdout.write('')
