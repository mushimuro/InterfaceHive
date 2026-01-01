from rest_framework import serializers
from apps.credits.models import CreditLedgerEntry
from apps.users.serializers import UserProfileSerializer


class CreditLedgerEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for credit ledger entries.
    
    Shows credit transaction history with related user and project info.
    """
    from_user_name = serializers.CharField(source='created_by_user.display_name', read_only=True, allow_null=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    contribution_id = serializers.UUIDField(source='contribution.id', read_only=True, allow_null=True)
    
    class Meta:
        model = CreditLedgerEntry
        fields = (
            'id', 'to_user', 'created_by_user', 'from_user_name', 'project',
            'project_title', 'contribution', 'contribution_id', 'amount',
            'entry_type', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class CreditBalanceSerializer(serializers.Serializer):
    """
    Serializer for user credit balance.
    """
    user_id = serializers.UUIDField(read_only=True)
    total_credits = serializers.IntegerField(read_only=True)
    awards = serializers.IntegerField(read_only=True)
    reversals = serializers.IntegerField(read_only=True)
    adjustments = serializers.IntegerField(read_only=True)

