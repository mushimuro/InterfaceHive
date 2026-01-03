"""
URL configuration for InterfaceHive project.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API Documentation (OpenAPI/Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API v1 endpoints
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/contributions/', include('apps.contributions.urls')),
    path('api/v1/credits/', include('apps.credits.urls')),
    path('api/v1/admin/', include('apps.moderation.urls')),
    path('api/v1/ai/', include('apps.ai_agent.urls')),
    path('api/v1/chat/', include('apps.chat.urls')),
]
