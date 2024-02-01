import uuid

from django.db import models
from django.contrib.auth.models import AbstractBaseUser

from .managers import CustomUserManager

from auth.settings import AUTH_USER_MODEL


class StatusChoices(models.TextChoices):
    ONLINE = ('online', 'Online')
    OFFLINE = ('offline', 'Offline')
    INGAME = ('in-game', 'In-game')

    def __iter__():
        return iter([
            item[0] for key, item in StatusChoices.__dict__.items()
            if not key.startswith('__')
        ])


class Users(AbstractBaseUser):

    username = None
    password = None
    last_login = None

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    login = models.CharField(max_length=32, unique=True)
    email = models.EmailField(max_length=255)
    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128)
    status = models.CharField(
        max_length=16,
        choices=StatusChoices.choices,
        default=StatusChoices.OFFLINE,
    )
    avatar_path = models.ImageField(
        upload_to='avatars',
        default='avatars/default/default_avatar.jpg'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    two_factor_enabled = models.BooleanField(default=False)

    objects = CustomUserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'Users'

    def __str__(self):
        return self.login


class AuthToken(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grant_type = models.CharField(max_length=255)
    code = models.CharField(max_length=64)
    state = models.CharField(max_length=64)
    access_token = models.CharField(max_length=64)
    token_type = models.CharField(max_length=255)
    expires_in = models.IntegerField()
    refresh_token = models.CharField(max_length=64)
    scope = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    secret_valid_until = models.DateTimeField()

    class Meta:
        verbose_name = 'AuthToken'


class QRMeta(models.Model):

    user = models.OneToOneField(AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    secret = models.CharField(max_length=32)

    class Meta:
        verbose_name = 'QRMeta'
