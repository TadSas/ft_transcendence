from django.http import JsonResponse

from rest_framework.views import APIView

from .main import TournamentsController
from .permissions import JWTAuthentication


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
