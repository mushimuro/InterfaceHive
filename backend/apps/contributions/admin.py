from django.contrib import admin
from .models import Contribution


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    """Admin interface for Contribution model."""
    
    list_display = [
        'title',
        'contributor_user',
        'project',
        'status',
        'decided_by_user',
        'created_at'
    ]
    list_filter = ['status', 'created_at', 'decided_at']
    search_fields = [
        'title',
        'body',
        'contributor_user__email',
        'contributor_user__display_name',
        'project__title'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Relationships', {
            'fields': ('project', 'contributor_user')
        }),
        ('Content', {
            'fields': ('title', 'body', 'links_json', 'attachments_json')
        }),
        ('Decision', {
            'fields': ('status', 'decided_by_user', 'decided_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'decided_at']
