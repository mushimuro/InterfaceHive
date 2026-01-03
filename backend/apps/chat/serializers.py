from rest_framework import serializers
from .models import ChatMessage
from apps.users.serializers import UserProfileSerializer

class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
