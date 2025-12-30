from django.contrib import admin
from .models import Project, ProjectTag, ProjectTagMap


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Admin interface for Project model."""
    
    list_display = [
        'title',
        'host_user',
        'status',
        'difficulty',
        'created_at',
        'updated_at'
    ]
    list_filter = ['status', 'difficulty', 'created_at']
    search_fields = ['title', 'description', 'host_user__email', 'host_user__display_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('host_user', 'title', 'status')
        }),
        ('Content', {
            'fields': ('description', 'what_it_does', 'inputs_dependencies', 'desired_outputs')
        }),
        ('Metadata', {
            'fields': ('difficulty', 'estimated_time', 'github_url')
        }),
        ('Search', {
            'fields': ('search_vector',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    readonly_fields = ['search_vector', 'created_at', 'updated_at']


@admin.register(ProjectTag)
class ProjectTagAdmin(admin.ModelAdmin):
    """Admin interface for ProjectTag model."""
    
    list_display = ['name', 'created_at']
    search_fields = ['name']
    ordering = ['name']
    
    readonly_fields = ['created_at']


@admin.register(ProjectTagMap)
class ProjectTagMapAdmin(admin.ModelAdmin):
    """Admin interface for ProjectTagMap model."""
    
    list_display = ['project', 'tag', 'created_at']
    list_filter = ['created_at']
    search_fields = ['project__title', 'tag__name']
    ordering = ['-created_at']
    
    readonly_fields = ['created_at']
