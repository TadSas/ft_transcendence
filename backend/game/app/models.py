import uuid

from django.db import models


class StatusChoices(models.TextChoices):
    REGISTRATION = ('registration', 'Registration')
    STARTED = ('started', 'Started')
    FINISHED = ('finished', 'Finished')

    def __iter__():
        return iter([item[0] for key, item in StatusChoices.__dict__.items() if not key.startswith('__')])


class MatchStatusChoices(models.TextChoices):
    CREATED = ('created', 'Created')
    PLAYINIG = ('playing', 'Playing')
    FINISHED = ('finished', 'Finished')

    def __iter__():
        return iter([item[0] for key, item in MatchStatusChoices.__dict__.items() if not key.startswith('__')])


class Tournaments(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=32)
    game = models.CharField(max_length=16)
    size = models.PositiveSmallIntegerField(default=4)
    participants = models.JSONField(default=dict)
    host = models.CharField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=32, choices=StatusChoices.choices, default=StatusChoices.REGISTRATION)
    draw = models.JSONField(default=dict)

    class Meta:
        verbose_name = 'tournaments'

    def __str__(self):
        return self.name


class Matches(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.CharField(max_length=16)
    players = models.JSONField(default=dict)
    stats = models.JSONField(default=dict)
    score = models.JSONField(default=dict)
    customizations = models.JSONField(default=dict)
    tournament = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=32, choices=MatchStatusChoices.choices, default=MatchStatusChoices.CREATED)

    class Meta:
        verbose_name = 'matches'
