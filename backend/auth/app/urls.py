from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    CallbackView,
    UserAvatarView,
    AuthenticationCheckView,
)


urlpatterns = [
    path('login', LoginView.as_view(), name='api-login'),
    path('logout', LogoutView.as_view(), name='api-logout'),
    path('avatar', UserAvatarView.as_view(), name='api-avatar'),
    path('callback', CallbackView.as_view(), name='api-callback'),
    path('authentication/check', AuthenticationCheckView.as_view(), name='api-authentication-check')
]
