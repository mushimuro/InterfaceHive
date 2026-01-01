"""
Credit System Service Layer

Handles credit award logic with atomic transactions.
Ensures data integrity for contribution acceptance + credit award operations.
"""
from django.db import transaction, IntegrityError
from django.utils import timezone
from apps.credits.models import CreditLedgerEntry
from apps.users.models import User
from apps.projects.models import Project
from apps.contributions.models import Contribution
import logging

logger = logging.getLogger(__name__)


class CreditService:
    """
    Service class for managing credit awards.
    
    Provides atomic credit award operations with duplicate prevention.
    """

    @staticmethod
    @transaction.atomic
    def award_credit(
        to_user: User,
        from_user: User,
        project: Project,
        contribution: Contribution,
        amount: int = 1
    ) -> CreditLedgerEntry:
        """
        Award credit to a user for an accepted contribution.
        
        This operation is atomic - either the credit is awarded or the entire
        transaction is rolled back (including contribution status update).
        
        Args:
            to_user: User receiving the credit (contributor)
            from_user: User issuing the credit (project host)
            project: Project for which credit is awarded
            contribution: Accepted contribution
            amount: Number of credits to award (default: 1)
        
        Returns:
            CreditLedgerEntry: The created ledger entry
        
        Raises:
            IntegrityError: If duplicate credit attempt (unique constraint violation)
            ValueError: If validation fails
        """
        # Validation
        if amount <= 0:
            raise ValueError("Credit amount must be positive")
        
        if to_user == from_user:
            raise ValueError("Cannot award credit to yourself")
        
        if contribution.status != 'ACCEPTED':
            raise ValueError("Can only award credit for accepted contributions")
        
        if contribution.contributor_user != to_user:
            raise ValueError("Credit recipient must be the contributor")
        
        if project.host_user != from_user:
            raise ValueError("Credit issuer must be the project host")
        
        # Check if credit already exists (before attempting insert)
        existing_credit = CreditLedgerEntry.objects.filter(
            to_user=to_user,
            project=project,
            entry_type='AWARD'
        ).exists()
        
        if existing_credit:
            raise IntegrityError(
                "Credit already awarded for this project and user. "
                "Only one AWARD entry per user per project is allowed."
            )
        
        try:
            # Create credit ledger entry with unique constraint enforcement
            credit_entry = CreditLedgerEntry.objects.create(
                to_user=to_user,
                created_by_user=from_user,
                project=project,
                contribution=contribution,
                amount=amount,
                entry_type='AWARD'
            )
            
            logger.info(
                f"Credit awarded: {amount} credit(s) to {to_user.email} "
                f"for project '{project.title}' (contribution {contribution.id})"
            )
            
            return credit_entry
            
        except IntegrityError as e:
            logger.warning(
                f"Duplicate credit attempt prevented for user {to_user.email} "
                f"on project '{project.title}': {str(e)}"
            )
            raise IntegrityError(
                "Credit already awarded for this project and user. "
                "Duplicate credits are not allowed."
            ) from e
    
    @staticmethod
    def get_user_credit_balance(user: User) -> int:
        """
        Calculate the total credit balance for a user.
        
        Counts all AWARD entries minus any REVERSAL entries.
        
        Args:
            user: User to calculate balance for
        
        Returns:
            int: Total credit balance
        """
        awards = CreditLedgerEntry.objects.filter(
            to_user=user,
            entry_type='AWARD'
        ).count()
        
        reversals = CreditLedgerEntry.objects.filter(
            to_user=user,
            entry_type='REVERSAL'
        ).count()
        
        return awards - reversals
    
    @staticmethod
    def get_user_ledger(user: User, limit: int = 50):
        """
        Get credit ledger entries for a user.
        
        Args:
            user: User to get ledger for
            limit: Maximum number of entries to return
        
        Returns:
            QuerySet: Credit ledger entries ordered by most recent
        """
        return CreditLedgerEntry.objects.filter(
            to_user=user
        ).select_related(
            'created_by_user', 'project', 'contribution'
        ).order_by('-created_at')[:limit]

