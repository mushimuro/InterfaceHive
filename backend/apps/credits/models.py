import uuid
from django.db import models


class CreditLedgerEntry(models.Model):
    """
    Append-only ledger tracking credit transactions.
    
    Core business rule: Max 1 AWARD per (project, user) enforced via unique constraint.
    Entries are immutable - updates and deletes raise ValueError.
    """
    
    ENTRY_TYPE_CHOICES = [
        ('award', 'Award'),
        ('reversal', 'Reversal'),
        ('adjustment', 'Adjustment'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    to_user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='credits_received',
        db_index=True
    )
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='credit_ledger',
        db_index=True
    )
    contribution = models.ForeignKey(
        'contributions.Contribution',
        on_delete=models.CASCADE,
        related_name='credit_ledger',
        db_index=True
    )
    created_by_user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='credits_issued'
    )
    
    # Transaction Data
    amount = models.IntegerField(default=1)
    entry_type = models.CharField(
        max_length=15,
        choices=ENTRY_TYPE_CHOICES,
        default='award'
    )
    
    # Audit
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'credit_ledger_entries'
        verbose_name = 'Credit Ledger Entry'
        verbose_name_plural = 'Credit Ledger Entries'
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['to_user', '-created_at'],
                name='ledger_to_user_idx'
            ),
            models.Index(
                fields=['contribution'],
                name='ledger_contribution_idx'
            ),
            models.Index(
                fields=['created_by_user'],
                name='ledger_created_by_idx'
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'to_user'],
                condition=models.Q(entry_type='award'),
                name='unique_award_per_project_user'
            ),
        ]
    
    def __str__(self):
        return (
            f"{self.entry_type.upper()}: {self.amount} credit(s) "
            f"to {self.to_user.display_name} for {self.project.title}"
        )
    
    def save(self, *args, **kwargs):
        """
        Override save to enforce immutability.
        
        Only allows initial creation, not updates.
        """
        if not self._state.adding:
            raise ValueError(
                "CreditLedgerEntry is append-only. Updates not allowed. "
                "Use entry_type='reversal' to reverse credits."
            )
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """
        Override delete to enforce immutability.
        
        Deletions are not allowed - use REVERSAL entry type instead.
        """
        raise ValueError(
            "CreditLedgerEntry is append-only. Deletions not allowed. "
            "Use entry_type='reversal' to reverse credits."
        )
