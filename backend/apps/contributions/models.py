import uuid
from django.db import models


class Contribution(models.Model):
    """
    Submissions from contributors to projects.
    
    Status transitions: PENDING → ACCEPTED or DECLINED (one-time decision).
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='contributions',
        db_index=True
    )
    contributor_user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='contributions',
        db_index=True
    )
    decided_by_user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='decisions_made'
    )
    
    # Content
    title = models.CharField(max_length=200, blank=True, default='')
    body = models.TextField()
    links_json = models.JSONField(default=list, blank=True)
    attachments_json = models.JSONField(default=list, blank=True)
    
    # Status & Decision Tracking
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True
    )
    decided_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contributions'
        verbose_name = 'Contribution'
        verbose_name_plural = 'Contributions'
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['project', 'status', '-created_at'],
                name='contrib_project_status_idx'
            ),
            models.Index(
                fields=['contributor_user', 'status', '-created_at'],
                name='contrib_user_status_idx'
            ),
            models.Index(
                fields=['decided_by_user'],
                name='contrib_decided_by_idx'
            ),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    (
                        models.Q(status='pending') &
                        models.Q(decided_by_user__isnull=True) &
                        models.Q(decided_at__isnull=True)
                    ) |
                    (
                        models.Q(status__in=['accepted', 'declined']) &
                        models.Q(decided_by_user__isnull=False) &
                        models.Q(decided_at__isnull=False)
                    )
                ),
                name='contribution_decision_consistency'
            ),
        ]
    
    def __str__(self):
        title = self.title or 'Contribution'
        return f"{title} by {self.contributor_user.display_name} to {self.project.title}"
    
    def can_be_decided(self):
        """Check if contribution can be accepted or declined (must be pending)."""
        return self.status == 'pending'
    
    def is_owned_by(self, user):
        """Check if user is the contributor."""
        return self.contributor_user == user
    
    def can_be_decided_by(self, user):
        """Check if user can accept/decline (must be project host or admin)."""
        return self.project.host_user == user or user.is_admin
