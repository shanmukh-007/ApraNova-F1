from django.urls import path
from . import views

urlpatterns = [
    # Submission CRUD
    path('', views.submission_list_create, name='submission-list-create'),
    path('<int:pk>/', views.submission_detail, name='submission-detail'),
    path('<int:pk>/submit/', views.submit_for_review, name='submit-for-review'),
    
    # Project-specific submissions
    path('project/<int:project_id>/', views.project_submissions, name='project-submissions'),
]
