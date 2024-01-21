from django.db import models


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
