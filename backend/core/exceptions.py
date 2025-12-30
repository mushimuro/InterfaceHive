"""
Custom exception handlers for DRF.
"""
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError


class InvalidTokenException(Exception):
    """Exception for invalid JWT tokens."""
    pass


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response data
        custom_response_data = {
            'success': False,
            'error': response.data.get('detail', 'An error occurred'),
        }
        
        # Add field errors if validation error
        if isinstance(exc, ValidationError):
            custom_response_data['field_errors'] = response.data
        
        response.data = custom_response_data
    
    return response
