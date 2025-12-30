"""
Admin moderation API views.

Handles soft-delete, ban/unban, and credit reversal actions.
"""
from rest_framework import status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.users.permissions import IsAdminUser
from apps.moderation.services import ModerationService
from apps.projects.models import Project
from apps.contributions.models import Contribution
from apps.users.models import User
from apps.credits.models import CreditLedgerEntry
from core.responses import SuccessResponse, ErrorResponse


class AdminSoftDeleteProjectView(views.APIView):
    """
    POST /api/v1/admin/projects/:id/soft-delete/
    
    Soft delete a project (set status to CLOSED).
    Admin only.
    """
    permission_classes = (IsAdminUser,)
    
    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        reason = request.data.get('reason', 'No reason provided')
        
        if not reason or len(reason.strip()) < 10:
            return ErrorResponse(
                detail="Reason must be at least 10 characters",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        project, log_entry = ModerationService.soft_delete_project(
            project=project,
            moderator=request.user,
            reason=reason,
            request=request
        )
        
        return SuccessResponse(
            data={
                'project_id': str(project.id),
                'status': project.status,
                'log_id': str(log_entry.id)
            },
            message="Project soft-deleted successfully"
        )


class AdminSoftDeleteContributionView(views.APIView):
    """
    POST /api/v1/admin/contributions/:id/soft-delete/
    
    Soft delete a contribution (set status to DECLINED).
    Admin only.
    """
    permission_classes = (IsAdminUser,)
    
    def post(self, request, contribution_id):
        contribution = get_object_or_404(Contribution, id=contribution_id)
        reason = request.data.get('reason', 'No reason provided')
        
        if not reason or len(reason.strip()) < 10:
            return ErrorResponse(
                detail="Reason must be at least 10 characters",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        contribution, log_entry = ModerationService.soft_delete_contribution(
            contribution=contribution,
            moderator=request.user,
            reason=reason,
            request=request
        )
        
        return SuccessResponse(
            data={
                'contribution_id': str(contribution.id),
                'status': contribution.status,
                'log_id': str(log_entry.id)
            },
            message="Contribution soft-deleted successfully"
        )


class AdminBanUserView(views.APIView):
    """
    POST /api/v1/admin/users/:id/ban/
    
    Ban a user (set is_active=False).
    Admin only.
    """
    permission_classes = (IsAdminUser,)
    
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        reason = request.data.get('reason', 'No reason provided')
        
        if not reason or len(reason.strip()) < 10:
            return ErrorResponse(
                detail="Reason must be at least 10 characters",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Prevent banning yourself
        if user == request.user:
            return ErrorResponse(
                detail="Cannot ban yourself",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Prevent banning other admins
        if user.is_staff or user.is_admin:
            return ErrorResponse(
                detail="Cannot ban admin users",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        user, log_entry = ModerationService.ban_user(
            user=user,
            moderator=request.user,
            reason=reason,
            request=request
        )
        
        return SuccessResponse(
            data={
                'user_id': str(user.id),
                'is_active': user.is_active,
                'log_id': str(log_entry.id)
            },
            message=f"User {user.display_name} banned successfully"
        )


class AdminUnbanUserView(views.APIView):
    """
    POST /api/v1/admin/users/:id/unban/
    
    Unban a user (set is_active=True).
    Admin only.
    """
    permission_classes = (IsAdminUser,)
    
    def post(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        reason = request.data.get('reason', 'No reason provided')
        
        if not reason or len(reason.strip()) < 10:
            return ErrorResponse(
                detail="Reason must be at least 10 characters",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        user, log_entry = ModerationService.unban_user(
            user=user,
            moderator=request.user,
            reason=reason,
            request=request
        )
        
        return SuccessResponse(
            data={
                'user_id': str(user.id),
                'is_active': user.is_active,
                'log_id': str(log_entry.id)
            },
            message=f"User {user.display_name} unbanned successfully"
        )


class AdminReverseCreditView(views.APIView):
    """
    POST /api/v1/admin/credits/:id/reverse/
    
    Reverse a credit transaction (creates offsetting entry).
    Admin only.
    """
    permission_classes = (IsAdminUser,)
    
    def post(self, request, entry_id):
        ledger_entry = get_object_or_404(CreditLedgerEntry, id=entry_id)
        reason = request.data.get('reason', 'No reason provided')
        
        if not reason or len(reason.strip()) < 10:
            return ErrorResponse(
                detail="Reason must be at least 10 characters",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already reversed
        existing_reversal = CreditLedgerEntry.objects.filter(
            entry_type='reversal',
            related_entry_id=ledger_entry.id
        ).exists()
        
        if existing_reversal:
            return ErrorResponse(
                detail="This credit has already been reversed",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        reversal_entry, log_entry = ModerationService.reverse_credit(
            ledger_entry=ledger_entry,
            moderator=request.user,
            reason=reason,
            request=request
        )
        
        return SuccessResponse(
            data={
                'original_entry_id': str(ledger_entry.id),
                'reversal_entry_id': str(reversal_entry.id),
                'amount_reversed': reversal_entry.amount,
                'log_id': str(log_entry.id)
            },
            message="Credit reversed successfully"
        )

