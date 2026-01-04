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
    
    # Resources & Notes (Private)
    path('<uuid:project_id>/resources/', views.ProjectResourceListCreateView.as_view(), name='project-resource-list-create'),
    path('resources/<uuid:id>/', views.ProjectResourceDestroyView.as_view(), name='project-resource-destroy'),
    path('<uuid:project_id>/notes/', views.ProjectNoteListCreateView.as_view(), name='project-note-list-create'),
    path('notes/<uuid:id>/', views.ProjectNoteUpdateDestroyView.as_view(), name='project-note-update-destroy'),

    # Tags
    path('tags/', views.ProjectTagListView.as_view(), name='project-tags'),
]

