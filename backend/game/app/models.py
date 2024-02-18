import uuid

from django.db import models


class Tournaments(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        verbose_name = 'tournaments'

    def __str__(self):
        return self.id
