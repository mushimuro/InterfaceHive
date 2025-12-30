"""
Utility functions for consistent API responses.
"""
from rest_framework.response import Response
from rest_framework import status


def SuccessResponse(data=None, message=None, status_code=status.HTTP_200_OK, headers=None):
    """
    Create a standardized success response.
    
    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code
        headers: Additional headers
    
    Returns:
        Response: DRF Response object
    """
    response_data = {
        'success': True,
    }
    
    if message:
        response_data['message'] = message
    
    if data is not None:
        response_data['data'] = data
    
    return Response(response_data, status=status_code, headers=headers)


def ErrorResponse(detail, code=None, field_errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Create a standardized error response.
    
    Args:
        detail: Error message
        code: Error code
        field_errors: Field-specific errors
        status_code: HTTP status code
    
    Returns:
        Response: DRF Response object
    """
    response_data = {
        'success': False,
        'error': detail,
    }
    
    if code:
        response_data['code'] = code
    
    if field_errors:
        response_data['field_errors'] = field_errors
    
    return Response(response_data, status=status_code)


def created_response(data=None, message=None, headers=None):
    """Shortcut for 201 Created response."""
    return SuccessResponse(data=data, message=message, status_code=status.HTTP_201_CREATED, headers=headers)


def success_response(data=None, message=None):
    """Shortcut for 200 OK response."""
    return SuccessResponse(data=data, message=message)


def error_response(error, detail=None, field_errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Shortcut for error response."""
    return ErrorResponse(detail=detail or error, code=error, field_errors=field_errors, status_code=status_code)


def no_content_response():
    """Shortcut for 204 No Content response."""
    return Response(status=status.HTTP_204_NO_CONTENT)
