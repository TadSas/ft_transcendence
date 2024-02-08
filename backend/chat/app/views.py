from django.http import JsonResponse

from rest_framework.views import APIView

from .main import RoomController
from .permissions import JWTAuthentication


class CreateRoomView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({'status': 0, **RoomController().create_room(
            request.user.get('login'),
            request.data.get('chatter')
        )})


class GetRoomsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({'status': 0, **RoomController().get_rooms(request.user.get('login'))})