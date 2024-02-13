from django.urls import path

from .views import (
    GetRoomsView,
    BlockUserView,
    CreateRoomView,
    UnblockUserView,
    GetRoomMessagesView,
)


urlpatterns = [
    path('rooms/create', CreateRoomView.as_view(), name='api-create-room'),
    path('rooms/get', GetRoomsView.as_view(), name='api-get-rooms'),
    path('room/<slug:room_id>/messages', GetRoomMessagesView.as_view(), name='api-get-messages'),
    path('room/<slug:room_id>/participants/<slug:username>/block', BlockUserView.as_view(), name='api-block-user'),
    path('room/<slug:room_id>/participants/<slug:username>/unblock', UnblockUserView.as_view(), name='api-unblock-user'),
]
