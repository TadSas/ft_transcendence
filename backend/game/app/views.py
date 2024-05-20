from django.http import JsonResponse

from rest_framework.views import APIView

from .permissions import JWTAuthentication
from .main import TournamentsController, MatchesController


class CreateTournamentView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({
            'status': 0, **TournamentsController().create_tournament(request.user.get('login'), request.data)
        })


class GetTournamentListView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({
            'status': 0,  **TournamentsController().get_tournament_list(request.user.get('login'))
        })


class RegisterTournamentView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({
            'status': 0, **TournamentsController().register_tournament(request.user.get('login'), request.data)
        })


class UnregisterTournamentView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({
            'status': 0, **TournamentsController().unregister_tournament(request.user.get('login'), request.data)
        })


class GetUserTournamentStatsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, username = ''):
        return JsonResponse({
            'status': 0, **TournamentsController().get_user_tournament_stats(request.user.get('login'), username)
        })


class GetTournamentAliasesView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, username = ''):
        return JsonResponse({'status': 0, **TournamentsController().get_tournament_aliases(username)})


class GetUpcomingGamesView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({
            'status': 0, **MatchesController().get_user_upcoming_games(request.user.get('login'))
        })


class GetMatchView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, match_id = ''):
        return JsonResponse({
            'status': 0, **MatchesController().get_match(request.user.get('login'), match_id)
        })


class CreateMatchView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({
            'status': 0, **MatchesController().create_new_match(request.user.get('login'), request.data)
        })


class GetUserStatsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, username = ''):
        return JsonResponse({
            'status': 0, **MatchesController().get_user_stats(request.user.get('login'), username)
        })


class GetUserMatchHistoryView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, username = ''):
        return JsonResponse({
            'status': 0, **MatchesController().get_user_match_history(request.user.get('login'), username)
        })
