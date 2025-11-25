from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Make a user a trainer'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to make trainer')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            user.role = 'trainer'
            user.is_staff = True  # Trainers need staff access
            user.save()
            
            self.stdout.write(self.style.SUCCESS(f'Successfully made {email} a trainer!'))
            self.stdout.write(f'User: {user.username}')
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Role: {user.role}')
            self.stdout.write(f'Is Staff: {user.is_staff}')
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with email {email} does not exist'))
