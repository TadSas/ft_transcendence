from rest_framework import serializers

from .models import Tournaments


class TournamentsSerializer(serializers.Serializer):
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=32)
    game = models.CharField(max_length=16)
    size = models.PositiveSmallIntegerField(default=4)
    participants = models.JSONField(default=dict)
    host = models.CharField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=32, choices=StatusChoices.choices, default=StatusChoices.REGISTRATION)
    draw = models.JSONField(default=dict)
    """
    id = serializers.UUIDField(read_only=True)
    name = ''
    game = ''
    size = ''
    participants = ''
    host = ''
    created_at = ''
    status = ''
    draw = ''

    def create(self, validated_data):
        return Tournaments.objects.create(**validated_data)
