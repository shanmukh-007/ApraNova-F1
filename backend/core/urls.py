"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path, re_path
from django.http import JsonResponse
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from dj_rest_auth.registration.views import SocialConnectView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from accounts.views import CustomRegisterView
from accounts.views import health_check
from accounts.oauth_views import oauth_callback_handler


def api_root(request):
    """API Root - Welcome page with available endpoints"""
    return JsonResponse({
        "message": "Welcome to Apra Nova Backend API",
        "version": "v1",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "admin": "/admin/",
            "api_documentation": {
                "swagger": "/swagger/",
                "redoc": "/redoc/",
                "openapi_json": "/swagger.json",
                "openapi_yaml": "/swagger.yaml"
            },
            "authentication": {
                "login": "/api/auth/login/",
                "logout": "/api/auth/logout/",
                "register": "/api/auth/registration/",
                "password_reset": "/api/auth/password/reset/",
                "password_change": "/api/auth/password/change/",
                "user_details": "/api/auth/user/",
                "token_refresh": "/api/auth/token/refresh/",
                "token_verify": "/api/auth/token/verify/"
            },
            "social_auth": {
                "google": "/api/auth/google/",
                "github": "/api/auth/github/"
            },
            "users": "/api/users/",
            "payments": "/api/payments/"
        },
        "documentation": "Visit /swagger/ or /redoc/ for detailed API documentation"
    })


# Google OAuth
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

# GitHub OAuth  
class GitHubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter

schema_view = get_schema_view(
    openapi.Info(
        title="Apra Nova Backend API",
        default_version="v1",
        description="Comprehensive API documentation for Apra Nova Django backend",
        contact=openapi.Contact(email="support@apranova.dev"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)
urlpatterns = [
    path('', api_root, name='api-root'),
    path('health', health_check, name='health-check'),
    path("admin/", admin.site.urls),
    
    # OAuth callback handler (redirect to frontend with tokens)
    path("accounts/oauth/callback/", oauth_callback_handler, name="oauth_callback"),
    
    # Allauth social account URLs (for OAuth redirects)
    path("accounts/", include("allauth.urls")),
    
    # Social auth endpoints (for POST with tokens - API based)
    path("api/auth/google/", GoogleLogin.as_view(), name="google_login"),
    path("api/auth/github/", GitHubLogin.as_view(), name="github_login"),

    # Swagger / ReDoc documentation
    re_path(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "swagger/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    # accounts urls

    path("api/auth/registration/", CustomRegisterView.as_view(), name="custom_register"),
    path("api/auth/registration", CustomRegisterView.as_view(), name="custom_register_no_slash"),  # Without trailing slash

    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    path("api/auth/social/", include("allauth.socialaccount.urls")),
    path("api/users/", include("accounts.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/curriculum/", include("curriculum.urls")),
    path("api/quiz/", include("quizzes.urls")),
    path("api/compliance/", include("compliance.urls")),
    path("api/submissions/", include("submissions.urls")),
]
