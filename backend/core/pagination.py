"""
Custom pagination classes for DRF.
"""
from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination with configurable page size.
    
    Default: 30 items per page
    Max: 100 items per page
    """
    page_size = 30
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProjectPagination(PageNumberPagination):
    """Pagination for project lists."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
