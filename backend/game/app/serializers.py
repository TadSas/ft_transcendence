from rest_framework import serializers

from .models import Tournaments, Matches, StatusChoices, MatchStatusChoices


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


class MatchesSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    game = serializers.CharField(max_length=16)
    players = serializers.JSONField(required=False)
    stats = serializers.JSONField(required=False)
    score = serializers.JSONField(required=False)
    tournament = serializers.JSONField(required=False)
    created_at = serializers.DateTimeField(required=False)
    status = serializers.ChoiceField(MatchStatusChoices, default='created')

    def create(self, validated_data):
        return Matches.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.game = validated_data.get('game', instance.game)
        instance.players = validated_data.get('players', instance.players)
        instance.stats = validated_data.get('stats', instance.stats)
        instance.score = validated_data.get('score', instance.score)
        instance.tournament = validated_data.get('tournament', instance.tournament)
        instance.created_at = validated_data.get('created_at', instance.created_at)
        instance.status = validated_data.get('status', instance.status)

        instance.save()

        return instance
