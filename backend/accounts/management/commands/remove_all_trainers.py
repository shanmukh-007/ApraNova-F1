from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Remove trainer privileges from all trainer users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm the removal of all trainers',
        )

    def handle(self, *args, **options):
        trainers = User.objects.filter(role='trainer')
        
        if not trainers.exists():
            self.stdout.write(self.style.WARNING('No trainer users found'))
            return
        
        count = trainers.count()
        
        if not options['confirm']:
            self.stdout.write(self.style.WARNING(f'Found {count} trainer user(s):'))
            for user in trainers:
                self.stdout.write(f'  - {user.email} ({user.username})')
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('Run with --confirm to remove trainer privileges from all these users'))
            return
        
        # Remove trainer privileges
        updated_count = 0
        for user in trainers:
            user.role = 'student'
            user.is_staff = False
            user.save()
            updated_count += 1
            self.stdout.write(f'Removed trainer privileges from: {user.email}')
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'Successfully removed trainer privileges from {updated_count} user(s)!'))
