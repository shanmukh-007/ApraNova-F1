"""
PostgreSQL Schema Provisioning Service
Creates isolated schemas for Data Professional students
"""
import psycopg2
import logging
from django.conf import settings
from django.utils.crypto import get_random_string

logger = logging.getLogger(__name__)


class PostgresProvisioningService:
    """Service for provisioning Postgres schemas for DP students"""
    
    @staticmethod
    def provision_schema_for_student(user):
        """
        Create isolated Postgres schema for DP student
        
        Args:
            user: CustomUser instance
        
        Returns:
            dict: Database credentials
        """
        if user.track != 'DP':
            raise ValueError("Postgres schema only for DP track students")
        
        schema_name = f"dp_student_{user.id}"
        username = f"student_{user.id}"
        password = get_random_string(32)
        
        try:
            # Connect to database as admin
            conn = psycopg2.connect(
                host=settings.STUDENT_DB_HOST,
                port=settings.STUDENT_DB_PORT,
                database=settings.STUDENT_DB_NAME,
                user=settings.STUDENT_DB_ADMIN_USER,
                password=settings.STUDENT_DB_ADMIN_PASSWORD
            )
            conn.autocommit = True
            cursor = conn.cursor()
            
            # Create schema
            cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name}")
            logger.info(f"Created schema {schema_name}")
            
            # Create user
            cursor.execute(f"""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '{username}') THEN
                        CREATE USER {username} WITH PASSWORD '{password}';
                    END IF;
                END
                $$;
            """)
            logger.info(f"Created user {username}")
            
            # Grant permissions
            cursor.execute(f"""
                GRANT USAGE ON SCHEMA {schema_name} TO {username};
                GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA {schema_name} TO {username};
                GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA {schema_name} TO {username};
                ALTER DEFAULT PRIVILEGES IN SCHEMA {schema_name} 
                    GRANT ALL ON TABLES TO {username};
                ALTER DEFAULT PRIVILEGES IN SCHEMA {schema_name} 
                    GRANT ALL ON SEQUENCES TO {username};
            """)
            logger.info(f"Granted permissions to {username}")
            
            cursor.close()
            conn.close()
            
            # Build connection string
            connection_string = (
                f"postgresql://{username}:{password}@"
                f"{settings.STUDENT_DB_HOST}:{settings.STUDENT_DB_PORT}/"
                f"{settings.STUDENT_DB_NAME}?options=-c%20search_path={schema_name}"
            )
            
            credentials = {
                'host': settings.STUDENT_DB_HOST,
                'port': settings.STUDENT_DB_PORT,
                'database': settings.STUDENT_DB_NAME,
                'schema': schema_name,
                'username': username,
                'password': password,
                'connection_string': connection_string
            }
            
            # Store credentials securely
            PostgresProvisioningService._store_credentials(user, credentials)
            
            logger.info(f"Provisioned Postgres schema for user {user.email}")
            
            return credentials
            
        except Exception as e:
            logger.error(f"Failed to provision Postgres schema: {str(e)}")
            raise
    
    @staticmethod
    def _store_credentials(user, credentials):
        """
        Store database credentials securely
        
        Options:
        1. Encrypted database field
        2. Environment-specific secrets manager
        3. HashiCorp Vault or similar
        """
        # For now, store in a secure model field
        # In production, use a proper secrets manager
        from .models import StudentDatabaseCredentials
        
        StudentDatabaseCredentials.objects.update_or_create(
            user=user,
            defaults={
                'schema_name': credentials['schema'],
                'username': credentials['username'],
                'password': credentials['password'],  # Should be encrypted
                'connection_string': credentials['connection_string']
            }
        )
    
    @staticmethod
    def get_credentials(user):
        """
        Retrieve database credentials for student
        
        Args:
            user: CustomUser instance
        
        Returns:
            dict: Database credentials
        """
        from .models import StudentDatabaseCredentials
        
        try:
            creds = StudentDatabaseCredentials.objects.get(user=user)
            return {
                'host': settings.STUDENT_DB_HOST,
                'port': settings.STUDENT_DB_PORT,
                'database': settings.STUDENT_DB_NAME,
                'schema': creds.schema_name,
                'username': creds.username,
                'password': creds.password,
                'connection_string': creds.connection_string
            }
        except StudentDatabaseCredentials.DoesNotExist:
            return None
    
    @staticmethod
    def deprovision_schema(user):
        """
        Remove schema and user for student
        
        Args:
            user: CustomUser instance
        """
        schema_name = f"dp_student_{user.id}"
        username = f"student_{user.id}"
        
        try:
            conn = psycopg2.connect(
                host=settings.STUDENT_DB_HOST,
                port=settings.STUDENT_DB_PORT,
                database=settings.STUDENT_DB_NAME,
                user=settings.STUDENT_DB_ADMIN_USER,
                password=settings.STUDENT_DB_ADMIN_PASSWORD
            )
            conn.autocommit = True
            cursor = conn.cursor()
            
            # Drop schema
            cursor.execute(f"DROP SCHEMA IF EXISTS {schema_name} CASCADE")
            
            # Drop user
            cursor.execute(f"DROP USER IF EXISTS {username}")
            
            cursor.close()
            conn.close()
            
            # Remove credentials
            from .models import StudentDatabaseCredentials
            StudentDatabaseCredentials.objects.filter(user=user).delete()
            
            logger.info(f"Deprovisioned Postgres schema for user {user.email}")
            
        except Exception as e:
            logger.error(f"Failed to deprovision schema: {str(e)}")
            raise
