import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    
    Includes email verification, GDPR compliance fields, and profile information.
    All users must verify their email before logging in.
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Override username to make it non-required (we'll use email for auth)
    username = models.CharField(max_length=150, unique=True)
    
    # Email is the primary authentication field
    email = models.EmailField(unique=True, max_length=255)
    
    # Email Verification
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(
        max_length=64, null=True, blank=True, db_index=True
    )
    email_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Profile Information
    display_name = models.CharField(max_length=100)
    bio = models.TextField(max_length=1000, blank=True, default='')
    skills = models.JSONField(default=list, blank=True)
    github_url = models.URLField(max_length=500, blank=True, default='')
    portfolio_url = models.URLField(max_length=500, blank=True, default='')
    
    # Permissions (is_superuser, is_staff inherited from AbstractUser)
    is_admin = models.BooleanField(default=False)
    
    # GDPR Compliance
    is_deleted = models.BooleanField(default=False)
    deletion_requested_at = models.DateTimeField(null=True, blank=True)
    data_anonymized_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps (created, updated inherited from AbstractUser via date_joined)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Use email for authentication instead of username
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['display_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email'], name='user_email_idx'),
            models.Index(fields=['email_verified'], name='user_email_verified_idx'),
            models.Index(
                fields=['is_deleted', 'deletion_requested_at'],
                name='user_gdpr_cleanup_idx'
            ),
            models.Index(fields=['created_at'], name='user_created_at_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(email_verified=False) |
                    (models.Q(email_verified=True) & models.Q(email_verified_at__isnull=False))
                ),
                name='email_verified_requires_timestamp'
            ),
        ]
    
    def __str__(self):
        return f"{self.display_name} ({self.email})"
    
    def save(self, *args, **kwargs):
        # Auto-generate username from email if not provided
        if not self.username:
            self.username = self.email.split('@')[0]
            # Ensure uniqueness
            base_username = self.username
            counter = 1
            while User.objects.filter(username=self.username).exists():
                self.username = f"{base_username}{counter}"
                counter += 1
        super().save(*args, **kwargs)
    
    def anonymize(self):
        """
        GDPR anonymization: Clear all personal data while preserving audit trail.
        
        Projects and contributions remain visible but attributed to "Deleted User".
        Credit ledger entries are preserved for audit integrity.
        """
        self.email = f"deleted-{self.id}@anonymized.local"
        self.username = f"deleted_{self.id}"
        self.display_name = "Deleted User"
        self.bio = ""
        self.skills = []
        self.github_url = ""
        self.portfolio_url = ""
        self.data_anonymized_at = timezone.now()
        self.is_active = False
        self.save()
    
    @property
    def total_credits(self):
        """
        Calculate total credits from ledger (computed property).
        
        Returns count of AWARD entries for this user.
        """
        from apps.credits.models import CreditLedgerEntry
        return CreditLedgerEntry.objects.filter(
            to_user=self,
            entry_type='award'
        ).count()
