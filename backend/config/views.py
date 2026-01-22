"""
Configuration Views

Views for the main configuration app, including the homepage.
"""
from django.shortcuts import render


def home(request):
    """
    Homepage view displaying system information and links.

    Renders the main landing page with:
    - System introduction
    - API documentation links (Swagger UI, ReDoc)
    - Django admin link
    - Developer information
    - Technology stack
    """
    return render(request, 'home.html')
