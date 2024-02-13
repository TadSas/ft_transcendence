from django.http import JsonResponse

from rest_framework.views import APIView

from .main import RoomController
from .permissions import JWTAuthentication


class CreateRoomView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({
            'status': 0, **RoomController().create_room(request.user.get('login'), request.data.get('chatter'))
        })


class GetRoomView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, requset, room_id=''):
        return JsonResponse({
            'status': 0, **RoomController().get_user_room(room_id, requset.user.get('login'))
        })


class GetRoomsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return JsonResponse({
            'status': 0,
            **RoomController().get_user_rooms(request.user.get('login'))
        })


class GetRoomMessagesView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, room_id=''):
        return JsonResponse({
            'status': 0,
            **RoomController().get_room_messages(room_id, request.user.get('login'))
        })


class BlockUserView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, room_id='', username=''):
        return JsonResponse({
            'status': 0,
            **RoomController().block_user(room_id, username, request.user.get('login'))
        })