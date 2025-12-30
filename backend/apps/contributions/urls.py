from django.urls import path
from apps.contributions.views import (
    ProjectContributionListView,
    ContributionCreateView,
    ContributionDetailView,
    MyContributionsView,
    ContributionAcceptView,
    ContributionDeclineView,
)

urlpatterns = [
    # Contribution submission for a project
    path('projects/<uuid:project_id>/contributions/', ProjectContributionListView.as_view(), name='project-contributions-list'),
    path('projects/<uuid:project_id>/contributions/create/', ContributionCreateView.as_view(), name='contribution-create'),
    
    # User's own contributions
    path('me/', MyContributionsView.as_view(), name='my-contributions'),
    
    # Individual contribution operations
    path('<uuid:id>/', ContributionDetailView.as_view(), name='contribution-detail'),
    path('<uuid:contribution_id>/accept/', ContributionAcceptView.as_view(), name='contribution-accept'),
    path('<uuid:contribution_id>/decline/', ContributionDeclineView.as_view(), name='contribution-decline'),
]

