import jwt

from django.http import JsonResponse

from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication

from auth.settings import SECRET_KEY

from .models import Users


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        if not (token := request.COOKIES.get('jwt')):
            raise AuthenticationFailed({'authenticated': False})

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = Users.objects.filter(id=payload.get('id'))
            print(f"\nuser: {user}\n")
        except Exception:
            raise AuthenticationFailed({'authenticated': False})

        return (user, None)
