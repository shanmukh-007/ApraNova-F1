"""
Stripe Integration Service
Handles all Stripe-related operations for ApraNova LMS
"""
import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Payment, StripeCustomer

User = get_user_model()
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service class for Stripe operations"""
    
    # Pricing configuration (in cents)
    TRACK_PRICES = {
        'DP': 49900,   # $499 for Data Professional track
        'FSD': 59900,  # $599 for Full-Stack Developer track
    }
    
    @staticmethod
    def get_or_create_customer(user):
        """Get or create a Stripe customer for the user"""
        try:
            # Check if customer already exists
            stripe_customer = StripeCustomer.objects.filter(user=user).first()
            
            if stripe_customer:
                return stripe_customer.stripe_customer_id
            
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=user.email,
                name=user.name or user.username,
                metadata={
                    'user_id': user.id,
                    'role': user.role,
                }
            )
            
            # Save to database
            StripeCustomer.objects.create(
                user=user,
                stripe_customer_id=customer.id
            )
            
            return customer.id
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create Stripe customer: {str(e)}")
    
    @staticmethod
    def create_payment_intent(user, track, amount=None, currency='usd'):
        """
        Create a Stripe PaymentIntent for enrollment
        
        Args:
            user: User object
            track: Track code ('DP' or 'FSD')
            amount: Optional custom amount (in cents). If None, uses default track price
            currency: Currency code (default: 'usd')
        
        Returns:
            dict: Payment intent details including client_secret
        """
        try:
            # Get or create Stripe customer
            customer_id = StripeService.get_or_create_customer(user)
            
            # Determine amount
            if amount is None:
                amount = StripeService.TRACK_PRICES.get(track, 49900)
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                customer=customer_id,
                metadata={
                    'user_id': user.id,
                    'email': user.email,
                    'track': track,
                    'role': user.role,
                },
                automatic_payment_methods={'enabled': True},
                receipt_email=user.email,
                description=f"ApraNova {track} Track Enrollment - {user.email}",
            )
            
            # Save payment record
            Payment.objects.create(
                user=user,
                stripe_payment_intent=intent.id,
                stripe_customer_id=customer_id,
                amount=amount / 100,  # Convert cents to dollars
                currency=currency,
                status='CREATED',
                track=track,
            )
            
            return {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'amount': amount,
                'currency': currency,
            }
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create payment intent: {str(e)}")
    
    @staticmethod
    def retrieve_payment_intent(payment_intent_id):
        """Retrieve a payment intent from Stripe"""
        try:
            return stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve payment intent: {str(e)}")
    
    @staticmethod
    def create_refund(payment_intent_id, amount=None, reason=None):
        """
        Create a refund for a payment
        
        Args:
            payment_intent_id: Stripe payment intent ID
            amount: Optional partial refund amount (in cents). If None, full refund
            reason: Reason for refund
        
        Returns:
            dict: Refund details
        """
        try:
            refund_data = {
                'payment_intent': payment_intent_id,
            }
            
            if amount:
                refund_data['amount'] = amount
            
            if reason:
                refund_data['reason'] = reason
            
            refund = stripe.Refund.create(**refund_data)
            
            # Update payment record
            from django.utils import timezone
            payment = Payment.objects.filter(stripe_payment_intent=payment_intent_id).first()
            if payment:
                payment.refunded = True
                payment.refund_amount = (amount or payment.amount * 100) / 100
                payment.refund_reason = reason or ''
                payment.refunded_at = timezone.now()
                payment.status = 'REFUNDED'
                payment.save()
            
            return {
                'refund_id': refund.id,
                'amount': refund.amount,
                'status': refund.status,
            }
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create refund: {str(e)}")
    
    @staticmethod
    def get_customer_payment_methods(customer_id):
        """Get all payment methods for a customer"""
        try:
            return stripe.PaymentMethod.list(
                customer=customer_id,
                type='card',
            )
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve payment methods: {str(e)}")
    
    @staticmethod
    def create_anonymous_checkout_session(email, name, track, success_url, cancel_url):
        """
        Create a Stripe Checkout Session for anonymous user (payment-first flow)
        
        Args:
            email: User email
            name: User name
            track: Track code ('DP' or 'FSD')
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if payment is canceled
        
        Returns:
            dict: Checkout session details including URL
        """
        try:
            amount = StripeService.TRACK_PRICES.get(track, 49900)
            
            track_names = {
                'DP': 'Data Professional Track',
                'FSD': 'Full-Stack Developer Track',
            }
            
            session = stripe.checkout.Session.create(
                customer_email=email,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': track_names.get(track, 'ApraNova Track'),
                            'description': f'Enrollment in {track_names.get(track)}',
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url,
                metadata={
                    'email': email,
                    'name': name,
                    'track': track,
                    'anonymous_checkout': 'true',
                },
            )
            
            # Create payment record (without user)
            from .models import Payment
            Payment.objects.create(
                user=None,  # No user yet
                customer_email=email,
                customer_name=name,
                stripe_payment_intent='',  # Will be filled by webhook
                amount=amount / 100,
                currency='usd',
                status='CREATED',
                track=track,
            )
            
            return {
                'session_id': session.id,
                'url': session.url,
            }
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")
    
    @staticmethod
    def create_checkout_session(user, track, success_url, cancel_url):
        """
        Create a Stripe Checkout Session (alternative to PaymentIntent)
        
        Args:
            user: User object
            track: Track code ('DP' or 'FSD')
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if payment is canceled
        
        Returns:
            dict: Checkout session details including URL
        """
        try:
            customer_id = StripeService.get_or_create_customer(user)
            amount = StripeService.TRACK_PRICES.get(track, 49900)
            
            track_names = {
                'DP': 'Data Professional Track',
                'FSD': 'Full-Stack Developer Track',
            }
            
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': track_names.get(track, 'ApraNova Track'),
                            'description': f'Enrollment in {track_names.get(track)}',
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url,
                metadata={
                    'user_id': user.id,
                    'email': user.email,
                    'track': track,
                },
            )
            
            return {
                'session_id': session.id,
                'url': session.url,
            }
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")
    
    @staticmethod
    def create_anonymous_checkout_no_email(track, success_url, cancel_url):
        """
        Create a Stripe Checkout Session without pre-collected email
        Stripe will collect email and name on checkout page
        
        Args:
            track: Track code ('DP' or 'FSD')
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if payment is canceled
        
        Returns:
            dict: Checkout session details including URL
        """
        try:
            amount = StripeService.TRACK_PRICES.get(track, 49900)
            
            track_names = {
                'DP': 'Data Professional Track',
                'FSD': 'Full-Stack Developer Track',
            }
            
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': track_names.get(track, 'ApraNova Track'),
                            'description': f'Enrollment in {track_names.get(track)}',
                        },
                        'unit_amount': amount,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url,
                # Stripe will collect email
                customer_creation='always',
                billing_address_collection='required',
                metadata={
                    'track': track,
                    'anonymous_checkout': 'true',
                },
            )
            
            return {
                'session_id': session.id,
                'url': session.url,
            }
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")
    
    @staticmethod
    def verify_webhook_signature(payload, sig_header):
        """Verify Stripe webhook signature"""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError:
            raise Exception("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise Exception("Invalid signature")
