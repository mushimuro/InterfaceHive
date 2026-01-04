from rest_framework import generics, status, views
import logging
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db import transaction, IntegrityError
from django.utils import timezone
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from apps.contributions.models import Contribution
from apps.contributions.serializers import (
    ContributionSerializer,
    ContributionCreateSerializer,
    ContributionDecisionSerializer
)
from apps.contributions.services import ContributionService
from apps.projects.models import Project
from apps.users.permissions import IsAuthenticatedAndVerified, IsHostOrReadOnly
from core.pagination import CustomPageNumberPagination
from core.responses import SuccessResponse, ErrorResponse

logger = logging.getLogger(__name__)

from django.db.models import Q

class ProjectContributionListView(generics.ListAPIView):
    """
    List all contributions for a specific project.
    
    - Public users and contributors see only ACCEPTED contributions
    - Project host sees all contributions (PENDING, ACCEPTED, DECLINED)
    - Authenticated users ALSO see their own contributions regardless of status
    """
    serializer_class = ContributionSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        queryset = Contribution.objects.filter(project_id=project_id).select_related(
            'contributor_user', 'project', 'decided_by_user'
        ).order_by('-created_at')
        
        # Visibility logic: host sees all, others see only ACCEPTED + their own
        request_user = self.request.user
        if request_user.is_authenticated:
            try:
                project = Project.objects.get(id=project_id)
                if project.host_user != request_user:
                    queryset = queryset.filter(Q(status='accepted') | Q(contributor_user=request_user))
            except Project.DoesNotExist:
                queryset = queryset.filter(status='accepted')
        else:
            queryset = queryset.filter(status='accepted')
        
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data)


