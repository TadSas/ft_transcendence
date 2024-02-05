from django.urls import path

from .consumers import ChatConsumer


websocket_urlpatterns = [
    path("chat/room", ChatConsumer.as_asgi(), name='ws-room'),
]
