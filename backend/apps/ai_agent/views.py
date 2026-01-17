from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .services import GeminiService
import logging

logger = logging.getLogger(__name__)

class GenerateFromRepoView(APIView):
    def post(self, request):
        github_url = request.data.get('github_url')
        if not github_url:
            return Response({'error': 'github_url is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = GeminiService()
            data = service.generate_from_repo(github_url)
            
            # Ensure required fields have defaults
            data.setdefault('estimated_time', '2-4 weeks')
            data.setdefault('usage_type', 'practice')
            data.setdefault('difficulty', 'intermediate')
            data.setdefault('github_url', github_url)
            
            # Normalize difficulty and usage_type to lowercase
            if 'difficulty' in data:
                data['difficulty'] = data['difficulty'].lower()
            if 'usage_type' in data:
                data['usage_type'] = data['usage_type'].lower()
            
            return Response(data)
        except Exception as e:
            logger.error(f"AI Generation Error: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GenerateFromIdeaView(APIView):
    def post(self, request):
        idea = request.data.get('idea')
        if not idea:
            return Response({'error': 'idea is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = GeminiService()
            data = service.generate_from_idea(idea)
            
            # Ensure required fields have defaults
            data.setdefault('estimated_time', '2-4 weeks')
            data.setdefault('usage_type', 'practice')
            data.setdefault('difficulty', 'intermediate')
            data.setdefault('github_url', '')
            
            # Normalize difficulty and usage_type to lowercase
            if 'difficulty' in data:
                data['difficulty'] = data['difficulty'].lower()
            if 'usage_type' in data:
                data['usage_type'] = data['usage_type'].lower()
            
            return Response(data)
        except Exception as e:
            logger.error(f"AI Generation Error: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateRandomProjectView(APIView):
    """Generate a completely random project idea and optionally save it."""
    permission_classes = []  # Allow unauthenticated access for viewing
    
    def post(self, request):
        try:
            service = GeminiService()
            data = service.generate_random_project()
            
            # Ensure required fields have defaults
            data.setdefault('estimated_time', '2-4 weeks')
            data.setdefault('difficulty', 'intermediate')
            data.setdefault('github_url', '')
            
            # AI-generated templates are ALWAYS practice type
            data['usage_type'] = 'practice'
            
            # Normalize difficulty to lowercase
            if 'difficulty' in data:
                data['difficulty'] = data['difficulty'].lower()
            
            # Check if we should auto-save the project
            auto_save = request.data.get('auto_save', False)
            
            if auto_save:
                # Import here to avoid circular dependency
                from apps.projects.models import Project, ProjectTag, ProjectTagMap
                from apps.users.models import User
                
                # Get or create a system user for AI-generated projects
                from django.utils import timezone
                system_user, _ = User.objects.get_or_create(
                    email='ai@interfacehive.system',
                    defaults={
                        'display_name': 'AI Generator',
                        'email_verified': True,
                        'email_verified_at': timezone.now(),
                        'is_active': False,  # System user shouldn't be able to login
                    }
                )
                
                # Extract tags from data
                tags_data = data.pop('tags', [])
                
                # Create the project
                project = Project.objects.create(
                    host_user=system_user,
                    is_ai_generated=True,
                    status='open',
                    **data
                )
                
                # Create/associate tags
                for tag_name in tags_data:
                    tag, _ = ProjectTag.objects.get_or_create(name=tag_name.lower().strip())
                    ProjectTagMap.objects.create(project=project, tag=tag)
                
                # Return the saved project data
                from apps.projects.serializers import ProjectDetailSerializer
                serializer = ProjectDetailSerializer(project)
                return Response({
                    'saved': True,
                    'project': serializer.data
                })
            
            return Response(data)
        except Exception as e:
            logger.error(f"AI Generation Error: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
