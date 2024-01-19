import jwt
import json
import secrets
import datetime

from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.http import JsonResponse
from django.shortcuts import redirect
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, login, logout

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)


class LoginView(APIView):
    @staticmethod
    def get(request, format=None):
        oauth_url = 'https://api.intra.42.fr/oauth/authorize'
        client_id = 'u-s4t2ud-dc0e95331cec0da8e1734d27dcb39f568c3220de23ee32d917e947e7f58475f0'
        redirect_uri = 'https://localhost/auth/api/callback'
        response_type = 'code'
        scope = 'public'
        state = secrets.token_urlsafe(36)
        state = 'e49ae6a9-9cd8-4857-95f5-7e8d39a272af' # remove later

        # response query string
        code = 'd858db9d01a8562e35f110f97012404a800a98afed9445cbcac65e8e39fcd95e'
        state = 'e49ae6a9-9cd8-4857-95f5-7e8d39a272af'

        redirect_uri = (
            f'{oauth_url}?client_id={client_id}&'
            f'redirect_uri={redirect_uri}&response_type={response_type}&'
            f'scope={scope}&state={state}'
        )
        request.session['auth_state'] = state

        return JsonResponse({'redirect_uri': redirect_uri})


class CallbackView(APIView):
    @staticmethod
    def get(request, format=None):
        qs = request.query_params

        callback_code = qs.get('code')
        callback_state = qs.get('state')

        auth_state = request.session.get('auth_state')

        # if not auth_state or auth_state != callback_state:
        #     return redirect("/login")

        # create jwt payload
        payload = {
            'id': 'user_id'
        }

        req = Request(
            'https://api.intra.42.fr/oauth/token',
            urlencode({
                'grant_type': 'authorization_code',
                'client_id': '',
                'client_secret': '',
                'code': '',
                'redirect_uri': '',
                'state': auth_state,
            }).encode()
        )

        return redirect("/login")


class GetCsrfView(APIView):
    @staticmethod
    def get(request, format=None):
        response = JsonResponse({'detail': 'CSRF cookie set'})
        response['X-CSRFToken'] = get_token(request)

        return response


class LogoutView(APIView):
    @staticmethod
    def get(request, format=None):
        if not request.user.is_authenticated:
            return JsonResponse(
                {'detail': 'You\'re not logged in.'},
                status=400
            )

        logout(request)

        return JsonResponse({'detail': 'Successfully logged out.'})


class SessionView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    @staticmethod
    def get(request, format=None):
        return JsonResponse({'isAuthenticated': True})


class WhoAmIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    @staticmethod
    def get(request, format=None):
        return JsonResponse({'username': request.user.username})
