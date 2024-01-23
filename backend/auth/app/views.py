import jwt
import json
import secrets

from datetime import datetime

from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.http import JsonResponse
from django.shortcuts import redirect
from django.contrib.auth import logout
from django.middleware.csrf import get_token

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import (
    SessionAuthentication, BasicAuthentication
)

from .serializers import UsersSerializer, AuthTokenSerializer


class LoginView(APIView):
    @staticmethod
    def get(request):
        request.session['auth_state'] = (state := secrets.token_urlsafe(64)[:64])

        return JsonResponse({'redirect_uri': (
            f'https://api.intra.42.fr/oauth/authorize?{urlencode({
                'client_id': 'u-s4t2ud-dc0e95331cec0da8e1734d27dcb39f568c3220de23ee32d917e947e7f58475f0',
                'redirect_uri': 'https://localhost/auth/api/callback',
                'scope': 'public',
                'state': state,
                'response_type': 'code',
            })}'
        )})


class CallbackView(APIView):
    @staticmethod
    def get(request):
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
                'redirect_uri': 'https://localhost/auth/api/callback',
                'state': auth_state,
            }).encode()
        )

        try:
            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())
                access_token = response_data.get('access_token', '')
                serializer = AuthTokenSerializer(data={
                    'grant_type': 'authorization_code',
                    'code': callback_code,
                    'state': auth_state,
                    'access_token': access_token,
                    'token_type': response_data.get('token_type', ''),
                    'expires_in': response_data.get('expires_in', ''),
                    'refresh_token': response_data.get('refresh_token', ''),
                    'scope': response_data.get('scope', ''),
                    'created_at': datetime.fromtimestamp(response_data.get('created_at', '')),
                    'secret_valid_until': datetime.fromtimestamp(response_data.get('secret_valid_until', '')),
                })

                if serializer.is_valid():
                    serializer.save()

            request = Request(url='https://api.intra.42.fr/v2/me')
            request.add_header('Authorization', f'Bearer {access_token}')

            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())

                serializer = UsersSerializer(data={
                    'login': response_data.get('login', ''),
                    'email': response_data.get('email', ''),
                    'first_name': response_data.get('first_name', ''),
                    'last_name': response_data.get('last_name', ''),
                })

                if serializer.is_valid():
                    serializer.save()
        except Exception as ex:
            print(f"\nex: {ex}\n")

        return redirect("/login")


class GetCsrfView(APIView):
    @staticmethod
    def get(request):
        response = JsonResponse({'detail': 'CSRF cookie set'})
        response['X-CSRFToken'] = get_token(request)

        return response


class LogoutView(APIView):
    @staticmethod
    def get(request):
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
    def get(request):
        return JsonResponse({'isAuthenticated': True})


class WhoAmIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    @staticmethod
    def get(request):
        return JsonResponse({'username': request.user.username})
