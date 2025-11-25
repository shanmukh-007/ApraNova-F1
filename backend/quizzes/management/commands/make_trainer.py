from django.core.management.base import BaseCommand
from accounts.models import CustomUser


class Command(BaseCommand):
    help = 'Convert an existing user to trainer role'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='User email to convert to trainer')

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = CustomUser.objects.get(email=email)
            old_role = user.role
            user.role = 'trainer'
            user.save()
            
            self.stdout.write(self.style.SUCCESS(f'✅ Successfully updated user'))
            self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
            self.stdout.write(self.style.SUCCESS(f'Old role: {old_role} → New role: trainer'))
            
        except CustomUser.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ User with email {email} not found'))
            self.stdout.write(self.style.WARNING('Available users:'))
            for u in CustomUser.objects.all():
                self.stdout.write(f'  - {u.email} (role: {u.role})')
