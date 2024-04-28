from django.urls import path

from .consumers import PongGameConsumer


websocket_urlpatterns = [
    path("game/pong/room/<str:match_id>", PongGameConsumer.as_asgi(), name='ws-game-pong-room'),
]
