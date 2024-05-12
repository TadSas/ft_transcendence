import socket

from django.http import JsonResponse

from rest_framework.views import APIView

from chat.settings import GAME_SERVER

from .main import RoomController
from .permissions import JWTAuthentication


class CreateRoomView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        return JsonResponse({
            'status': 0, **RoomController().create_room(request.user.get('login'), request.data.get('chatter'))
        })


class CreateTournamentRoomView(APIView):

    def post(self, request):
        ip, port = GAME_SERVER.split('http://')[-1].split(':')
        tournament_server = list(map(lambda x: x[4][0], socket.getaddrinfo(ip, int(port), type=socket.SOCK_STREAM)))

        if request.META.get('REMOTE_ADDR') not in tournament_server:
            return JsonResponse({'status': 1, 'message': 'Not registered service'})

        return JsonResponse({
            'status': 0, **RoomController().create_tournament_room(request.data)
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

class UnblockUserView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request, room_id='', username=''):
        return JsonResponse({
            'status': 0,
            **RoomController().unblock_user(room_id, username, request.user.get('login'))
        })