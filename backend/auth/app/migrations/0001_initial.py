# Generated by Django 5.0.1 on 2024-01-23 14:59

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Users',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('login', models.CharField(max_length=32, unique=True)),
                ('email', models.EmailField(max_length=255)),
                ('first_name', models.CharField(max_length=128)),
                ('last_name', models.CharField(max_length=128)),
                ('status', models.CharField(choices=[('online', 'Online'), ('offline', 'Offline'), ('in-game', 'In-game')], default='offline', max_length=16)),
                ('avatar_path', models.ImageField(default='avatars/default/stormtrooper.jpg', upload_to='avatars')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('two_factor_enabled', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name': 'Users',
            },
        ),
        migrations.CreateModel(
            name='AuthToken',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('grant_type', models.CharField(max_length=255)),
                ('code', models.CharField(max_length=64)),
                ('state', models.CharField(max_length=64)),
                ('access_token', models.CharField(max_length=64)),
                ('token_type', models.CharField(max_length=255)),
                ('expires_in', models.IntegerField()),
                ('refresh_token', models.CharField(max_length=64)),
                ('scope', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField()),
                ('secret_valid_until', models.DateTimeField()),
            ],
            options={
                'verbose_name': 'AuthToken',
            },
        ),
    ]