import uuid

from django.db import models
from django.contrib.postgres.fields import ArrayField


class Rooms(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = ArrayField(models.CharField(max_length=32), default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'rooms'

    def __str__(self):
        return self.participants


class Messages(models.Model):

    room = models.ForeignKey(Rooms, on_delete=models.CASCADE)
    message = models.TextField()
    sender = models.CharField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'messages'

    def __str__(self):
        return self.message
