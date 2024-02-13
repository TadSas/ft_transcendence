from django.utils import timezone
from django.forms.models import model_to_dict

from .utils import is_valid_uuid
from .models import Rooms, Messages
from .serializers import RoomsSerializer


class RoomController:

    def __init__(self):
        pass

    def create_room(self, user: str, chatter: str) -> str:
        """ Creates the room with the specified user and chatter

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

    def get_room(self, room_id: str) -> Rooms:
        """ Returnes the room with specified room id

        Parameters
        ----------
        room_id : str

        Returns
        -------
        Rooms

        """
        return Rooms.objects.filter(id=room_id).first()

    def get_user_room(self, room_id: str, user: str) -> dict:
        """

        Parameters
        ----------
        room_id : str
        user : str

        Returns
        -------
        dict

        """
        room = self.get_room(room_id)

        if not room:
            return {'status': 1, 'message': "Room not found"}

        if user not in room.participants:
            return {'status': 1, 'message': "You don't have access to this room"}

        return {'data': {'room': model_to_dict(room)}}

    def get_user_rooms(self, user: str) -> list:
        """ Returns rooms and last message of that room that the user acts as a participant

        Parameters
        ----------
        user : str

        Returns
        -------
        list

        """
        rooms = self.get_unfiltered_rooms(user)
        messagesCont = MessagesController()

        for room in rooms:
            last_message = messagesCont.get_room_last_message(room.get('id'))
            created_at = last_message.get('created_at') or ''

            room['participants'].remove(user)
            room['activity'] = {
                'sender': last_message.get('sender') or '',
                'message': last_message.get('message') or '',
                'sent_date': created_at and timezone.localtime(created_at).strftime("%d-%m-%Y %H:%M") or ''
            }

        return {'data': rooms}

    def get_unfiltered_rooms(self, user: str) -> list:
        """ Returns all rooms for specified user

        Parameters
        ----------
        user : str

        Returns
        -------
        list

        """
        return list(Rooms.objects.filter(participants__contains=[user]).values('id', 'participants'))

    def get_room_participants(self, room_id: str) -> list:
        """ Returns room participants for specified room id

        Parameters
        ----------
        room_id : str

        Returns
        -------
        list

        """
        return self.get_room(room_id).participants or []

    def get_room_messages(self, room_id: str, username: str) -> dict:
        """ Returns room messages for specified room id also checking if the user can access it

        Parameters
        ----------
        room_id : str
        username : str

        Returns
        -------
        dict

        """
        if not is_valid_uuid(room_id) or username not in (self.get_room_participants(room_id)):
            return {'data': []}

        return {'data': MessagesController().get_room_messages(room_id)}

    def block_user(self, room_id: str, username: str, logged_username: str) -> dict:
        """

        Parameters
        ----------
        room_id : str
        username : str
        logged_username : str

        Returns
        -------
        dict

        """
        error_response = {'status': 1, 'message': ''}

        if not is_valid_uuid(room_id):
            error_response['message'] = 'Invalid room identifier'

            return error_response

        if not (room := self.get_room(room_id)):
            error_response['message'] = 'Room not found'

            return error_response

        if not (room_participants := room.participants):
            error_response['message'] = 'Room participants not found'

            return error_response

        if logged_username not in room_participants:
            error_response['message'] = "You don't have access to this room"

            return error_response

        if username not in room_participants:
            error_response['message'] = 'User not found in the room participant list'

            return error_response

        serializer = RoomsSerializer(
            room,
            data={'blocked': {username: {'from': logged_username}}},
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

        return {'data': serializer.validated_data}


class MessagesController:

    def __init__(self):
        pass

    def save_message(self, sender: str, message: str, room_id: str) -> None:
        """ Saves the message information with specified room id

        Parameters
        ----------
        sender : str
        message : str
        room_id : str

        """
        return Messages.objects.create(
            room=Rooms.objects.get(id=room_id),
            message=message,
            sender=sender
        )

    def get_room_messages(self, room_id: str) -> list:
        """ Returns room all messages for specified room id

        Parameters
        ----------
        room_id : str

        Returns
        -------
        list

        """
        return list(
            map(
                lambda message: message.update({
                    'created_at': timezone.localtime(message['created_at']).strftime("%d-%m-%Y %H:%M")
                }) or message,
                Messages.objects.filter(room=room_id).order_by('created_at').values('message', 'sender', 'created_at')
            )
        )

    def get_room_last_message(self, room_id: str) -> Messages:
        """ Returns the last message of specified room id

        Parameters
        ----------
        room_id : str

        Returns
        -------
        Messages

        """
        last_message = Messages.objects.filter(room=room_id).order_by('-created_at').values()

        return last_message[0] if last_message.count() > 0 else {}
