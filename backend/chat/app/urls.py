from django.urls import path

from .views import CreateRoomView, GetRoomsView, GetRoomMessagesView


urlpatterns = [
    path('rooms/create', CreateRoomView.as_view(), name='api-create-room'),
    path('rooms/get', GetRoomsView.as_view(), name='api-get-rooms'),
    path('room/<slug:room_id>/messages', GetRoomMessagesView.as_view(), name='api-get-messages'),
]
