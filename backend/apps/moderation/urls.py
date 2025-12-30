"""
URL routing for admin moderation endpoints.
"""
from django.urls import path
from apps.moderation import views

app_name = 'moderation'

urlpatterns = [
    # Soft Delete
    path('projects/<uuid:project_id>/soft-delete/', views.AdminSoftDeleteProjectView.as_view(), name='soft-delete-project'),
    path('contributions/<uuid:contribution_id>/soft-delete/', views.AdminSoftDeleteContributionView.as_view(), name='soft-delete-contribution'),
    
    # User Ban/Unban
    path('users/<uuid:user_id>/ban/', views.AdminBanUserView.as_view(), name='ban-user'),
    path('users/<uuid:user_id>/unban/', views.AdminUnbanUserView.as_view(), name='unban-user'),
    
    # Credit Reversal
    path('credits/<uuid:entry_id>/reverse/', views.AdminReverseCreditView.as_view(), name='reverse-credit'),
]

