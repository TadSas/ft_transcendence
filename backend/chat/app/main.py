from .models import Rooms
from .serializers import RoomsSerializer


class RoomController:

    def __init__(self):
        pass

    def create_room(self, user: str, chatter: str) -> str:
        """

        Parameters
        ----------
        user : str
        chatter : str

        Returns
        -------
        str

        """
        result = {'data': {}}

        if not user or not chatter:
            return result

        if room := Rooms.objects.filter(participants__contains=[user, chatter]).first():
            result['data']['room_id'] = str(room.id)

            return result

        serializer = RoomsSerializer(data={'participants': [user, chatter]})

        if serializer.is_valid():
            room = serializer.save()
            result['data']['room_id'] = str(room.id)

        return result

    def get_rooms(self, user: str) -> list:
        """

        Parameters
        ----------
        user : str

        Returns
        -------
        list

        """
        return {
            'data': list(Rooms.objects.filter(participants__contains=[user]).values('id', 'participants'))
        }
