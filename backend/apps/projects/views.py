"""
API views for project management.

Handles project CRUD operations, filtering, search, and tag management.
"""
from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend

from apps.projects.models import Project, ProjectTag, ProjectResource, ProjectNote
from apps.projects.serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateSerializer,
    ProjectUpdateSerializer,
    ProjectTagSerializer,
    ProjectResourceSerializer,
    ProjectNoteSerializer
)
from apps.users.permissions import IsAuthenticatedAndVerified, IsHostOrReadOnly, IsProjectMember
from core.pagination import ProjectPagination
from core.responses import success_response, error_response, created_response, no_content_response


class ProjectListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/projects/
    List all open projects with filtering and search.
    
    POST /api/v1/projects/
    Create a new project (authenticated + verified users only).
    
    Query Parameters:
    - search: Full-text search in title, description, desired_outputs
    - status: Filter by status (OPEN, CLOSED, DRAFT)
    - difficulty: Filter by difficulty (EASY, INTERMEDIATE, ADVANCED)
    - tags: Filter by tag names (comma-separated)
    - ordering: Sort by field (e.g., -created_at, title)
    """
    queryset = Project.objects.all()
    pagination_class = ProjectPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'difficulty']
    search_fields = ['title', 'description', 'desired_outputs']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """Get appropriate permissions based on request method."""
        if self.request.method == 'POST':
            return [IsAuthenticatedAndVerified()]
        return [IsAuthenticatedOrReadOnly()]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on request method."""
        if self.request.method == 'POST':
            return ProjectCreateSerializer
        return ProjectListSerializer
    
    def get_queryset(self):
        """
        Get filtered queryset with optimizations.
        
        Supports:
        - Full-text search via 'search' parameter
        - Tag filtering via 'tags' parameter (comma-separated)
        - Status and difficulty filtering via Django Filter
        """
        queryset = Project.objects.select_related('host_user').prefetch_related(
            'tag_maps__tag'
        )
        
        # Filter by tags if provided
        tags_param = self.request.query_params.get('tags')
        if tags_param:
            tag_names = [tag.strip().lower() for tag in tags_param.split(',') if tag.strip()]
            if tag_names:
                queryset = queryset.filter(
                    tag_maps__tag__name__in=tag_names
                ).distinct()
        
        # Full-text search + Substring matching
        search_query = self.request.query_params.get('search')
        if search_query:
            # 1. Full-Text Search (Prefix matching for ranking)
            words = [f"{word}:*" for word in search_query.split() if word]
            fts_query = None
            if words:
                raw_query = " & ".join(words)
                fts_query = SearchQuery(raw_query, search_type='raw')
            
            # 2. Substring matching (Standard Django icontains)
            substring_filter = (
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(desired_outputs__icontains=search_query) |
                Q(tag_maps__tag__name__icontains=search_query)
            )
            
            # Combine them: Match if either FTS matches OR substring filter matches
            if fts_query:
                queryset = queryset.filter(
                    Q(search_vector=fts_query) | substring_filter
                ).annotate(
                    # Annotate rank; matches that only satisfy substring_filter get rank 0
                    rank=SearchRank('search_vector', fts_query)
                ).order_by('-rank')
            else:
                queryset = queryset.filter(substring_filter)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create a new project."""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            project = serializer.save()
            detail_serializer = ProjectDetailSerializer(project)
            
            return created_response(
                data=detail_serializer.data,
                message='Project created successfully'
            )
        
        return error_response(
            error='validation_error',
            detail='Failed to create project',
            field_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/v1/projects/<id>/
    Retrieve project details.
    
    PATCH /api/v1/projects/<id>/
    Update project (host only).
    
    DELETE /api/v1/projects/<id>/
    Delete project (host only, soft delete).
    """
    queryset = Project.objects.select_related('host_user').prefetch_related(
        'tag_maps__tag',
        'contributions__contributor_user'
    )
    permission_classes = [IsHostOrReadOnly]
    lookup_field = 'id'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on request method."""
        if self.request.method in ['PUT', 'PATCH']:
            return ProjectUpdateSerializer
        return ProjectDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Get project details."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return success_response(data=serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Update project."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check permission
        if instance.host_user != request.user:
            return error_response(
                error='permission_denied',
                detail='Only the project host can edit this project',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            project = serializer.save()
            detail_serializer = ProjectDetailSerializer(project)
            
            return success_response(
                data=detail_serializer.data,
                message='Project updated successfully'
            )
        
        return error_response(
            error='validation_error',
            detail='Failed to update project',
            field_errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete project."""
        instance = self.get_object()
        
        # Check permission
        if instance.host_user != request.user:
            return error_response(
                error='permission_denied',
                detail='Only the project host can delete this project',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Perform hard delete
            instance.delete()
            return success_response(
                message='Project deleted successfully'
            )
        except Exception as e:
            instance.status = 'closed'
            instance.save()
            return success_response(
                message='Project closed instead of deleted because credits have already been issued. Audit history must be preserved.'
            )


class MyProjectsView(generics.ListAPIView):
    """
    GET /api/v1/projects/my-projects/
    List projects created by the authenticated user.
    
    Query Parameters:
    - status: Filter by status (OPEN, closed, DRAFT)
    """
    serializer_class = ProjectListSerializer
    permission_classes = [IsAuthenticatedAndVerified]
    pagination_class = ProjectPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'difficulty']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get projects created by current user."""
        return Project.objects.filter(
            host_user=self.request.user
        ).select_related('host_user').prefetch_related('tag_maps__tag')


class ProjectTagListView(generics.ListAPIView):
    """
    GET /api/v1/projects/tags/
    List all project tags with usage count.
    
    Returns tags ordered by most used.
    """
    queryset = ProjectTag.objects.annotate(
        usage_count=Count('project_maps')
    ).order_by('-usage_count')
    serializer_class = ProjectTagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CloseProjectView(APIView):
    """
    POST /api/v1/projects/<id>/close/
    Close a project (host only).
    
    Sets status to closed and prevents new contributions.
    """
    permission_classes = [IsAuthenticatedAndVerified]
    
    def post(self, request, id):
        """Close project."""
        try:
            project = Project.objects.get(id=id)
        except Project.DoesNotExist:
            return error_response(
                error='not_found',
                detail='Project not found',
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Check permission
        if project.host_user != request.user:
            return error_response(
                error='permission_denied',
                detail='Only the project host can close this project',
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        # 2. Check if project is already closed
        if project.status == 'closed':
            return error_response(
                error='already_closed',
                detail='Project is already closed',
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # 4. Success - fall back to soft delete
        project.status = 'closed'
        project.save()
        
        return success_response(
            data={'id': str(project.id), 'status': project.status},
            message='Project closed successfully'
        )


class ProjectResourceListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/projects/<project_id>/resources/
    POST /api/v1/projects/<project_id>/resources/
    
    Access restricted to project members.
    """
    serializer_class = ProjectResourceSerializer
    permission_classes = [IsProjectMember]
    
    def get_queryset(self):
        return ProjectResource.objects.filter(project_id=self.kwargs['project_id'])
    
    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs['project_id'],
            user=self.request.user
        )


