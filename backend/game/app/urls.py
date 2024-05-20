from django.urls import path

from .views import (
    GetMatchView,
    CreateMatchView,
    GetUserStatsView,
    CreateTournamentView,
    GetUpcomingGamesView,
    GetTournamentListView,
    RegisterTournamentView,
    GetUserMatchHistoryView,
    UnregisterTournamentView,
    GetTournamentAliasesView,
    GetUserTournamentStatsView,
)


urlpatterns = [
    path('match/create', CreateMatchView.as_view(), name='api-create-match'),
    path('match/<slug:match_id>', GetMatchView.as_view(), name='api-get-match'),
    path('match/stats/<slug:username>', GetUserStatsView.as_view(), name='api-user-stats'),
    path('match/history/<slug:username>', GetUserMatchHistoryView.as_view(), name='api-user-match-history'),

    path('tournament/list', GetTournamentListView.as_view(), name='api-tournament-list'),
    path('tournament/create', CreateTournamentView.as_view(), name='api-tournament-create'),
    path('tournament/register', RegisterTournamentView.as_view(), name='api-tournament-register'),
    path('tournament/unregister', UnregisterTournamentView.as_view(), name='api-tournament-unregister'),
    path('tournament/games/upcoming', GetUpcomingGamesView.as_view(), name='api-tournament-upcoming-games'),
    path('tournament/stats/<slug:username>', GetUserTournamentStatsView.as_view(), name='api-user-tournament-stats'),
    path('tournament/aliases/<slug:username>', GetTournamentAliasesView.as_view(), name='api-get-tournament-aliases'),
]
