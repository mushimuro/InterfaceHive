import logging
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from .permissions import is_project_member
from apps.projects.models import Project

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f'chat_{self.project_id}'
        self.user = self.scope['user']

        logger.info(f"ChatConsumer: Attempting connection for user {self.user} and project {self.project_id}")

        if not self.user.is_authenticated:
            logger.warning(f"ChatConsumer: Connection rejected. User is not authenticated.")
            await self.close(code=4001)  # Unauthorized
            return

        # Check project membership
        project = await self.get_project(self.project_id)
        if not project:
            logger.warning(f"ChatConsumer: Connection rejected. Project {self.project_id} not found.")
            await self.close(code=4003)  # Forbidden
            return

        if not await self.check_membership(self.user, project):
            logger.warning(f"ChatConsumer: Connection rejected. User {self.user.email} is not a member of project {self.project_id}")
            await self.close(code=4003)  # Forbidden
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"ChatConsumer: Connection accepted for user {self.user.email} in project {self.project_id}")
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive_json(self, content):
        message_text = content.get('message', '').strip()
        
        if not message_text:
            return

        if len(message_text) > 5000:
            await self.send_json({'error': 'Message too long'})
            return

        # Save message to database
        project = await self.get_project(self.project_id)
        msg_obj = await self.save_message(self.user, project, message_text)
        
        # Serialize and broadcast using a sync_to_async wrapper
        serialized_message = await self.serialize_message(msg_obj)
        broadcast_data = {
            'type': 'chat_message',
            'message': serialized_message
        }

        logger.info(f"ChatConsumer: Broadcasting message {msg_obj.id} to group {self.room_group_name}")
        
        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                broadcast_data
            )
        except Exception as e:
            logger.error(f"ChatConsumer: Broadcast failed for group {self.room_group_name}: {str(e)}")
            # Optionally notify the sender that broadcast failed
            await self.send_json({
                'type': 'error',
                'message': 'Failed to broadcast message to other participants.'
            })

    async def chat_message(self, event):
        # Send message to WebSocket
        logger.debug(f"ChatConsumer: Sending broadcast message to user {self.user.email}")
        await self.send_json(event['message'])

    @database_sync_to_async
    def get_project(self, project_id):
        try:
            return Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return None

    @database_sync_to_async
    def check_membership(self, user, project):
        return is_project_member(user, project)

    @database_sync_to_async
    def save_message(self, user, project, content):
        return ChatMessage.objects.create(
            user=user,
            project=project,
            content=content
        )
    @database_sync_to_async
    def serialize_message(self, message):
        """
        Serialize a message in a sync context to avoid SynchronousOnlyOperation.
        """
        return ChatMessageSerializer(message).data
