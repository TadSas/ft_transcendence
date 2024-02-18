import json

from urllib.request import Request, urlopen

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication

from game.settings import JWT_COOKIE_NAME, AUTHORIZATION_SERVER


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


class WebSocketJWTAuthentication:
    def __init__(self, app):
        self.app = app

    def __call__(self, scope, receive, send):
        headers = dict(scope['headers'])

        if b'cookie' in headers:
            try:
                cookies = headers[b'cookie'].decode().split()
                jwt = list(filter(lambda x: x.startswith(JWT_COOKIE_NAME), cookies))[0].split('=')[1]

                request = Request(
                    url=f"{AUTHORIZATION_SERVER}/auth/api/jwt/verify",
                    data=json.dumps({'jwt': jwt}).encode()
                )
                request.add_header('Content-Type', 'application/json')

                with urlopen(request) as response:
                    response_data = json.loads(response.read().decode())

                    if not (response_data and (user := response_data.get('user')) and response_data.get('authenticated')):
                        raise Exception()

                    scope['user'] = user
            except Exception as ex:
                pass

        return self.app(scope, receive, send)