class ProjectResourceDestroyView(generics.DestroyAPIView):
    """
    DELETE /api/v1/projects/resources/<id>/
    
    Host can delete any. Contributor can delete their own.
    """
    queryset = ProjectResource.objects.all()
    serializer_class = ProjectResourceSerializer
    permission_classes = [IsProjectMember]
    lookup_field = 'id'
    
    def perform_destroy(self, instance):
        # Additional check: only host or owner
        if instance.project.host_user == self.request.user or instance.user == self.request.user:
            instance.delete()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own resources or those in your project.")


class ProjectNoteListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/projects/<project_id>/notes/
    POST /api/v1/projects/<project_id>/notes/
    
    Access restricted to project members.
    """
    serializer_class = ProjectNoteSerializer
    permission_classes = [IsProjectMember]
    
    def get_queryset(self):
        return ProjectNote.objects.filter(project_id=self.kwargs['project_id'])
    
    def perform_create(self, serializer):
        serializer.save(
            project_id=self.kwargs['project_id'],
            user=self.request.user
        )


class ProjectNoteUpdateDestroyView(generics.UpdateAPIView, generics.DestroyAPIView):
    """
    PATCH /api/v1/projects/notes/<id>/
    DELETE /api/v1/projects/notes/<id>/
    
    Host can delete any. Contributor can edit/delete their own.
    """
    queryset = ProjectNote.objects.all()
    serializer_class = ProjectNoteSerializer
    permission_classes = [IsProjectMember]
    lookup_field = 'id'
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own notes.")
        serializer.save()
        
    def perform_destroy(self, instance):
        if instance.project.host_user == self.request.user or instance.user == self.request.user:
            instance.delete()
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only delete your own notes.")
