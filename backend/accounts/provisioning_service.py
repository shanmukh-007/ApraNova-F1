"""
Tool Provisioning Service
Automatically provisions tools for students based on their track
"""
import logging
import docker
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


class ProvisioningService:
    """Service for provisioning student tools"""
    
    @staticmethod
    def provision_tools_for_user(user):
        """
        Provision tools based on user's track
        
        Args:
            user: CustomUser instance
        
        Returns:
            dict: Provisioned tool URLs
        """
        try:
            if user.track == 'FSD':
                return ProvisioningService.provision_fsd_tools(user)
            elif user.track == 'DP':
                return ProvisioningService.provision_dp_tools(user)
            else:
                raise ValueError(f"Unknown track: {user.track}")
                
        except Exception as e:
            logger.error(f"Tool provisioning failed for user {user.email}: {str(e)}")
            user.provisioning_error = str(e)
            user.tools_provisioned = False
            user.save()
            raise
    
    @staticmethod
    def provision_fsd_tools(user):
        """
        Provision tools for Full-Stack Development track
        - CodeServer workspace
        
        Args:
            user: CustomUser instance
        
        Returns:
            dict: Tool URLs
        """
        logger.info(f"Provisioning FSD tools for user {user.email}")
        
        try:
            # Create CodeServer workspace
            workspace_url = ProvisioningService._create_codeserver_workspace(user)
            
            # Update user record
            user.workspace_url = workspace_url
            user.tools_provisioned = True
            user.provisioned_at = timezone.now()
            user.save()
            
            logger.info(f"FSD tools provisioned successfully for {user.email}")
            
            return {
                'workspace_url': workspace_url,
            }
            
        except Exception as e:
            logger.error(f"FSD tool provisioning failed: {str(e)}")
            raise
    
    @staticmethod
    def provision_dp_tools(user):
        """
        Provision tools for Data Pipeline track
        - Postgres schema (isolated database)
        - Apache Superset
        - Prefect
        - Jupyter/Streamlit
        
        Args:
            user: CustomUser instance
        
        Returns:
            dict: Tool URLs and credentials
        """
        logger.info(f"Provisioning DP tools for user {user.email}")
        
        try:
            # Provision Postgres schema
            from .postgres_provisioning import PostgresProvisioningService
            db_credentials = PostgresProvisioningService.provision_schema_for_student(user)
            logger.info(f"Postgres schema provisioned for {user.email}")
            
            # Create Superset instance
            superset_url = ProvisioningService._create_superset_instance(user)
            
            # Create Prefect workspace
            prefect_url = ProvisioningService._create_prefect_workspace(user)
            
            # Create Jupyter environment
            jupyter_url = ProvisioningService._create_jupyter_environment(user)
            
            # Update user record
            user.superset_url = superset_url
            user.prefect_url = prefect_url
            user.jupyter_url = jupyter_url
            user.tools_provisioned = True
            user.provisioned_at = timezone.now()
            user.save()
            
            logger.info(f"DP tools provisioned successfully for {user.email}")
            
            return {
                'superset_url': superset_url,
                'prefect_url': prefect_url,
                'jupyter_url': jupyter_url,
                'db_credentials': db_credentials,
            }
            
        except Exception as e:
            logger.error(f"DP tool provisioning failed: {str(e)}")
            raise
    
    @staticmethod
    def _create_codeserver_workspace(user):
        """
        Create a CodeServer workspace for FSD student
        
        Args:
            user: CustomUser instance
        
        Returns:
            str: Workspace URL
        """
        try:
            client = docker.from_env()
            
            # Container name
            container_name = f"workspace_{user.id}_fsd"
            
            # Check if container already exists
            try:
                existing = client.containers.get(container_name)
                if existing.status == 'running':
                    port = existing.attrs['NetworkSettings']['Ports']['8080/tcp'][0]['HostPort']
                    return f"http://localhost:{port}"
                else:
                    existing.remove(force=True)
            except docker.errors.NotFound:
                pass
            
            # Create new container
            container = client.containers.run(
                'codercom/code-server:latest',
                name=container_name,
                detach=True,
                environment={
                    'PASSWORD': f'student_{user.id}_password',  # TODO: Generate secure password
                },
                ports={'8080/tcp': None},  # Random host port
                volumes={
                    f'workspace_{user.id}_data': {'bind': '/home/coder/project', 'mode': 'rw'}
                },
                labels={
                    'user_id': str(user.id),
                    'track': 'FSD',
                    'type': 'codeserver',
                }
            )
            
            # Get assigned port
            container.reload()
            port = container.attrs['NetworkSettings']['Ports']['8080/tcp'][0]['HostPort']
            workspace_url = f"http://localhost:{port}"
            
            logger.info(f"CodeServer created for user {user.email} at {workspace_url}")
            
            return workspace_url
            
        except Exception as e:
            logger.error(f"Failed to create CodeServer: {str(e)}")
            raise
    
    @staticmethod
    def _create_superset_instance(user):
        """
        Create Apache Superset instance for DP student
        
        Args:
            user: CustomUser instance
        
        Returns:
            str: Superset URL
        """
        try:
            client = docker.from_env()
            
            container_name = f"workspace_{user.id}_dp"
            
            # Check if container already exists
            try:
                existing = client.containers.get(container_name)
                if existing.status == 'running':
                    port = existing.attrs['NetworkSettings']['Ports']['8088/tcp'][0]['HostPort']
                    return f"http://localhost:{port}"
                else:
                    existing.remove(force=True)
            except docker.errors.NotFound:
                pass
            
            # Create Superset container
            container = client.containers.run(
                'apache/superset:latest',
                name=container_name,
                detach=True,
                environment={
                    'SUPERSET_SECRET_KEY': f'student_{user.id}_secret',
                },
                ports={'8088/tcp': None},
                labels={
                    'user_id': str(user.id),
                    'track': 'DP',
                    'type': 'superset',
                }
            )
            
            # Get assigned port
            container.reload()
            port = container.attrs['NetworkSettings']['Ports']['8088/tcp'][0]['HostPort']
            superset_url = f"http://localhost:{port}"
            
            logger.info(f"Superset created for user {user.email} at {superset_url}")
            
            return superset_url
            
        except Exception as e:
            logger.error(f"Failed to create Superset: {str(e)}")
            raise
    
    @staticmethod
    def _create_prefect_workspace(user):
        """
        Create Prefect workspace for DP student
        
        Args:
            user: CustomUser instance
        
        Returns:
            str: Prefect URL
        """
        # For now, return shared Prefect instance
        # In production, create isolated workspace
        return "http://localhost:4200"
    
    @staticmethod
    def _create_jupyter_environment(user):
        """
        Create Jupyter environment for DP student
        
        Args:
            user: CustomUser instance
        
        Returns:
            str: Jupyter URL
        """
        # For now, return shared Jupyter instance
        # In production, create isolated environment
        return "http://localhost:8888"
    
    @staticmethod
    def deprovision_tools(user):
        """
        Remove all provisioned tools for a user
        
        Args:
            user: CustomUser instance
        """
        try:
            client = docker.from_env()
            
            # Find all containers for this user
            containers = client.containers.list(
                all=True,
                filters={'label': f'user_id={user.id}'}
            )
            
            for container in containers:
                logger.info(f"Removing container {container.name} for user {user.email}")
                container.remove(force=True)
            
            # Clear URLs
            user.workspace_url = ''
            user.superset_url = ''
            user.prefect_url = ''
            user.jupyter_url = ''
            user.tools_provisioned = False
            user.save()
            
            logger.info(f"Tools deprovisioned for user {user.email}")
            
        except Exception as e:
            logger.error(f"Failed to deprovision tools: {str(e)}")
            raise
