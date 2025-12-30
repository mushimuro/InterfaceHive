from django.contrib import admin
from apps.moderation.models import ModerationLog


@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    """
    Django admin for ModerationLog model.
    
    Read-only view of all moderation actions.
    """
    list_display = ('action', 'moderator_email', 'target_type', 'created_at')
    list_filter = ('action', 'target_type', 'created_at')
    search_fields = ('moderator_email', 'reason', 'target_description')
    readonly_fields = ('id', 'action', 'reason', 'moderator', 'moderator_email', 
                      'target_type', 'target_id', 'target_description', 
                      'ip_address', 'user_agent', 'created_at')
    ordering = ('-created_at',)
    
    def has_add_permission(self, request):
        """Prevent manual creation through admin."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion through admin (audit trail)."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Prevent modification through admin (immutable)."""
        return False

