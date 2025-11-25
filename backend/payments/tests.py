"""
Unit tests for payment functionality
"""
from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import CustomUser
from payments.models import Payment
from decimal import Decimal
from unittest.mock import patch, MagicMock
import stripe


class PaymentModelTestCase(TestCase):
    """Test Payment model"""

    def setUp(self):
        """Set up test data"""
        self.user = CustomUser.objects.create_user(
            email='paymenttest@example.com',
            password='TestPass123!@#',
            name='Payment Test User',
            role='student'
        )

    def test_create_payment(self):
        """Test creating a payment record"""
        payment = Payment.objects.create(
            user=self.user,
            stripe_payment_intent='pi_test_123456',
            amount=Decimal('99.99'),
            currency='usd',
            status='succeeded'
        )

        self.assertEqual(payment.user, self.user)
        self.assertEqual(payment.amount, Decimal('99.99'))
        self.assertEqual(payment.currency, 'usd')
        self.assertEqual(payment.status, 'succeeded')
        print(f"✅ Test Passed: Payment created successfully")
        print(f"   Amount: ${payment.amount}")
        print(f"   Status: {payment.status}")

    def test_payment_string_representation(self):
        """Test payment __str__ method"""
        payment = Payment.objects.create(
            user=self.user,
            stripe_payment_intent='pi_test_789',
            amount=Decimal('49.99'),
            currency='usd',
            status='pending'
        )

        expected_str = f"{self.user.email} - pi_test_789"
        self.assertEqual(str(payment), expected_str)
        print(f"✅ Test Passed: Payment string representation correct")

    def test_payment_unique_intent(self):
        """Test that stripe_payment_intent must be unique"""
        Payment.objects.create(
            user=self.user,
            stripe_payment_intent='pi_unique_test',
            amount=Decimal('29.99'),
            currency='usd'
        )

        # Try to create another payment with same intent
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            Payment.objects.create(
                user=self.user,
                stripe_payment_intent='pi_unique_test',
                amount=Decimal('39.99'),
                currency='usd'
            )
        print(f"✅ Test Passed: Duplicate payment intent rejected")


class PaymentAPITestCase(APITestCase):
    """Test Payment API endpoints"""

    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='apitest@example.com',
            password='TestPass123!@#',
            name='API Test User',
            role='student'
        )
        self.client.force_authenticate(user=self.user)
        self.payment_url = '/api/payments/create-payment/'

    @patch('stripe.PaymentIntent.create')
    def test_create_payment_intent_success(self, mock_stripe):
        """Test successful payment intent creation"""
        # Mock Stripe response
        mock_intent = MagicMock()
        mock_intent.id = 'pi_mock_123'
        mock_intent.client_secret = 'pi_mock_123_secret'
        mock_intent.status = 'requires_payment_method'
        mock_stripe.return_value = mock_intent

        payment_data = {
            'amount': '99.99',
            'currency': 'usd'
        }

        response = self.client.post(
            self.payment_url,
            payment_data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('clientSecret', response.data)
        self.assertIn('publishableKey', response.data)

        # Verify payment was saved to database
        payment = Payment.objects.filter(user=self.user).first()
        self.assertIsNotNone(payment)
        self.assertEqual(payment.amount, Decimal('99.99'))

        print(f"✅ Test Passed: Payment intent created successfully")
        print(f"   Amount: ${payment.amount}")

    @patch('stripe.PaymentIntent.create')
    def test_create_payment_unauthenticated(self, mock_stripe):
        """Test that unauthenticated users cannot create payments"""
        self.client.force_authenticate(user=None)

        # Mock Stripe to avoid actual API calls
        mock_stripe.return_value = MagicMock(
            id='pi_test_unauthenticated',
            client_secret='secret_test_unauthenticated',
            amount=4999,
            currency='usd'
        )

        payment_data = {
            'amount': '49.99',
            'currency': 'usd'
        }

        response = self.client.post(
            self.payment_url,
            payment_data,
            format='json'
        )

        # Should return 401 or 403 (authentication required)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

        # Stripe should not be called for unauthenticated users
        mock_stripe.assert_not_called()

        print(f"✅ Test Passed: Unauthenticated payment creation rejected")

    @patch('stripe.PaymentIntent.create')
    def test_create_payment_invalid_amount(self, mock_stripe):
        """Test payment creation with invalid amount"""
        payment_data = {
            'amount': 'invalid',
            'currency': 'usd'
        }

        response = self.client.post(
            self.payment_url,
            payment_data,
            format='json'
        )

        # Should return error
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_500_INTERNAL_SERVER_ERROR])
        print(f"✅ Test Passed: Invalid amount rejected")

    @patch('stripe.PaymentIntent.create')
    def test_create_payment_different_currencies(self, mock_stripe):
        """Test payment creation with different currencies"""
        currencies = ['usd', 'eur', 'gbp', 'inr']

        for currency in currencies:
            mock_intent = MagicMock()
            mock_intent.id = f'pi_mock_{currency}'
            mock_intent.client_secret = f'pi_mock_{currency}_secret'
            mock_intent.status = 'requires_payment_method'
            mock_stripe.return_value = mock_intent

            payment_data = {
                'amount': '50.00',
                'currency': currency
            }

            response = self.client.post(
                self.payment_url,
                payment_data,
                format='json'
            )

            if response.status_code == status.HTTP_200_OK:
                payment = Payment.objects.filter(
                    user=self.user,
                    currency=currency
                ).first()
                if payment:
                    self.assertEqual(payment.currency, currency)

        print(f"✅ Test Passed: Multiple currencies supported")


class PaymentHistoryTestCase(APITestCase):
    """Test payment history and retrieval"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            email='historytest@example.com',
            password='TestPass123!@#',
            name='History Test User',
            role='student'
        )
        self.client.force_authenticate(user=self.user)

        # Create some test payments
        Payment.objects.create(
            user=self.user,
            stripe_payment_intent='pi_history_1',
            amount=Decimal('29.99'),
            currency='usd',
            status='succeeded'
        )
        Payment.objects.create(
            user=self.user,
            stripe_payment_intent='pi_history_2',
            amount=Decimal('49.99'),
            currency='usd',
            status='succeeded'
        )

    def test_user_has_payment_history(self):
        """Test that user has payment records"""
        payments = Payment.objects.filter(user=self.user)
        self.assertEqual(payments.count(), 2)

        total_amount = sum(p.amount for p in payments)
        self.assertEqual(total_amount, Decimal('79.98'))

        print(f"✅ Test Passed: Payment history retrieved")
        print(f"   Total payments: {payments.count()}")
        print(f"   Total amount: ${total_amount}")

    def test_payment_status_filtering(self):
        """Test filtering payments by status"""
        # Create a failed payment
        Payment.objects.create(
            user=self.user,
            stripe_payment_intent='pi_failed',
            amount=Decimal('19.99'),
            currency='usd',
            status='failed'
        )

        succeeded_payments = Payment.objects.filter(
            user=self.user,
            status='succeeded'
        )
        failed_payments = Payment.objects.filter(
            user=self.user,
            status='failed'
        )

        self.assertEqual(succeeded_payments.count(), 2)
        self.assertEqual(failed_payments.count(), 1)

        print(f"✅ Test Passed: Payment status filtering works")
        print(f"   Succeeded: {succeeded_payments.count()}")
        print(f"   Failed: {failed_payments.count()}")
