from django.urls import path

from .consumers import GameConsumer


websocket_urlpatterns = [
    path("game/room", GameConsumer.as_asgi(), name='ws-game-room'),
]
