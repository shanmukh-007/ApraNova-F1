from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrackViewSet, ProjectViewSet, StudentProgressViewSet, SubmissionViewSet
from .webhook_views import github_webhook

router = DefaultRouter()
router.register(r'tracks', TrackViewSet, basename='track')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'progress', StudentProgressViewSet, basename='progress')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
    path('webhooks/github/', github_webhook, name='github-webhook'),
    path('webhooks/github', github_webhook, name='github-webhook-no-slash'),
]
