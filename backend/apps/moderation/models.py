import uuid
from django.db import models
from django.utils import timezone


class ModerationLog(models.Model):
    """
    Log of all moderation actions for audit trail.
    
    Immutable record of admin actions on content and users.
    """
    
    ACTION_CHOICES = [
        ('soft_delete_project', 'Soft Delete Project'),
        ('soft_delete_contribution', 'Soft Delete Contribution'),
        ('ban_user', 'Ban User'),
        ('unban_user', 'Unban User'),
        ('reverse_credit', 'Reverse Credit'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Action Details
    action = models.CharField(max_length=50, choices=ACTION_CHOICES, db_index=True)
    reason = models.TextField(max_length=1000)
    
    # Actor (Admin performing action)
    moderator = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='moderation_actions',
        db_index=True
    )
    moderator_email = models.EmailField()  # Preserved even if user deleted
    
    # Target (Object being moderated)
    target_type = models.CharField(max_length=50)  # 'project', 'contribution', 'user', 'credit'
    target_id = models.UUIDField(db_index=True)
    target_description = models.TextField(max_length=500)  # Human-readable description
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True, default='')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'moderation_logs'
        verbose_name = 'Moderation Log'
        verbose_name_plural = 'Moderation Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action', '-created_at'], name='modlog_action_created_idx'),
            models.Index(fields=['target_type', 'target_id'], name='modlog_target_idx'),
            models.Index(fields=['moderator', '-created_at'], name='modlog_moderator_idx'),
        ]
    
    def __str__(self):
        return f"{self.action} by {self.moderator_email} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        # Ensure immutability (only create, no updates)
        if self.pk:
            raise ValueError("Moderation logs are immutable and cannot be updated")
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Prevent deletion
        raise ValueError("Moderation logs cannot be deleted (audit trail)")

