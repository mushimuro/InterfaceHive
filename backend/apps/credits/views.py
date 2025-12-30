from rest_framework import generics, views, status
from rest_framework.permissions import IsAuthenticated
from apps.credits.models import CreditLedgerEntry
from apps.credits.serializers import CreditLedgerEntrySerializer, CreditBalanceSerializer
from apps.credits.services import CreditService
from apps.users.permissions import IsAuthenticatedAndVerified
from core.pagination import CustomPageNumberPagination
from core.responses import SuccessResponse, ErrorResponse


class UserCreditBalanceView(views.APIView):
    """
    Get the credit balance for the authenticated user.
    
    Returns:
        - user_id: UUID of the user
        - total_credits: Net credit balance (awards - reversals + adjustments)
        - awards: Count of AWARD entries
        - reversals: Count of REVERSAL entries
        - adjustments: Count of ADJUSTMENT entries
    """
    permission_classes = (IsAuthenticatedAndVerified,)

    def get(self, request):
        user = request.user
        
        # Get credit counts by type
        awards = CreditLedgerEntry.objects.filter(
            to_user=user,
            entry_type='AWARD'
        ).count()
        
        reversals = CreditLedgerEntry.objects.filter(
            to_user=user,
            entry_type='REVERSAL'
        ).count()
        
        adjustments = CreditLedgerEntry.objects.filter(
            to_user=user,
            entry_type='ADJUSTMENT'
        ).count()
        
        total_credits = awards - reversals + adjustments
        
        data = {
            'user_id': str(user.id),
            'total_credits': total_credits,
            'awards': awards,
            'reversals': reversals,
            'adjustments': adjustments
        }
        
        serializer = CreditBalanceSerializer(data=data)
        serializer.is_valid()  # No validation needed, just formatting
        
        return SuccessResponse(data=serializer.data)


class UserCreditLedgerView(generics.ListAPIView):
    """
    Get the credit ledger (transaction history) for the authenticated user.
    
    Returns paginated list of credit transactions ordered by most recent.
    """
    serializer_class = CreditLedgerEntrySerializer
    permission_classes = (IsAuthenticatedAndVerified,)
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        return CreditLedgerEntry.objects.filter(
            to_user=self.request.user
        ).select_related(
            'from_user', 'project', 'contribution'
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data)


class UserPublicCreditsView(views.APIView):
    """
    Get public credit balance for any user (by user ID).
    
    Allows viewing another user's credit count (read-only, public info).
    """
    permission_classes = ()  # Public endpoint

    def get(self, request, user_id):
        from apps.users.models import User
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return ErrorResponse(
                detail="User not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        total_credits = CreditService.get_user_credit_balance(user)
        
        data = {
            'user_id': str(user.id),
            'display_name': user.display_name,
            'total_credits': total_credits
        }
        
        return SuccessResponse(data=data)
