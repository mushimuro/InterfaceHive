import uuid
from django.db import models
from django.contrib.postgres.search import SearchVector, SearchVectorField
from django.contrib.postgres.indexes import GinIndex


class Project(models.Model):
    """
    Contribution request project posted by hosts.
    
    Includes full-text search via PostgreSQL GIN index on search_vector field.
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    host_user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='hosted_projects',
        db_index=True
    )
    
    # Content
    title = models.CharField(max_length=200)
    description = models.TextField()
    what_it_does = models.TextField()
    inputs_dependencies = models.TextField(blank=True, default='')
    desired_outputs = models.TextField()
    
    # Metadata
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='open',
        db_index=True
    )
    difficulty = models.CharField(
        max_length=15,
        choices=DIFFICULTY_CHOICES,
        blank=True,
        default=''
    )
    estimated_time = models.CharField(max_length=50, blank=True, default='')
    github_url = models.URLField(max_length=500, blank=True, default='')
    
    # Full-Text Search (PostgreSQL GIN index)
    search_vector = SearchVectorField(null=True, editable=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['host_user', 'status'],
                name='project_host_status_idx'
            ),
            models.Index(
                fields=['status', '-created_at'],
                name='project_status_created_idx'
            ),
            GinIndex(fields=['search_vector'], name='project_search_idx'),
        ]
    
    def __str__(self):
        return f"{self.title} (by {self.host_user.display_name})"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Update search vector after save to avoid "F() expressions can only be used to update" error
        # Check if we need to update search vector (optimize if update_fields is present)
        update_fields = kwargs.get('update_fields', None)
        text_fields = {'title', 'description', 'desired_outputs'}
        
        should_update = (
            update_fields is None or 
            any(field in update_fields for field in text_fields)
        )
        
        if should_update and self.title and self.description:
            vector = (
                SearchVector('title', weight='A', config='english') +
                SearchVector('description', weight='B', config='english') +
                SearchVector('desired_outputs', weight='C', config='english')
            )
            # Use .update() to handle the expression on the DB side
            self.__class__.objects.filter(pk=self.pk).update(search_vector=vector)
    
    @property
    def accepted_contributors(self):
        """
        Returns queryset of users with accepted contributions.
        
        Unique users only, ordered by most recent acceptance date.
        """
        from apps.users.models import User
        return User.objects.filter(
            contributions__project=self,
            contributions__status='accepted'
        ).distinct().order_by('-contributions__decided_at')
    
    @property
    def accepted_contributors_count(self):
        """Count of unique users with accepted contributions."""
        return self.accepted_contributors.count()


class ProjectTag(models.Model):
    """
    Reusable tags for categorizing projects (skills, technologies).
    
    Tags are created on-demand and never deleted (reusable).
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Data
    name = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_tags'
        verbose_name = 'Project Tag'
        verbose_name_plural = 'Project Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Normalize tag name to lowercase
        self.name = self.name.lower().strip()
        super().save(*args, **kwargs)


class ProjectTagMap(models.Model):
    """
    Many-to-many relationship between projects and tags.
    
    Max 10 tags per project (validated in serializer).
    """
    
    # Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationships
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tag_maps',
        db_index=True
    )
    tag = models.ForeignKey(
        ProjectTag,
        on_delete=models.CASCADE,
        related_name='project_maps',
        db_index=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_tag_maps'
        verbose_name = 'Project Tag Map'
        verbose_name_plural = 'Project Tag Maps'
        unique_together = [['project', 'tag']]
        indexes = [
            models.Index(fields=['project'], name='tagmap_project_idx'),
            models.Index(fields=['tag'], name='tagmap_tag_idx'),
        ]
    
    def __str__(self):
        return f"{self.project.title} → {self.tag.name}"
