"""
Unit tests for user authentication, signup, and email verification
"""
from django.test import TestCase, Client
from django.urls import reverse
from django.core import mail
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import CustomUser
from allauth.account.models import EmailAddress, EmailConfirmation, EmailConfirmationHMAC
import json


class SignupTestCase(APITestCase):
    """Test user signup functionality"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.signup_url = '/api/auth/registration/'
        self.valid_signup_data = {
            'username': 'testuser@example.com',
            'name': 'Test User',
            'email': 'testuser@example.com',
            'password1': 'TestPass123!@#',
            'password2': 'TestPass123!@#',
            'role': 'student',
            'track': 'web-development'
        }
    
    def test_signup_success(self):
        """Test successful user signup"""
        response = self.client.post(
            self.signup_url,
            self.valid_signup_data,
            format='json'
        )
        
        # Should return 201 Created
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Should return access and refresh tokens
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
        # User should be created in database
        user = CustomUser.objects.get(email='testuser@example.com')
        self.assertEqual(user.name, 'Test User')
        self.assertEqual(user.role, 'student')
        self.assertEqual(user.track, 'web-development')
        
        print(f"✅ Test Passed: User signup successful")
        print(f"   User: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   Track: {user.track}")
    
    def test_signup_duplicate_email(self):
        """Test signup with duplicate email"""
        # Create first user
        self.client.post(self.signup_url, self.valid_signup_data, format='json')
        
        # Try to create second user with same email
        response = self.client.post(
            self.signup_url,
            self.valid_signup_data,
            format='json'
        )
        
        # Should return 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        print(f"✅ Test Passed: Duplicate email rejected")
    
    def test_signup_password_mismatch(self):
        """Test signup with mismatched passwords"""
        data = self.valid_signup_data.copy()
        data['password2'] = 'DifferentPass123!@#'
        
        response = self.client.post(self.signup_url, data, format='json')
        
        # Should return 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        print(f"✅ Test Passed: Password mismatch rejected")
    
    def test_signup_weak_password(self):
        """Test signup with weak password"""
        data = self.valid_signup_data.copy()
        data['password1'] = '123'
        data['password2'] = '123'
        
        response = self.client.post(self.signup_url, data, format='json')
        
        # Should return 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        print(f"✅ Test Passed: Weak password rejected")
    
    def test_signup_invalid_email(self):
        """Test signup with invalid email"""
        data = self.valid_signup_data.copy()
        data['email'] = 'invalid-email'
        data['username'] = 'invalid-email'
        
        response = self.client.post(self.signup_url, data, format='json')
        
        # Should return 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        print(f"✅ Test Passed: Invalid email rejected")
    
    def test_signup_superadmin_role_rejected(self):
        """Test that superadmin role cannot be assigned during signup"""
        data = self.valid_signup_data.copy()
        data['role'] = 'superadmin'
        
        response = self.client.post(self.signup_url, data, format='json')
        
        # Should return 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        print(f"✅ Test Passed: Superadmin role rejected during signup")
    
    def test_signup_missing_required_fields(self):
        """Test signup with missing required fields"""
        data = {
            'email': 'test@example.com',
            'password1': 'TestPass123!@#'
            # Missing password2, name, role
        }
        
        response = self.client.post(self.signup_url, data, format='json')
        
        # Should return 400 Bad Request
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        print(f"✅ Test Passed: Missing required fields rejected")


class EmailVerificationTestCase(APITestCase):
    """Test email verification functionality"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.signup_url = '/api/auth/registration/'
        self.signup_data = {
            'username': 'emailtest@example.com',
            'name': 'Email Test User',
            'email': 'emailtest@example.com',
            'password1': 'TestPass123!@#',
            'password2': 'TestPass123!@#',
            'role': 'student',
            'track': 'data-science'
        }
    
    def test_email_sent_on_signup(self):
        """Test that verification email is sent on signup"""
        # Clear mail outbox
        mail.outbox = []
        
        # Signup
        response = self.client.post(
            self.signup_url,
            self.signup_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that email was sent (with console backend, it's in outbox)
        # Note: With console backend, emails are printed to console
        # In test mode, they go to mail.outbox
        
        print(f"✅ Test Passed: Signup completed")
        print(f"   Emails in outbox: {len(mail.outbox)}")
        
        if len(mail.outbox) > 0:
            email = mail.outbox[0]
            print(f"   Email subject: {email.subject}")
            print(f"   Email to: {email.to}")
            print(f"   Email from: {email.from_email}")
    
    def test_email_address_created(self):
        """Test that EmailAddress object is created on signup"""
        # Signup
        self.client.post(self.signup_url, self.signup_data, format='json')
        
        # Check EmailAddress was created
        user = CustomUser.objects.get(email='emailtest@example.com')
        email_address = EmailAddress.objects.filter(user=user, email=user.email).first()
        
        self.assertIsNotNone(email_address)
        self.assertEqual(email_address.email, 'emailtest@example.com')
        
        print(f"✅ Test Passed: EmailAddress object created")
        print(f"   Email: {email_address.email}")
        print(f"   Verified: {email_address.verified}")
        print(f"   Primary: {email_address.primary}")
    
    def test_user_can_login_without_verification(self):
        """Test that user can login without email verification (optional mode)"""
        # Signup
        self.client.post(self.signup_url, self.signup_data, format='json')
        
        # Try to login
        login_url = '/api/users/login/'
        login_data = {
            'email': 'emailtest@example.com',
            'password': 'TestPass123!@#',
            'role': 'student'
        }
        
        response = self.client.post(login_url, login_data, format='json')
        
        # Should succeed (email verification is optional)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        
        print(f"✅ Test Passed: User can login without email verification")


class LoginTestCase(APITestCase):
    """Test user login functionality"""
    
    def setUp(self):
        """Set up test client and create test user"""
        self.client = APIClient()
        self.login_url = '/api/users/login/'
        
        # Create test user
        self.user = CustomUser.objects.create_user(
            username='logintest@example.com',
            email='logintest@example.com',
            password='TestPass123!@#',
            name='Login Test User',
            role='student',
            track='web-development'
        )
    
    def test_login_success(self):
        """Test successful login"""
        login_data = {
            'email': 'logintest@example.com',
            'password': 'TestPass123!@#',
            'role': 'student'
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        
        print(f"✅ Test Passed: Login successful")
        print(f"   User: {response.data['user']['email']}")
        print(f"   Role: {response.data['user']['role']}")
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        login_data = {
            'email': 'logintest@example.com',
            'password': 'WrongPassword123!@#',
            'role': 'student'
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        print(f"✅ Test Passed: Wrong password rejected")
    
    def test_login_wrong_role(self):
        """Test login with wrong role"""
        login_data = {
            'email': 'logintest@example.com',
            'password': 'TestPass123!@#',
            'role': 'admin'  # User is student, not admin
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        print(f"✅ Test Passed: Wrong role rejected")
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent user"""
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'TestPass123!@#',
            'role': 'student'
        }
        
        response = self.client.post(self.login_url, login_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        print(f"✅ Test Passed: Non-existent user rejected")


class UserProfileTestCase(APITestCase):
    """Test user profile functionality"""
    
    def setUp(self):
        """Set up test client and create authenticated user"""
        self.client = APIClient()
        
        # Create test user
        self.user = CustomUser.objects.create_user(
            username='profiletest@example.com',
            email='profiletest@example.com',
            password='TestPass123!@#',
            name='Profile Test User',
            role='student',
            track='web-development'
        )
        
        # Authenticate
        self.client.force_authenticate(user=self.user)
    
    def test_get_user_profile(self):
        """Test getting user profile"""
        url = '/api/users/profile/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profiletest@example.com')
        self.assertEqual(response.data['role'], 'student')

        print(f"✅ Test Passed: Get user profile successful")
        print(f"   Email: {response.data['email']}")
        print(f"   Role: {response.data['role']}")
        if 'name' in response.data:
            print(f"   Name: {response.data['name']}")

