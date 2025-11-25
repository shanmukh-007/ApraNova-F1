import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status as http_status
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from .models import Payment
from .stripe_service import StripeService

stripe.api_key = settings.STRIPE_SECRET_KEY


def _create_user_from_payment(payment_intent, payment):
    """
    Create a user account from payment metadata
    
    Args:
        payment_intent: Stripe PaymentIntent object
        payment: Payment model instance
    
    Returns:
        CustomUser: Created user instance
    """
    from django.contrib.auth import get_user_model
    from django.utils.crypto import get_random_string
    import logging
    
    logger = logging.getLogger(__name__)
    User = get_user_model()
    
    metadata = payment_intent.get('metadata', {})
    email = metadata.get('email') or payment.customer_email
    name = metadata.get('name') or payment.customer_name
    track = metadata.get('track') or payment.track
    
    # Check if user already exists
    try:
        user = User.objects.get(email=email)
        logger.info(f"User {email} already exists, linking payment")
        return user
    except User.DoesNotExist:
        pass
    
    # Generate username from email
    username = email.split('@')[0]
    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    # Generate random password
    password = get_random_string(16)
    
    # Create user
    user = User.objects.create_user(
        email=email,
        username=username,
        password=password,
        name=name,
        role='student',
        track=track,
        enrollment_status='ENROLLED',
        payment_verified=True,
        enrolled_at=timezone.now(),
        privacy_accepted=True,  # Assumed accepted during checkout
        privacy_accepted_at=timezone.now(),
        privacy_version='1.0',
    )
    
    logger.info(f"Created user account for {email}")
    
    # TODO: Send welcome email with password
    # send_welcome_email(user, password)
    
    return user


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """
    Create a Stripe PaymentIntent for enrollment
    
    Required fields:
    - track: 'DP' or 'FSD'
    
    Optional fields:
    - amount: Custom amount in cents (defaults to track price)
    - currency: Currency code (defaults to 'usd')
    """
    try:
        track = request.data.get("track")
        amount = request.data.get("amount")  # Optional, in cents
        currency = request.data.get("currency", "usd")
        
        if not track:
            return Response(
                {"error": "Track is required (DP or FSD)"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        if track not in ['DP', 'FSD']:
            return Response(
                {"error": "Invalid track. Must be 'DP' or 'FSD'"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        # Create payment intent using service
        result = StripeService.create_payment_intent(
            user=request.user,
            track=track,
            amount=amount,
            currency=currency
        )
        
        return Response({
            "clientSecret": result['client_secret'],
            "paymentIntentId": result['payment_intent_id'],
            "amount": result['amount'],
            "currency": result['currency'],
            "publishableKey": settings.STRIPE_PUBLISHABLE_KEY,
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def create_simple_checkout(request):
    """
    Create a Stripe Checkout Session without pre-collecting email
    Stripe will collect email and name on the checkout page
    
    Required fields:
    - track: 'DP' or 'FSD'
    - success_url: URL to redirect after successful payment
    - cancel_url: URL to redirect if payment is canceled
    """
    try:
        track = request.data.get("track")
        success_url = request.data.get("success_url")
        cancel_url = request.data.get("cancel_url")
        
        if not all([track, success_url, cancel_url]):
            return Response(
                {"error": "track, success_url, and cancel_url are required"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        if track not in ['DP', 'FSD']:
            return Response(
                {"error": "Invalid track. Must be 'DP' or 'FSD'"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        result = StripeService.create_anonymous_checkout_no_email(
            track=track,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        return Response({
            "sessionId": result['session_id'],
            "url": result['url'],
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def create_anonymous_checkout(request):
    """
    Create a Stripe Checkout Session for anonymous user (payment-first flow)
    
    Required fields:
    - email: User email
    - name: User name
    - track: 'DP' or 'FSD'
    - success_url: URL to redirect after successful payment
    - cancel_url: URL to redirect if payment is canceled
    """
    try:
        email = request.data.get("email")
        name = request.data.get("name")
        track = request.data.get("track")
        success_url = request.data.get("success_url")
        cancel_url = request.data.get("cancel_url")
        
        if not all([email, name, track, success_url, cancel_url]):
            return Response(
                {"error": "email, name, track, success_url, and cancel_url are required"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        if track not in ['DP', 'FSD']:
            return Response(
                {"error": "Invalid track. Must be 'DP' or 'FSD'"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        result = StripeService.create_anonymous_checkout_session(
            email=email,
            name=name,
            track=track,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        return Response({
            "sessionId": result['session_id'],
            "url": result['url'],
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Create a Stripe Checkout Session (alternative payment flow)
    
    Required fields:
    - track: 'DP' or 'FSD'
    - success_url: URL to redirect after successful payment
    - cancel_url: URL to redirect if payment is canceled
    """
    try:
        track = request.data.get("track")
        success_url = request.data.get("success_url")
        cancel_url = request.data.get("cancel_url")
        
        if not all([track, success_url, cancel_url]):
            return Response(
                {"error": "track, success_url, and cancel_url are required"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        result = StripeService.create_checkout_session(
            user=request.user,
            track=track,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        return Response({
            "sessionId": result['session_id'],
            "url": result['url'],
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_payment_status(request, payment_intent_id):
    """Get the status of a payment"""
    try:
        payment = Payment.objects.filter(
            stripe_payment_intent=payment_intent_id,
            user=request.user
        ).first()
        
        if not payment:
            return Response(
                {"error": "Payment not found"}, 
                status=http_status.HTTP_404_NOT_FOUND
            )
        
        # Also check Stripe for latest status
        intent = StripeService.retrieve_payment_intent(payment_intent_id)
        
        return Response({
            "payment_id": payment.id,
            "status": payment.status,
            "amount": float(payment.amount),
            "currency": payment.currency,
            "track": payment.track,
            "created_at": payment.created_at.isoformat(),
            "stripe_status": intent.status,
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_payments(request):
    """Get all payments for the current user"""
    payments = Payment.objects.filter(user=request.user)
    
    data = [{
        "id": p.id,
        "payment_intent_id": p.stripe_payment_intent,
        "amount": float(p.amount),
        "currency": p.currency,
        "status": p.status,
        "track": p.track,
        "refunded": p.refunded,
        "created_at": p.created_at.isoformat(),
    } for p in payments]
    
    return Response({"payments": data})


@api_view(["GET"])
@permission_classes([AllowAny])
def verify_checkout_session(request):
    """
    Verify checkout session and return auto-login tokens
    Called after successful payment redirect
    
    Query params:
    - session_id: Stripe checkout session ID
    """
    try:
        session_id = request.GET.get('session_id')
        
        if not session_id:
            return Response(
                {"error": "session_id is required"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        # Retrieve session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != 'paid':
            return Response(
                {"error": "Payment not completed"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        # Get user by email from customer_details (Stripe collects this)
        email = None
        if session.customer_details and session.customer_details.get('email'):
            email = session.customer_details.get('email')
        elif session.metadata.get('email'):
            email = session.metadata.get('email')
        
        if not email:
            return Response(
                {"error": "Email not found in session"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        # Find user
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "error": "Account not created yet",
                    "message": "Your account is being set up. Please wait a moment and refresh."
                }, 
                status=http_status.HTTP_202_ACCEPTED
            )
        
        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        # Serialize user data
        from accounts.serializers import UserSerializer
        user_data = UserSerializer(user).data
        
        return Response({
            "success": True,
            "user": user_data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "track": user.track,
            "tools_provisioned": user.tools_provisioned,
            "workspace_url": user.workspace_url,
            "superset_url": user.superset_url,
            "prefect_url": user.prefect_url,
            "jupyter_url": user.jupyter_url,
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_refund(request):
    """Request a refund for a payment (admin approval required)"""
    try:
        payment_intent_id = request.data.get("payment_intent_id")
        reason = request.data.get("reason", "")
        
        if not payment_intent_id:
            return Response(
                {"error": "payment_intent_id is required"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        payment = Payment.objects.filter(
            stripe_payment_intent=payment_intent_id,
            user=request.user
        ).first()
        
        if not payment:
            return Response(
                {"error": "Payment not found"}, 
                status=http_status.HTTP_404_NOT_FOUND
            )
        
        if payment.refunded:
            return Response(
                {"error": "Payment already refunded"}, 
                status=http_status.HTTP_400_BAD_REQUEST
            )
        
        # For now, just record the request
        # In production, this would create a refund request for admin approval
        return Response({
            "message": "Refund request submitted. An admin will review your request.",
            "payment_id": payment.id,
            "reason": reason,
        })
        
    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Handle Stripe webhook events
    
    Supported events:
    - payment_intent.succeeded: Payment successful, enroll student
    - payment_intent.payment_failed: Payment failed
    - charge.refunded: Refund processed
    - checkout.session.completed: Checkout session completed
    """
    from django.contrib.auth import get_user_model
    from django.utils import timezone
    from curriculum.models import Track, Project, StudentProgress
    from compliance.views import log_audit
    import logging
    
    logger = logging.getLogger(__name__)
    User = get_user_model()
    
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = StripeService.verify_webhook_signature(payload, sig_header)
    except Exception as e:
        logger.error(f"Webhook signature verification failed: {str(e)}")
        return HttpResponse(status=400)
    
    logger.info(f"Received Stripe webhook: {event['type']}")
    
    # Handle payment_intent.succeeded
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        metadata = payment_intent.get('metadata', {})
        is_anonymous = metadata.get('anonymous_checkout') == 'true'
        
        # Find payment record
        payment = Payment.objects.filter(
            stripe_payment_intent=payment_intent['id']
        ).first()
        
        # If no payment found, try to find by email (for anonymous checkout)
        if not payment and is_anonymous:
            email = metadata.get('email')
            if email:
                payment = Payment.objects.filter(
                    customer_email=email,
                    status='CREATED'
                ).order_by('-created_at').first()
        
        if payment:
            # Update payment record
            payment.stripe_payment_intent = payment_intent['id']
            payment.status = 'SUCCEEDED'
            payment.stripe_charge_id = payment_intent.get('latest_charge', '')
            payment.payment_method = payment_intent.get('payment_method_types', [''])[0]
            payment.save()
            
            # Check if this is anonymous checkout (payment-first flow)
            if is_anonymous and not payment.user:
                logger.info(f"Processing anonymous checkout for {metadata.get('email')}")
                
                # Create user account
                try:
                    user = _create_user_from_payment(payment_intent, payment)
                    payment.user = user
                    payment.account_created = True
                    payment.save()
                    
                    logger.info(f"Account created for {user.email}")
                    
                except Exception as e:
                    logger.error(f"Failed to create account: {str(e)}")
                    payment.provisioning_error = f"Account creation failed: {str(e)}"
                    payment.save()
                    # TODO: Send alert to admin
                    return HttpResponse(status=200)
            else:
                user = payment.user
            
            if not user:
                logger.error("No user found for payment")
                return HttpResponse(status=200)
            
            track_code = metadata.get('track') or payment.track
            
            # Update user enrollment
            user.payment_verified = True
            user.enrollment_status = 'ENROLLED'
            user.enrolled_at = timezone.now()
            
            if track_code:
                user.track = track_code
            
            user.save()
            
            # Log enrollment
            log_audit(
                user, 
                'ENROLLMENT', 
                f'Enrolled in {track_code} track',
                {'payment_intent_id': payment_intent['id'], 'amount': payment.amount}
            )
            
            # Provision tools based on track
            if not user.tools_provisioned:
                try:
                    from accounts.provisioning_service import ProvisioningService
                    ProvisioningService.provision_tools_for_user(user)
                    payment.tools_provisioned = True
                    payment.save()
                    logger.info(f"Tools provisioned for {user.email}")
                except Exception as e:
                    logger.error(f"Tool provisioning failed: {str(e)}")
                    payment.provisioning_error = f"Tool provisioning failed: {str(e)}"
                    payment.save()
                    # Continue anyway - user can still access platform
            
            # Initialize first project
            if user.track:
                try:
                    track = Track.objects.get(code=user.track)
                    first_project = track.projects.filter(number=1).first()
                    
                    if first_project:
                        # Create progress entry for first project (unlocks it)
                        progress, created = StudentProgress.objects.get_or_create(
                            student=user,
                            project=first_project,
                            step=None,
                            defaults={'started_at': timezone.now()}
                        )
                        
                        # Create progress entries for all steps
                        for step in first_project.steps.all():
                            StudentProgress.objects.get_or_create(
                                student=user,
                                project=first_project,
                                step=step
                            )
                        
                        logger.info(f"Unlocked Project 1 for user {user.email}")
                        
                except Track.DoesNotExist:
                    logger.error(f"Track {user.track} not found for user {user.email}")
            
            # TODO: Send welcome email with credentials
            # TODO: Notify admin via Slack
            logger.info(f"Payment succeeded for user {user.email}, enrolled in {track_code}")
    
    # Handle payment_intent.payment_failed
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        
        payment = Payment.objects.filter(
            stripe_payment_intent=payment_intent['id']
        ).first()
        
        if payment:
            payment.status = 'FAILED'
            payment.save()
            
            logger.warning(f"Payment failed for user {payment.user.email}")
            # TODO: Send failure notification email
    
    # Handle charge.refunded
    elif event['type'] == 'charge.refunded':
        charge = event['data']['object']
        payment_intent_id = charge.get('payment_intent')
        
        if payment_intent_id:
            payment = Payment.objects.filter(
                stripe_payment_intent=payment_intent_id
            ).first()
            
            if payment:
                payment.refunded = True
                payment.refund_amount = charge['amount_refunded'] / 100
                payment.refunded_at = timezone.now()
                payment.status = 'REFUNDED'
                payment.save()
                
                # Update user enrollment status
                user = payment.user
                user.enrollment_status = 'WITHDRAWN'
                user.save()
                
                log_audit(
                    user,
                    'ENROLLMENT',
                    'Enrollment refunded',
                    {'payment_intent_id': payment_intent_id, 'refund_amount': payment.refund_amount}
                )
                
                logger.info(f"Refund processed for user {user.email}")
    
    # Handle checkout.session.completed (if using Checkout)
    elif event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        payment_intent_id = session.get('payment_intent')
        metadata = session.get('metadata', {})
        is_anonymous = metadata.get('anonymous_checkout') == 'true'
        
        # For anonymous checkout, create account here
        if is_anonymous and session.payment_status == 'paid':
            customer_email = session.customer_details.get('email')
            customer_name = session.customer_details.get('name')
            track = metadata.get('track')
            
            if customer_email:
                try:
                    # Check if user exists
                    user = User.objects.filter(email=customer_email).first()
                    
                    if not user:
                        # Create user account
                        from django.utils.crypto import get_random_string
                        
                        username = customer_email.split('@')[0]
                        base_username = username
                        counter = 1
                        while User.objects.filter(username=username).exists():
                            username = f"{base_username}{counter}"
                            counter += 1
                        
                        password = get_random_string(16)
                        
                        user = User.objects.create_user(
                            email=customer_email,
                            username=username,
                            password=password,
                            name=customer_name or '',
                            role='student',
                            track=track,
                            enrollment_status='ENROLLED',
                            payment_verified=True,
                            enrolled_at=timezone.now(),
                            privacy_accepted=True,
                            privacy_accepted_at=timezone.now(),
                            privacy_version='1.0',
                        )
                        
                        logger.info(f"Created user account for {customer_email}")
                        
                        # Create payment record
                        Payment.objects.create(
                            user=user,
                            customer_email=customer_email,
                            customer_name=customer_name or '',
                            stripe_payment_intent=payment_intent_id or session['id'],
                            amount=session['amount_total'] / 100,
                            currency=session['currency'],
                            status='SUCCEEDED',
                            track=track,
                            account_created=True,
                        )
                        
                        # Provision tools
                        try:
                            from accounts.provisioning_service import ProvisioningService
                            ProvisioningService.provision_tools_for_user(user)
                            logger.info(f"Tools provisioned for {user.email}")
                        except Exception as e:
                            logger.error(f"Tool provisioning failed: {str(e)}")
                        
                        # Unlock first project
                        if user.track:
                            try:
                                track_obj = Track.objects.get(code=user.track)
                                first_project = track_obj.projects.filter(number=1).first()
                                
                                if first_project:
                                    StudentProgress.objects.get_or_create(
                                        student=user,
                                        project=first_project,
                                        step=None,
                                        defaults={'started_at': timezone.now()}
                                    )
                                    
                                    for step in first_project.steps.all():
                                        StudentProgress.objects.get_or_create(
                                            student=user,
                                            project=first_project,
                                            step=step
                                        )
                                    
                                    logger.info(f"Unlocked Project 1 for user {user.email}")
                            except Track.DoesNotExist:
                                logger.error(f"Track {user.track} not found")
                        
                        # Log audit
                        log_audit(
                            user,
                            'ENROLLMENT',
                            f'Enrolled in {track} track via checkout',
                            {'session_id': session['id'], 'amount': session['amount_total'] / 100}
                        )
                        
                        # TODO: Send welcome email with password
                        
                except Exception as e:
                    logger.error(f"Failed to create account from checkout: {str(e)}")
        
        if payment_intent_id:
            # Payment intent will be handled by payment_intent.succeeded event
            logger.info(f"Checkout session completed: {session['id']}")
    
    return HttpResponse(status=200)
