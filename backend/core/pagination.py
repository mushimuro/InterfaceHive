"""
Custom pagination classes for DRF.
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination with configurable page size.
    
    Default: 30 items per page
    Max: 100 items per page
    """
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        """Standardize paginated response envelope."""
        return Response({
            'success': True,
            'status_code': 200,
            'message': 'Data retrieved successfully',
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'data': data
        })


class ProjectPagination(CustomPageNumberPagination):
    """Pagination for project lists."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
