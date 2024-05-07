from django.urls import path

from .views import (
    GetMatchView,
    CreateMatchView,
    CreateTournamentView,
    GetUpcomingGamesView,
    GetTournamentListView,
    RegisterTournamentView,
    UnregisterTournamentView,
)


urlpatterns = [
    path('match/create', CreateMatchView.as_view(), name='api-create-match'),
    path('match/<slug:match_id>/get', GetMatchView.as_view(), name='api-get-match'),

    path('tournament/list', GetTournamentListView.as_view(), name='api-tournament-list'),
    path('tournament/create', CreateTournamentView.as_view(), name='api-tournament-create'),
    path('tournament/register', RegisterTournamentView.as_view(), name='api-tournament-register'),
    path('tournament/unregister', UnregisterTournamentView.as_view(), name='api-tournament-unregister'),
    path('tournament/games/upcoming', GetUpcomingGamesView.as_view(), name='api-tournament-upcoming-games'),
]
