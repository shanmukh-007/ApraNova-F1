from django.urls import path

from .views import (
    create_payment,
    create_checkout_session,
    create_simple_checkout,
    create_anonymous_checkout,
    verify_checkout_session,
    get_payment_status,
    get_user_payments,
    request_refund,
    stripe_webhook,
)

urlpatterns = [
    # Payment creation
    path("create-payment/", create_payment, name="create-payment"),
    path("create-checkout-session/", create_checkout_session, name="create-checkout-session"),
    
    # Simple checkout (payment-first flow - no email pre-collection)
    path("create-simple-checkout/", create_simple_checkout, name="create-simple-checkout"),
    
    # Anonymous checkout (payment-first flow with email)
    path("create-anonymous-checkout/", create_anonymous_checkout, name="create-anonymous-checkout"),
    path("verify-checkout-session/", verify_checkout_session, name="verify-checkout-session"),
    
    # Payment status and history
    path("status/<str:payment_intent_id>/", get_payment_status, name="payment-status"),
    path("my-payments/", get_user_payments, name="my-payments"),
    
    # Refunds
    path("request-refund/", request_refund, name="request-refund"),
    
    # Webhook
    path("webhook/", stripe_webhook, name="stripe-webhook"),
]
