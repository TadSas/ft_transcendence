from django.urls import path

from .views import (
    GetTournamentsView,
    CreateTournamentView,
)


urlpatterns = [
    path('tournaments/get', GetTournamentsView.as_view(), name='api-tournaments-get'),
    path('tournament/create', CreateTournamentView.as_view(), name='api-tournament-create'),
]
