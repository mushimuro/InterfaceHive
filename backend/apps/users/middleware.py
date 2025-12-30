"""
Authentication and user verification middleware.

Ensures users have verified their email before accessing protected endpoints.
"""
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from rest_framework import status


class EmailVerificationMiddleware(MiddlewareMixin):
    """
    Middleware to enforce email verification for authenticated users.
    
    Allows access to:
    - Public endpoints (no authentication required)
    - Authentication endpoints (login, register, verify-email, etc.)
    - Admin panel
    
    Blocks access to protected endpoints if user is authenticated but email not verified.
    """
    
    # Paths that don't require email verification
    EXEMPT_PATHS = [
        '/api/v1/auth/register/',
        '/api/v1/auth/login/',
        '/api/v1/auth/verify-email/',
        '/api/v1/auth/token/refresh/',
        '/api/v1/auth/resend-verification/',
        '/api/v1/schema/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    def process_request(self, request):
        """Check if authenticated user has verified email."""
        # Skip check for exempt paths
        if any(request.path.startswith(path) for path in self.EXEMPT_PATHS):
            return None
        
        # Skip check for unauthenticated users
        if not request.user.is_authenticated:
            return None
        
        # Skip check for superusers and staff
        if request.user.is_superuser or request.user.is_staff:
            return None
        
        # Check if email is verified
        if not request.user.email_verified:
            return JsonResponse(
                {
                    'error': 'Email verification required',
                    'detail': 'Please verify your email address before accessing this resource.',
                    'email': request.user.email
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        return None

