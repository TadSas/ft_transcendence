from django.urls import path

from .consumers import ChatConsumer


websocket_urlpatterns = [
    path("chat/room/<str:room_id>", ChatConsumer.as_asgi(), name='ws-chat-room'),
]
