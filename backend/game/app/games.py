class Pong:
    def __init__(
        self,
        width = 720,
        height = 405,
        multiplayer = False,
    ):
        self.width = width
        self.height = height
        self.multiplayer = multiplayer
        self.borders = {'top': 7, 'right': 12, 'bottom': -7, 'left': -12}
        self.paddle_measurements = {'width': 0.25, 'height': 3}
        self.ball_measurements = {'diameter': 0.25}
        self.paddles = {
            'left': {0: {'x': -10, 'y': 0}},
            'right': {0: {'x': 10, 'y': 0}},
        }
        self.ball = {'x': 0, 'y': 0}

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
