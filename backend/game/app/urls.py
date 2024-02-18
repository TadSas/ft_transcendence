from django.urls import path

from .views import (
    CreateTournamentView,
)


urlpatterns = [
    path('tournament/create', CreateTournamentView.as_view(), name='api-tournament-create'),
]
