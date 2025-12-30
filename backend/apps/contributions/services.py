"""
Contribution Service Layer

Handles contribution acceptance/decline logic with atomic credit awards.
"""
from django.db import transaction, IntegrityError
from django.utils import timezone
from apps.contributions.models import Contribution
from apps.credits.services import CreditService
from apps.users.models import User
import logging

logger = logging.getLogger(__name__)


class ContributionService:
    """
    Service class for managing contribution decisions.
    
    Provides atomic operations for contribution acceptance with credit awards.
    """

    @staticmethod
    @transaction.atomic
    def accept_contribution(contribution: Contribution, decided_by: User) -> dict:
        """
        Accept a contribution and award credit atomically.
        
        This operation is atomic - either both the contribution status update
        and credit award succeed, or neither happens (transaction rollback).
        
        Args:
            contribution: Contribution to accept
            decided_by: User making the decision (must be project host)
        
        Returns:
            dict: Result with contribution and credit_entry (or None if duplicate)
        
        Raises:
            ValueError: If validation fails
            PermissionError: If user is not the project host
        """
        # Validation
        if contribution.status != 'PENDING':
            raise ValueError(
                f"Cannot accept contribution. Current status: {contribution.status}. "
                "Only PENDING contributions can be accepted."
            )
        
        if contribution.project.host != decided_by:
            raise PermissionError(
                "Only the project host can accept contributions."
            )
        
        # Update contribution status
        contribution.status = 'ACCEPTED'
        contribution.decided_by = decided_by
        contribution.decided_at = timezone.now()
        contribution.save(update_fields=['status', 'decided_by', 'decided_at', 'updated_at'])
        
        logger.info(
            f"Contribution {contribution.id} accepted by {decided_by.email} "
            f"for project '{contribution.project.title}'"
        )
        
        # Award credit (atomic within same transaction)
        credit_entry = None
        try:
            credit_entry = CreditService.award_credit(
                to_user=contribution.contributor,
                from_user=decided_by,
                project=contribution.project,
                contribution=contribution,
                amount=1
            )
            logger.info(
                f"Credit awarded to {contribution.contributor.email} "
                f"for contribution {contribution.id}"
            )
        except IntegrityError as e:
            # Credit already exists - log but don't fail the transaction
            # This can happen if a contribution was accepted, then declined, then accepted again
            logger.warning(
                f"Credit already exists for user {contribution.contributor.email} "
                f"on project '{contribution.project.title}': {str(e)}"
            )
            # We still return success for the contribution acceptance
            # but indicate no new credit was awarded
        
        return {
            'contribution': contribution,
            'credit_entry': credit_entry,
            'credit_awarded': credit_entry is not None
        }
    
    @staticmethod
    @transaction.atomic
    def decline_contribution(contribution: Contribution, decided_by: User) -> Contribution:
        """
        Decline a contribution (no credit awarded).
        
        Args:
            contribution: Contribution to decline
            decided_by: User making the decision (must be project host)
        
        Returns:
            Contribution: Updated contribution
        
        Raises:
            ValueError: If validation fails
            PermissionError: If user is not the project host
        """
        # Validation
        if contribution.status != 'PENDING':
            raise ValueError(
                f"Cannot decline contribution. Current status: {contribution.status}. "
                "Only PENDING contributions can be declined."
            )
        
        if contribution.project.host != decided_by:
            raise PermissionError(
                "Only the project host can decline contributions."
            )
        
        # Update contribution status
        contribution.status = 'DECLINED'
        contribution.decided_by = decided_by
        contribution.decided_at = timezone.now()
        contribution.save(update_fields=['status', 'decided_by', 'decided_at', 'updated_at'])
        
        logger.info(
            f"Contribution {contribution.id} declined by {decided_by.email} "
            f"for project '{contribution.project.title}'"
        )
        
        return contribution

