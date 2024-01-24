import jwt
import secrets

from django.http import JsonResponse
from django.shortcuts import redirect

from rest_framework.views import APIView

from .main import AuthController


class LoginView(APIView):
    @staticmethod
    def get(request):
        request.session['auth_state'] = (state := secrets.token_urlsafe(64)[:64])

        return JsonResponse({'redirect_uri': AuthController().get_authorization_url(state)})


class CallbackView(APIView):
    @staticmethod
    def get(request):
        qs = request.query_params
        authCont = AuthController()

        callback_code = qs.get('code')
        callback_state = qs.get('state')

        auth_state = request.session.get('auth_state')

        if not auth_state or auth_state != callback_state:
            return redirect("/login")

        user_id = authCont.retrieve_logged_user(
            authCont.exchange_access_token(callback_code, callback_state)
        )

        return redirect("/login#alo")


class LogoutView(APIView):
    @staticmethod
    def get(request):
        return JsonResponse({'detail': 'Successfully logged out.'})
