"""
API views for user authentication and profile management.

Handles registration, login, email verification, token refresh, and logout.
"""
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from django.utils import timezone
import secrets

from apps.users.models import User
from apps.users.serializers import (
    RegisterSerializer,
    LoginSerializer,
    EmailVerificationSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ResendVerificationSerializer,
    PublicUserProfileSerializer
)
from core.responses import success_response, error_response, created_response
from core.exceptions import InvalidTokenException


class RegisterView(APIView):
    """
    POST /api/v1/auth/register/
    
    Register a new user account.
    Sends email verification link.
    
    Request:
        {
            "email": "user@example.com",
            "password": "SecurePass123",
            "confirm_password": "SecurePass123",
            "display_name": "John Doe"
        }
    
    Response (201):
        {
            "success": true,
            "message": "Registration successful. Please check your email to verify your account.",
            "data": {
                "email": "user@example.com",
                "display_name": "John Doe"
            }
        }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return created_response(
                data={
                    'email': user.email,
                    'display_name': user.display_name
                },
                message='Registration successful. Please check your email to verify your account.'
            )
        return error_response(
            error='validation_error',
            detail='Registration failed',
            field_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    
    Authenticate user and return JWT tokens.
    Requires email verification.
    
    Request:
        {
            "email": "user@example.com",
            "password": "SecurePass123"
        }
    
    Response (200):
        {
            "success": true,
            "message": "Login successful",
            "data": {
                "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
                "user": {
                    "id": "uuid",
                    "email": "user@example.com",
                    "display_name": "John Doe",
                    ...
                }
            }
        }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Serialize user data
            user_data = UserProfileSerializer(user).data
            
            return success_response(
                data={
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': user_data
                },
                message='Login successful'
            )
        
        return error_response(
            error='authentication_failed',
            detail='Invalid credentials or email not verified',
            field_errors=serializer.errors,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class VerifyEmailView(APIView):
    """
    POST /api/v1/auth/verify-email/
    
    Verify user email with token from verification email.
    
    Request:
        {
            "token": "verification_token_here"
        }
    
    Response (200):
        {
            "success": true,
            "message": "Email verified successfully. You can now log in.",
            "data": {
                "email": "user@example.com",
                "email_verified": true
            }
        }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            
            try:
                user = User.objects.get(email_verification_token=token, email_verified=False)
                
                # Mark email as verified
                user.email_verified = True
                user.email_verified_at = timezone.now()
                user.email_verification_token = None  # Clear token after use
                user.save()
                
                return success_response(
                    data={
                        'email': user.email,
                        'email_verified': True
                    },
                    message='Email verified successfully. You can now log in.'
                )
            
            except User.DoesNotExist:
                return error_response(
                    error='invalid_token',
                    detail='Invalid or expired verification token',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        
        return error_response(
            error='validation_error',
            detail='Invalid request',
            field_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ResendVerificationView(APIView):
    """
    POST /api/v1/auth/resend-verification/
    
    Resend verification email to unverified user.
    
    Request:
        {
            "email": "user@example.com"
        }
    
    Response (200):
        {
            "success": true,
            "message": "Verification email sent. Please check your inbox."
        }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email.lower())
            
            # Generate new token
            new_token = secrets.token_urlsafe(32)
            user.email_verification_token = new_token
            user.save()
            
            # Send verification email
            from apps.users.tasks import send_verification_email
            send_verification_email.delay(str(user.id), new_token)
            
            return success_response(
                message='Verification email sent. Please check your inbox.'
            )
        
        return error_response(
            error='validation_error',
            detail='Invalid request',
            field_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    
    Logout user and blacklist refresh token.
    
    Request:
        {
            "refresh": "refresh_token_here"
        }
    
    Response (200):
        {
            "success": true,
            "message": "Logout successful"
        }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return success_response(
                message='Logout successful'
            )
        except TokenError:
            return error_response(
                error='invalid_token',
                detail='Invalid token',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                error='logout_failed',
                detail='Logout failed',
                status_code=status.HTTP_400_BAD_REQUEST
            )


class CurrentUserView(APIView):
    """
    GET /api/v1/auth/me/
    
    Get current authenticated user profile.
    
    Response (200):
        {
            "success": true,
            "data": {
                "id": "uuid",
                "email": "user@example.com",
                "display_name": "John Doe",
                "bio": "...",
                "total_credits": 5,
                ...
            }
        }
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return success_response(data=serializer.data)


class UpdateProfileView(generics.UpdateAPIView):
    """
    PATCH /api/v1/auth/profile/
    
    Update current user profile.
    
    Request:
        {
            "display_name": "New Name",
            "bio": "Updated bio",
            "skills": ["Python", "Django"],
            "github_url": "https://github.com/username",
            "portfolio_url": "https://example.com"
        }
    
    Response (200):
        {
            "success": true,
            "message": "Profile updated successfully",
            "data": { ...updated profile... }
        }
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileUpdateSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            self.perform_update(serializer)
            user_data = UserProfileSerializer(instance).data
            
            return success_response(
                data=user_data,
                message='Profile updated successfully'
            )
        
        return error_response(
            error='validation_error',
            detail='Update failed',
            field_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class PublicUserProfileView(APIView):
    """
    GET /api/v1/users/:id/
    
    Get public profile for any user.
    
    Response (200):
        {
            "success": true,
            "data": {
                "id": "uuid",
                "display_name": "John Doe",
                "bio": "...",
                "skills": [...],
                "total_credits": 5,
                ...
            }
        }
    """
    permission_classes = [AllowAny]
    
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
            serializer = PublicUserProfileSerializer(user)
            return success_response(data=serializer.data)
        except User.DoesNotExist:
            return error_response(
                error='user_not_found',
                detail='User not found',
                status_code=status.HTTP_404_NOT_FOUND
            )
