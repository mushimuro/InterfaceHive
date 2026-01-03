from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.projects.models import Project
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from .permissions import is_project_member
from core.pagination import CustomPageNumberPagination

class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id)
        
        if not is_project_member(self.request.user, project):
            return ChatMessage.objects.none()
            
        return ChatMessage.objects.filter(project=project).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id)
        
        if not is_project_member(request.user, project):
            return Response(
                {"error": "You do not have permission to view this chat."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().list(request, *args, **kwargs)
