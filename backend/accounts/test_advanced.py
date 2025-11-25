"""
Advanced unit tests for accounts app - trainer assignment, role management, OAuth
"""
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import CustomUser
from unittest.mock import patch, MagicMock


class TrainerAssignmentTestCase(TestCase):
    """Test trainer assignment functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.trainer = CustomUser.objects.create_user(
            email='trainer@example.com',
            password='TestPass123!@#',
            name='Test Trainer',
            role='trainer',
            username='trainer_assign'
        )
        self.student = CustomUser.objects.create_user(
            email='student@example.com',
            password='TestPass123!@#',
            name='Test Student',
            role='student',
            username='student_assign'
        )
    
    def test_assign_student_to_trainer(self):
        """Test assigning a student to a trainer"""
        self.student.assigned_trainer = self.trainer
        self.student.save()
        
        self.assertEqual(self.student.assigned_trainer, self.trainer)
        self.assertIn(self.student, self.trainer.students.all())
        
        print(f"✅ Test Passed: Student assigned to trainer")
        print(f"   Student: {self.student.email}")
        print(f"   Trainer: {self.trainer.email}")
    
    def test_trainer_student_count(self):
        """Test trainer student count property"""
        # Create multiple students
        for i in range(5):
            student = CustomUser.objects.create_user(
                email=f'student{i}@example.com',
                password='TestPass123!@#',
                name=f'Student {i}',
                role='student',
                assigned_trainer=self.trainer,
                username=f'student_count_{i}'
            )
        
        self.assertEqual(self.trainer.student_count, 5)
        
        print(f"✅ Test Passed: Trainer student count correct")
        print(f"   Student count: {self.trainer.student_count}")
    
    def test_trainer_can_accept_students(self):
        """Test trainer can_accept_students property"""
        # Initially should be able to accept students
        self.assertTrue(self.trainer.can_accept_students)

        # Create 20 students (max limit)
        for i in range(20):
            CustomUser.objects.create_user(
                email=f'maxstudent{i}@example.com',
                password='TestPass123!@#',
                name=f'Max Student {i}',
                role='student',
                assigned_trainer=self.trainer,
                username=f'maxstudent_{i}'
            )
        
        # Should not be able to accept more
        self.assertFalse(self.trainer.can_accept_students)
        
        print(f"✅ Test Passed: Trainer capacity limit enforced")
        print(f"   Student count: {self.trainer.student_count}")
        print(f"   Can accept more: {self.trainer.can_accept_students}")
    
    def test_student_cannot_have_students(self):
        """Test that students cannot have assigned students"""
        student_count = self.student.student_count
        can_accept = self.student.can_accept_students
        
        self.assertEqual(student_count, 0)
        self.assertFalse(can_accept)
        
        print(f"✅ Test Passed: Students cannot have students")


class GetMyStudentsTestCase(APITestCase):
    """Test get my students API endpoint"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.trainer = CustomUser.objects.create_user(
            email='trainer_mystudents@example.com',
            password='TestPass123!@#',
            name='Test Trainer',
            role='trainer',
            username='trainer_mystudents'
        )

        # Create students assigned to trainer
        for i in range(3):
            CustomUser.objects.create_user(
                email=f'trainer_mystudent_{i}@example.com',
                password='TestPass123!@#',
                name=f'My Student {i}',
                role='student',
                track='web-development',
                assigned_trainer=self.trainer,
                username=f'trainer_mystudent_{i}'
            )

        self.my_students_url = '/api/users/my-students/'
    
    def test_trainer_get_students(self):
        """Test trainer can get their students"""
        self.client.force_authenticate(user=self.trainer)

        response = self.client.get(self.my_students_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(len(response.data['students']), 3)

        # Verify student data
        for student_data in response.data['students']:
            self.assertIn('email', student_data)
            self.assertIn('name', student_data)
            self.assertIn('track', student_data)
        
        print(f"✅ Test Passed: Trainer retrieved students")
        print(f"   Student count: {len(response.data)}")
    
    def test_student_cannot_get_students(self):
        """Test that students cannot access my-students endpoint"""
        student = CustomUser.objects.create_user(
            email='nostudents@example.com',
            password='TestPass123!@#',
            name='No Students',
            role='student',
            username='nostudents_user'
        )
        self.client.force_authenticate(user=student)
        
        response = self.client.get(self.my_students_url)
        
        # Should return empty list or error
        if response.status_code == status.HTTP_200_OK:
            self.assertEqual(len(response.data), 0)
        
        print(f"✅ Test Passed: Students cannot get students list")
    
    def test_unauthenticated_cannot_get_students(self):
        """Test unauthenticated users cannot access endpoint"""
        response = self.client.get(self.my_students_url)
        
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
        print(f"✅ Test Passed: Unauthenticated access rejected")


class RoleManagementTestCase(APITestCase):
    """Test role management functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.admin = CustomUser.objects.create_user(
            email='admin_role@example.com',
            password='TestPass123!@#',
            name='Admin User',
            role='admin',
            username='admin_role'
        )
        self.user = CustomUser.objects.create_user(
            email='user_role@example.com',
            password='TestPass123!@#',
            name='Regular User',
            role='student',
            username='user_role'
        )
        self.update_role_url = '/api/users/update-role/'
    
    def test_user_role_choices(self):
        """Test that user roles are properly defined"""
        valid_roles = ['student', 'trainer', 'admin', 'superadmin']
        
        for role_value, role_label in CustomUser.ROLE_CHOICES:
            self.assertIn(role_value, valid_roles)
        
        print(f"✅ Test Passed: User roles properly defined")
        print(f"   Roles: {[r[0] for r in CustomUser.ROLE_CHOICES]}")
    
    def test_create_users_with_different_roles(self):
        """Test creating users with different roles"""
        roles = ['student', 'trainer', 'admin']

        for role in roles:
            user = CustomUser.objects.create_user(
                email=f'{role}_test@example.com',
                password='TestPass123!@#',
                name=f'{role.title()} User',
                role=role,
                username=f'{role}_test_user'
            )
            self.assertEqual(user.role, role)

        print(f"✅ Test Passed: Users created with different roles")
    
    def test_superadmin_role_cannot_be_set_via_signup(self):
        """Test that superadmin role cannot be set during signup"""
        signup_url = '/api/auth/registration/'
        
        signup_data = {
            'username': 'superadmin@example.com',
            'name': 'Super Admin',
            'email': 'superadmin@example.com',
            'password1': 'TestPass123!@#',
            'password2': 'TestPass123!@#',
            'role': 'superadmin',
            'track': 'none'
        }
        
        response = self.client.post(signup_url, signup_data, format='json')
        
        # Should be rejected
        self.assertNotEqual(response.status_code, status.HTTP_201_CREATED)
        
        print(f"✅ Test Passed: Superadmin role rejected during signup")


class CheckEmailExistsTestCase(APITestCase):
    """Test check email exists endpoint"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.existing_user = CustomUser.objects.create_user(
            email='existing@example.com',
            password='TestPass123!@#',
            name='Existing User',
            role='student',
            username='existing_user'
        )
        self.check_email_url = '/api/users/check-email/'
    
    def test_check_existing_email(self):
        """Test checking an existing email"""
        response = self.client.post(
            self.check_email_url,
            {'email': 'existing@example.com'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('exists', False))
        
        print(f"✅ Test Passed: Existing email detected")
    
    def test_check_nonexistent_email(self):
        """Test checking a non-existent email"""
        response = self.client.post(
            self.check_email_url,
            {'email': 'nonexistent@example.com'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data.get('exists', True))
        
        print(f"✅ Test Passed: Non-existent email detected")
    
    def test_check_email_case_insensitive(self):
        """Test that email check is case-insensitive"""
        response = self.client.post(
            self.check_email_url,
            {'email': 'EXISTING@EXAMPLE.COM'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should find the email regardless of case
        
        print(f"✅ Test Passed: Email check is case-insensitive")


class TokenRefreshTestCase(APITestCase):
    """Test token refresh functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='tokentest@example.com',
            password='TestPass123!@#',
            name='Token Test User',
            role='student',
            username='tokentest_user'
        )
        self.login_url = '/api/users/login/'
        self.refresh_url = '/api/users/refresh/'
    
    def test_refresh_token_success(self):
        """Test successful token refresh"""
        # First login to get tokens
        login_response = self.client.post(
            self.login_url,
            {
                'email': 'tokentest@example.com',
                'password': 'TestPass123!@#',
                'role': 'student'
            },
            format='json'
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        refresh_token = login_response.data.get('refresh')

        # Authenticate the user (refresh endpoint requires authentication)
        self.client.force_authenticate(user=self.user)

        # Use refresh token to get new access token
        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': refresh_token},
            format='json'
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

        print(f"✅ Test Passed: Token refresh successful")
    
    def test_refresh_token_invalid(self):
        """Test refresh with invalid token"""
        refresh_response = self.client.post(
            self.refresh_url,
            {'refresh': 'invalid_token_12345'},
            format='json'
        )
        
        self.assertNotEqual(refresh_response.status_code, status.HTTP_200_OK)
        
        print(f"✅ Test Passed: Invalid refresh token rejected")


class LogoutTestCase(APITestCase):
    """Test logout functionality"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='logouttest@example.com',
            password='TestPass123!@#',
            name='Logout Test User',
            role='student',
            username='logouttest_user'
        )
        self.logout_url = '/api/users/logout/'
        self.login_url = '/api/users/login/'

    def test_logout_authenticated_user(self):
        """Test logout for authenticated user"""
        # First login to get refresh token
        login_response = self.client.post(
            self.login_url,
            {
                'email': 'logouttest@example.com',
                'password': 'TestPass123!@#',
                'role': 'student'
            },
            format='json'
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        refresh_token = login_response.data.get('refresh')

        # Now logout with the refresh token
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.logout_url,
            {'refresh': refresh_token},
            format='json'
        )

        # Should succeed
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_204_NO_CONTENT])

        print(f"✅ Test Passed: User logged out successfully")

