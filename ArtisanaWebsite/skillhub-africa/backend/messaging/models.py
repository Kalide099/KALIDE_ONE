from django.db import models
from users.models import User


class Conversation(models.Model):
    participants = models.ManyToManyField(User)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation {self.id}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    source_language = models.CharField(max_length=10, default='en')
    translated_content = models.JSONField(default=dict, blank=True, help_text="Stores translations like {'fr': '...', 'es': '...'}")
    timestamp = models.DateTimeField(auto_now_add=True)
    room_name = models.CharField(max_length=100, null=True, blank=True, default='')  # For WebSocket chat rooms

    def __str__(self):
        return f"Message from {self.sender.name}"
