from django.utils import timezone

from rest_framework import serializers

from .models import Users, Friends, StatusChoices, FriendStatusChoices


class UsersSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    login = serializers.CharField(max_length=32)
    email = serializers.EmailField(max_length=255)
    first_name = serializers.CharField(max_length=128)
    last_name = serializers.CharField(max_length=128)
    status = serializers.ChoiceField(StatusChoices, default='offline')
    avatar_path = serializers.ImageField(required=False)
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)
    two_factor_enabled = serializers.BooleanField(default=False)

    def create(self, validated_data):
        validated_data['updated_at'] = timezone.now()

        instance, created = Users.objects.update_or_create(
            login=validated_data['login'],
            defaults=validated_data
        )

        return instance

    def update(self, instance, validated_data):
        instance.login = validated_data.get('login', instance.login)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.status = validated_data.get('status', instance.status)
        instance.avatar_path = validated_data.get('avatar_path', instance.avatar_path)
        instance.updated_at = validated_data.get('updated_at', instance.updated_at)
        instance.two_factor_enabled = validated_data.get('two_factor_enabled', instance.two_factor_enabled)
        instance.save()

        return instance


class FriendsSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    user_id = serializers.CharField(max_length=32)
    friend_id = serializers.CharField(max_length=32)
    status = serializers.ChoiceField(FriendStatusChoices, default='request')
    created_at = serializers.DateTimeField(required=False)

    def create(self, validated_data):
        validated_data['user'] = Users.objects.filter(login=validated_data.pop('user_id')).first()
        validated_data['friend'] = Users.objects.filter(login=validated_data.pop('friend_id')).first()

        return Friends.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.id = validated_data.get('id', instance.id)
        instance.user_id = validated_data.get('user_id', instance.user_id)
        instance.friend_id = validated_data.get('friend_id', instance.friend_id)
        instance.status = validated_data.get('status', instance.status)
        instance.created_at = validated_data.get('created_at', instance.created_at)
        instance.save()

        return instance
