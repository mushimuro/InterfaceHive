import uuid
from django.db import models
from django.conf import settings

class ChatMessage(models.Model):
    """
    Messages in a project's chat room.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='chat_messages',
        db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'chat_messages'
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'created_at'], name='chat_msg_proj_time_idx'),
        ]

    def __str__(self):
        return f"Msg by {self.user.username} in {self.project.title}"
