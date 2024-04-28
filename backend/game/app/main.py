import math
import random

from django.utils import timezone
from django.utils.html import escape

from .models import Tournaments, Matches
from .serializers import TournamentsSerializer, MatchesSerializer


class TournamentsController:

    def __init__(self):
        pass

    def get_tournament(self, tournament_id: str) -> Tournaments:
        """ Get tournament by id

        Parameters
        ----------
        tournament_id : str

        Returns
        -------
        Tournaments

        """
        return Tournaments.objects.filter(id=tournament_id).first()

    def get_tournaments_by_ids(self, tournament_ids: list, filters: list = list()) -> list:
        """ Get tournamnets by ids

        Parameters
        ----------
        tournament_ids : list
        filters : list

        Returns
        -------
        list

        """
        return list(Tournaments.objects.filter(id__in=tournament_ids).values(*filters))

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
            'name': escape(request_data.get('name', '')),
            'game': game,
            'size': size,
            'host': logged_user,
        })

        if serializer.is_valid():
            serializer.save()
        else:
            return {'message': 'Invalid values for tournament fields', 'errors': serializer.errors}

        return {'message': 'Tournament successfully created'}

    def get_tournament_list(self, logged_user: str) -> dict:
        """ Get the list of tournaments for tournament view

        Parameters
        ----------
        logged_user : str

        Returns
        -------
        dict

        """
        tournaments = list(Tournaments.objects.filter().order_by('-created_at').values())

        for tournament in tournaments:
            tournament['registered'] = f"{len(tournament['participants'])}/{tournament['size']}"
            tournament['created_at'] = timezone.localtime(tournament['created_at']).strftime("%H:%M - %d/%m/%Y")

            tournament['activity'] = {'type': 'button'}

            if tournament['status'] == 'registration':
                tournament['activity']['title'] = 'unregister' if logged_user in tournament['participants'] else 'register'
            elif tournament['status'] == 'started':
                tournament['activity']['title'] = 'watch'
            else:
                tournament['activity']['title'] = 'results'

        return {'data': {
            'tournaments': tournaments,
            'headers': {
                'name': 'Name',
                'game': 'Game',
                'size': 'Size',
                'registered': 'Registered',
                'host': 'Host',
                'created_at': 'Created',
                'status': 'Status',
                'activity': 'Activity',
            }
        }}

    def register_tournament(self, logged_user: str, request_data: dict) -> dict:
        """ Register the logger user to the provided tournament

        Parameters
        ----------
        logged_user : str
        request_data : dict

        Returns
        -------
        dict

        """
        if not (tournament_id := request_data.get('tournament_id')):
            return {'status': 1, 'message': 'Tournament id not specified'}

        if not (alias := request_data.get('alias')):
            return {'status': 1, 'message': 'Alias for the username is not specified'}

        if len(alias) > 16:
            return {'status': 1, 'message': 'The length of an alias name cannot be greater than 16'}

        if not (tournament := self.get_tournament(tournament_id)):
            return {'status': 1, 'message': 'Tournament not found by specified id'}

        if tournament.status != 'registration':
            return {'status': 1, 'message': 'The tournament is not at the registration stage'}

        if logged_user in (tournament_participants := tournament.participants):
            return {'status': 1, 'message': 'Already registered for the specified tournament'}

        if (tournament_size := tournament.size) == len(tournament_participants):
            return {'status': 1, 'message': 'The tournament is already full'}

        draw = {}
        status = 'registration'
        tournament_participants[logged_user] = {'alias': alias}

        if tournament_size == len(tournament_participants):
            status = 'started'
            draw = getattr(self, f"organize_{tournament.game}_matchmaking")(tournament_participants, tournament_id)

        serializer = TournamentsSerializer(
            tournament,
            data={
                'participants': tournament_participants,
                'status': status,
                'draw': draw,
            },
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
        else:
            return {'status': 1, 'message': 'An unexpected error occurred while registering for the tournament'}

        return {'message': 'Successfully registered for the tournament'}

    def unregister_tournament(self, logged_user: str, request_data: dict) -> dict:
        """ Unregister the logger user to the provided tournament

        Parameters
        ----------
        logged_user : str
        request_data : dict

        Returns
        -------
        dict

        """
        if not (tournament_id := request_data.get('tournament_id')):
            return {'status': 1, 'message': 'Tournament id not specified'}

        if not (tournament := self.get_tournament(tournament_id)):
            return {'status': 1, 'message': 'Tournament not found by specified id'}

        if tournament.status != 'registration':
            return {'status': 1, 'message': 'The tournament is not at the registration stage'}

        if logged_user not in (tournament_participants := tournament.participants):
            return {'status': 1, 'message': 'Already unregistered from the specified tournament'}

        tournament_participants.pop(logged_user)

        serializer = TournamentsSerializer(tournament, data={'participants': tournament_participants}, partial=True)

        if serializer.is_valid():
            serializer.save()
        else:
            return {'status': 1, 'message': 'An unexpected error occurred while unregistering from the tournament'}

        return {'message': 'Successfully unregistered from the tournament'}

    def organize_pong_matchmaking(self, players: dict, tournament_id: str) -> dict:
        """ Organize a pong tournament single elimination bracket

        Parameters
        ----------
        players : dict
        tournament_id : str

        Returns
        -------
        dict

        """
        player_names = list(players.keys())

        root = {
            "matchId": "",
            "leftUser": "",
            "leftScore": "",
            "rightUser": "",
            "rightScore": "",
            "left": {},
            "right": {}
        }

        return self.__create_bracket(
            root,
            root.copy(),
            player_names,
            '',
            1,
            int(math.log2(len(players))),
            tournament_id
        )

    def __create_bracket(
        self,
        root: dict,
        root_copy: dict,
        players: list,
        current_path: int,
        current_depth: int,
        max_depth: int,
        tournament_id: str
    ) -> dict:
        """ Returns single elimination bracket tree, also initializing first-level matches

        Parameters
        ----------
        root : dict
        root_copy : dict
        players : list
        current_path : int
        current_depth : int
        max_depth : int
        tournament_id : str

        Returns
        -------
        dict

        """
        if current_depth == max_depth:
            return

        if not root["left"]:
            root["left"] = root_copy.copy()

            if current_depth + 1 == max_depth:
                left_user, right_user = self.__get_players_pair(players)
                root["left"]["matchId"] = MatchesController().create_match(
                    'pong',
                    [left_user, right_user],
                    tournament_path=current_path + "/left",
                    tournament_id=tournament_id
                )
                root["left"]["leftUser"] = left_user
                root["left"]["rightUser"] = right_user

        if not root["right"]:
            root["right"] = root_copy.copy()

            if current_depth + 1 == max_depth:
                left_user, right_user = self.__get_players_pair(players)
                root["right"]["matchId"] = MatchesController().create_match(
                    'pong',
                    [left_user, right_user],
                    tournament_path=current_path + "/right",
                    tournament_id=tournament_id
                )
                root["right"]["leftUser"] = left_user
                root["right"]["rightUser"] = right_user

        self.__create_bracket(
            root["left"],
            root_copy,
            players,
            f"{current_path}/left",
            current_depth + 1,
            max_depth,
            tournament_id
        )
        self.__create_bracket(
            root["right"],
            root_copy,
            players,
            f"{current_path}/right",
            current_depth + 1,
            max_depth,
            tournament_id
        )

        return root

    def __get_players_pair(self, players: list) -> tuple:
        """ This function provides matchmaking logic (not yet, it's just a random match)

        Parameters
        ----------
        players : list

        Returns
        -------
        tuple

        """
        return (players.pop(random.randrange(0, len(players))), players.pop(random.randrange(0, len(players))))


class MatchesController:

    def __init__(self):
        pass

    def get_match(self, logged_username: str, match_id: str) -> dict:
        """ Get a match by id that belongs to the logged user

        Parameters
        ----------
        logged_username : str
        match_id : str

        Returns
        -------
        dict

        """
        match = self.get_match_by_id(match_id)

        if not match or logged_username not in match.players:
            match = {}
        else:
            tournament = {}

            if match_tournament := match.tournament:
                tournament_record = TournamentsController().get_tournament(match_tournament['id'])
                tournament = {
                    'id': tournament_record.id,
                    'name': tournament_record.name,
                    'host': tournament_record.host,
                    'participants': tournament_record.participants,
                }

            match = {
                'id': str(match.id),
                'game': match.game,
                'players': match.players,
                'tournament': tournament,
                'status': match.status,
            }

        return {'data': {'match': match}}

    def get_match_by_id(self, match_id: str) -> Matches:
        """ Get match by id

        Parameters
        ----------
        match_id : str

        Returns
        -------
        Matches

        """
        return Matches.objects.filter(id=match_id).first()

    def create_match(self, game: str, players: list, tournament_path='', tournament_id='') -> str:
        """ Create a arbitrary match record for singl or tournament games

        Parameters
        ----------
        game : str
        players : list

        Returns
        -------
        str

        """
        tournament_data = {}

        if tournament_id and tournament_path:
            tournament_data['id'] = tournament_id
            tournament_data['path'] = tournament_path

        serializer = MatchesSerializer(data={
            'game': game,
            'players': players,
            'stats': {player: {} for player in players},
            'score': {player: 0 for player in players},
            'tournament': tournament_data
        })

        if serializer.is_valid():
            match = serializer.save()

            return str(match.id)

    def get_user_upcoming_games(self, logged_username: str) -> dict:
        """ Get user upcoming games

        Parameters
        ----------
        logged_username : str

        Returns
        -------
        dict

        """
        tournament_ids = set()
        matches = []

        for match in Matches.objects.filter(
            players__has_key=logged_username,
            status='created'
        ).order_by('-created_at').values('id', 'game', 'players', 'stats', 'score', 'tournament'):
            matches.append(match)

            if (tournament := match.get('tournament')) and (tournament_id := tournament.get('id')):
                tournament_ids.add(tournament_id)\

        tournaments = {
            str(tournament.get('id')): tournament for tournament in
            TournamentsController().get_tournaments_by_ids(tournament_ids, ['id', 'name', 'participants'])
            if tournament.get('id')
        }

        return {'data': {'matches': matches, 'tournaments': tournaments}}
