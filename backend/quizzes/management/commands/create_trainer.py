from django.core.management.base import BaseCommand
from accounts.models import CustomUser


class Command(BaseCommand):
    help = 'Create a trainer user for testing'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Trainer email', default='trainer@test.com')
        parser.add_argument('--password', type=str, help='Trainer password', default='trainer123')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        
        # Check if user already exists
        if CustomUser.objects.filter(email=email).exists():
            user = CustomUser.objects.get(email=email)
            user.role = 'trainer'
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated existing user {email} to trainer role'))
        else:
            # Create new trainer
            user = CustomUser.objects.create_user(
                email=email,
                username=email.split('@')[0],
                password=password,
                role='trainer',
                name='Test Trainer'
            )
            self.stdout.write(self.style.SUCCESS(f'Created new trainer: {email}'))
        
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
        self.stdout.write(self.style.SUCCESS(f'Role: {user.role}'))
