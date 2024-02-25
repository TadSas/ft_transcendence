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

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.game = validated_data.get('game', instance.game)
        instance.size = validated_data.get('size', instance.size)
        instance.participants = validated_data.get('participants', instance.participants)
        instance.host = validated_data.get('host', instance.host)
        instance.created_at = validated_data.get('created_at', instance.created_at)
        instance.status = validated_data.get('status', instance.status)
        instance.draw = validated_data.get('draw', instance.draw)

        instance.save()

        return instance
