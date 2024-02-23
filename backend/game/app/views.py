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


class GetTournamentsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(sel, request):
        return JsonResponse({
            'status': 0,  **TournamentsController().get_tournaments(request.user.get('login'))
        })