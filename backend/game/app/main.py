import json
import math
import random

from typing import Any
from django.utils import timezone
from django.utils.html import escape
from urllib.request import Request, urlopen

from game.settings import CHAT_SERVER

from .models import Tournaments, Matches
from .serializers import TournamentsSerializer, MatchesSerializer
from .utils import ws_handshake, ws_send_message, ws_close_connection


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

    def get_user_tournament_stats(self, logged_user: str, username: str) -> dict:
        """

        Parameters
        ----------
        logged_user : str
        username : str

        Returns
        -------
        dict

        """
        tournaments = []
        places = {
            1: 'Finals',
            2: 'Semifinals',
            3: 'Quarterfinals',
            4: 'Round of 16',
            5: 'Round of 32',
            6: 'Round of 64',
            7: 'Round of 128',
            8: 'Round of 256',
        }

        for tournament in list(Tournaments.objects.filter(
            participants__has_key=username,
            status='finished'
        ).order_by('-created_at').values()):
            draw = tournament.get('draw')
            left_user = draw['leftUser']
            right_user = draw['rightUser']

            if username in (left_user, right_user):
                place = 'Winner' if (left_user if draw['leftScore'] > draw['rightScore'] else right_user) == username else 'Finalist'
            else:
                place = places.get(self.get_draw_level(draw, username, 1), 'Participant')

            tournaments.append({
                'name': tournament.get('name'),
                'place': place,
            })

        return {'data': tournaments}

    def get_draw_level(self, node: dict, data: Any, level: int) -> int:
        """ Get draw level

        Parameters
        ----------
        node : dict
        data : Any
        level : int

        Returns
        -------
        int

        """
        if not node:
            return 0

        if data in (node['leftUser'], node['rightUser']):
            return level

        down_level = self.get_draw_level(node['left'], data, level + 1)

        if (down_level != 0):
            return down_level

        down_level = self.get_draw_level(node['right'], data, level + 1)

        return down_level

    def get_tournament_aliases(self, username: str) -> dict:
        """ Get tournament aliases

        Parameters
        ----------
        username : str

        Returns
        -------
        dict
        select participants->'stadevos'->>'alias' from app_tournaments where participants::text ilike '%stadevos%' and status in ('registration', 'started');
        """
        aliases = []

        for tournament in list(Tournaments.objects.filter(
            participants__has_key=username,
            status__in=('registration', 'started')
        ).order_by('-created_at').values()):
            aliases.append(((tournament.get('participants') or {}).get(username) or {}).get('alias') or '')

        return {'data': {'aliases': aliases}}

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

    def start_tournament(self, tournament_id: str):
        """ Change tournament status to started

        Parameters
        ----------
        tournament_id : str

        """
        tournament = self.get_tournament(tournament_id)

        if tournament.status == 'started':
            return

        serializer = TournamentsSerializer(tournament, data={
            'name': tournament.name,
            'game': tournament.game,
            'host': tournament.host,
            'status': 'started'
        })

        if serializer.is_valid():
            serializer.save()

    def finish_tournament(self, tournament_id: str):
        """ Change tournament status to finished

        Parameters
        ----------
        tournament_id : str
        draw : dict

        """
        tournament = self.get_tournament(tournament_id)

        serializer = TournamentsSerializer(tournament, data={
            'name': tournament.name,
            'game': tournament.game,
            'host': tournament.host,
            'status': 'finished'
        })

        if serializer.is_valid():
            serializer.save()

    def update_tournament_draw(self, tournament_id, draw):
        """ Update tournament draw

        Parameters
        ----------
        tournament_id : str
        draw : dict
        """
        tournament = self.get_tournament(tournament_id)

        serializer = TournamentsSerializer(tournament, data={
            'name': tournament.name,
            'game': tournament.game,
            'host': tournament.host,
            'status': tournament.status,
            'draw': draw
        })

        if serializer.is_valid():
            serializer.save()

    def update_match(self, tournament_id: str, match_path: str, score: dict, finished: bool = False):
        """ Update tournament match result

        Parameters
        ----------
        tournament_id : str
        match_path : str
        score : dict
        finished : bool

        """
        tournament = self.get_tournament(tournament_id)
        draw = tournament.draw

        match, parent_match, relation_side = self.get_tournament_match_by_path(draw, match_path)
        match['leftScore'] = score['left']
        match['rightScore'] = score['right']
        match_cont = MatchesController()

        if relation_side:
            parent_match[f"{relation_side}User"] = match[f'{max(score, key=score.get)}User']

            if (
                finished and
                (left_user := parent_match['leftUser']) and
                (right_user := parent_match['rightUser']) and
                not parent_match['matchId']
            ):
                parent_match['matchId'] = match_cont.create_match(
                    game=tournament.game,
                    players=[left_user, right_user],
                    tournament_path='/'.join(match_path.split('/')[:-1]) or '/',
                    tournament_id=tournament_id
                )

                for user in (left_user, right_user):
                    self.send_tournament_notification(
                        tournament.name,
                        f'Tournament({tournament.name})',
                        tournament.participants[user].get('room_id'),
                        user,
                        match_cont.get_tournament_game(tournament_id, user)
                    )
        else:
            finished and self.finish_tournament(tournament_id)

        self.update_tournament_draw(tournament_id, draw)

    def get_tournament_match_by_path(self, draw: dict, match_path: str) -> tuple:
        """ Get tournament match and parent match by path

        Parameters
        ----------
        draw : dict
        match_path : str

        Returns
        -------
        tuple

        """
        component = ''
        parent_match = draw

        for component in list(filter(lambda x: x, match_path.split('/'))):
            parent_match = draw
            draw = parent_match.get(component) or {}

        return (draw, parent_match, component)

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
        tournament_participants[logged_user] = {'alias': escape(alias)}

        if tournament_size == len(tournament_participants):
            status = 'started'
            draw = getattr(self, f"organize_{tournament.game}_matchmaking")(tournament_participants, tournament_id)
            self.notify_tournament_participants(tournament_id, tournament.name, tournament_participants)

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

    def notify_tournament_participants(self, tournament_id: str, tournament_name: str, tournament_participants: dict):
        """ Notify tournament participants

        Parameters
        ----------
        tournament_id : str
        tournament_name : str
        tournament_participants : dict

        """
        match_cont = MatchesController()

        for participant in tournament_participants:
            try:
                tournament_alias = f'Tournament({tournament_name})'
                request = Request(
                    url=f"{CHAT_SERVER}/chat/api/rooms/tournament/create",
                    data=json.dumps({'participants': [participant, tournament_alias]}).encode()
                )
                request.add_header('Content-Type', 'application/json')

                with urlopen(request) as response:
                    response_data = json.loads(response.read().decode())

                    if response_data.get('status') == 1:
                        continue

                    room_id = response_data['data']['room_id']
                    tournament_participants[participant]['room_id'] = room_id

                    self.send_tournament_notification(
                        tournament_name,
                        tournament_alias,
                        room_id,
                        participant,
                        match_cont.get_tournament_game(tournament_id, participant)
                    )

            except Exception:
                continue

    def send_tournament_notification(
        self,
        tournament_name: str,
        tournament_alias: str,
        room_id: str,
        participant: str,
        match: dict
    ):
        """ Send tournament notification

        Parameters
        ----------
        tournament_name : str
        tournament_alias : str
        room_id : str
        participant : str
        match : dict

        """
        players = match.get('players')
        players.remove(participant)
        message = f"""
        Hi <u><strong>{participant}</strong></u><br><br>

        Exciting news! You have been paired up for a match in the upcoming <u><strong>{tournament_name}</strong></u> (tournament).<br>
        Your opponent is <u><strong>{players[0]}</strong></u>. Get ready to bring your A-game and show off your skills.<br>
        Good luck, and may the best player win!<br><br>

        Best regards,<br>
        <u><strong>Squeeze, Inc</strong></u>
        """

        try:
            request = Request(
                url=f"{CHAT_SERVER}/chat/api/rooms/tournament/message/send",
                data=json.dumps({'room_id': room_id, 'message': message, 'sender': tournament_alias}).encode()
            )
            request.add_header('Content-Type', 'application/json')

            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())

                if response_data.get('status') == 1:
                    return

            socket = ws_handshake('chat', '/chat/room/tournament_notifications', 8082)
            ws_send_message(socket, {'type': 'tournament_notification', 'players': [participant], 'message': message})
            ws_close_connection(socket)
        except Exception:
            pass

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

    def get_user_stats(self, logged_username: str, username: str) -> dict:
        """ Get user stats

        Parameters
        ----------
        logged_username : str
        username : str

        Returns
        -------
        dict

        """
        played = won = lost = 0

        for match in Matches.objects.filter(players__contains=[username], status='finished').values():
            if len(match.get('players', [])) <= 1:
                continue

            score = match.get('score') or {}

            if max(score, key=score.get) == username:
                won += 1
            else:
                lost += 1

            played += 1

        return {'data': {'played': played, 'won': won, 'lost': lost}}

    def get_user_match_history(self, logged_username: str, username: str) -> dict:
        """ Get user match history

        Parameters
        ----------
        logged_username : str
        username : str

        Returns
        -------
        dict

        """
        result = []
        match_history = list(Matches.objects.filter(players__contains=[username], status='finished').order_by('-created_at').values())

        for match in match_history:
            match['created_at'] = timezone.localtime(match['created_at']).strftime("%H:%M - %d/%m/%Y")

            if len(players := match['players'].copy()) <= 1:
                continue

            players.remove(username)
            score = match['score']

            if len(players) > 0:
                match['against'] = players[0]
            else:
                match['against'] = 'himself'

            if max(score, key=score.get) == username:
                match['result'] = "Win"
            else:
                match['result'] = "Lose"

            match['score'] = f'{score[match['players'][0]]} : {score[match['players'][-1]]}'

            result.append(match)

        return {'data': {
            'match_history': result,
            'headers': {
                'game': 'Game',
                'score': 'Score',
                'against': 'Against',
                'created_at': 'Created at',
                'result': 'Result',
            }
        }}

    def get_tournament_game(self, tournament_id: str, participant: str, status: str = 'created') -> dict:
        """ Get tournament game

        Parameters
        ----------
        tournament_id : str
        participant : str
        status : str, optional

        Returns
        -------
        dict

        """
        return Matches.objects.filter(
            tournament__contains={'id': tournament_id},
            players__contains=[participant],
            status=status
        ).values().first()

    def update_match_status(self, match_id: str, status: str):
        """ Update match status

        Parameters
        ----------
        match_id : str
        status : str

        """
        if status not in ('created', 'playing', 'finished'):
            return

        match = self.get_match_by_id(match_id)
        serializer = MatchesSerializer(match, data={'game': match.game, 'status': status})

        if serializer.is_valid():
            serializer.save()

        if (tournament := match.tournament) and (tournament_id := tournament.get('id')):
            TournamentsController().start_tournament(tournament_id)

    def update_match_score(self, match_id: str, score: dict, status: str = ''):
        """ Update match score

        Parameters
        ----------
        match_id : str
        score : dict
        status : str

        """
        match = self.get_match_by_id(match_id)
        match_players = match.players
        player_length = len(match.players)

        updated_score = match.score
        updated_stats = match.stats

        if tournamnet_data := match.tournament:
            TournamentsController().update_match(
                tournament_id=tournamnet_data.get('id'),
                match_path=tournamnet_data.get('path'),
                score=score,
                finished=status=='finished'
            )

        if len(match_players) > 1:
            for player in match_players[:player_length // 2]:
                updated_score[player] = score['left']

            for player in match_players[player_length // 2:]:
                updated_score[player] = score['right']
        else:
            updated_score[f'{match_players[0]}Left'] = score['left']
            updated_score[f'{match_players[0]}Right'] = score['right']

        serializer = MatchesSerializer(
            match,
            data={
                'game': match.game,
                'stats': updated_stats,
                'score': updated_score,
                'status': status or match.status
            }
        )

        if serializer.is_valid():
            serializer.save()

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

    def create_new_match(self, logged_user: str, request_data: dict) -> dict:
        """ Creates new match instance

        Parameters
        ----------
        logged_user : str
        request_data : dict

        Returns
        -------
        dict

        """
        pong_map = request_data.get('map') or 1
        players = [logged_user]
        game = game if (game := request_data.get('game')) in ['pong'] else 'pong'

        if (username := request_data.get('username')) and username not in players:
            players.append(username)

        return {'data': {'match_id': self.create_match(game=game, players=players, match_map=pong_map)}}

    def create_match(
        self,
        game: str,
        players: list,
        tournament_path: str = '',
        tournament_id: str = '',
        match_map: int = 1
    ) -> str:
        """ Create a arbitrary match record for singl or tournament games

        Parameters
        ----------
        game : str
        players : list
        tournament_path : str
        tournament_id : str
        match_map : int

        Returns
        -------
        str

        """
        tournament_data = {}
        stats = (
            {player: {} for player in players}
            if len(players) > 1 else
            {f'{players[0]}Left': {}, f'{players[0]}Right': {}}
        )
        score = (
            {player: 0 for player in players}
            if len(players) > 1 else
            {f'{players[0]}Left': 0, f'{players[0]}Right': 0}
        )

        if tournament_id and tournament_path:
            tournament_data['id'] = tournament_id
            tournament_data['path'] = tournament_path

        serializer = MatchesSerializer(data={
            'game': game,
            'players': players,
            'stats': stats,
            'score': score,
            'customizations': {'map': match_map},
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
            status__in=['created', 'playing']
        ).order_by('-created_at').values('id', 'game', 'players', 'stats', 'score', 'status', 'tournament', 'created_at'):
            match['created_at'] = timezone.localtime(match['created_at']).strftime("%H:%M - %d/%m/%Y")

            if len(match_players := match.get('players') or []) <= 1 and logged_username not in match_players:
                continue

            matches.append(match)

            if (tournament := match.get('tournament')) and (tournament_id := tournament.get('id')):
                tournament_ids.add(tournament_id)

        tournaments = {
            str(tournament.get('id')): tournament for tournament in
            TournamentsController().get_tournaments_by_ids(tournament_ids, ['id', 'name', 'participants'])
            if tournament.get('id')
        }

        return {'data': {'matches': matches, 'tournaments': tournaments}}
