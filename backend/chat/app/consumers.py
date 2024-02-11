import json
import uuid

from django.utils import timezone
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .main import RoomController, MessagesController


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if 'user' not in self.scope:
            return await self.close()

        user = self.scope['user']
        room_id = self.scope['url_route']['kwargs']['room_id']

        if room_id == 'notifications':
            self.room_group_name = f"{user.get('login')}_{room_id}"
        else:
            try:
                self.room_participants = await database_sync_to_async(RoomController().get_room_participants)(room_id)
            except Exception:
                return await self.close()

            if not self.room_participants or user.get('login') not in self.room_participants:
                return await self.close()

            self.room_group_name = room_id

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
        message = text_data_json['message']

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