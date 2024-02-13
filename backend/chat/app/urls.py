from django.urls import path

from .views import (
    CreateRoomView,
    GetRoomView,
    GetRoomsView,
    GetRoomMessagesView,
    BlockUserView
)


urlpatterns = [
    path('rooms/create', CreateRoomView.as_view(), name='api-create-room'),
    path('rooms/get', GetRoomsView.as_view(), name='api-get-rooms'),
    path('room/<slug:room_id>/get', GetRoomView.as_view(), name='api-get-room'),
    path('room/<slug:room_id>/messages', GetRoomMessagesView.as_view(), name='api-get-messages'),
    path('room/<slug:room_id>/participants/<slug:username>/block', BlockUserView.as_view(), name='api-block-user'),
]
