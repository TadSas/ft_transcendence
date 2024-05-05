import asyncio

from time import sleep


class Pong:
    def __init__(
        self,
        width = 720,
        height = 405,
        multiplayer = False,
        players={},
        channel_layer=None,
        room_group_name=None,
    ):
        self.width = width
        self.height = height
        self.multiplayer = multiplayer
        self.channel_layer = channel_layer
        self.room_group_name = room_group_name
        self.borders = {'top': 7, 'right': 12, 'bottom': -7, 'left': -12}
        self.paddle_measurements = {'width': 0.25, 'height': 3}
        self.ball_measurements = {'diameter': 0.25}
        self.paddles = self.init_paddles(players)
        self.players = self.init_players(players)
        self.ball = {'x': 0, 'y': 0}
        self.score = {'left': 0, 'right': 0}
        self.do_broadcast = True

        self.paddle_speed = 0.15

        self.action_queue = []

    def init_paddles(self, players):
        paddles = {'left': {}, 'right': {}}

        for path in players.values():
            side, paddle_id = path.split('.')
            paddles[side][int(paddle_id)] = {'x': -10 if side == 'left' else 10, 'y': 0}

        return paddles

    def init_players(self, players):
        result = {}

        for player, path in players.items():
            side, paddle_id = path.split('.')
            result[player] = self.paddles[side][int(paddle_id)]

        return result

    async def initialize(self) -> dict:
        return {
            'game': {
                'canvas': {'width': self.width, 'height': self.height},
                'borders': self.borders,
            },
            'ball': self.ball,
            'ball_measurements': self.ball_measurements,
            'paddles': self.paddles,
            'paddle_measurements': self.paddle_measurements,
        }

    def broadcast_wrapper(self, channel_layer, room_group_name):
        asyncio.run(self.broadcast(channel_layer, room_group_name))

    async def broadcast(self, channel_layer, room_group_name):
        while self.do_broadcast:
            await channel_layer.group_send(
                room_group_name,
                {
                    'type': 'pong_packet',
                    'data': {
                        'ball': self.ball,
                        'paddles': self.paddles,
                        'score': self.score
                    }
                }
            )
            await self.run_action()
            sleep(0.018)
            # sleep(0.015)

    async def pop_action(self):
        if (action_queue_len := len(self.action_queue)) == 0:
            return None
        elif action_queue_len == 1:
            return self.action_queue[0]
        else:
            return self.action_queue.pop(0)

    async def push_action(self, player, data):
        self.action_queue.append((
            getattr(self, data.get('type'), self.unknown_action),
            {'player': player, 'data': data}
        ))

    async def run_action(self):
        if (action := await self.pop_action()):
            await action[0](**action[1])

    async def move_paddle(self, player, data):
        if (direction := data['direction']) in (-1, 1):
            self.players[player]['y'] += self.paddle_speed * direction

    async def stop_paddle(self, player, data):
        self.players[player]['y'] += 0

    async def unknown_action(self, player, data):
        pass
