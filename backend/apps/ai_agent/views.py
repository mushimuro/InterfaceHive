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
            return Response(data)
        except Exception as e:
            logger.error(f"AI Generation Error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GenerateFromIdeaView(APIView):
    def post(self, request):
        idea = request.data.get('idea')
        if not idea:
            return Response({'error': 'idea is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            service = GeminiService()
            data = service.generate_from_idea(idea)
            return Response(data)
        except Exception as e:
            logger.error(f"AI Generation Error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
