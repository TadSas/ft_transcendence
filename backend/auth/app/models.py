from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from .managers import CustomUserManager


class Users(AbstractBaseUser, PermissionsMixin):
    class Status(models.TextChoices):
        ONLINE = ('online', 'Online')
        OFFLINE = ('offline', 'Offline')
        INGAME = ('in-game', 'In-game')

    username = None
    password = None
    is_superuser = None

    login = models.CharField(max_length=32, unique=True)
    email = models.EmailField(max_length=255)
    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.OFFLINE,
    )
    avatar_path = models.ImageField(
        upload_to='avatars',
        default='avatars/default/stormtrooper.jpg'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField()
    two_factor_enabled = models.BooleanField(default=False)

    objects = CustomUserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'created_at']

    class Meta:
        verbose_name = 'Users'
