from rest_framework import serializers

from .models import Tournaments


class TournamentsSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)

    def create(self, validated_data):
        return Tournaments.objects.create(**validated_data)
