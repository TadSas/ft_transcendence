import json

from urllib.request import Request, urlopen

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication

from chat.settings import JWT_COOKIE_NAME, AUTHORIZATION_SERVER


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        if not (token := request.COOKIES.get(JWT_COOKIE_NAME)):
            raise AuthenticationFailed({'authenticated': False})

        user = None
        request = Request(
            url=f"{AUTHORIZATION_SERVER}/auth/api/jwt/verify",
            data=json.dumps({'jwt': token}).encode()
        )
        request.add_header('Content-Type', 'application/json')

        try:
            with urlopen(request) as response:
                response_data = json.loads(response.read().decode())

                if not (response_data and (user := response_data.get('user')) and response_data.get('authenticated')):
                    raise AuthenticationFailed({'authenticated': False})

        except Exception:
            raise AuthenticationFailed({'authenticated': False})

        return (user, None)
