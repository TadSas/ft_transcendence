from django.urls import path

from .views import (
    UserView,
    LoginView,
    LogoutView,
    CallbackView,
    JWTVerifyView,
    UserAvatarView,
    FriendStatusView,
    FriendRequestView,
    DashboardUsersView,
    TwoFactorVerifyView,
    AuthenticationCheckView,
    CancelFriendRequestView,
)


urlpatterns = [
    path('user', UserView.as_view(), name='api-user'),
    path('user/<slug:username>', UserView.as_view(), name='api-user'),
    path('login', LoginView.as_view(), name='api-login'),
    path('logout', LogoutView.as_view(), name='api-logout'),
    path('avatar', UserAvatarView.as_view(), name='api-avatar'),
    path('avatar/<slug:username>', UserAvatarView.as_view(), name='api-avatar'),
    path('callback', CallbackView.as_view(), name='api-callback'),
    path('dashboard/users', DashboardUsersView.as_view(), name='api-dashboard-users'),
    path('twofactor/verify', TwoFactorVerifyView.as_view(), name='api-twofactor-verify'),
    path('jwt/verify', JWTVerifyView.as_view(), name='api-jwt-verify'),
    path('authentication/check', AuthenticationCheckView.as_view(), name='api-authentication-check'),

    path('friends/request', FriendRequestView.as_view(), name='api-friend-request'),
    path('friends/request/cancel', CancelFriendRequestView.as_view(), name='api-cancel-friend-request'),
    path('friends/status/<slug:friend>', FriendStatusView.as_view(), name='api-friend-status'),
]
