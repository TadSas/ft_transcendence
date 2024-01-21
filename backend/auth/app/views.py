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
        request.session['auth_state'] = (state := secrets.token_urlsafe(64))

        return JsonResponse({'redirect_uri': (
            f'https://api.intra.42.fr/oauth/authorize?{urlencode({
                'client_id': 'u-s4t2ud-dc0e95331cec0da8e1734d27dcb39f568c3220de23ee32d917e947e7f58475f0',
                'redirect_uri': 'https://192.168.0.106/auth/api/callback',
                'response_type': 'code',
                'scope': 'public',
                'state': state
            })}'
        )})


class CallbackView(APIView):
    @staticmethod
    def get(request, format=None):
        qs = request.query_params

        callback_code = qs.get('code')
        callback_state = qs.get('state')

        auth_state = request.session.get('auth_state')

        if not auth_state or auth_state != callback_state:
            return redirect("/login")

        request = Request(
            url='https://api.intra.42.fr/oauth/token',
            data=urlencode({
                'grant_type': 'authorization_code',
                'client_id': 'u-s4t2ud-dc0e95331cec0da8e1734d27dcb39f568c3220de23ee32d917e947e7f58475f0',
                'client_secret': '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',
                'code': callback_code,
                'redirect_uri': 'https://192.168.0.106/auth/api/callback',
                'state': auth_state,
            }).encode()
        )

        try:
            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())
                # print(f"\nresponse_data: {response_data}\n")
                access_token = response_data.get('access_token', '')

            request = Request(url='https://api.intra.42.fr/v2/me')
            request.add_header('Authorization', f'Bearer {access_token}')

            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())
                # print(f"\nresponse_data: {response_data}\n")

            """
            {
                "access_token": "c090bbc130da535b883cd328ef21feba31e4fe005969dc211bd7775928f9ffbc",
                "token_type": "bearer",
                "expires_in": 5520,
                "refresh_token": "08b3019b8bdb4f3336b5f29528e19ef3434e3fcbbe99dfa89b75cbd8a81fad8b",
                "scope": "public",
                "created_at": 1705672847, # datetime.fromtimestamp()
                "secret_valid_until": 1706508016 # datetime.fromtimestamp()
            }
            """
        except Exception as ex:
            print(f"\nex: {ex}\n")

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
