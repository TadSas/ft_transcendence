import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .main import MatchesController


class PongGameConsumer(AsyncWebsocketConsumer):
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

        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # receive_type = text_data_json.get('type')
        # connected_user  = self.scope['user'].get('login')

        # if receive_type == 'notifications':
        #     pass

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'pong_packet',
                'subtype': 'paddle_move',
                'sender_channel_name': self.channel_name,
                **text_data_json
            }
        )

    async def pong_packet(self, event):
        if self.channel_name == event['sender_channel_name']:
            return

        await self.send(text_data=json.dumps({
            **event
        }))

