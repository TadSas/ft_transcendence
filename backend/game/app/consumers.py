import json
import threading

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .games import Pong
from .main import MatchesController


class PongGameConsumer(AsyncWebsocketConsumer):
    user_mapping = dict()
    connected_users = dict()
    room_game_instances = dict()
    threads = dict()

    async def connect(self):
        if 'user' not in self.scope:
            return await self.close(code=4004)

        try:
            username = self.scope['user'].get('login')
            match_id = self.scope['url_route']['kwargs']['match_id']
        except Exception:
            return await self.close(code=4005)

        try:
            match = await database_sync_to_async(MatchesController().get_match_by_id)(match_id)
            match_players = match.players
        except Exception:
            return await self.close(code=4006)

        if not match_players or username not in match_players:
            return await self.close(code=4007)

        self.room_group_name = match_id

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        self.user_mapping[self.channel_name] = username

        if match_id in self.connected_users:
            self.connected_users[match_id].add(username)
        else:
            self.connected_users[match_id] = {username}

        await self.accept()

        if set(match_players) == set(self.connected_users[match_id]):
            if match_id not in self.room_game_instances:
                match_score = match.score
                left_user = match_players[0]
                right_user = match_players[-1]
                multiplayer = len(match_players) > 1

                game_instance = Pong(
                    players=(
                        {left_user: 'left.0', right_user: 'right.0'}
                        if multiplayer else
                        {f'{left_user}Left': 'left.0', f'{right_user}Right': 'right.0'}
                    ),
                    score= (
                        {'left': match_score[left_user], 'right': match_score[right_user]}
                        if multiplayer else
                        {'left': match_score[f'{left_user}Left'], 'right': match_score[f'{left_user}Right']}
                    ),
                    multiplayer=multiplayer,
                    channel_layer=self.channel_layer,
                    room_group_name=self.room_group_name,
                )
                self.room_game_instances[match_id] = game_instance

                await database_sync_to_async(MatchesController().update_match_status)(match_id, 'playing')

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'pong_start',
                        **await game_instance.initialize()
                    }
                )

                loop_thread = threading.Thread(
                    target=game_instance.broadcast_wrapper,
                    args=(self.channel_layer, self.room_group_name)
                )
                self.threads[match_id] = loop_thread

                loop_thread.start()
            # else:
                # self.room_game_instances[self.room_group_name].do_broadcast = True

    async def disconnect(self, code):
        self.connected_users[self.room_group_name].remove(self.user_mapping[self.channel_name])

        if not len(self.connected_users[self.room_group_name]):
            if self.room_group_name in self.room_game_instances:
                self.room_game_instances[self.room_group_name].do_broadcast = False

            if self.room_group_name in self.threads:
                self.threads[self.room_group_name].join()
                self.threads.pop(self.room_group_name, None)

            self.room_game_instances.pop(self.room_group_name, None)
            self.connected_users.pop(self.room_group_name, None)
        # else:
        #     if self.room_group_name in self.room_game_instances:
        #         self.room_game_instances[self.room_group_name].do_broadcast = False

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if self.room_group_name in self.room_game_instances:
            game_instance = self.room_game_instances[self.room_group_name]

            await getattr(
                game_instance,
                data.get('type'),
                game_instance.unknown_action
            )(player=self.scope['user']['login'], data=data)

            await game_instance.move_ball()

    async def pong_start(self, event):
        await self.send(text_data=json.dumps({**event}))

    async def pong_packet(self, event):
        await self.send(text_data=json.dumps({**event}))

    async def pong_reconnect(self, event):
        await self.send(text_data=json.dumps({**event}))

    async def pong_end(self, event):
        await self.send(text_data=json.dumps({**event}))
