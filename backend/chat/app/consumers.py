import json
import uuid
import socket

from django.utils import timezone
from django.utils.html import escape
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .main import RoomController, MessagesController

from chat.settings import GAME_SERVER


class ChatConsumer(AsyncWebsocketConsumer):
    user_activity = {'online': []}

    async def connect(self):
        if await self.invoked_tournament_notifications():
            return

        if 'user' not in self.scope:
            return await self.close(code=4002)

        try:
            username = self.scope['user'].get('login')
            room_id = self.scope['url_route']['kwargs']['room_id']
        except Exception:
            return await self.close(code=4005)

        if room_id == 'notifications':
            self.room_group_name = f"{username}_notifications"
            self.user_activity['online'].append(username)

            await self.send_user_activity_notification()
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

        await self.send_user_activity_notification()

    async def disconnect(self, code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

            if self.room_group_name.endswith('_notifications'):
                username = self.room_group_name.split('_notifications')[0]

                if username in self.user_activity['online']:
                    self.user_activity['online'].remove(username)

                    await self.send_user_activity_notification()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        if await self.check_tournament_notifications_message(text_data_json):
            return

        receive_type = text_data_json.get('type')
        connected_user  = self.scope['user'].get('login')

        if receive_type == 'notifications':
            del text_data_json['type']

            match text_data_json.get('subtype'):
                case 'game_invite':
                    text_data_json['opponent'] = connected_user

                    for player in text_data_json.get('players') or []:
                        if connected_user == player:
                            continue

                        await self.channel_layer.group_send(
                            f'{player}_notifications',
                            {
                                'type': 'game_notifications',
                                **text_data_json
                            }
                        )

                    return
                case 'game_accept' | 'game_decline':
                    await self.channel_layer.group_send(
                        f'{text_data_json['opponent']}_notifications',
                        {
                            'type': 'game_notifications',
                            **text_data_json
                        }
                    )

                    return

        try:
            room = await database_sync_to_async(RoomController().get_room)(self.room_group_name)
        except Exception:
            return await self.close()

        if receive_type in ['block', 'unblock']:
            room_id = text_data_json.get('room_id')
            blocking_user = text_data_json.get('username')

            if (
                not room_id or
                not blocking_user or
                room_id != self.room_group_name or
                blocking_user not in self.room_participants or
                connected_user  not in self.room_participants
            ):
                return await self.close()

            return await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': f'chat_{receive_type}',
                    'blocked_users': list(room.blocked.values())
                }
            )

        if connected_user in room.blocked or connected_user in room.blocked.values():
            return

        if not (message := escape(text_data_json.get('message'))):
            return

        saved_message = await database_sync_to_async(MessagesController().save_message)(
            connected_user,
            message,
            self.room_group_name
        )

        created_at = timezone.localtime(saved_message.created_at).strftime("%d-%m-%Y %H:%M")

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'created_at': created_at,
                'sender_channel_name': self.channel_name
            }
        )

        current_user = self.scope['user']

        for participant in self.room_participants:
            if participant == connected_user:
                continue

            await self.channel_layer.group_send(
                f"{participant}_notifications",
                {
                    'type': 'chat_notifications',
                    'message': message,
                    'created_at': created_at,
                    'sender': current_user,
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

    async def game_notifications(self, event):
        subtype = event['subtype']

        if subtype == 'game_invite':
            await self.send(text_data=json.dumps({
                'type': 'notifications',
                'subtype': subtype,
                'id': event['id'],
                'game': event['game'],
                'opponent': event['opponent'],
                'players': event['players'],
                'tournament': event['tournament']
            }))
        elif subtype in ('game_accept', 'game_decline'):
            await self.send(text_data=json.dumps({
                'type': 'notifications',
                'subtype': subtype,
                'id': event['match_id'],
                'opponent': event['opponent'],
            }))

    async def chat_block(self, event):
        await self.send(text_data=json.dumps({
            'type': 'block',
            'blocked_users': event['blocked_users']
        }))

    async def chat_unblock(self, event):
        await self.send(text_data=json.dumps({
            'type': 'unblock',
            'blocked_users': event['blocked_users']
        }))

    async def tournament_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notifications',
            'subtype': 'tournament',
            'message': event['message']
        }))

    async def user_activity_notification(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notifications',
            'subtype': 'user_activity',
            'user_activity': event['user_activity']
        }))

    async def invoked_tournament_notifications(self):
        try:
            if self.scope['url_route']['kwargs']['room_id'] != 'tournament_notifications':
                return

            client = self.scope.get('client')[0]

            host, port = GAME_SERVER.split('http://')[-1].split(':')
            game_server_ip = list(map(lambda x: x[4][0], socket.getaddrinfo(host, int(port), type=socket.SOCK_STREAM)))

            if client not in game_server_ip:
                return

            await self.channel_layer.group_add(
                'tournament_notifications',
                self.channel_name
            )

            await self.accept()

            return True
        except Exception:
            pass

    async def check_tournament_notifications_message(self, data):
        if data.get('type') != 'tournament_notification':
            return

        players = data.get('players') or []
        message = data.get('message') or ''

        for player in players:
            await self.channel_layer.group_send(
                f'{player}_notifications',
                {
                    'type': 'tournament_notification',
                    'message': message
                }
            )

        return True

    async def send_user_activity_notification(self):
        for username in self.user_activity['online']:
            await self.channel_layer.group_send(
                f'{username}_notifications',
                {
                    'type': 'user_activity_notification',
                    'user_activity': self.user_activity,
                }
            )
