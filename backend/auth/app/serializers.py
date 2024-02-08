from django.utils import timezone

from rest_framework import serializers

from .models import Users, StatusChoices, AuthToken


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


class AuthTokenSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    grant_type = serializers.CharField(max_length=255)
    code = serializers.CharField(max_length=64)
    state = serializers.CharField(max_length=64)
    access_token = serializers.CharField(max_length=64)
    token_type = serializers.CharField(max_length=255)
    expires_in = serializers.IntegerField()
    refresh_token = serializers.CharField(max_length=64)
    scope = serializers.CharField(max_length=255)
    created_at = serializers.DateTimeField()
    secret_valid_until = serializers.DateTimeField()

    def create(self, validated_data):
        return AuthToken.objects.create(**validated_data)
