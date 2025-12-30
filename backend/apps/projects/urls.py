"""
URL routing for project management endpoints.
"""
from django.urls import path
from apps.projects import views

app_name = 'projects'

urlpatterns = [
    # Project CRUD
    path('', views.ProjectListCreateView.as_view(), name='project-list-create'),
    path('<uuid:id>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('<uuid:id>/close/', views.CloseProjectView.as_view(), name='project-close'),
    
    # My Projects
    path('my-projects/', views.MyProjectsView.as_view(), name='my-projects'),
    
    # Tags
    path('tags/', views.ProjectTagListView.as_view(), name='project-tags'),
]

