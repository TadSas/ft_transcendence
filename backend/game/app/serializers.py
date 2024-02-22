from rest_framework import serializers

from .models import Tournaments, StatusChoices


class TournamentsSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(max_length=32)
    game = serializers.CharField(max_length=16)
    size = serializers.IntegerField(min_value=4, max_value=2048, required=False)
    participants = serializers.JSONField(required=False)
    host = serializers.CharField(max_length=32)
    created_at = serializers.DateTimeField(required=False)
    status = serializers.ChoiceField(StatusChoices, default='registration')
    draw = serializers.JSONField(required=False)

    def create(self, validated_data):
        return Tournaments.objects.create(**validated_data)
