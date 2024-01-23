from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    WhoAmIView,
    GetCsrfView,
    SessionView,
    CallbackView,
)


urlpatterns = [
    path('csrf', GetCsrfView.as_view(), name='api-csrf'),
    path('login', LoginView.as_view(), name='api-login'),
    path('logout', LogoutView.as_view(), name='api-logout'),
    path('whoami', WhoAmIView.as_view(), name='api-whoami'),
    path('session', SessionView.as_view(), name='api-session'),
    path('callback', CallbackView.as_view(), name='api-callback'),
]
