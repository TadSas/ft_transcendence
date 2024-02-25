from django.urls import path

from .views import (
    CreateTournamentView,
    GetTournamentListView,
    RegisterTournamentView,
    UnregisterTournamentView,
)


urlpatterns = [
    path('tournament/list', GetTournamentListView.as_view(), name='api-tournament-list'),
    path('tournament/create', CreateTournamentView.as_view(), name='api-tournament-create'),
    path('tournament/register', RegisterTournamentView.as_view(), name='api-tournament-register'),
    path('tournament/unregister', UnregisterTournamentView.as_view(), name='api-tournament-unregister'),
]
