"""
Serializers for project management.

Handles project creation, updates, listing, and tag management.
"""
from rest_framework import serializers
from django.contrib.postgres.search import SearchVector
from apps.projects.models import Project, ProjectTag, ProjectTagMap, ProjectResource, ProjectNote
from apps.users.serializers import UserProfileSerializer


class ProjectTagSerializer(serializers.ModelSerializer):
    """Serializer for project tags."""
    
    class Meta:
        model = ProjectTag
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Serializer for project list view.
    
    Includes host info, tag names, and contribution count.
    Optimized for list performance.
    """
    host = UserProfileSerializer(source='host_user', read_only=True)
    tags = serializers.SerializerMethodField()
    contribution_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'description',
            'status',
            'difficulty',
            'estimated_time',
            'host',
            'tags',
            'contribution_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'host', 'created_at', 'updated_at']
    
    def get_tags(self, obj):
        """Get list of tag names for the project."""
        tag_maps = ProjectTagMap.objects.filter(project=obj).select_related('tag')
        return [tag_map.tag.name for tag_map in tag_maps]
    
    def get_contribution_count(self, obj):
        """Get count of contributions to this project."""
        return obj.contributions.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for project detail view.
    
    Includes full project information, host details, tags, and accepted contributors.
    """
    host = UserProfileSerializer(source='host_user', read_only=True)
    tags = serializers.SerializerMethodField()
    contribution_count = serializers.SerializerMethodField()
    accepted_contributors = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'description',
            'what_it_does',
            'inputs_dependencies',
            'desired_outputs',
            'status',
            'difficulty',
            'estimated_time',
            'github_url',
            'host',
            'tags',
            'contribution_count',
            'accepted_contributors',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'host', 'created_at', 'updated_at']
    
    def get_tags(self, obj):
        """Get list of tag names for the project."""
        tag_maps = ProjectTagMap.objects.filter(project=obj).select_related('tag')
        return [tag_map.tag.name for tag_map in tag_maps]
    
    def get_contribution_count(self, obj):
        """Get count of contributions to this project."""
        return obj.contributions.count()
    
    def get_accepted_contributors(self, obj):
        """Get list of users with accepted contributions."""
        accepted_contributions = obj.contributions.filter(status='accepted').select_related('contributor_user')
        return UserProfileSerializer([c.contributor_user for c in accepted_contributions], many=True).data


class ProjectCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating a new project.
    
    Handles tag creation/association and validates required fields.
    """
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        max_length=5,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Project
        fields = [
            'title',
            'description',
            'what_it_does',
            'inputs_dependencies',
            'desired_outputs',
            'difficulty',
            'estimated_time',
            'github_url',
            'tags',
            'status',
        ]
    
    def validate_title(self, value):
        """Validate title length."""
        if len(value) < 5:
            raise serializers.ValidationError('Title must be at least 5 characters')
        if len(value) > 200:
            raise serializers.ValidationError('Title is too long (max 200 characters)')
        return value
    
    def validate_description(self, value):
        """Validate description length."""
        if len(value) < 20:
            raise serializers.ValidationError('Description must be at least 20 characters')
        if len(value) > 5000:
            raise serializers.ValidationError('Description is too long (max 5000 characters)')
        return value
    
    def validate_desired_outputs(self, value):
        """Validate desired outputs."""
        if len(value) < 20:
            raise serializers.ValidationError('Please describe desired outputs (min 20 characters)')
        if len(value) > 2000:
            raise serializers.ValidationError('Desired outputs is too long (max 2000 characters)')
        return value
    
    def validate_github_url(self, value):
        """Validate GitHub URL format."""
        if value and not value.startswith('https://github.com/'):
            raise serializers.ValidationError('Must be a valid GitHub URL')
        return value
    
    def validate_tags(self, value):
        """Validate tags."""
        if len(value) > 5:
            raise serializers.ValidationError('Maximum 5 tags allowed')
        
        # Normalize tags (lowercase, trim whitespace)
        normalized_tags = []
        for tag in value:
            normalized = tag.strip().lower()
            if normalized:
                if len(normalized) > 50:
                    raise serializers.ValidationError(f'Tag "{tag}" is too long (max 50 characters)')
                normalized_tags.append(normalized)
        
        return normalized_tags
    
    def create(self, validated_data):
        """Create project and associate tags."""
        tags_data = validated_data.pop('tags', [])
        
        # Set host from request user
        validated_data['host_user'] = self.context['request'].user
        
        # Create project
        project = Project.objects.create(**validated_data)
        
        # Create/associate tags
        for tag_name in tags_data:
            tag, _ = ProjectTag.objects.get_or_create(name=tag_name)
            ProjectTagMap.objects.create(project=project, tag=tag)
        
        return project


class ProjectUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating an existing project.
    
    Allows updating most fields except host. Tags can be updated.
    """
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        max_length=5,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Project
        fields = [
            'title',
            'description',
            'what_it_does',
            'inputs_dependencies',
            'desired_outputs',
            'difficulty',
            'estimated_time',
            'github_url',
            'tags',
            'status',
        ]
    
    def validate_title(self, value):
        """Validate title length."""
        if len(value) < 5:
            raise serializers.ValidationError('Title must be at least 5 characters')
        if len(value) > 200:
            raise serializers.ValidationError('Title is too long (max 200 characters)')
        return value
    
    def validate_description(self, value):
        """Validate description length."""
        if len(value) < 20:
            raise serializers.ValidationError('Description must be at least 20 characters')
        if len(value) > 5000:
            raise serializers.ValidationError('Description is too long (max 5000 characters)')
        return value
    
    def validate_status(self, value):
        # Projects cannot be reopened once CLOSED via API (must be reopened by admin/host if desired)
        if self.instance and self.instance.status == 'closed' and value != 'closed':
            raise serializers.ValidationError("This project is closed and its status cannot be changed.")
        return value
    
    def validate_tags(self, value):
        """Validate tags."""
        if len(value) > 5:
            raise serializers.ValidationError('Maximum 5 tags allowed')
        
        # Normalize tags
        normalized_tags = []
        for tag in value:
            normalized = tag.strip().lower()
            if normalized:
                if len(normalized) > 50:
                    raise serializers.ValidationError(f'Tag "{tag}" is too long')
                normalized_tags.append(normalized)
        
        return normalized_tags
    
    def update(self, instance, validated_data):
        """Update project and tags."""
        tags_data = validated_data.pop('tags', None)
        
        # Update project fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update tags if provided
        if tags_data is not None:
            # Remove old tag associations
            ProjectTagMap.objects.filter(project=instance).delete()
            
            # Create new tag associations
            for tag_name in tags_data:
                tag, _ = ProjectTag.objects.get_or_create(name=tag_name)
                ProjectTagMap.objects.create(project=instance, tag=tag)
        
        instance.save()
        return instance


class ProjectResourceSerializer(serializers.ModelSerializer):
    """Serializer for private project resources."""
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = ProjectResource
        fields = [
            'id',
            'project',
            'user',
            'title',
            'url',
            'category',
            'created_at',
        ]
        read_only_fields = ['id', 'project', 'user', 'created_at']


class ProjectNoteSerializer(serializers.ModelSerializer):
    """Serializer for private project notes."""
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = ProjectNote
        fields = [
            'id',
            'project',
            'user',
            'content',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'project', 'user', 'created_at', 'updated_at']

