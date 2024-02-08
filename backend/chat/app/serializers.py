from rest_framework import serializers

from .models import Rooms


class RoomsSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    participants = serializers.ListField(child=serializers.CharField(max_length=32))
    created_at = serializers.DateTimeField(required=False)

    def create(self, validated_data):
        return Rooms.objects.create(**validated_data)
