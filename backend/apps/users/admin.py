from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""
    
    list_display = [
        'email',
        'display_name',
        'email_verified',
        'is_active',
        'is_admin',
        'is_deleted',
        'created_at'
    ]
    list_filter = [
        'email_verified',
        'is_active',
        'is_admin',
        'is_deleted',
        'created_at'
    ]
    search_fields = ['email', 'display_name', 'username']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'password', 'username')
        }),
        ('Email Verification', {
            'fields': ('email_verified', 'email_verification_token', 'email_verified_at')
        }),
        ('Profile', {
            'fields': ('display_name', 'bio', 'skills', 'github_url', 'portfolio_url')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_admin')
        }),
        ('GDPR', {
            'fields': ('is_deleted', 'deletion_requested_at', 'data_anonymized_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'date_joined')
        }),
    )
    
    readonly_fields = [
        'created_at',
        'updated_at',
        'date_joined',
        'email_verified_at',
        'data_anonymized_at'
    ]
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'display_name', 'password1', 'password2'),
        }),
    )
