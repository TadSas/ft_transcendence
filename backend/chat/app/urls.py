from django.urls import path

from .views import CreateRoomView, GetRoomsView


urlpatterns = [
    path('rooms/create', CreateRoomView.as_view(), name='api-create-room'),
    path('rooms/get', GetRoomsView.as_view(), name='api-get-rooms')
]
