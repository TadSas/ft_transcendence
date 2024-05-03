class Pong:
    def __init__(
        self,
        width = 720,
        height = 405,
        multiplayer = False,
        players={},
    ):
        self.width = width
        self.height = height
        self.multiplayer = multiplayer
        self.players = players
        self.borders = {'top': 7, 'right': 12, 'bottom': -7, 'left': -12}
        self.paddle_measurements = {'width': 0.25, 'height': 3}
        self.ball_measurements = {'diameter': 0.25}
        self.paddles = self.init_paddles()
        self.ball = {'x': 0, 'y': 0}

    def init_paddles(self):
        paddles = {'left': {}, 'right': {}}

        for path in self.players.values():
            side, paddle_id = path.split('.')
            paddles[side][int(paddle_id)] = {'x': -10 if side == 'left' else 10, 'y': 0}

        return paddles

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

    async def broadcast(self, channel_layer, room_group_name):
        while True:
            await channel_layer.group_send(
                room_group_name,
                {'type': 'pong_packet', 'data': 'meow'}
            )

    async def move_paddle(self, player, data):
        direction = data['direction']

    async def unknown_action(self, player, data):
        pass
