"""
Custom permission classes for DRF views.

Implements role-based access control and email verification checks.
"""
from rest_framework import permissions


class IsAuthenticatedAndVerified(permissions.BasePermission):
    """
    Permission class that requires user to be authenticated AND email verified.
    
    Used for endpoints that require full account verification.
    """
    
    message = "Email verification required. Please verify your email address to access this resource."
    
    def has_permission(self, request, view):
        """Check if user is authenticated and has verified email."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.email_verified
        )


class IsHostOrReadOnly(permissions.BasePermission):
    """
    Permission class for Project objects.
    
    - Read (GET): Anyone can read
    - Create (POST): Authenticated + verified users only
    - Update/Delete (PUT/PATCH/DELETE): Only project host
    
    Used for project management endpoints.
    """
    
    def has_permission(self, request, view):
        """Check if user can access the endpoint."""
        # Read permissions allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions require authenticated + verified user
        return (
            request.user and
            request.user.is_authenticated and
            request.user.email_verified
        )
    
    def has_object_permission(self, request, view, obj):
        """Check if user can access/modify specific project."""
        # Read permissions allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for project host
        return obj.host_user == request.user


class IsContributorOrHost(permissions.BasePermission):
    """
    Permission class for Contribution objects.
    
    - Read: Project host and contribution author can read
    - Create: Any authenticated + verified user (one per project)
    - Update: Contribution author only (before decision)
    - Delete: Contribution author only (before decision)
    - Decision actions: Project host only
    
    Used for contribution management endpoints.
    """
    
    def has_permission(self, request, view):
        """Check if user can access the endpoint."""
        # All actions require authenticated + verified user
        return (
            request.user and
            request.user.is_authenticated and
            request.user.email_verified
        )
    
    def has_object_permission(self, request, view, obj):
        """Check if user can access/modify specific contribution."""
        # Project host can always read/decide
        if obj.project.host_user == request.user:
            return True
        
        # Contribution author can read and modify (if pending)
        if obj.contributor == request.user:
            # Can only modify if still pending
            if request.method in permissions.SAFE_METHODS:
                return True
            return obj.status == 'pending'
        
        # Other users cannot access
        return False


class IsProjectHost(permissions.BasePermission):
    """
    Permission class that requires user to be the project host.
    
    Used for project-specific actions like closing, accepting contributions, etc.
    """
    
    message = "Only the project host can perform this action."
    
    def has_object_permission(self, request, view, obj):
        """Check if user is the project host."""
        # For Project objects
        if hasattr(obj, 'host_user'):
            return obj.host_user == request.user
        
        # For Contribution objects (check via project)
        if hasattr(obj, 'project'):
            return obj.project.host_user == request.user
        
        return False


class IsAdminUser(permissions.BasePermission):
    """
    Permission class for admin-only endpoints.
    
    Used for moderation, GDPR compliance, and admin tools.
    """
    
    message = "Administrator privileges required."
    
    def has_permission(self, request, view):
        """Check if user is an admin."""
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_admin)
        )


class IsProjectMember(permissions.BasePermission):
    """
    Permission class that requires user to be a project member.
    
    A user is a member if they are:
    1. The project host
    2. An accepted contributor
    
    Checks are performed against a project ID in the URL.
    """
    
    message = "Only project members can access this resource."
    
    def has_permission(self, request, view):
        """Check if user is a member of the project specified in the URL."""
        if not (request.user and request.user.is_authenticated):
            return False
            
        project_id = view.kwargs.get('project_id')
        if not project_id:
            # If checking object permission instead
            return True
            
        from apps.projects.models import Project
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return False
            
        # Check if host
        if project.host_user == request.user:
            return True
            
        # Check if accepted contributor
        return project.contributions.filter(
            contributor=request.user,
            status='accepted'
        ).exists()

    def has_object_permission(self, request, view, obj):
        """Check if user is a member of the project directly from the object."""
        # Handle both Resource and Note objects
        project = getattr(obj, 'project', obj)
        
        # Check if host
        if project.host_user == request.user:
            return True
            
        # Check if accepted contributor
        return project.contributions.filter(
            contributor=request.user,
            status='accepted'
        ).exists()

