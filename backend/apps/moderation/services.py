"""
Service layer for moderation actions.

Handles admin content moderation with audit logging.
"""
from django.utils import timezone
from apps.moderation.models import ModerationLog


class ModerationService:
    """Service for admin moderation actions."""
    
    @staticmethod
    def log_action(action, moderator, target_type, target_id, target_description, reason, request=None):
        """
        Create an immutable audit log entry for a moderation action.
        
        Args:
            action: Type of moderation action (from ACTION_CHOICES)
            moderator: User performing the action
            target_type: Type of object being moderated
            target_id: UUID of the target object
            target_description: Human-readable description
            reason: Reason for the action
            request: HTTP request object (optional, for IP/user-agent)
        
        Returns:
            ModerationLog: Created log entry
        """
        log_data = {
            'action': action,
            'moderator': moderator,
            'moderator_email': moderator.email,
            'target_type': target_type,
            'target_id': target_id,
            'target_description': target_description,
            'reason': reason,
        }
        
        if request:
            log_data['ip_address'] = get_client_ip(request)
            log_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')[:500]
        
        return ModerationLog.objects.create(**log_data)
    
    @staticmethod
    def soft_delete_project(project, moderator, reason, request=None):
        """
        Soft delete a project (sets status to CLOSED, preserves data).
        
        Args:
            project: Project instance to soft delete
            moderator: Admin user performing action
            reason: Reason for deletion
            request: HTTP request object
        
        Returns:
            tuple: (project, log_entry)
        """
        from apps.projects.models import Project
        
        # Update project status
        original_status = project.status
        project.status = 'closed'
        project.save(update_fields=['status'])
        
        # Log the action
        log_entry = ModerationService.log_action(
            action='soft_delete_project',
            moderator=moderator,
            target_type='project',
            target_id=project.id,
            target_description=f"Project: {project.title} (was {original_status})",
            reason=reason,
            request=request
        )
        
        return project, log_entry
    
    @staticmethod
    def soft_delete_contribution(contribution, moderator, reason, request=None):
        """
        Soft delete a contribution (sets status to DECLINED, preserves data).
        
        Args:
            contribution: Contribution instance to soft delete
            moderator: Admin user performing action
            reason: Reason for deletion
            request: HTTP request object
        
        Returns:
            tuple: (contribution, log_entry)
        """
        from apps.contributions.models import Contribution
        
        # Update contribution status
        original_status = contribution.status
        contribution.status = 'declined'
        contribution.decided_by = moderator
        contribution.decided_at = timezone.now()
        contribution.save(update_fields=['status', 'decided_by', 'decided_at'])
        
        # Log the action
        log_entry = ModerationService.log_action(
            action='soft_delete_contribution',
            moderator=moderator,
            target_type='contribution',
            target_id=contribution.id,
            target_description=f"Contribution to {contribution.project.title} by {contribution.contributor.display_name} (was {original_status})",
            reason=reason,
            request=request
        )
        
        return contribution, log_entry
    
    @staticmethod
    def ban_user(user, moderator, reason, request=None):
        """
        Ban a user (sets is_active=False).
        
        Args:
            user: User instance to ban
            moderator: Admin user performing action
            reason: Reason for ban
            request: HTTP request object
        
        Returns:
            tuple: (user, log_entry)
        """
        # Deactivate user account
        user.is_active = False
        user.save(update_fields=['is_active'])
        
        # Log the action
        log_entry = ModerationService.log_action(
            action='ban_user',
            moderator=moderator,
            target_type='user',
            target_id=user.id,
            target_description=f"User: {user.display_name} ({user.email})",
            reason=reason,
            request=request
        )
        
        return user, log_entry
    
    @staticmethod
    def unban_user(user, moderator, reason, request=None):
        """
        Unban a user (sets is_active=True).
        
        Args:
            user: User instance to unban
            moderator: Admin user performing action
            reason: Reason for unban
            request: HTTP request object
        
        Returns:
            tuple: (user, log_entry)
        """
        # Reactivate user account
        user.is_active = True
        user.save(update_fields=['is_active'])
        
        # Log the action
        log_entry = ModerationService.log_action(
            action='unban_user',
            moderator=moderator,
            target_type='user',
            target_id=user.id,
            target_description=f"User: {user.display_name} ({user.email})",
            reason=reason,
            request=request
        )
        
        return user, log_entry
    
    @staticmethod
    def reverse_credit(ledger_entry, moderator, reason, request=None):
        """
        Reverse a credit transaction (creates offsetting entry).
        
        Args:
            ledger_entry: CreditLedgerEntry to reverse
            moderator: Admin user performing action
            reason: Reason for reversal
            request: HTTP request object
        
        Returns:
            tuple: (reversal_entry, log_entry)
        """
        from apps.credits.models import CreditLedgerEntry
        
        # Create reversal entry
        reversal_entry = CreditLedgerEntry.objects.create(
            to_user=ledger_entry.to_user,
            from_user=moderator,
            entry_type='reversal',
            amount=-ledger_entry.amount,
            project=ledger_entry.project,
            contribution=ledger_entry.contribution,
            reason=f"Reversal by admin: {reason}",
            related_entry_id=ledger_entry.id
        )
        
        # Log the action
        log_entry = ModerationService.log_action(
            action='reverse_credit',
            moderator=moderator,
            target_type='credit',
            target_id=ledger_entry.id,
            target_description=f"Credit {ledger_entry.amount} to {ledger_entry.to_user.display_name} for project {ledger_entry.project.title if ledger_entry.project else 'N/A'}",
            reason=reason,
            request=request
        )
        
        return reversal_entry, log_entry


def get_client_ip(request):
    """
    Get the client IP address from the request.
    
    Handles proxy headers (X-Forwarded-For, X-Real-IP).
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

