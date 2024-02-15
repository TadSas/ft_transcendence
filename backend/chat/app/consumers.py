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
            return await self.close(code=4004)

        try:
            username = self.scope['user'].get('login')
            room_id = self.scope['url_route']['kwargs']['room_id']
        except Exception:
            return await self.close(code=4005)


        if room_id == 'notifications':
            self.room_group_name = f"{username}_notifications"
        else:
            try:
                room = await database_sync_to_async(RoomController().get_room)(room_id)
                room_participants = room.participants
            except Exception:
                return await self.close(code=4006)

            if not room_participants or username not in room_participants:
                return await self.close(code=4007)

            self.room_group_name = room_id

            self.room_participants = room_participants

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

        if receive_type == 'block':
            room_id = text_data_json.get('room_id')
            logged_user = self.scope['user'].get('login')
            blocking_user = text_data_json.get('username')

            if (
                not room_id or
                not blocking_user or
                room_id != self.room_group_name or
                blocking_user not in self.room_participants or
                logged_user not in self.room_participants
            ):
                return await self.close()

            try:
                room = await database_sync_to_async(RoomController().get_room)(room_id)
            except Exception:
                return await self.close()

            return await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_block',
                    'blocked_from': list(room.blocked.values())
                }
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
        if self.channel_name == event['sender_channel_name']:
            return

        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': event['message'],
            'created_at': event['created_at'],
            'room_id': self.room_group_name
        }))

    async def chat_notifications(self, event):
        if self.channel_name == event['sender_channel_name']:
            return

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

    async def chat_block(self, event):
        await self.send(text_data=json.dumps({
            'type': 'block',
            'blocked_from': event['blocked_from']
        }))
