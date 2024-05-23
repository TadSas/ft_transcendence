import random
import asyncio

from time import sleep
from channels.db import database_sync_to_async

from .main import MatchesController


class Pong:
    def __init__(
        self,
        width = 720,
        height = 405,
        multiplayer = False,
        players={},
        score={},
        channel_layer=None,
        room_group_name=None,
    ):
        self.width = width
        self.height = height
        self.multiplayer = multiplayer
        self.channel_layer = channel_layer
        self.room_group_name = room_group_name
        self.borders = {'top': 7, 'right': 12, 'bottom': -7, 'left': -12}
        self.static_objects = self.init_static_objects()

        self.paddles = self.init_paddles(players)
        self.paddle_measurements = {'width': 0.25, 'height': 3}
        self.paddle_step = 0.15

        self.players = self.init_players(players)

        self.ball = {'x': 0, 'y': 0}
        self.ball_measurements = {'diameter': 0.25}
        self.ball_direction = random.choice((1, -1))
        self.ball_step = {'x': 0.075, 'y': 0.05}
        self.ball_speed = {'x': self.ball_step['x'] * self.ball_direction, 'y': 0}

        self.score = score or {'left': 0, 'right': 0}
        self.do_broadcast = True
        self.paused = False

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
            'static_objects': self.static_objects,
            'ball': self.ball,
            'ball_measurements': self.ball_measurements,
            'paddles': self.paddles,
            'paddle_measurements': self.paddle_measurements,
            'score': self.score,
        }

    def init_static_objects(self) -> list:
        vertical_borders = [
            {
                'x': 0, 'y': self.borders['top'] + 0.75, 'z': 0,
                'width': self.borders['right'] * 2, 'height': 1, 'length': 0
            },
            {
                'x': 0, 'y': self.borders['bottom'] - 0.75, 'z': 0,
                'width': self.borders['right'] * 2, 'height': 1, 'length': 0
            },
        ]

        return [*vertical_borders]

    def broadcast_wrapper(self):
        asyncio.run(self.broadcast())

    async def broadcast(self):
        while self.do_broadcast:
            if self.paused:
                continue

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'pong_packet',
                    'data': {
                        'ball': self.ball,
                        'paddles': self.paddles,
                        'score': self.score
                    }
                }
            )
            sleep(0.015)

    async def move_paddle(self, player, data):
        if self.paused:
            return

        if (direction := data['direction']) not in (-1, 1):
            return

        if self.multiplayer:
            paddle = self.players[player]
        else:
            if not (side := data.get('side')):
                return

            paddle = self.players[f'{player}{side.capitalize()}']

        if self.paddle_within_bounds(paddle):
            paddle['y'] += self.paddle_step * direction
        elif self.paddle_over_bounds(paddle):
            paddle['y'] -= self.paddle_step / 10
        elif self.paddle_under_bounds(paddle):
            paddle['y'] += self.paddle_step / 10

    async def pong_reconnect(self, player, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'pong_reconnect',
                **await self.initialize()
            }
        )

    async def unknown_action(self, player, data):
        pass

    def paddle_within_bounds(self, paddle):
        return (
            paddle['y'] + self.paddle_measurements['height'] / 2 <= self.borders['top'] and
            paddle['y'] - self.paddle_measurements['height'] / 2 >= self.borders['bottom']
        )

    def paddle_over_bounds(self, paddle):
        return paddle['y'] + self.paddle_measurements['height'] > self.borders['top']

    def paddle_under_bounds(self, paddle):
        return paddle['y'] - self.paddle_measurements['height'] < self.borders['bottom']

    async def move_ball(self):
        if not self.do_broadcast or self.paused:
            return

        self.check_ball_collisions()
        await self.check_ball_out_of_bounds()

        self.ball['x'] += self.ball_speed['x']
        self.ball['y'] += self.ball_speed['y']

    def check_ball_collisions(self):
        ball_x = self.ball['x']
        ball_y = self.ball['y']
        ball_diameter = self.ball_measurements['diameter']
        paddle_width = self.paddle_measurements['width']
        paddle_height = self.paddle_measurements['height']

        for object in (*self.paddles['left'].values(), *self.paddles['right'].values(), *self.static_objects):
            object_x = object['x']
            object_y = object['y']
            object_half_width = (object.get('width') or paddle_width) / 2
            object_half_height = (object.get('height') or paddle_height) / 2

            collision = self.collision(
                ball_diameter,
                round(ball_x, 2),
                round(ball_y, 2),
                round(object_x - object_half_width, 2),
                round(object_y - object_half_height, 2),
                round(object_x + object_half_width, 2),
                round(object_y + object_half_height, 2),
            )

            if collision['occurred']:
                if ball_x > 0:
                    self.ball['x'] -= 0.05
                else:
                    self.ball['x'] += 0.05

                if collision['horizontal']:
                    self.ball_speed['x'] *= -1
                    self.ball_speed['y'] = (ball_y - object_y) / 30

                if collision['vertical']:
                    self.ball_speed['y'] *= -1

    def collision(
        self,
        ball_diameter: int,
        ball_x: int,
        ball_y: int,
        obj_left_bottom_x: int,
        obj_left_bottom_y: int,
        obj_top_right_x: int,
        obj_top_right_y: int,
    ) -> tuple:
        x = max(obj_left_bottom_x, min(ball_x, obj_top_right_x))
        y = max(obj_left_bottom_y, min(ball_y, obj_top_right_y))

        x_diff = round(x - ball_x, 2)
        y_diff = round(y - ball_y, 2)

        return {
            'occurred': (x_diff ** 2 + y_diff ** 2) <= ball_diameter,
            'vertical': bool(y_diff),
            'horizontal': bool(x_diff),
        }

    async def check_ball_out_of_bounds(self):
        if self.ball['x'] < self.borders['left']:
            self.prepare_next_round()
            self.score['right'] += 1
            await database_sync_to_async(MatchesController().update_match_score)(
                match_id=self.room_group_name,
                score=self.score
            )
        elif self.ball['x'] > self.borders['right']:
            self.prepare_next_round()
            self.score['left'] += 1
            await database_sync_to_async(MatchesController().update_match_score)(
                match_id=self.room_group_name,
                score=self.score
            )

        await self.check_game_over()

    def prepare_next_round(self):
        for paddle in self.paddles['left'].values():
            paddle['y'] = 0

        for paddle in self.paddles['right'].values():
            paddle['y'] = 0

        self.ball = {'x': 0, 'y': 0}
        self.ball_speed = {'x': self.ball_step['x'] * random.choice((1, -1)), 'y': 0}

    async def check_game_over(self):
        if 11 in self.score.values():
            sleep(0.1)
            self.do_broadcast = False
            await self.pong_end()
            await database_sync_to_async(MatchesController().update_match_score)(
                match_id=self.room_group_name,
                score=self.score,
                status='finished'
            )

    async def pong_end(self):
        match = await database_sync_to_async(MatchesController().get_match_by_id)(match_id=self.room_group_name)
        match_score = match.score

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'pong_end',
                'players': match.players,
                'score': match_score,
                'winner': max(match_score, key=match_score.get),
            }
        )
