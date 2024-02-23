from .models import Tournaments
from .serializers import TournamentsSerializer


class TournamentsController:

    def __init__(self):
        pass

    def create_tournament(self, logged_user: str, request_data: dict) -> dict:
        """ Creates a tournament by the logged user

        Parameters
        ----------
        logged_user : str
        request_data : dict

        Returns
        -------
        dict

        """
        errors = {}

        if (game := request_data.get('game', '')) not in ['pong']:
            errors['game'] = ['Tournament game is not correct']

        if (size := request_data.get('size', 4)) not in [4, 8, 16, 32, 64]:
            errors['size'] = ['Tournament size is not correct']

        if errors:
            return {'message': 'Invalid values for tournament fields', 'errors': errors}

        serializer = TournamentsSerializer(data={
            'name': request_data.get('name', ''),
            'game': game,
            'size': size,
            'host': logged_user,
        })

        if serializer.is_valid():
            serializer.save()
        else:
            return {'message': 'Invalid values for tournament fields', 'errors': serializer.errors}

        return {'message': 'Tournament successfully created'}

    def get_tournaments(self, logged_user: str) -> dict:
        """

        Parameters
        ----------
        logged_user : str

        Returns
        -------
        dict

        """
        return {'data': {
            'tournaments': list(
                Tournaments.objects.filter().order_by('-created_at').values()
            ),
            'headers': {
                'name': 'Name',
                'game': 'Game',
                'size': 'Size',
                'participants': 'Participants',
                'host': 'Host',
                'status': 'Status'
            }
        }}