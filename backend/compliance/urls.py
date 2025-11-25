from django.urls import path
from . import views

urlpatterns = [
    # Privacy & Terms
    path('privacy-policy/', views.get_active_privacy_policy, name='get_privacy_policy'),
    path('terms/', views.get_active_terms, name='get_terms'),
    path('accept-consent/', views.accept_privacy_and_terms, name='accept_consent'),
    path('my-consents/', views.get_user_consents, name='get_user_consents'),
    
    # GDPR Rights
    path('export-data/', views.request_data_export, name='export_data'),
    path('delete-account/', views.request_account_deletion, name='delete_account'),
    path('cancel-deletion/', views.cancel_account_deletion, name='cancel_deletion'),
]
