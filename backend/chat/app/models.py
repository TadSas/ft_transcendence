import uuid

from django.db import models
from django.contrib.postgres.fields import ArrayField


class Rooms(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = ArrayField(models.UUIDField(), default=list)
    created_at = models.DateTimeField()

    class Meta:
        verbose_name = 'rooms'


class Messages(models.Model):

    room = models.ForeignKey(Rooms, on_delete=models.CASCADE)
    message = models.TextField()
    sender_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'messages'

    def __str__(self):
        return self.message
