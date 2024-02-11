from rest_framework import serializers

from .models import Rooms, Messages


class RoomsSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    participants = serializers.ListField(child=serializers.CharField(max_length=32))
    created_at = serializers.DateTimeField(required=False)

    def create(self, validated_data):
        return Rooms.objects.create(**validated_data)


class MessagesSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True, required=False)
    room_id = serializers.UUIDField()
    message = serializers.CharField()
    sender = serializers.CharField(max_length=32)
    created_at = serializers.DateTimeField(required=False)

    def create(self, validated_data):
        validated_data['room'] = Rooms.objects.filter(id=validated_data.pop('room_id')).first()

        return Messages.objects.create(**validated_data)
