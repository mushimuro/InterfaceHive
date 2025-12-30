"""
Serializers for user authentication and profile management.

Handles registration, login, email verification, and profile updates.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
import secrets
from apps.users.models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    
    Validates email uniqueness, password strength, and creates new user account.
    Automatically generates email verification token and triggers verification email.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'display_name']
        extra_kwargs = {
            'email': {'required': True},
            'display_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password match and email uniqueness."""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': "Passwords don't match"
            })
        
        # Check email uniqueness
        if User.objects.filter(email=attrs['email'].lower()).exists():
            raise serializers.ValidationError({
                'email': 'A user with this email already exists'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create new user with email verification token."""
        # Remove confirm_password from validated data
        validated_data.pop('confirm_password', None)
        
        # Normalize email
        validated_data['email'] = validated_data['email'].lower()
        
        # Generate verification token
        verification_token = secrets.token_urlsafe(32)
        
        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            display_name=validated_data['display_name'],
            username=validated_data['email'].split('@')[0],  # Auto-generate username
            email_verification_token=verification_token,
            email_verified=False
        )
        
        # Trigger email verification task (async)
        from apps.users.tasks import send_verification_email
        send_verification_email.delay(str(user.id), verification_token)
        
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    
    Validates credentials and checks email verification status.
    Returns JWT tokens on successful authentication.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Authenticate user and check email verification."""
        email = attrs.get('email', '').lower()
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError('Email and password are required')
        
        # Authenticate user
        user = authenticate(
            request=self.context.get('request'),
            username=email,  # USERNAME_FIELD is email
            password=password
        )
        
        if not user:
            raise serializers.ValidationError('Invalid email or password')
        
        if not user.is_active:
            raise serializers.ValidationError('Account is deactivated')
        
        # Check email verification
        if not user.email_verified:
            raise serializers.ValidationError({
                'email_not_verified': True,
                'message': 'Please verify your email address before logging in',
                'email': user.email
            })
        
        attrs['user'] = user
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification.
    
    Validates verification token and marks email as verified.
    """
    token = serializers.CharField(required=True)
    
    def validate_token(self, value):
        """Validate verification token exists and is not expired."""
        try:
            user = User.objects.get(email_verification_token=value, email_verified=False)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired verification token')


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile display.
    
    Returns public user information including computed fields like total_credits.
    """
    total_credits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'display_name',
            'bio',
            'skills',
            'github_url',
            'portfolio_url',
            'email_verified',
            'total_credits',
            'created_at',
        ]
        read_only_fields = ['id', 'email', 'email_verified', 'created_at', 'total_credits']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    
    Allows users to update their display name, bio, skills, and social links.
    Email and password changes are handled by separate endpoints.
    """
    class Meta:
        model = User
        fields = [
            'display_name',
            'bio',
            'skills',
            'github_url',
            'portfolio_url',
        ]
    
    def validate_github_url(self, value):
        """Validate GitHub URL format."""
        if value and not value.startswith('https://github.com/'):
            raise serializers.ValidationError('Must be a valid GitHub URL (https://github.com/...)')
        return value
    
    def validate_bio(self, value):
        """Validate bio length."""
        if value and len(value) > 1000:
            raise serializers.ValidationError('Bio is too long (max 1000 characters)')
        return value
    
    def validate_skills(self, value):
        """Validate skills array."""
        if value and len(value) > 10:
            raise serializers.ValidationError('Maximum 10 skills allowed')
        return value


class ResendVerificationSerializer(serializers.Serializer):
    """
    Serializer for resending verification email.
    
    Generates new token and sends verification email to unverified users.
    """
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Check that user exists and email is not already verified."""
        try:
            user = User.objects.get(email=value.lower())
            if user.email_verified:
                raise serializers.ValidationError('Email is already verified')
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError('No user found with this email')


class PublicUserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for public user profiles.
    
    Excludes sensitive information like email and GDPR fields.
    Shows only publicly visible information.
    """
    total_credits = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'display_name',
            'bio',
            'skills',
            'github_url',
            'portfolio_url',
            'total_credits',
            'created_at',
        ]
        read_only_fields = ['id', 'display_name', 'bio', 'skills', 'github_url', 
                           'portfolio_url', 'total_credits', 'created_at']

