from django.urls import path

from .views import CreateRoomView


urlpatterns = [
    path('room/create', CreateRoomView.as_view(), name='api-create-room')
]
