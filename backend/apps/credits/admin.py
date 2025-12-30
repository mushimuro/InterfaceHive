from django.contrib import admin
from .models import CreditLedgerEntry


@admin.register(CreditLedgerEntry)
class CreditLedgerEntryAdmin(admin.ModelAdmin):
    """Admin interface for CreditLedgerEntry model."""
    
    list_display = [
        'to_user',
        'project',
        'entry_type',
        'amount',
        'created_by_user',
        'created_at'
    ]
    list_filter = ['entry_type', 'created_at']
    search_fields = [
        'to_user__email',
        'to_user__display_name',
        'project__title',
        'created_by_user__email'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Transaction', {
            'fields': ('to_user', 'amount', 'entry_type')
        }),
        ('References', {
            'fields': ('project', 'contribution', 'created_by_user')
        }),
        ('Audit', {
            'fields': ('created_at',)
        }),
    )
    
    readonly_fields = ['created_at']
    
    def has_change_permission(self, request, obj=None):
        """Disable editing (append-only ledger)."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Disable deletion (append-only ledger)."""
        return False
