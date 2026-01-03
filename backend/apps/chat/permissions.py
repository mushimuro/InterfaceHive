from django.db import models
from apps.projects.models import Project

def is_project_member(user, project):
    """
    Check if a user is authorized to participate in the project chat.
    A user is authorized if:
    1. They are the project host.
    2. They have an accepted contribution for the project.
    """
    if not user.is_authenticated:
        return False
        
    if str(project.host_user_id) == str(user.id):
        return True
        
    # Check for accepted contribution
    return project.contributions.filter(
        contributor_user_id=user.id,
        status='accepted'
    ).exists()