@method_decorator(ratelimit(key='user', rate='20/h', block=True), name='post')
class ContributionCreateView(generics.CreateAPIView):
    """
    Create a new contribution for a project.
    
    Rate limited to 20 contributions per hour per user.
    
    Validation:
    - User must be authenticated and email verified
    - Project must be OPEN
    - User cannot contribute to their own project
    - User can only submit one contribution per project
    """
    queryset = Contribution.objects.all()
    serializer_class = ContributionCreateSerializer
    permission_classes = (IsAuthenticatedAndVerified,)

    def create(self, request, *args, **kwargs):
        # Get project from URL parameter
        project_id = self.kwargs.get('project_id')
        
        # Validate project exists
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return ErrorResponse(
                detail="Project not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Add project to request data
        data = request.data.copy()
        data['project'] = str(project.id)
        
        serializer = self.get_serializer(data=data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            
            return SuccessResponse(
                data=serializer.data,
                message="Contribution submitted successfully. The project host will review your submission.",
                status_code=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            # Handle rate limit exceeded
            if hasattr(e, 'status_code') and e.status_code == 429:
                return ErrorResponse(
                    detail="Rate limit exceeded. You can submit up to 20 contributions per hour.",
                    code="rate_limit_exceeded",
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS
                )
            raise


class ContributionDetailView(generics.RetrieveAPIView):
    """
    Retrieve a single contribution by ID.
    
    Visibility:
    - ACCEPTED contributions: visible to all
    - PENDING/DECLINED contributions: visible only to contributor and project host
    """
    queryset = Contribution.objects.select_related('contributor_user', 'project', 'decided_by_user')
    serializer_class = ContributionSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check visibility permissions
        if instance.status != 'accepted':
            if not request.user.is_authenticated:
                return ErrorResponse(
                    detail="You do not have permission to view this contribution.",
                    status_code=status.HTTP_403_FORBIDDEN
                )
            if request.user != instance.contributor_user and request.user != instance.project.host_user:
                return ErrorResponse(
                    detail="You do not have permission to view this contribution.",
                    status_code=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(instance)
        return SuccessResponse(data=serializer.data)


class MyContributionsView(generics.ListAPIView):
    """
    Get all contributions by the authenticated user.
    
    Supports filtering by status via query parameter.
    """
    serializer_class = ContributionSerializer
    permission_classes = (IsAuthenticatedAndVerified,)
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        queryset = Contribution.objects.filter(
            contributor_user=self.request.user
        ).select_related(
            'project', 'project__host_user', 'decided_by_user'
        ).order_by('-created_at')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter and status_filter.lower() in ['pending', 'accepted', 'declined']:
            queryset = queryset.filter(status=status_filter.lower())
        
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return SuccessResponse(data=serializer.data)


class ContributionAcceptView(views.APIView):
    """
    Accept a pending contribution (host only).
    
    Atomically updates contribution status AND awards credit to contributor.
    If credit award fails (duplicate), contribution is still accepted.
    """
    permission_classes = (IsAuthenticatedAndVerified,)

    def post(self, request, contribution_id):
        try:
            contribution = Contribution.objects.select_related('project', 'contributor_user').get(id=contribution_id)
        except Contribution.DoesNotExist:
            return ErrorResponse(
                detail="Contribution not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Validate decision using serializer
        serializer = ContributionDecisionSerializer(
            data={'decision': 'accepted'},
            context={'contribution': contribution, 'request': request}
        )
        
        if not serializer.is_valid():
            logger.warning(f"Validation failed for contribution {contribution_id}: {serializer.errors}")
            return ErrorResponse(
                detail=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Accept the contribution with atomic credit award
        try:
            result = ContributionService.accept_contribution(
                contribution=contribution,
                decided_by=request.user
            )
            
            response_data = {
                'id': str(contribution.id),
                'status': contribution.status,
                'decided_at': contribution.decided_at,
                'credit_awarded': result['credit_awarded']
            }
            
            message = "Contribution accepted."
            if result['credit_awarded']:
                message += " Credit awarded successfully."
            
            return SuccessResponse(
                data=response_data,
                message=message
            )
        except ValueError as e:
            logger.error(f"ValueError accepting contribution {contribution_id}: {str(e)}")
            return ErrorResponse(detail=str(e), status_code=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            logger.error(f"PermissionError accepting contribution {contribution_id}: {str(e)}")
            return ErrorResponse(detail=str(e), status_code=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.exception(f"Unexpected error accepting contribution {contribution_id}")
            return ErrorResponse(detail="An unexpected error occurred.", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContributionDeclineView(views.APIView):
    """
    Decline a pending contribution (host only).
    
    No credit is awarded for declined contributions.
    """
    permission_classes = (IsAuthenticatedAndVerified,)

    def post(self, request, contribution_id):
        try:
             contribution = Contribution.objects.select_related('project', 'contributor_user').get(id=contribution_id)
        except Contribution.DoesNotExist:
            return ErrorResponse(
                detail="Contribution not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        # Validate decision using serializer
        serializer = ContributionDecisionSerializer(
            data={'decision': 'declined'},
            context={'contribution': contribution, 'request': request}
        )
        
        if not serializer.is_valid():
            logger.warning(f"Validation failed for contribution {contribution_id}: {serializer.errors}")
            return ErrorResponse(
                detail=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Decline the contribution
        try:
            contribution = ContributionService.decline_contribution(
                contribution=contribution,
                decided_by=request.user
            )
            
            return SuccessResponse(
                data={
                    'id': str(contribution.id),
                    'status': contribution.status,
                    'decided_at': contribution.decided_at
                },
                message="Contribution declined."
            )
        except ValueError as e:
            logger.error(f"ValueError declining contribution {contribution_id}: {str(e)}")
            return ErrorResponse(detail=str(e), status_code=status.HTTP_400_BAD_REQUEST)
        except PermissionError as e:
            logger.error(f"PermissionError declining contribution {contribution_id}: {str(e)}")
            return ErrorResponse(detail=str(e), status_code=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.exception(f"Unexpected error declining contribution {contribution_id}")
            return ErrorResponse(detail="An unexpected error occurred.", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
