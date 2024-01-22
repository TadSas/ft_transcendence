from django.db import models
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Status(models.TextChoices):
        ONLINE = ('online', 'Online')
        OFFLINE = ('offline', 'Offline')
        INGAME = ('in-game', 'In-game')

    username = None
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    two_factor_enabled = models.BooleanField(default=False)

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'created_at']

    objects = UserManager()

    def __str__(self):
        return self.login


class UserAdmin(UserAdmin):
    # # The forms to add and change user instances
    # form = UserChangeForm
    # add_form = UserCreationForm

    # # The fields to be used in displaying the User model.
    # # These override the definitions on the base UserAdmin
    # # that reference specific fields on auth.User.
    # list_display = ["email", "date_of_birth", "is_admin"]
    # list_filter = ["is_admin"]
    # fieldsets = [
    #     (None, {"fields": ["email", "password"]}),
    #     ("Personal info", {"fields": ["date_of_birth"]}),
    #     ("Permissions", {"fields": ["is_admin"]}),
    # ]
    # # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # # overrides get_fieldsets to use this attribute when creating a user.
    # add_fieldsets = [
    #     (
    #         None,
    #         {
    #             "classes": ["wide"],
    #             "fields": ["email", "date_of_birth", "password1", "password2"],
    #         },
    #     ),
    # ]
    # search_fields = ["email"]
    ordering = ['login']
    # filter_horizontal = []


class AuthToken(models.Model):
    grant_type = models.CharField(max_length=255)
    code = models.CharField(max_length=64)
    state = models.CharField(max_length=64)
    access_token = models.CharField(max_length=64)
    token_type = models.CharField(max_length=255)
    expires_in = models.IntegerField()
    refresh_token = models.CharField(max_length=64)
    scope = models.CharField(max_length=255)
    created_at = models.DateField()
    secret_valid_until = models.DateField()
