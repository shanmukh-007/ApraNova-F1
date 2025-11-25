from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Remove admin privileges from a user'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to remove admin privileges')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            user.is_staff = False
            user.is_superuser = False
            user.role = 'student'  # Default to student role
            user.save()
            
            self.stdout.write(self.style.SUCCESS(f'Successfully removed admin privileges from {email}!'))
            self.stdout.write(f'User: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Role: {user.role}')
            self.stdout.write(f'Is Staff: {user.is_staff}')
            self.stdout.write(f'Is Superuser: {user.is_superuser}')
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with email {email} does not exist'))
