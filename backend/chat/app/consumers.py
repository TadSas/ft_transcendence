import json
import uuid

from django.utils import timezone
from django.utils.html import escape
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .main import RoomController, MessagesController


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if 'user' not in self.scope:
            return await self.close()

        try:
            username = self.scope['user'].get('login')
            room_id = self.scope['url_route']['kwargs']['room_id']
        except Exception:
            return await self.close()


        if room_id == 'notifications':
            self.room_group_name = f"{username}_notifications"
        else:
            try:
                room = await database_sync_to_async(RoomController().get_room)(room_id)
                room_participants = room.participants
            except Exception:
                return await self.close()

            if not room_participants or username not in room_participants:
                return await self.close()

            if username in room.blocked:
                return await self.close()

            self.room_group_name = room_id

            self.room_participants = room_participants

        if hasattr(self.channel_layer, 'user_channels'):
            if self.room_group_name in self.channel_layer.user_channels:
                self.channel_layer.user_channels[self.room_group_name].update({username: self.channel_name})
            else:
                self.channel_layer.user_channels[self.room_group_name] = {username: self.channel_name}
        else:
            self.channel_layer.user_channels = {self.room_group_name: {username: self.channel_name}}

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
        receive_type = text_data_json.get('type')

        if (
            receive_type == 'block' and
            (room_id := text_data_json.get('room_id')) and
            (username := text_data_json.get('username')) and
            (block_group := self.channel_layer.user_channels.get(room_id)) and
            (block_channel_name := block_group.get(username))
        ):
            return await self.channel_layer.group_discard(
                room_id,
                block_channel_name
            )

        if not (message := escape(text_data_json.get('message'))):
            return

        saved_message = await database_sync_to_async(MessagesController().save_message)(
            self.scope['user'].get('login'),
            message,
            self.room_group_name
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'created_at': timezone.localtime(saved_message.created_at).strftime("%d-%m-%Y %H:%M"),
                'sender_channel_name': self.channel_name
            }
        )

        current_user = self.scope['user']['login']

        for participant in self.room_participants:
            if participant == current_user:
                continue

            await self.channel_layer.group_send(
                f"{participant}_notifications",
                {
                    'type': 'chat_notifications',
                    'message': message,
                    'created_at': timezone.localtime(saved_message.created_at).strftime("%d-%m-%Y %H:%M"),
                    'sender': self.scope['user'],
                    'sender_channel_name': self.channel_name
                }
            )

    async def chat_message(self, event):
        if self.channel_name != event['sender_channel_name']:
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'created_at': event['created_at'],
                'room_id': self.room_group_name
            }))

    async def chat_notifications(self, event):
        if self.channel_name != event['sender_channel_name']:
            sender = event['sender']

            await self.send(text_data=json.dumps({
                'type': 'notifications',
                'subtype': 'chat',
                'id': str(uuid.uuid4()),
                'room_id': self.room_group_name,
                'message': event['message'],
                'created_at': event['created_at'],
                'sender': {
                    'login': sender['login'],
                    'first_name': sender['first_name'],
                    'last_name': sender['last_name']
                }
            }))