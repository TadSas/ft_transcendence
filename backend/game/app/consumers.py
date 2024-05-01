import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .main import MatchesController


class PongGameConsumer(AsyncWebsocketConsumer):
    connected_users = dict()
    user_mapping = dict()

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

        self.match_players = match_players

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

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'pong_ready',
                'now_connected': username,
                'connected_users': list(self.connected_users[self.room_group_name]),
            }
        )

    async def disconnect(self, code):
        username = self.user_mapping[self.channel_name]
        self.connected_users[self.room_group_name].remove(username)

        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'pong_ready',
                'now_disconnected': username,
                'connected_users': list(self.connected_users[self.room_group_name]),
            }
        )


    async def receive(self, text_data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'pong_packet',
                'sender_channel_name': self.channel_name,
                **json.loads(text_data)
            }
        )

    async def pong_packet(self, event):
        if self.channel_name == event.pop('sender_channel_name'):
            return

        await self.send(text_data=json.dumps({**event}))

    async def pong_ready(self, event):
        await self.send(text_data=json.dumps({**event}))
