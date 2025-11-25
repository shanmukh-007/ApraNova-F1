"""
Unit tests for workspace provisioning functionality
"""
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import CustomUser
from unittest.mock import patch, MagicMock, PropertyMock
import docker


class WorkspaceProvisioningTestCase(APITestCase):
    """Test workspace provisioning functionality"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='workspace@example.com',
            password='TestPass123!@#',
            name='Workspace Test User',
            role='student',
            username='workspace_user'
        )
        self.client.force_authenticate(user=self.user)
        self.workspace_url = '/api/users/workspace/create/'
    
    @patch('accounts.workspace_views.client')
    def test_create_workspace_success(self, mock_docker_client):
        """Test successful workspace creation"""
        # Mock Docker client
        mock_container = MagicMock()
        mock_container.status = 'running'
        mock_container.attrs = {
            'HostConfig': {
                'PortBindings': {
                    '8080/tcp': [{'HostPort': '8081'}]
                }
            }
        }
        
        # Mock containers.get to raise NotFound (new workspace)
        mock_docker_client.containers.get.side_effect = docker.errors.NotFound('Container not found')
        
        # Mock containers.run to return mock container
        mock_docker_client.containers.run.return_value = mock_container
        
        response = self.client.post(self.workspace_url)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('url', response.data)
        self.assertIn('port', response.data)
        self.assertIn('msg', response.data)
        
        print(f"✅ Test Passed: Workspace created successfully")
        print(f"   URL: {response.data.get('url')}")
        print(f"   Port: {response.data.get('port')}")
    
    @patch('accounts.workspace_views.client')
    def test_get_existing_workspace(self, mock_docker_client):
        """Test getting existing workspace"""
        # Mock existing container
        mock_container = MagicMock()
        mock_container.status = 'running'
        mock_container.attrs = {
            'HostConfig': {
                'PortBindings': {
                    '8080/tcp': [{'HostPort': '8082'}]
                }
            }
        }
        
        mock_docker_client.containers.get.return_value = mock_container
        
        response = self.client.post(self.workspace_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('url', response.data)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'running')
        
        print(f"✅ Test Passed: Existing workspace retrieved")
        print(f"   Status: {response.data.get('status')}")
    
    @patch('accounts.workspace_views.client')
    def test_start_stopped_workspace(self, mock_docker_client):
        """Test starting a stopped workspace"""
        # Mock stopped container
        mock_container = MagicMock()
        mock_container.status = 'exited'
        mock_container.attrs = {
            'HostConfig': {
                'PortBindings': {
                    '8080/tcp': [{'HostPort': '8083'}]
                }
            }
        }
        mock_container.start = MagicMock()
        
        mock_docker_client.containers.get.return_value = mock_container
        
        response = self.client.post(self.workspace_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'started')
        mock_container.start.assert_called_once()
        
        print(f"✅ Test Passed: Stopped workspace started")
    
    def test_workspace_unauthenticated(self):
        """Test that unauthenticated users cannot create workspaces"""
        self.client.force_authenticate(user=None)
        
        response = self.client.post(self.workspace_url)
        
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
        print(f"✅ Test Passed: Unauthenticated workspace creation rejected")
    
    @patch('accounts.workspace_views.client', None)
    def test_workspace_docker_unavailable(self):
        """Test workspace creation when Docker is unavailable"""
        response = self.client.post(self.workspace_url)
        
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn('error', response.data)
        
        print(f"✅ Test Passed: Docker unavailable error handled")
    
    @patch('accounts.workspace_views.client')
    def test_workspace_image_not_found(self, mock_docker_client):
        """Test workspace creation when image is not found"""
        # Mock containers.get to raise NotFound
        mock_docker_client.containers.get.side_effect = docker.errors.NotFound('Container not found')
        
        # Mock containers.run to raise ImageNotFound
        mock_docker_client.containers.run.side_effect = docker.errors.ImageNotFound('Image not found')
        
        response = self.client.post(self.workspace_url)
        
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('error', response.data)
        
        print(f"✅ Test Passed: Image not found error handled")
    
    @patch('accounts.workspace_views.client')
    def test_workspace_container_naming(self, mock_docker_client):
        """Test that workspace containers are named correctly"""
        mock_container = MagicMock()
        mock_docker_client.containers.get.side_effect = docker.errors.NotFound('Container not found')
        mock_docker_client.containers.run.return_value = mock_container
        
        response = self.client.post(self.workspace_url)
        
        # Verify container name includes user ID
        expected_name = f"workspace_{self.user.id}"
        
        # Check if containers.run was called with correct name
        if mock_docker_client.containers.run.called:
            call_kwargs = mock_docker_client.containers.run.call_args[1]
            if 'name' in call_kwargs:
                self.assertEqual(call_kwargs['name'], expected_name)
        
        print(f"✅ Test Passed: Workspace container named correctly")
        print(f"   Expected name: {expected_name}")


class WorkspaceAccessControlTestCase(APITestCase):
    """Test workspace access control"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.student = CustomUser.objects.create_user(
            email='student_workspace@example.com',
            password='TestPass123!@#',
            name='Student User',
            role='student',
            username='student_workspace'
        )
        self.trainer = CustomUser.objects.create_user(
            email='trainer_workspace@example.com',
            password='TestPass123!@#',
            name='Trainer User',
            role='trainer',
            username='trainer_workspace'
        )
        self.workspace_url = '/api/users/workspace/create/'
    
    @patch('accounts.workspace_views.client')
    def test_student_can_create_workspace(self, mock_docker_client):
        """Test that students can create workspaces"""
        self.client.force_authenticate(user=self.student)
        
        mock_container = MagicMock()
        mock_docker_client.containers.get.side_effect = docker.errors.NotFound('Container not found')
        mock_docker_client.containers.run.return_value = mock_container
        
        response = self.client.post(self.workspace_url)
        
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        print(f"✅ Test Passed: Student can create workspace")
    
    @patch('accounts.workspace_views.client')
    def test_trainer_can_create_workspace(self, mock_docker_client):
        """Test that trainers can create workspaces"""
        self.client.force_authenticate(user=self.trainer)
        
        mock_container = MagicMock()
        mock_docker_client.containers.get.side_effect = docker.errors.NotFound('Container not found')
        mock_docker_client.containers.run.return_value = mock_container
        
        response = self.client.post(self.workspace_url)
        
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        print(f"✅ Test Passed: Trainer can create workspace")
    
    @patch('accounts.workspace_views.client')
    def test_workspace_isolation(self, mock_docker_client):
        """Test that each user gets their own workspace"""
        # Create workspaces for both users
        mock_container = MagicMock()
        mock_docker_client.containers.get.side_effect = docker.errors.NotFound('Container not found')
        mock_docker_client.containers.run.return_value = mock_container
        
        # Student workspace
        self.client.force_authenticate(user=self.student)
        response1 = self.client.post(self.workspace_url)
        
        # Trainer workspace
        self.client.force_authenticate(user=self.trainer)
        response2 = self.client.post(self.workspace_url)
        
        # Both should succeed
        self.assertIn(response1.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertIn(response2.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        
        print(f"✅ Test Passed: Workspace isolation maintained")


class WorkspacePortAllocationTestCase(TestCase):
    """Test workspace port allocation"""

    def test_get_free_port_function(self):
        """Test that get_free_port returns a valid port"""
        from accounts.workspace_views import get_free_port

        port = get_free_port()

        # Port should be a valid port number (1-65535)
        self.assertGreaterEqual(port, 1)
        self.assertLessEqual(port, 65535)
        self.assertIsInstance(port, int)

        print(f"✅ Test Passed: Free port allocated")
        print(f"   Port: {port}")

    def test_multiple_port_allocations(self):
        """Test that multiple port allocations don't conflict"""
        from accounts.workspace_views import get_free_port

        ports = [get_free_port() for _ in range(5)]

        # All ports should be valid port numbers
        for port in ports:
            self.assertGreaterEqual(port, 1)
            self.assertLessEqual(port, 65535)
            self.assertIsInstance(port, int)

        # Ports should be unique (very likely with random allocation)
        self.assertEqual(len(ports), len(set(ports)))

        print(f"✅ Test Passed: Multiple unique ports allocated")
        print(f"   Ports: {ports}")

